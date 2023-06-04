export interface IDevice {
  uid: string;
  name: string;
  mac: string;
  ip: string;
  port: number;
}

export enum IDeviceStatus {
  Online = 'Online',
  Offline = 'Offline',
}
