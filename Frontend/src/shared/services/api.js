// API service for making backend requests

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

// Convenor Committee API calls
export const convenorCommitteeAPI = {
  // Get all convenor committee members
  getAll: async () => {
    const response = await fetch(`${API_BASE}/hod/convenor-committee`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });
    if (!response.ok) {
      throw new Error('Failed to fetch convenor committee members');
    }
    return response.json();
  },

  // Add a new convenor committee member
  add: async (member) => {
    const response = await fetch(`${API_BASE}/hod/convenor-committee`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(member),
    });
    if (!response.ok) {
      throw new Error('Failed to add convenor committee member');
    }
    return response.json();
  },

  // Update a convenor committee member
  update: async (id, member) => {
    const response = await fetch(`${API_BASE}/hod/convenor-committee/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(member),
    });
    if (!response.ok) {
      throw new Error('Failed to update convenor committee member');
    }
    return response.json();
  },

  // Delete a convenor committee member
  delete: async (id) => {
    const response = await fetch(`${API_BASE}/hod/convenor-committee/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    if (!response.ok) {
      throw new Error('Failed to delete convenor committee member');
    }
    return response.json();
  },

  // Initialize default organizing committee
  initializeDefault: async () => {
    const response = await fetch(`${API_BASE}/hod/convenor-committee/initialize-default`, {
      method: 'POST',
      headers: getAuthHeaders(),
    });
    if (!response.ok) {
      throw new Error('Failed to initialize default committee');
    }
    return response.json();
  },

  // Get available roles
  getAvailableRoles: async () => {
    const response = await fetch(`${API_BASE}/hod/convenor-committee/available-roles`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });
    if (!response.ok) {
      throw new Error('Failed to fetch available roles');
    }
    return response.json();
  }
};

// Events API calls
export const eventsAPI = {
  // Get event details with convenor committee members
  getWithConvenorCommittee: async (eventId) => {
    const response = await fetch(`${API_BASE}/hod/events/${eventId}/with-convenor-committee`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });
    if (!response.ok) {
      throw new Error('Failed to fetch event with convenor committee');
    }
    return response.json();
  }
};

// Users API calls
export const usersAPI = {
  // Get active HOD details
  getActiveHOD: async () => {
    const response = await fetch(`${API_BASE}/coordinator/getHOD`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });
    if (!response.ok) {
      throw new Error('Failed to fetch HOD details');
    }
    return response.json();
  }
};
