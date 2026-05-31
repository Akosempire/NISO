// API Client for NISO Frontend
class NisoAPI {
  constructor(baseURL = 'http://localhost:3000/api') {
    this.baseURL = baseURL;
    this.token = localStorage.getItem('niso_token');
  }

  setToken(token) {
    this.token = token;
    localStorage.setItem('niso_token', token);
  }

  async request(method, endpoint, body = null) {
    const headers = {
      'Content-Type': 'application/json'
    };

    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    try {
      const response = await fetch(`${this.baseURL}${endpoint}`, {
        method,
        headers,
        body: body ? JSON.stringify(body) : null
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Request failed');
      }

      return await response.json();
    } catch (error) {
      console.error(`API Error [${method} ${endpoint}]:`, error);
      throw error;
    }
  }

  // Auth
  async login(email, password) {
    const data = await this.request('POST', '/auth/login', { email, password });
    this.setToken(data.token);
    return data;
  }

  async register(email, password, firstName, lastName, roleId, stationId) {
    return this.request('POST', '/auth/register', {
      email, password, firstName, lastName, roleId, stationId
    });
  }

  // Readings
  async getReadings(filters = {}) {
    const params = new URLSearchParams(filters);
    return this.request('GET', `/readings?${params}`);
  }

  async createReading(data) {
    return this.request('POST', '/readings', data);
  }

  async updateReadingStatus(id, status) {
    return this.request('PATCH', `/readings/${id}`, { status });
  }

  // SLA
  async getSLA(filters = {}) {
    const params = new URLSearchParams(filters);
    return this.request('GET', `/sla?${params}`);
  }

  async calculateSLA(data) {
    return this.request('POST', '/sla/calculate', data);
  }

  // Interruptions
  async getInterruptions(filters = {}) {
    const params = new URLSearchParams(filters);
    return this.request('GET', `/interruptions?${params}`);
  }

  async createInterruption(data) {
    return this.request('POST', '/interruptions', data);
  }

  async restoreEquipment(id, restoreTime) {
    return this.request('POST', `/interruptions/${id}/restore`, { restoreTime });
  }

  // Inspections
  async getInspections(filters = {}) {
    const params = new URLSearchParams(filters);
    return this.request('GET', `/inspections?${params}`);
  }

  async createInspection(data) {
    return this.request('POST', '/inspections', data);
  }

  async updateInspection(id, data) {
    return this.request('PATCH', `/inspections/${id}`, data);
  }

  // Equipment
  async getEquipment(filters = {}) {
    const params = new URLSearchParams(filters);
    return this.request('GET', `/equipment?${params}`);
  }

  async getEquipmentById(id) {
    return this.request('GET', `/equipment/${id}`);
  }

  async createEquipment(data) {
    return this.request('POST', '/equipment', data);
  }

  // Reports
  async getReportSummary(filters = {}) {
    const params = new URLSearchParams(filters);
    return this.request('GET', `/reports/summary?${params}`);
  }

  async exportPDF(filters = {}) {
    return this.request('POST', '/reports/export/pdf', filters);
  }

  // Notifications
  async getNotifications(unreadOnly = false) {
    return this.request('GET', `/notifications?unreadOnly=${unreadOnly}`);
  }

  async markNotificationRead(id) {
    return this.request('PATCH', `/notifications/${id}/read`);
  }

  // Users
  async getCurrentUser() {
    return this.request('GET', '/users/me');
  }

  async getUsers() {
    return this.request('GET', '/users');
  }

  async disableUser(id) {
    return this.request('PATCH', `/users/${id}/disable`);
  }
}

// WebSocket Connection
class NisoWebSocket {
  constructor(url = 'ws://localhost:3000') {
    this.url = url;
    this.ws = null;
    this.listeners = {};
  }

  connect() {
    return new Promise((resolve, reject) => {
      this.ws = new WebSocket(this.url);

      this.ws.onopen = () => {
        console.log('WebSocket connected');
        resolve();
      };

      this.ws.onmessage = (event) => {
        const message = JSON.parse(event.data);
        const handlers = this.listeners[message.type] || [];
        handlers.forEach(handler => handler(message));
      };

      this.ws.onerror = (error) => {
        console.error('WebSocket error:', error);
        reject(error);
      };

      this.ws.onclose = () => {
        console.log('WebSocket disconnected');
      };
    });
  }

  on(eventType, handler) {
    if (!this.listeners[eventType]) {
      this.listeners[eventType] = [];
    }
    this.listeners[eventType].push(handler);
  }

  disconnect() {
    if (this.ws) {
      this.ws.close();
    }
  }
}

// Export for use
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { NisoAPI, NisoWebSocket };
}
/**
 * DEPRECATED — this file is intentionally emptied.
 * Use src/services/api.ts (the centralized axios client) for all API calls.
 * Token key: "authToken" (not "niso_token").
 * Base URL:  VITE_API_URL env var → http://localhost:3001/api
 */
throw new Error(
  '[NISO] src/api/client.js is deprecated. Import apiClient from src/services/api.ts instead.'
);

