import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../config/api';

export const useReadings = (stationId: string, date: string) => {
  return useQuery(
    ['readings', stationId, date],
    () => {
      const params = new URLSearchParams();
      if (stationId) params.append('stationId', stationId);
      if (date) params.append('date', date);
      params.append('limit', '100');
      return apiClient.get(`/readings?${params.toString()}`);
    },
    { staleTime: 5 * 60 * 1000, enabled: !!stationId }
  );
};

export const useCreateReading = () => {
  const queryClient = useQueryClient();

  return useMutation(
    (data: any) => apiClient.post(`/readings`, data),
    {
      onSuccess: (_, variables) => {
        queryClient.invalidateQueries(['readings', variables.stationId]);
      }
    }
  );
};

export const useSealReading = () => {
  const queryClient = useQueryClient();

  return useMutation(
    (readingId: string) =>
      apiClient.post(`/readings/${readingId}/seal`, {}),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['readings']);
      }
    }
  );
};

export const useUpdateReading = () => {
  const queryClient = useQueryClient();

  return useMutation(
    ({ id, ...patch }: { id: string } & Record<string, any>) =>
      apiClient.patch(`/readings/${id}`, patch),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['readings']);
      }
    }
  );
};
