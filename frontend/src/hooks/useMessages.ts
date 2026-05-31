import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../config/api';

// Messages are served by the notifications endpoint until the dedicated
// messaging service lands (see BUILD_LOG Phase 2).
const BASE = '/notifications';

export const useMessages = (stationId?: string) => {
  const params = new URLSearchParams();
  if (stationId) params.append('stationId', stationId);

  return useQuery(
    ['messages', stationId],
    () => apiClient.get(`${BASE}?${params.toString()}`),
    { staleTime: 30 * 1000, refetchInterval: 60 * 1000, enabled: !!stationId }
  );
};

export const useCreateMessage = () => {
  const queryClient = useQueryClient();

  return useMutation(
    (data: any) => apiClient.post(BASE, data),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['messages']);
      }
    }
  );
};

export const useAcknowledgeMessage = () => {
  const queryClient = useQueryClient();

  return useMutation(
    // Backend exposes PATCH /:id/read on the notifications router.
    (messageId: string) => apiClient.patch(`${BASE}/${messageId}/read`, {}),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['messages']);
      }
    }
  );
};
