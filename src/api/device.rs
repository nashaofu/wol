use crate::{
  errors::Result,
  settings::{Device, SETTINGS},
  wol,
};

use actix_web::{get, post, web, HttpResponse, Responder};
use serde::{Deserialize, Serialize};
use surge_ping;

#[get("/all")]
async fn all() -> Result<impl Responder> {
  Ok(HttpResponse::Ok().json(&SETTINGS.read()?.devices))
}

#[post("/save")]
async fn save(data: web::Json<Vec<Device>>) -> Result<impl Responder> {
  let settings = &mut SETTINGS.write()?;
  settings.devices = data.clone();
  settings.save()?;

  Ok(HttpResponse::Ok().json(&settings.devices))
}

#[post("/wake")]
async fn wake(data: web::Json<wol::WakeData>) -> Result<impl Responder> {
  wol::wake(&data)?;
  Ok(HttpResponse::Ok().json(&data))
}

#[derive(Debug, Serialize, Deserialize)]
pub struct PingData {
  ip: String,
}

#[derive(Debug, Serialize, Deserialize)]
pub enum DeviceStatus {
  Online,
  Offline,
}

#[get("/status/{ip}")]
async fn status(ip: web::Path<String>) -> Result<impl Responder> {
  let payload = [0; 8];
  let device = ip.parse()?;

  let device_status = surge_ping::ping(device, &payload)
    .await
    .map(|_| DeviceStatus::Online)
    .unwrap_or(DeviceStatus::Offline);

  Ok(HttpResponse::Ok().json(device_status))
}
