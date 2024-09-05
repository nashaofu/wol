export interface Device {
  uid: string;
  name: string;
  mac: string;
  ip: string;
  port: number;
  netmask: string;
}

export enum DeviceStatus {
  Online = 'Online',
  Offline = 'Offline',
}
