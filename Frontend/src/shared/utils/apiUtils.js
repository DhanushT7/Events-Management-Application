// Centralized API utility for consistent authorization headers and error handling

const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://10.5.12.1:4000/api";

// Helper function to get auth headers
const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  
  // Remove quotes if they exist (localStorage sometimes adds them)
  const cleanToken = token ? token.replace(/"/g, '') : null;
  
  return {
    'Content-Type': 'application/json',
    ...(cleanToken && { 'Authorization': `Bearer ${cleanToken}` })
  };
};

// Helper function to handle auth errors
const handleAuthError = (response) => {
  if (response.status === 401) {

    localStorage.removeItem('token');
    localStorage.removeItem('userInfo');
    alert('Your session has expired or is invalid. Please log in again.');
    window.location.href = '/';
    return true; // Indicates auth error was handled
  }
  return false; // No auth error
};

// Generic fetch wrapper with automatic auth headers and error handling
export const apiRequest = async (endpoint, options = {}) => {
  const url = endpoint.startsWith('http') ? endpoint : `${API_BASE}${endpoint}`;
  
  const config = {
    headers: getAuthHeaders(),
    ...options,
    headers: {
      ...getAuthHeaders(),
      ...options.headers
    }
  };

  try {
    const response = await fetch(url, config);
    
    // Handle auth errors
    if (handleAuthError(response)) {
      return null; // Auth error handled, stop processing
    }
    
    // Handle other errors
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: 'Unknown error' }));
      throw new Error(errorData.message || `HTTP ${response.status}: ${response.statusText}`);
    }
    
    // Return response for further processing
    return response;
  } catch (error) {
    console.error('API Request failed:', error);
    throw error;
  }
};

// Convenience methods for common HTTP verbs
export const apiGet = async (endpoint, options = {}) => {
  const response = await apiRequest(endpoint, { method: 'GET', ...options });
  return response ? response.json() : null;
};

export const apiPost = async (endpoint, data, options = {}) => {
  const response = await apiRequest(endpoint, {
    method: 'POST',
    body: JSON.stringify(data),
    ...options
  });
  return response ? response.json() : null;
};

export const apiPut = async (endpoint, data, options = {}) => {
  const response = await apiRequest(endpoint, {
    method: 'PUT',
    body: JSON.stringify(data),
    ...options
  });
  return response ? response.json() : null;
};

export const apiDelete = async (endpoint, options = {}) => {
  const response = await apiRequest(endpoint, { method: 'DELETE', ...options });
  return response ? response.json() : null;
};

// For file downloads (returns blob)
export const apiDownload = async (endpoint, options = {}) => {
  const response = await apiRequest(endpoint, { method: 'GET', ...options });
  return response ? response.blob() : null;
};

export default {
  apiRequest,
  apiGet,
  apiPost,
  apiPut,
  apiDelete,
  apiDownload,
  getAuthHeaders
};