use actix_web::{error::ErrorNotFound, HttpRequest, HttpResponse, Responder, Result};
use rust_embed::RustEmbed;

#[derive(RustEmbed)]
#[folder = "www"]
struct Asset;

pub async fn serve(req: HttpRequest) -> Result<impl Responder> {
  let path = &req.path()[1..];

  let file = Asset::get(path)
    .or(Asset::get("index.html"))
    .ok_or(ErrorNotFound("Not Found"))?;

  Ok(
    HttpResponse::Ok()
      .content_type(file.metadata.mimetype())
      .body(file.data),
  )
}
