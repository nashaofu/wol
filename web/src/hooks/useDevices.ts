import useSWR, { SWRConfiguration } from 'swr';
import useSWRMutation, { SWRMutationConfiguration } from 'swr/mutation';
import { nanoid } from 'nanoid';
import fetcher from '@/utils/fetcher';
import { IDevice } from '@/types/device';

type UseSaveDevicesConfig = SWRMutationConfiguration<
IDevice[],
Error,
IDevice[],
'/device/save'
>;

export function useDevices(config?: SWRConfiguration<IDevice[]>) {
  return useSWR<IDevice[]>(
    '/device/all',
    async (url) => {
      const resp = await fetcher.get<unknown, Omit<IDevice, 'uid'>[]>(url);
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
    async (url, { arg }: { arg: IDevice[] }) => {
      const resp = await fetcher.post<unknown, Omit<IDevice, 'uid'>[]>(
        url,
        arg.map((item) => ({
          ...item,
          uid: undefined,
        })),
      );

      const devices: IDevice[] = resp.map((item) => ({
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
    trigger: (device: Omit<IDevice, 'uid'>) => {
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
    trigger: (device: IDevice) => {
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
    trigger: (device: IDevice) => saveDevices.trigger(devices.filter((item) => item.uid !== device.uid)),
  };
}

export function useWakeDevice(
  config?: SWRMutationConfiguration<void, Error, IDevice, '/device/wake'>,
) {
  return useSWRMutation(
    '/device/wake',
    async (url, { arg }: { arg: IDevice }) => {
      await fetcher.post(url, arg);
      // 延迟 10s, 等待机器开机
      await new Promise<void>((resolve) => {
        setTimeout(() => resolve(), 10000);
      });
    },
    config,
  );
}
