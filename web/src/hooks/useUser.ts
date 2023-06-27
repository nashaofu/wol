import useSWR, { SWRConfiguration } from 'swr';
import useSWRMutation, { SWRMutationConfiguration } from 'swr/mutation';
import { nanoid } from 'nanoid';
import fetcher from '@/utils/fetcher';
import { User } from '@/types/user';

type UseSaveDevicesConfig = SWRMutationConfiguration<
Device[],
Error,
Device[],
'/device/save'
>;

export function useUser(config?: SWRConfiguration<Device[]>) {
  return useSWR<User>(
    '/user/get',
    async (url) => fetcher.get<unknown, User>(url),
    {
      revalidateOnFocus: false,
      ...config,
    },
  );
}

export function useSaveUser(config?: UseSaveDevicesConfig) {
  const { mutate } = useUser();
  return useSWRMutation(
    '/user/save',
    async (url, { arg }: { arg: User }) => {
      const resp = await fetcher.post<unknown, User>(url, arg);

      await mutate(resp);

      return resp;
    },
    config,
  );
}
