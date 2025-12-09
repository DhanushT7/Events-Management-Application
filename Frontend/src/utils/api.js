// src/utils/api.js
import axios from 'axios';

// Create axios instance
const api = axios.create({
  baseURL: 'http://10.5.12.1:4000/api', // Your backend URL
});

// Add request interceptor
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor for handling token expiration
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid, clear storage and redirect to login
      localStorage.removeItem('token');
      localStorage.removeItem('userInfo');
      window.location.href = '/login/admin';
    }
    return Promise.reject(error);
  }
);

export default api;
