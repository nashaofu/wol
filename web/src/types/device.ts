export interface Device {
  uid: string;
  name: string;
  mac: string;
  ip: string;
  netmask: string;
  port: number;
}

export enum DeviceStatus {
  Online = "Online",
  Offline = "Offline",
}
