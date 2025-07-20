use crate::{
  errors::Result,
  settings::{Auth, SETTINGS},
};

use actix_web::{HttpResponse, Responder, get, post, web};
use serde::{Deserialize, Serialize};

#[get("/info")]
async fn get() -> Result<impl Responder> {
  Ok(HttpResponse::Ok().json(&SETTINGS.read()?.auth))
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SaveAuthData {
  username: String,
  password: Option<String>,
}

#[post("/save")]
async fn save(data: web::Json<Option<SaveAuthData>>) -> Result<impl Responder> {
  let settings = &mut SETTINGS.write()?;
  if let Some(data) = data.clone() {
    settings.auth = Some(Auth {
      username: data.username,
      password: data.password.unwrap_or(String::default()),
    });
  } else {
    settings.auth = None;
  }
  settings.save()?;

  Ok(HttpResponse::Ok().json(&settings.auth))
}
