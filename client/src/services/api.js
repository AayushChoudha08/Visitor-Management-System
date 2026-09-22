import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

const getSession = () => {
  try {
    const raw = localStorage.getItem('vms_session');
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

// Request interceptor to inject active session role and ID
api.interceptors.request.use((config) => {
  const session = getSession();

  if (session?.role && session?.userId) {
    config.headers['x-user-role'] = session.role;
    config.headers['x-user-id'] = session.userId;
  }

  return config;
});

// Response interceptor for consistent error extraction
api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    let message = 'An unexpected error occurred. Please try again.';
    if (error.response && error.response.data) {
      message = error.response.data.message || message;
    } else if (error.request) {
      message = 'Unable to reach the server. Please ensure the backend is running.';
    } else if (error.message) {
      message = error.message;
    }
    return Promise.reject(new Error(message));
  }
);

export default api;
