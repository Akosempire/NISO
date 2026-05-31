import { apiClient } from './api';

/**
 * Axios-based auth service.
 * apiClient already unwraps .data and handles 401 redirect.
 */
export const authService = {
  /**
   * Login with email + password.
   * Returns { token, user } on success.
   */
  async login(email, password) {
    return apiClient.post('/auth/login', { email, password });
  },

  /**
   * Register a new user (HQ Admin only).
   */
  async register({ email, password, firstName, lastName, role, stationId, regionId }) {
    return apiClient.post('/auth/register', {
      email, password, firstName, lastName, role, stationId, regionId,
    });
  },

  /**
   * Fetch the current authenticated user profile.
   */
  async getCurrentUser() {
    return apiClient.get('/users/me');
  },
};

export default authService;
