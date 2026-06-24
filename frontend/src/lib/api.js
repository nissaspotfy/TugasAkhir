import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const setAuthToken = (token) => {
  if (token) {
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  } else {
    delete api.defaults.headers.common['Authorization'];
  }
};

// Add a request interceptor to include the token if it exists
api.interceptors.request.use(
  (config) => {
    // Check if Authorization header is already set (by setAuthToken)
    if (config.headers.Authorization) {
      return config;
    }

    const key = window.location.pathname.startsWith('/admin') ? 'admin-auth-storage' : 'customer-auth-storage';
    const state = JSON.parse(localStorage.getItem(key) || '{}');
    const token = state.state?.token;
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add a response interceptor to handle 401 Unauthorized errors (session expired)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      const key = window.location.pathname.startsWith('/admin') ? 'admin-auth-storage' : 'customer-auth-storage';
      localStorage.removeItem(key);
      localStorage.removeItem('adminActiveTab');
      localStorage.removeItem('customerActiveTab');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;
