use crate::{
  errors::Result,
  settings::{User, SETTINGS},
};

use actix_web::{get, post, web, HttpResponse, Responder};

#[get("/get")]
async fn get() -> Result<impl Responder> {
  Ok(HttpResponse::Ok().json(&SETTINGS.read()?.user))
}

#[post("/save")]
async fn save(data: web::Json<User>) -> Result<impl Responder> {
  let settings = &mut SETTINGS.write()?;
  settings.user = Some(data.clone());
  settings.save()?;

  Ok(HttpResponse::Ok().json(&settings.user))
}
