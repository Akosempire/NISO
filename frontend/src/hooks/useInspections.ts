import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../config/api';

export const useInspections = (stationId?: string) => {
  const params = new URLSearchParams();
  if (stationId) params.append('stationId', stationId);

  return useQuery(
    ['inspections', stationId],
    () => apiClient.get(`/inspections?${params.toString()}`),
    { staleTime: 5 * 60 * 1000, enabled: !!stationId }
  );
};

export const useCreateInspection = () => {
  const queryClient = useQueryClient();

  return useMutation(
    (data: any) => apiClient.post(`/inspections`, data),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['inspections']);
      }
    }
  );
};

export const useApproveInspection = () => {
  const queryClient = useQueryClient();

  return useMutation(
    (inspectionId: string) =>
      apiClient.post(`/inspections/${inspectionId}/approve`, {}),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['inspections']);
      }
    }
  );
};

export const useUpdateInspection = () => {
  const queryClient = useQueryClient();

  return useMutation(
    ({ id, ...patch }: { id: string } & Record<string, any>) =>
      apiClient.patch(`/inspections/${id}`, patch),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['inspections']);
      }
    }
  );
};
