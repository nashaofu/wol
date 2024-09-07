use crate::args::ARGS;

use std::{env, fs, path::PathBuf, sync::RwLock};

use anyhow::{anyhow, Result};
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

#[derive(Debug, Clone, Deserialize, Serialize)]
pub struct Auth {
  pub username: String,
  pub password: String,
}

#[derive(Debug, Clone, Deserialize, Serialize)]
pub struct Device {
  pub name: String,
  pub mac: String,
  pub ip: String,
  pub port: Option<u16>,
  pub netmask: String,
}

#[derive(Debug, Clone, Serialize)]
pub struct Settings {
  pub auth: Option<Auth>,
  pub devices: Vec<Device>,
}

impl Settings {
  pub fn init() -> Result<Self> {
    let config = Config::builder()
      .add_source(File::with_name(&CONFIG_FILE.display().to_string()).required(false))
      .build()?;

    let devices = match config.get::<Vec<Device>>("devices") {
      Ok(devices) => devices,
      Err(err) => {
        log::error!("Failed get devices from config: {}", err);

        if CONFIG_FILE.exists() {
          let filename = CONFIG_FILE
            .file_name()
            .and_then(|name| name.to_str())
            .ok_or(anyhow!("Failed get config file name"))?;

          let target = CONFIG_FILE
            .parent()
            .ok_or(anyhow!("Failed get config file parent dirname"))?
            .join(format!("{}.backup", filename));

          log::info!("Backup config file {} to {}", CONFIG_FILE.display(), target.display());

          fs::copy(CONFIG_FILE.as_path(), target)?;
        }

        Vec::new()
      }
    };

    let auth = config.get::<Auth>("auth").ok();

    let settings = Settings { auth, devices };

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
