mod device;
mod user;

use actix_web::web;

pub fn init(cfg: &mut web::ServiceConfig) {
  cfg.service(
    web::scope("/device")
      .service(device::all)
      .service(device::save)
      .service(device::wake)
      .service(device::status),
  ).service(
    web::scope("/user")
      .service(user::get)
      .service(device::save)
  );
}
