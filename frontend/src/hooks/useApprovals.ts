import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../config/api';

// Approvals endpoint planned for Phase 2 — supervisors review reading corrections,
// SLA entries, and inspection sign-offs from a unified queue.

export const useApprovals = (stationId?: string) => {
  const params = new URLSearchParams();
  if (stationId) params.append('stationId', stationId);

  return useQuery(
    ['approvals', stationId],
    () => apiClient.get(`/approvals?${params.toString()}`),
    { staleTime: 30 * 1000, refetchInterval: 60 * 1000, enabled: !!stationId }
  );
};

export const useApprove = () => {
  const queryClient = useQueryClient();

  return useMutation(
    ({ id, comment }: { id: string; comment?: string }) =>
      apiClient.post(`/approvals/${id}/approve`, { comment }),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['approvals']);
      }
    }
  );
};

export const useReject = () => {
  const queryClient = useQueryClient();

  return useMutation(
    ({ id, comment }: { id: string; comment: string }) =>
      apiClient.post(`/approvals/${id}/reject`, { comment }),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['approvals']);
      }
    }
  );
};
