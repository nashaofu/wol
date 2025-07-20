use actix_web::{HttpResponse, ResponseError, body::BoxBody, http::StatusCode};
use serde::Serialize;
use serde_yaml;
use std::{error::Error, fmt, io, net::AddrParseError, result, sync::PoisonError};
use surge_ping::SurgeError;

pub type Result<T, E = AppError> = result::Result<T, E>;

#[derive(Debug)]
pub struct AppError {
  pub status_code: StatusCode,
  pub code: u16,
  pub message: String,
}

impl fmt::Display for AppError {
  // This trait requires `fmt` with this exact signature.
  fn fmt(&self, f: &mut fmt::Formatter) -> fmt::Result {
    write!(f, "AppError{self:?}")
  }
}

#[derive(Serialize, Debug)]
pub struct AppErrorJson {
  pub code: u16,
  pub message: String,
}

impl AppError {
  pub fn new<M: ToString>(status_code: StatusCode, code: u16, message: M) -> Self {
    AppError {
      status_code,
      code,
      message: message.to_string(),
    }
  }

  pub fn from_err<E: Error>(err: E) -> Self {
    AppError::new(StatusCode::INTERNAL_SERVER_ERROR, 500, err.to_string())
  }
}

impl ResponseError for AppError {
  fn status_code(&self) -> StatusCode {
    self.status_code
  }

  fn error_response(&self) -> HttpResponse<BoxBody> {
    HttpResponse::build(self.status_code()).json(AppErrorJson {
      code: self.code,
      message: self.message.clone(),
    })
  }
}

impl From<anyhow::Error> for AppError {
  fn from(err: anyhow::Error) -> Self {
    log::error!("anyhow::Error {err}");
    AppError::new(StatusCode::INTERNAL_SERVER_ERROR, 500, err.to_string())
  }
}

impl From<AddrParseError> for AppError {
  fn from(err: AddrParseError) -> Self {
    log::error!("AddrParseError {err}");
    AppError::new(StatusCode::INTERNAL_SERVER_ERROR, 500, err.to_string())
  }
}

impl From<SurgeError> for AppError {
  fn from(err: SurgeError) -> Self {
    log::error!("SurgeError {err}");
    AppError::new(StatusCode::INTERNAL_SERVER_ERROR, 500, err.to_string())
  }
}

impl<T> From<PoisonError<T>> for AppError {
  fn from(err: PoisonError<T>) -> Self {
    log::error!("PoisonError<T> {err}");
    AppError::new(StatusCode::INTERNAL_SERVER_ERROR, 500, err.to_string())
  }
}

impl From<io::Error> for AppError {
  fn from(err: io::Error) -> Self {
    log::error!("io::Error {err}");
    AppError::new(StatusCode::INTERNAL_SERVER_ERROR, 500, err.to_string())
  }
}

impl From<serde_yaml::Error> for AppError {
  fn from(err: serde_yaml::Error) -> Self {
    log::error!("serde_yaml::Error {err}");
    AppError::new(StatusCode::INTERNAL_SERVER_ERROR, 500, err.to_string())
  }
}
