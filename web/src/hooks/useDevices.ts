import useSWR, { SWRConfiguration } from 'swr';
import useSWRMutation, { SWRMutationConfiguration } from 'swr/mutation';
import { nanoid } from 'nanoid';
import fetcher from '@/utils/fetcher';
import { Device } from '@/types/device';

type UseSaveDevicesConfig = SWRMutationConfiguration<
Device[],
Error,
Device[],
'/device/save'
>;

export function useDevices(config?: SWRConfiguration<Device[]>) {
  return useSWR<Device[]>(
    '/device/all',
    async (url) => {
      const resp = await fetcher.get<unknown, Omit<Device, 'uid'>[]>(url);
      const devices = resp.map((item) => ({
        ...item,
        uid: nanoid(),
      }));

      return devices;
    },
    {
      revalidateOnFocus: false,
      ...config,
    },
  );
}

export function useSaveDevices(config?: UseSaveDevicesConfig) {
  const { mutate } = useDevices();
  return useSWRMutation(
    '/device/save',
    async (url, { arg }: { arg: Device[] }) => {
      const resp = await fetcher.post<unknown, Omit<Device, 'uid'>[]>(
        url,
        arg.map((item) => ({
          ...item,
          uid: undefined,
        })),
      );

      const devices: Device[] = resp.map((item) => ({
        ...item,
        uid: nanoid(),
      }));

      await mutate(devices);

      return devices;
    },
    config,
  );
}

export function useAddDevice(config?: UseSaveDevicesConfig) {
  const { data: devices = [] } = useDevices();
  const saveDevices = useSaveDevices(config);

  return {
    ...saveDevices,
    trigger: (device: Omit<Device, 'uid'>) => {
      devices.push({
        ...device,
        uid: nanoid(),
      });

      return saveDevices.trigger(devices);
    },
  };
}

export function useUpdateDevice(config?: UseSaveDevicesConfig) {
  const { data: devices = [] } = useDevices();
  const saveDevices = useSaveDevices(config);

  return {
    ...saveDevices,
    trigger: (device: Device) => {
      const index = devices.findIndex((item) => item.uid === device.uid);
      if (index !== -1) {
        devices[index] = device;
      }

      return saveDevices.trigger(devices);
    },
  };
}

export function useDeleteDevice(config?: UseSaveDevicesConfig) {
  const { data: devices = [] } = useDevices();
  const saveDevices = useSaveDevices(config);

  return {
    ...saveDevices,
    trigger: (device: Device) => saveDevices.trigger(devices.filter((item) => item.uid !== device.uid)),
  };
}

export function useWakeDevice(
  config?: SWRMutationConfiguration<void, Error, Device, '/device/wake'>,
) {
  return useSWRMutation(
    '/device/wake',
    async (url, { arg }: { arg: Device }) => {
      await fetcher.post(url, arg);
      // 延迟 10s, 等待机器开机
      await new Promise<void>((resolve) => {
        setTimeout(() => resolve(), 10000);
      });
    },
    config,
  );
}
