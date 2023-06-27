import useSWR, { SWRConfiguration } from 'swr';
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
  const { mutate } = useAuth();
  return useSWRMutation(
    '/auth/save',
    async (url, { arg }: { arg: Auth }) => {
      const resp = await fetcher.post<unknown, Auth>(url, arg);

      await mutate(resp);

      return resp;
    },
    config,
  );
}