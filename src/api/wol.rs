use crate::{errors::Result, wol};

use actix_web::{post, web, HttpResponse, Responder};

#[post("/wake")]
async fn wake(data: web::Json<wol::WakeData>) -> Result<impl Responder> {
  wol::wake(&data)?;
  Ok(HttpResponse::Ok().json(&data))
}
