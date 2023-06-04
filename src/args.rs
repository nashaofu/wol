use clap::Parser;
use lazy_static::lazy_static;

lazy_static! {
  pub static ref ARGS: Args = Args::parse();
}

#[derive(Parser, Debug)]
#[command(author, version, about, long_about = None)]
pub struct Args {
  /// App listen port
  #[arg(short, long, default_value_t = 3000)]
  pub port: u16,

  /// Config file path
  #[arg(short, long, default_value_t = String::from("./wol.yaml"))]
  pub config: String,
}
