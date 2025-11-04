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

