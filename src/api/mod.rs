mod device;
mod wol;

use actix_web::web;

pub fn init(cfg: &mut web::ServiceConfig) {
  cfg
    .service(
      web::scope("/device")
        .service(device::all)
        .service(device::save)
        .service(device::status)
    )
    .service(web::scope("/wol").service(wol::wake));
}
