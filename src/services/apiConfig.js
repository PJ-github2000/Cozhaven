// Centralized API configuration
// Uses Vite environment variables for flexibility across environments

// In development, Vite proxies /api to backend
// In production, set VITE_API_URL to your backend URL
export const API_BASE = import.meta.env.VITE_API_URL || '/api';

export const STRIPE_PUBLISHABLE_KEY = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || '';

export const getAuthHeaders = () => {
  return {
    'Content-Type': 'application/json',
  };
};

export const handleResponse = async (response) => {
  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: 'Request failed' }));
    let errorMessage = error.detail || 'API request failed';
    if (Array.isArray(error.detail)) {
      errorMessage = error.detail
        .map((item) => {
          const field = Array.isArray(item.loc) ? item.loc.filter((part) => part !== 'body').join('.') : 'field';
          return `${field}: ${item.msg}`;
        })
        .join('; ');
    }
    if (response.status === 401) {
      // Clear user data on 401
      localStorage.removeItem('user');
      if (window.location.pathname !== '/') {
        window.location.href = '/';
      }
    }
    throw new Error(errorMessage);
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
