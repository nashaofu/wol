pub mod api;
pub mod args;
pub mod asset;
pub mod errors;
pub mod middleware;
pub mod settings;
pub mod wol;

use actix_web::{
  middleware::{Logger, NormalizePath},
  web, App, HttpServer,
};
use dotenv::dotenv;
use std::io;

use args::ARGS;
use asset::serve;
use middleware::BasicAuth;

#[actix_web::main]
async fn main() -> Result<(), io::Error> {
  dotenv().ok();

  env_logger::init_from_env(env_logger::Env::new().default_filter_or("info"));

  log::info!("starting HTTP server at http://0.0.0.0:{}", ARGS.port);

  HttpServer::new(|| {
    App::new()
      .wrap(NormalizePath::trim())
      .wrap(BasicAuth)
      .service(
        web::scope("/api")
          .wrap(Logger::default())
          .configure(api::init),
      )
      .default_service(web::to(serve))
  })
  .bind(("0.0.0.0", ARGS.port))?
  .run()
  .await
}
