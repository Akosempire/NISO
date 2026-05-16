// src/hooks/useInterruptions.ts

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

export function useInterruptions() {
  return useQuery({
    queryKey: ['interruptions'],
    queryFn: async () => {
      const response = await fetch('/api/interruptions');
      if (!response.ok) throw new Error('Failed to fetch interruptions');
      return response.json();
    },
  });
}

export function useCreateInterruption() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: any) => {
      const response = await fetch('/api/interruptions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error('Failed to create interruption');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['interruptions'] });
    },
  });
}

export function useRestoreInterruption() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: { recordId: string; restorationTime: Date }) => {
      const response = await fetch(`/api/interruptions/${data.recordId}/restore`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error('Failed to restore interruption');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['interruptions'] });
    },
  });
}
