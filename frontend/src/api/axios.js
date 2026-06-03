import axios from 'axios';

const api = axios.create({
  // Relative base URL: in dev the Vite proxy forwards /api → backend,
  // in prod nginx reverse-proxies /api → backend. Override via VITE_API_URL.
  baseURL: import.meta.env.VITE_API_URL || '/api',
  // Don't let a hung request block the UI indefinitely.
  timeout: 20000,
});

// Attach JWT to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// On an expired/invalid token (401), clear the session and bounce to login.
// Skip auth endpoints, where a 401 just means "wrong credentials".
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error?.response?.status;
    const url = error?.config?.url || '';
    const isAuthRoute = url.includes('/auth/login') || url.includes('/auth/register');
    if (status === 401 && !isAuthRoute) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      if (window.location.pathname !== '/login') {
        window.location.assign('/login');
      }
    }
    return Promise.reject(error);
  }
);

export default api;