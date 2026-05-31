import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../config/api';

export const useSLAEntries = (stationId: string, date: string) => {
  return useQuery(
    ['sla', stationId, date],
    () => {
      const params = new URLSearchParams();
      if (stationId) params.append('stationId', stationId);
      if (date) params.append('date', date);
      params.append('limit', '24');
      return apiClient.get(`/sla?${params.toString()}`);
    },
    { staleTime: 5 * 60 * 1000, enabled: !!stationId }
  );
};

export const useCreateSLA = () => {
  const queryClient = useQueryClient();

  return useMutation(
    (data: any) => apiClient.post(`/sla`, data),
    {
      onSuccess: (_, variables) => {
        queryClient.invalidateQueries(['sla', variables.stationId]);
      }
    }
  );
};

export const useApproveSLA = () => {
  const queryClient = useQueryClient();

  return useMutation(
    (entryId: string) =>
      apiClient.post(`/sla/${entryId}/approve`, {}),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['sla']);
      }
    }
  );
};

export const useUpdateSLA = () => {
  const queryClient = useQueryClient();

  return useMutation(
    ({ id, ...patch }: { id: string } & Record<string, any>) =>
      apiClient.patch(`/sla/${id}`, patch),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['sla']);
      }
    }
  );
};
