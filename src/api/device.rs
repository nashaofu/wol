use crate::{
  errors::Result,
  settings::{Device, SETTINGS},
  wol,
};

use axum::{extract::Path, response::IntoResponse, Json};
use serde::{Deserialize, Serialize};
use surge_ping;

pub async fn all() -> Result<impl IntoResponse> {
  let devices = SETTINGS.read()?.devices.clone();

  Ok(Json(devices))
}

pub async fn save(Json(data): Json<Vec<Device>>) -> Result<impl IntoResponse> {
  let settings = &mut SETTINGS.write()?;
  settings.devices = data.clone();
  settings.save()?;

  let devices = settings.devices.clone();

  Ok(Json(devices))
}

pub async fn wake(data: Json<wol::WakeData>) -> Result<impl IntoResponse> {
  wol::wake(&data)?;
  Ok(())
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

pub async fn status(Path(ip): Path<String>) -> Result<impl IntoResponse> {
  let payload = [0; 8];
  let device = ip.parse()?;

  let device_status = surge_ping::ping(device, &payload)
    .await
    .map(|_| DeviceStatus::Online)
    .unwrap_or(DeviceStatus::Offline);

  Ok(Json(device_status))
}
