import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../config/api';

// Backend exposes /reports/summary for listing and /reports/export/{pdf,excel}
// — there is no per-report GET/POST list yet. Hooks below match what exists.
export const useReports = (stationId?: string) => {
  const params = new URLSearchParams();
  if (stationId) params.append('stationId', stationId);

  return useQuery(
    ['reports', stationId],
    () => apiClient.get(`/reports/summary?${params.toString()}`),
    { staleTime: 60 * 1000, enabled: !!stationId }
  );
};

export const useCreateReport = () => {
  const queryClient = useQueryClient();

  return useMutation(
    (data: any) => apiClient.post(`/reports`, data),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['reports']);
      }
    }
  );
};

export type ReportFormat = 'pdf' | 'xlsx' | 'csv';

export const useExportReport = () => {
  return useMutation(
    ({ reportId, format }: { reportId: string; format: ReportFormat }) => {
      const endpoint = format === 'pdf' ? 'export/pdf' : 'export/excel';
      return apiClient.post(`/reports/${endpoint}`, { reportId, format });
    }
  );
};
