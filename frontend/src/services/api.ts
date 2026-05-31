import axios, { AxiosInstance } from 'axios';
import { useAuthStore } from '../stores/authStore';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

let apiInstance: AxiosInstance;

export const initializeApi = () => {
  apiInstance = axios.create({
    baseURL: API_BASE,
    headers: {
      'Content-Type': 'application/json'
    }
  });

  // Add token to requests
  apiInstance.interceptors.request.use((config) => {
    const token = useAuthStore.getState().token;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  });

  // Handle token refresh on 401
  apiInstance.interceptors.response.use(
    (response) => response,
    async (error) => {
      if (error.response?.status === 401) {
        useAuthStore.getState().logout();
        window.location.href = '/login';
      }
      return Promise.reject(error);
    }
  );

  return apiInstance;
};

export const api = () => apiInstance || initializeApi();

// Unwrap axios response.data so consumers can destructure { token, user } directly
// Backend list endpoints return raw arrays (e.g. `[reading, reading]`), but
// consumers access `query.data?.data` as if responses were wrapped. Normalize
// list responses to `{ data: [...] }` so the page-level access pattern is
// consistent. Object responses (login, single resource fetch, mutation
// results) pass through untouched.
const wrap = (payload: any) =>
  Array.isArray(payload) ? { data: payload } : payload;

export const apiClient = {
  get:    async (url: string, config?: any) => wrap((await api().get(url, config)).data),
  post:   async (url: string, data?: any, config?: any) => wrap((await api().post(url, data, config)).data),
  put:    async (url: string, data?: any, config?: any) => wrap((await api().put(url, data, config)).data),
  patch:  async (url: string, data?: any, config?: any) => wrap((await api().patch(url, data, config)).data),
  delete: async (url: string, config?: any) => wrap((await api().delete(url, config)).data)
};
