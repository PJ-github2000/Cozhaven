// Centralized API configuration
// Uses Vite environment variables for flexibility across environments

// Fallback to absolute URL only if on Vite dev port, otherwise use relative path for production/FastAPI serving
const isViteDev = window.location.port === '5173';
export const API_BASE = import.meta.env.VITE_API_URL || (isViteDev ? 'http://localhost:8000/api' : '/api');

export const STRIPE_PUBLISHABLE_KEY = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || '';

export const getAuthHeaders = () => {
  return {
    'Content-Type': 'application/json',
  };
};

export const handleResponse = async (response) => {
  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: 'Request failed' }));
    if (response.status === 401) {
      // Clear user data on 401
      localStorage.removeItem('user');
      if (window.location.pathname !== '/') {
        window.location.href = '/';
      }
    }
    throw new Error(error.detail || 'API request failed');
  }
  return response.json();
};

export const apiFetch = (path, options = {}) => {
  const headers = getAuthHeaders();
  if (options.body instanceof FormData) {
    delete headers['Content-Type'];
  }
  return fetch(`${API_BASE}${path}`, {
    ...options,
    credentials: 'include', // Important for HttpOnly cookies
    headers: {
      ...headers,
      ...options.headers,
    },
  }).then(handleResponse);
};
