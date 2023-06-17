mod device;

use axum::{
  routing::{get, post},
  Router,
};

pub fn init() -> Router {
  let device_routes = Router::new()
    .route("/all", get(device::all))
    .route("/save", post(device::save))
    .route("/wake", post(device::wake))
    .route("/status/:ip", get(device::status));

  Router::new().nest("/api/device", device_routes)
}
