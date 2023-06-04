use anyhow::{anyhow, Result};
use serde::{Deserialize, Serialize};
use std::net::UdpSocket;

/**
 * mac address eg: FF-FF-FF-FF-FF-FF
 * @wiki https://en.wikipedia.org/wiki/Wake-on-LAN
 * @docs http://support.amd.com/TechDocs/20213.pdf
 */
fn parse_mac<T: ToString>(mac: T) -> Result<[u8; 6]> {
  let mac = mac.to_string();
  let mac_vec: Vec<&str> = mac.split(":").collect();

  if mac_vec.len() != 6 {
    return Err(anyhow!("mac address is invalid"));
  }

  let mut mac_bytes = [0_u8; 6];
  for i in 0..mac_bytes.len() {
    mac_bytes[i] = u8::from_str_radix(mac_vec[i], 16)?;
  }

  Ok(mac_bytes)
}

fn create_magic_packet(mac: [u8; 6]) -> [u8; 102] {
  // 前6个字节为 0xff
  let mut magic_packet = [0xff_u8; 102];

  // mac 地址重复 16 次
  for i in 0..16 {
    for j in 0..6 {
      let index = 6 + i * 6 + j;
      magic_packet[index] = mac[j];
    }
  }

  magic_packet
}

#[derive(Debug, Serialize, Deserialize)]
pub struct WakeData {
  port: Option<u16>,
  mac: String,
}

pub fn wake(data: &WakeData) -> Result<()> {
  let mac = parse_mac(&data.mac)?;
  let magic_packet = create_magic_packet(mac);

  let socket = UdpSocket::bind(("0.0.0.0", 0))?;
  socket.set_broadcast(true)?;
  socket.send_to(&magic_packet, ("255.255.255.255", data.port.unwrap_or(9)))?;

  Ok(())
}
