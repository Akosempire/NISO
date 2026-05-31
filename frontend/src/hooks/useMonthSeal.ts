import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../config/api';

export type SealState = 'OPEN' | 'REVIEW' | 'SEALED';

interface SealRecord {
  stationId: string;
  year: number;
  month: number;
  state: SealState;
  transitionedAt: string | null;
  transitionedBy: string | null;
  readingsSealed?: number;
  slaApproved?: number;
}

export const useMonthSeal = (stationId?: string, year?: number, month?: number) => {
  return useQuery<SealRecord>(
    ['month-seal', stationId, year, month],
    async () => {
      const params = new URLSearchParams();
      if (stationId) params.append('stationId', stationId);
      if (year != null) params.append('year', String(year));
      if (month != null) params.append('month', String(month));
      return apiClient.get(`/month/seal?${params.toString()}`) as Promise<SealRecord>;
    },
    { enabled: !!stationId && year != null && month != null, staleTime: 30 * 1000 }
  );
};

export const useTransitionMonthSeal = () => {
  const queryClient = useQueryClient();

  return useMutation(
    (vars: { stationId: string; year: number; month: number; transition: 'REVIEW' | 'SEALED' }) =>
      apiClient.post(`/month/seal`, vars),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['month-seal']);
      }
    }
  );
};
