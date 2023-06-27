use crate::{
  errors::Result,
  settings::{Auth, SETTINGS},
};

use actix_web::{get, post, web, HttpResponse, Responder};

#[get("/info")]
async fn get() -> Result<impl Responder> {
  Ok(HttpResponse::Ok().json(&SETTINGS.read()?.auth))
}

#[post("/save")]
async fn save(data: web::Json<Option<Auth>>) -> Result<impl Responder> {
  log::info!("data {:?}", data);
  let settings = &mut SETTINGS.write()?;
  log::info!("data2 {:?}", data);
  settings.auth = data.clone();
  settings.save()?;

  Ok(HttpResponse::Ok().json(&settings.auth))
}
