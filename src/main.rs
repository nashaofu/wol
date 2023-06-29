pub mod api;
pub mod args;
pub mod errors;
pub mod middleware;
pub mod settings;
pub mod wol;

use actix_files::{Files, NamedFile};
use actix_web::{
  dev::{fn_service, ServiceRequest, ServiceResponse},
  middleware::{Logger, NormalizePath},
  web, App, HttpServer,
};
use dotenv::dotenv;
use std::io;

use args::ARGS;
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
      .service(
        Files::new("/", "./www")
          .index_file("index.html")
          .use_etag(true)
          .default_handler(fn_service(|req: ServiceRequest| async {
            let (req, _) = req.into_parts();
            let file = NamedFile::open_async("./www/index.html").await?;
            let res = file.into_response(&req);
            Ok(ServiceResponse::new(req, res))
          })),
      )
  })
  .bind(("0.0.0.0", ARGS.port))?
  .run()
  .await
}
