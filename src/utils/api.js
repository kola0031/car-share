const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Get auth token from localStorage
const getToken = () => {
  return localStorage.getItem('token');
};

// API request helper
const request = async (endpoint, options = {}) => {
  const token = getToken();
  const config = {
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    },
    ...options,
  };

  if (options.body && typeof options.body === 'object') {
    config.body = JSON.stringify(options.body);
  }

  try {
    const response = await fetch(`${API_URL}${endpoint}`, config);
    
    // Handle non-JSON responses or network errors
    let data;
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      data = await response.json();
    } else {
      const text = await response.text();
      throw new Error(text || `HTTP ${response.status}: ${response.statusText}`);
    }

    if (!response.ok) {
      // Handle 401/403 errors by clearing invalid token
      if (response.status === 401 || response.status === 403) {
        const token = getToken();
        if (token) {
          localStorage.removeItem('token');
          // Redirect to login if we're not already there
          if (window.location.pathname !== '/login' && window.location.pathname !== '/register') {
            window.location.href = '/login?expired=true';
          }
        }
      }
      throw new Error(data.message || `Request failed: ${response.status}`);
    }

    return data;
  } catch (error) {
    console.error('API request error:', error);
    
    // Handle network errors (server not running, CORS, etc.)
    if (error instanceof TypeError && error.message.includes('fetch')) {
      throw new Error('Unable to connect to server. Please make sure the backend is running on port 5000.');
    }
    
    throw error;
  }
};

// Auth API
export const authAPI = {
  login: (email, password) => request('/auth/login', {
    method: 'POST',
    body: { email, password },
  }),
  
  register: (userData) => request('/auth/register', {
    method: 'POST',
    body: userData,
  }),
  
  verify: () => request('/auth/verify', {
    headers: {
      Authorization: `Bearer ${getToken()}`,
    },
  }),
};

// Dashboard API
export const dashboardAPI = {
  getStats: () => request('/dashboard/stats'),
  getRecentReservations: () => request('/dashboard/recent-reservations'),
};

// Reservations API
export const reservationsAPI = {
  getAll: () => request('/reservations'),
  getOne: (id) => request(`/reservations/${id}`),
  create: (data) => request('/reservations', {
    method: 'POST',
    body: data,
  }),
  update: (id, data) => request(`/reservations/${id}`, {
    method: 'PUT',
    body: data,
  }),
  delete: (id) => request(`/reservations/${id}`, {
    method: 'DELETE',
  }),
};

// Vehicles API
export const vehiclesAPI = {
  getAll: () => request('/vehicles'),
  getOne: (id) => request(`/vehicles/${id}`),
  create: (data) => request('/vehicles', {
    method: 'POST',
    body: data,
  }),
  update: (id, data) => request(`/vehicles/${id}`, {
    method: 'PUT',
    body: data,
  }),
  delete: (id) => request(`/vehicles/${id}`, {
    method: 'DELETE',
  }),
};

// Hosts API
export const hostsAPI = {
  getAll: () => request('/hosts'),
  getOne: (id) => request(`/hosts/${id}`),
  getByUserId: (userId) => request(`/hosts/user/${userId}`),
  getDashboard: (id) => request(`/hosts/${id}/dashboard`),
  create: (data) => request('/hosts', {
    method: 'POST',
    body: data,
  }),
  update: (id, data) => request(`/hosts/${id}`, {
    method: 'PUT',
    body: data,
  }),
  delete: (id) => request(`/hosts/${id}`, {
    method: 'DELETE',
  }),
};

// Fleets API
export const fleetsAPI = {
  getAll: () => request('/fleets'),
  getOne: (id) => request(`/fleets/${id}`),
  create: (data) => request('/fleets', {
    method: 'POST',
    body: data,
  }),
  update: (id, data) => request(`/fleets/${id}`, {
    method: 'PUT',
    body: data,
  }),
  delete: (id) => request(`/fleets/${id}`, {
    method: 'DELETE',
  }),
};

// Subscriptions API
export const subscriptionsAPI = {
  getTiers: () => request('/subscriptions/tiers'),
  getCurrent: (hostId) => request(`/subscriptions?hostId=${hostId}`),
  getOne: (id) => request(`/subscriptions/${id}`),
  create: (data) => request('/subscriptions', {
    method: 'POST',
    body: data,
  }),
  update: (id, data) => request(`/subscriptions/${id}`, {
    method: 'PUT',
    body: data,
  }),
  cancel: (id) => request(`/subscriptions/${id}/cancel`, {
    method: 'POST',
  }),
  delete: (id) => request(`/subscriptions/${id}`, {
    method: 'DELETE',
  }),
};

// Performance API
export const performanceAPI = {
  getDashboard: (hostId) => request(`/performance/dashboard/${hostId}`),
  getRevenue: (hostId, startDate, endDate) => {
    const params = new URLSearchParams();
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);
    return request(`/performance/revenue/${hostId}?${params.toString()}`);
  },
};

// Tickets API
export const ticketsAPI = {
  getTypes: () => request('/tickets/types'),
  getAll: (hostId, filters = {}) => {
    const params = new URLSearchParams({ hostId, ...filters });
    return request(`/tickets?${params.toString()}`);
  },
  getOne: (id) => request(`/tickets/${id}`),
  create: (data) => request('/tickets', {
    method: 'POST',
    body: data,
  }),
  update: (id, data) => request(`/tickets/${id}`, {
    method: 'PUT',
    body: data,
  }),
  delete: (id) => request(`/tickets/${id}`, {
    method: 'DELETE',
  }),
};

// Leads API
export const leadsAPI = {
  getAll: (filters = {}) => {
    const params = new URLSearchParams(filters);
    return request(`/leads?${params.toString()}`);
  },
  getOne: (id) => request(`/leads/${id}`),
  create: (data) => request('/leads', {
    method: 'POST',
    body: data,
  }),
  update: (id, data) => request(`/leads/${id}`, {
    method: 'PUT',
    body: data,
  }),
  delete: (id) => request(`/leads/${id}`, {
    method: 'DELETE',
  }),
};

// Bookings API
export const bookingsAPI = {
  getAll: (filters = {}) => {
    const params = new URLSearchParams(filters);
    return request(`/bookings?${params.toString()}`);
  },
  getAvailable: (startDate, endDate, location) => {
    const params = new URLSearchParams({ startDate, endDate });
    if (location) params.append('location', location);
    return request(`/bookings/available?${params.toString()}`);
  },
  getOne: (id) => request(`/bookings/${id}`),
  create: (data) => request('/bookings', {
    method: 'POST',
    body: data,
  }),
  update: (id, data) => request(`/bookings/${id}`, {
    method: 'PUT',
    body: data,
  }),
  cancel: (id) => request(`/bookings/${id}/cancel`, {
    method: 'POST',
  }),
  delete: (id) => request(`/bookings/${id}`, {
    method: 'DELETE',
  }),
};

// Trips API
export const tripsAPI = {
  getAll: (filters = {}) => {
    const params = new URLSearchParams(filters);
    return request(`/trips?${params.toString()}`);
  },
  getActive: () => request('/trips/active'),
  getOne: (id) => request(`/trips/${id}`),
  start: (id, data) => request(`/trips/${id}/start`, {
    method: 'POST',
    body: data,
  }),
  complete: (id, data) => request(`/trips/${id}/complete`, {
    method: 'POST',
    body: data,
  }),
  update: (id, data) => request(`/trips/${id}`, {
    method: 'PUT',
    body: data,
  }),
  delete: (id) => request(`/trips/${id}`, {
    method: 'DELETE',
  }),
};

// Drivers API
export const driversAPI = {
  getAll: () => request('/drivers'),
  getOne: (id) => request(`/drivers/${id}`),
  getByUserId: (userId) => request(`/drivers/user/${userId}`),
  create: (data) => request('/drivers', {
    method: 'POST',
    body: data,
  }),
  update: (id, data) => request(`/drivers/${id}`, {
    method: 'PUT',
    body: data,
  }),
  delete: (id) => request(`/drivers/${id}`, {
    method: 'DELETE',
  }),
};

