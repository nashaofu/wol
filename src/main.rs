pub mod api;
pub mod args;
pub mod errors;
pub mod settings;
pub mod wol;

use anyhow::Result;
use axum::Server;
use dotenv::dotenv;
use std::net::{Ipv4Addr, SocketAddr, SocketAddrV4};
use tower_http::services::{ServeDir, ServeFile};
use tracing::info;
use tracing_subscriber::{fmt, prelude::*, registry, EnvFilter};

use args::ARGS;

#[tokio::main]
async fn main() -> Result<()> {
  dotenv()?;

  registry()
    .with(fmt::layer())
    .with(EnvFilter::try_from_default_env().unwrap_or_else(|_| "info".into()))
    .init();

  let socket_addr = SocketAddr::V4(SocketAddrV4::new(Ipv4Addr::UNSPECIFIED, ARGS.port));
  info!("starting HTTP server at http://{}", socket_addr);

  let serve_dir = ServeDir::new("www").fallback(ServeFile::new("www/index.html"));

  Server::bind(&socket_addr)
    .serve(api::init().nest_service("/", serve_dir).into_make_service())
    .await?;

  Ok(())
}
