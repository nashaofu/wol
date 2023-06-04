use crate::args::ARGS;

use std::{env, fs, path::PathBuf, sync::RwLock};

use anyhow::Result;
use config::{Config, File};
use lazy_static::lazy_static;
use serde::{Deserialize, Serialize};
use serde_yaml;

lazy_static! {
  pub static ref CONFIG_FILE: PathBuf = env::current_dir()
    .map(|current_dir| current_dir.join(&ARGS.config).to_path_buf())
    .expect("DATA_DIR parse failed");
  pub static ref SETTINGS: RwLock<Settings> =
    RwLock::new(Settings::init().expect("Settings init failed"));
}

#[derive(Debug, Deserialize, Serialize)]
pub struct User {
  pub username: String,
  pub password: Option<String>,
}

#[derive(Debug, Clone, Deserialize, Serialize)]
pub struct Device {
  pub name: String,
  pub mac: String,
  pub ip: String,
  pub port: Option<u16>,
}

#[derive(Debug, Serialize)]
pub struct Settings {
  pub user: Option<User>,
  pub devices: Vec<Device>,
}

impl Settings {
  pub fn init() -> Result<Self> {
    let config = Config::builder()
      .add_source(File::with_name(&CONFIG_FILE.display().to_string()).required(false))
      .build()?;

    let devices = config
      .get::<Vec<Device>>("devices")
      .unwrap_or(Vec::default());

    let user = config.get::<User>("user").ok();

    let settings = Settings { user, devices };

    log::debug!("Init settings: {:?}", settings);
    settings.save()?;
    Ok(settings)
  }

  pub fn save(self: &Settings) -> Result<()> {
    let yaml = serde_yaml::to_string(&self)?;
    fs::write(&CONFIG_FILE.to_path_buf(), yaml)?;
    Ok(())
  }
}
