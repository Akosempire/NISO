import { useQuery, useMutation } from '@tanstack/react-query';
import { apiClient } from '../config/api';

// Knowledge endpoints are part of Phase 2 (BUILD_LOG). These hooks
// match the planned `/knowledge` and `/knowledge/search` and `/ask-ai` routes —
// they will resolve once the backend service is online.

export const useKnowledgeArticles = (category?: string) => {
  const params = new URLSearchParams();
  if (category) params.append('category', category);

  return useQuery(
    ['knowledge-articles', category],
    () => apiClient.get(`/knowledge?${params.toString()}`),
    { staleTime: 10 * 60 * 1000 }
  );
};

export const useSearchKnowledge = (query: string) => {
  return useQuery(
    ['knowledge-search', query],
    () => apiClient.get(`/knowledge/search?q=${encodeURIComponent(query)}`),
    { enabled: query.trim().length >= 3, staleTime: 5 * 60 * 1000 }
  );
};

export const useAskAI = () => {
  return useMutation(
    (question: string) => apiClient.post('/knowledge/ask', { question })
  );
};
