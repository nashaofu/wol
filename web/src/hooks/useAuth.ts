import useSWR, { SWRConfiguration, useSWRConfig } from 'swr';
import useSWRMutation, { SWRMutationConfiguration } from 'swr/mutation';
import fetcher from '@/utils/fetcher';
import { Auth } from '@/types/auth';

type UseSaveAuthConfig = SWRMutationConfiguration<
Auth,
Error,
Auth,
'/auth/save'
>;

export function useAuth(config?: SWRConfiguration<Auth | null>) {
  return useSWR<Auth | null>(
    '/auth/info',
    (url) => fetcher.get<unknown, Auth | null>(url),
    {
      revalidateOnFocus: false,
      ...config,
    },
  );
}

export function useSaveAuth(config?: UseSaveAuthConfig) {
  const { mutate } = useSWRConfig();

  return useSWRMutation(
    '/auth/save',
    async (url, { arg }: { arg: Auth }) => {
      const resp = await fetcher.post<unknown, Auth>(url, arg);
      return resp;
    },
    {
      ...config,
      onSuccess: (resp, ...args) => {
        config?.onSuccess(resp, ...args);
        // 清理所有本地数据
        mutate(() => true, undefined, { revalidate: true });
      },
    },
  );
}
