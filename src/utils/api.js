const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

// Get auth token from localStorage
const getToken = () => {
  return localStorage.getItem('token');
};

// API request helper
const request = async (endpoint, options = {}) => {
  const token = getToken();

  // Debug: Log token status for authentication-required endpoints
  if (!token && (endpoint.includes('/hosts') || endpoint.includes('/fleets') || endpoint.includes('/vehicles'))) {
    console.warn('No token found for authenticated endpoint:', endpoint);
  }

  const config = {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
      // Only add Authorization if not already provided in options.headers
      ...(!options.headers?.Authorization && token && { Authorization: `Bearer ${token}` }),
    },
  };

  // Debug logging for verify requests
  if (endpoint.includes('/auth/verify')) {
    console.log('Verify request:', {
      endpoint,
      hasToken: !!token,
      hasAuthHeader: !!config.headers.Authorization,
      tokenPreview: token ? `${token.substring(0, 20)}...` : 'none'
    });
  }

  if (options.body && typeof options.body === 'object') {
    config.body = JSON.stringify(options.body);
    // Debug logging for registration requests
    if (endpoint.includes('/auth/register')) {
      console.log('Registration request:', {
        endpoint,
        body: options.body,
        serialized: config.body
      });
    }
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
        const currentPath = window.location.pathname;
        const isOnboarding = currentPath.startsWith('/onboarding');
        const isAuthPage = currentPath === '/login' || currentPath === '/register';

        // Determine the specific error type
        const errorType = data.error || '';
        const isExpired = errorType === 'TokenExpiredError' || data.message?.toLowerCase().includes('expired');
        const isInvalid = errorType === 'JsonWebTokenError' || data.message?.toLowerCase().includes('invalid');

        console.error('Authentication failed:', {
          status: response.status,
          message: data.message,
          error: data.error,
          errorType: errorType,
          isExpired: isExpired,
          isInvalid: isInvalid,
          hasToken: !!token,
          endpoint: endpoint,
          currentPath: currentPath
        });

        // Clear invalid/expired token from storage
        if (token && (isExpired || isInvalid)) {
          localStorage.removeItem('token');
        }

        if (token) {
          // Build a more helpful error message
          let errorMsg = data.message || 'Authentication failed';

          if (isExpired) {
            errorMsg = 'Your session has expired. Please log in again.';
          } else if (isInvalid) {
            errorMsg = 'Your session is invalid. Please log in again.';
          } else if (data.message) {
            errorMsg = data.message;
          }

          // During onboarding, provide more helpful error messages and don't redirect
          if (isOnboarding) {
            // For JsonWebTokenError, provide more specific guidance
            if (isInvalid && errorType === 'JsonWebTokenError') {
              throw new Error(
                'Your session token is invalid. This usually happens if the server was restarted.\n\n' +
                'Please log out and log back in to get a new token.'
              );
            }
            throw new Error(errorMsg + ' Please try logging out and logging back in.');
          }

          // For other protected routes, redirect to login
          if (!isAuthPage) {
            // Add a small delay to allow error to be logged
            setTimeout(() => {
              window.location.href = '/login?expired=true';
            }, 100);
            throw new Error(errorMsg);
          } else {
            // On auth pages, just throw the error
            throw new Error(errorMsg);
          }
        } else {
          // No token, redirect to login (unless already there)
          if (!isAuthPage && !isOnboarding) {
            setTimeout(() => {
              window.location.href = '/login?expired=true';
            }, 100);
            throw new Error('Authentication required. Please log in.');
          } else {
            throw new Error(data.message || 'Authentication required');
          }
        }
      }

      // Handle 400 Bad Request (validation errors)
      if (response.status === 400) {
        // Check if it's a validation error with an errors array
        if (data.errors && Array.isArray(data.errors) && data.errors.length > 0) {
          // Format validation errors into a readable message
          const errorMessages = data.errors.map(err => {
            const field = err.param || err.field || 'field';
            const msg = err.msg || err.message || 'Invalid value';
            return `${field}: ${msg}`;
          }).join(', ');
          throw new Error(`Validation failed: ${errorMessages}`);
        }
        // Otherwise use the message if available
        throw new Error(data.message || 'Bad request. Please check your input.');
      }

      // Handle 404 errors with more context
      if (response.status === 404) {
        const errorMsg = data.message || 'Resource not found';
        throw new Error(errorMsg);
      }

      // Handle other errors
      throw new Error(data.message || `Request failed: ${response.status}`);
    }

    return data;
  } catch (error) {
    console.error('API request error:', error);

    // Handle network errors (server not running, CORS, etc.)
    if (error instanceof TypeError && (error.message.includes('fetch') || error.message.includes('Load failed'))) {
      const apiUrl = API_URL.replace('/api', '');
      const port = apiUrl.split(':').pop() || '3001';
      throw new Error(
        `Unable to connect to server at ${apiUrl}.\n\n` +
        `Please make sure the backend server is running:\n` +
        `  1. Open a terminal in the project directory\n` +
        `  2. Run: npm run dev:server\n` +
        `  3. Or run both frontend and backend: npm run dev:all\n\n` +
        `The server should start on port ${port}.`
      );
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

  verify: () => {
    const token = getToken();
    if (!token) {
      return Promise.reject(new Error('No token available for verification'));
    }
    return request('/auth/verify', {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  },
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


