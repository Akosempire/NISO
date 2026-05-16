// src/hooks/useReadings.ts

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

export function useReadings(equipmentId?: string) {
  return useQuery({
    queryKey: ['readings', equipmentId],
    queryFn: async () => {
      const params = equipmentId ? `?equipmentId=${equipmentId}` : '';
      const response = await fetch(`/api/readings${params}`);
      if (!response.ok) throw new Error('Failed to fetch readings');
      return response.json();
    },
  });
}

export function useCreateReading() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: any) => {
      const response = await fetch('/api/readings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error('Failed to create reading');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['readings'] });
    },
  });
}
