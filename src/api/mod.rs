mod auth;
mod device;

use actix_web::web;

pub fn init(cfg: &mut web::ServiceConfig) {
  cfg
    .service(
      web::scope("/device")
        .service(device::all)
        .service(device::save)
        .service(device::wake)
        .service(device::status),
    )
    .service(web::scope("/auth").service(auth::get).service(auth::save));
}
