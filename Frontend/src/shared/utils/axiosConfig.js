import axios from 'axios';

// Create axios instance
const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://10.5.12.1:4000/api',
});

// Request interceptor to add auth token
axiosInstance.interceptors.request.use(
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

// Response interceptor to handle auth errors
axiosInstance.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response?.status === 401) {
      const errorData = error.response.data;
      
      // Check if backend is signaling to clear token or any auth failure
      if (errorData?.clearToken || 
          errorData?.error === 'INVALID_TOKEN' || 
          errorData?.message === 'No token, authorization denied' ||
          errorData?.message?.includes('invalid signature') ||
          errorData?.message?.includes('Token expired') ||
          errorData?.message?.includes('Authentication failed')) {

        localStorage.removeItem('token');
        localStorage.removeItem('userInfo');
        
        // Show user-friendly message
        alert('Your session has expired or is invalid. Please log in again.');
        
        // Redirect to login page
        window.location.href = '/';
        return; // Don't continue with the error
      }
    }
    
    return Promise.reject(error);
  }
);

export default axiosInstance;