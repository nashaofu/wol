use std::{
  fmt,
  future::{ready, Ready},
  rc::Rc,
};

use actix_web::{
  body::BoxBody,
  dev::{forward_ready, Service, ServiceRequest, ServiceResponse, Transform},
  http::{
    header::{AUTHORIZATION, WWW_AUTHENTICATE},
    StatusCode,
  },
  Error, HttpResponse, ResponseError,
};
use anyhow::{anyhow, Result};
use base64::prelude::{Engine, BASE64_STANDARD};
use futures_util::future::LocalBoxFuture;

use crate::{errors::AppError, settings::SETTINGS};

fn parse_header(req: &ServiceRequest) -> Result<(String, String)> {
  let header = req
    .headers()
    .get(AUTHORIZATION)
    .ok_or(anyhow!("failed get header"))?;

  // "Basic *" length
  if header.len() < 7 {
    return Err(anyhow!("failed parse header"));
  }

  let mut parts = header.to_str()?.splitn(2, ' ');
  let is_basic = parts.next().is_some_and(|scheme| scheme == "Basic");

  if !is_basic {
    return Err(anyhow!("failed parse header"));
  }

  let decoded =
    BASE64_STANDARD.decode(parts.next().ok_or(anyhow!("failed get header content"))?)?;

  let credentials = String::from_utf8(decoded)?;
  let mut credentials = credentials.splitn(2, ':');

  let user_id = credentials
    .next()
    .ok_or(anyhow!("failed get user_id"))
    .map(|user_id| user_id.to_string().into())?;

  let password = credentials
    .next()
    .ok_or(anyhow!("failed get password"))
    .map(|password| password.to_string().into())?;

  Ok((user_id, password))
}

// There are two steps in middleware processing.
// 1. Middleware initialization, middleware factory gets called with
//    next service in chain as parameter.
// 2. Middleware's call method gets called with normal request.
pub struct BasicAuth;

// Middleware factory is `Transform` trait
// `S` - type of the next service
// `B` - type of response's body
impl<S, B> Transform<S, ServiceRequest> for BasicAuth
where
  S: Service<ServiceRequest, Response = ServiceResponse<B>, Error = Error> + 'static,
  S::Future: 'static,
  B: 'static,
{
  type Response = ServiceResponse<B>;
  type Error = Error;
  type InitError = ();
  type Transform = BasicAuthMiddleware<S>;
  type Future = Ready<Result<Self::Transform, Self::InitError>>;

  fn new_transform(&self, service: S) -> Self::Future {
    ready(Ok(BasicAuthMiddleware {
      service: Rc::new(service),
    }))
  }
}

pub struct BasicAuthMiddleware<S> {
  service: Rc<S>,
}

impl<S, B> Service<ServiceRequest> for BasicAuthMiddleware<S>
where
  S: Service<ServiceRequest, Response = ServiceResponse<B>, Error = Error> + 'static,
  S::Future: 'static,
  B: 'static,
{
  type Response = ServiceResponse<B>;
  type Error = Error;
  type Future = LocalBoxFuture<'static, Result<Self::Response, Self::Error>>;

  forward_ready!(service);

  fn call(&self, req: ServiceRequest) -> Self::Future {
    let service = Rc::clone(&self.service);

    Box::pin(async move {
      let auth = {
        // 确保锁被释放掉, 否则 RwLock 会死锁
        let auth = &SETTINGS.read().map_err(|err| AppError::from(err))?.auth;

        auth.clone()
      };
      if let Some(auth) = auth {
        let (user_id, password) = parse_header(&req).map_err(|_| BasicAuthError)?;
        if auth.username == user_id && auth.password == password {
          let res = service.call(req).await?;
          Ok(res)
        } else {
          Err(BasicAuthError.into())
        }
      } else {
        let res = service.call(req).await?;
        Ok(res)
      }
    })
  }
}

#[derive(Debug)]
pub struct BasicAuthError;

impl fmt::Display for BasicAuthError {
  // This trait requires `fmt` with this exact signature.
  fn fmt(&self, f: &mut fmt::Formatter) -> fmt::Result {
    write!(f, "BasicAuthError{:?}", self)
  }
}

impl ResponseError for BasicAuthError {
  fn status_code(&self) -> StatusCode {
    StatusCode::UNAUTHORIZED
  }

  fn error_response(&self) -> HttpResponse<BoxBody> {
    HttpResponse::build(self.status_code())
      .insert_header((WWW_AUTHENTICATE, "Basic"))
      .finish()
  }
}
