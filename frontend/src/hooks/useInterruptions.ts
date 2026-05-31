import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../config/api';

export const useInterruptions = (stationId?: string, status?: string) => {
  const params = new URLSearchParams();
  if (stationId) params.append('stationId', stationId);
  if (status) params.append('status', status);

  return useQuery(
    ['interruptions', stationId, status],
    () =>
      apiClient.get(`/interruptions?${params.toString()}`),
    { staleTime: 2 * 60 * 1000, refetchInterval: 30000 }
  );
};

export const useCreateInterruption = () => {
  const queryClient = useQueryClient();

  return useMutation(
    (data: any) => apiClient.post(`/interruptions`, data),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['interruptions']);
      }
    }
  );
};

export const useUpdateInterruption = () => {
  const queryClient = useQueryClient();

  return useMutation(
    ({ id, status, ...patch }: { id: string; status?: string } & Record<string, any>) => {
      // Backend exposes POST /:id/restore for the restore transition.
      // PATCH /:id handles plain field updates (notes, etc.).
      if (status === 'Restored' || status === 'Resolved') {
        return apiClient.post(`/interruptions/${id}/restore`, patch);
      }
      return apiClient.patch(`/interruptions/${id}`, patch);
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['interruptions']);
      }
    }
  );
};
