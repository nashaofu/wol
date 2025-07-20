use anyhow::{Result, anyhow};
use serde::{Deserialize, Serialize};
use std::{net::UdpSocket, result::Result as StdResult};

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

/**
 * WOL magic packet 构成：
 * 前6个字节为 0xff，然后是目标计算机的 MAC 地址的16次重复，总共 102 个字节。
 */
fn create_magic_packet(mac: [u8; 6]) -> [u8; 102] {
  // 前6个字节为 0xff
  let mut magic_packet = [0xff_u8; 102];

  // MAC 地址重复 16 次
  magic_packet[6..].copy_from_slice(&mac.repeat(16));

  magic_packet
}

/**
 * IP 转换为 u32 数值
 */
fn ip_to_u32(ip: &str) -> Result<u32> {
  let parts = ip
    .split('.')
    .map(|src| src.parse::<u32>())
    .collect::<StdResult<Vec<u32>, _>>()?;

  if parts.len() != 4 {
    return Err(anyhow!("ip address is invalid"));
  }

  Ok((parts[0] << 24) | (parts[1] << 16) | (parts[2] << 8) | parts[3])
}

/**
 * 根据 IP 与子网掩码计算广播地址
 */
fn calculate_broadcast(ip: &str, netmask: &str) -> Result<String> {
  // 将 IP 地址和子网掩码转换为 u32
  let ip_u32 = ip_to_u32(ip)?;
  let netmask_u32 = ip_to_u32(netmask)?;

  // 计算广播地址
  let broadcast_u32 = ip_u32 | !netmask_u32;

  // 将 u32 转换回点分十进制字符串
  let broadcast_ip = format!(
    "{}.{}.{}.{}",
    (broadcast_u32 >> 24) & 0xFF,
    (broadcast_u32 >> 16) & 0xFF,
    (broadcast_u32 >> 8) & 0xFF,
    broadcast_u32 & 0xFF
  );

  Ok(broadcast_ip)
}

#[derive(Debug, Serialize, Deserialize)]
pub struct WakeData {
  ip: String,
  port: Option<u16>,
  mac: String,
  netmask: String,
}

pub fn wake(data: &WakeData) -> Result<()> {
  let mac = parse_mac(&data.mac)?;
  let magic_packet = create_magic_packet(mac);

  log::info!("wake magic packet {magic_packet:?}");

  let broadcast = calculate_broadcast(&data.ip, &data.netmask)?;
  log::info!("wake broadcast address {broadcast}");

  let socket = UdpSocket::bind(("0.0.0.0", 0))?;
  socket.set_broadcast(true)?;
  socket.send_to(&magic_packet, (broadcast.as_str(), data.port.unwrap_or(9)))?;

  Ok(())
}
