import axios from 'axios';

// Test profile update functionality
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://10.5.12.1:4000/api';

export const testProfileUpdate = async () => {
  try {
    const token = localStorage.getItem('token');
    if (!token) {
      console.error('No token found');
      return false;
    }

    // Test data
    const testData = {
      name: 'Test Coordinator',
      email: 'test@example.com',
      phone: '+1234567890',
      designation: 'Assistant Professor',
      department: 'Computer Science',
      employeeId: 'EMP001',
      bio: 'Test bio for coordinator profile'
    };

    console.log('Testing profile update with data:', testData);

    const response = await axios.put(
      `${API_BASE_URL}/coordinator/profile`,
      testData,
      {
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }
    );

    console.log('Profile update test response:', response.data);
    return response.data.success;
  } catch (error) {
    console.error('Profile update test failed:', error);
    if (error.response) {
      console.error('Error response:', error.response.data);
    }
    return false;
  }
};

// Test profile fetch functionality
export const testProfileFetch = async () => {
  try {
    const token = localStorage.getItem('token');
    if (!token) {
      console.error('No token found');
      return false;
    }

    console.log('Testing profile fetch...');

    const response = await axios.get(
      `${API_BASE_URL}/coordinator/profile`,
      {
        headers: { Authorization: `Bearer ${token}` }
      }
    );

    console.log('Profile fetch test response:', response.data);
    return response.data.success;
  } catch (error) {
    console.error('Profile fetch test failed:', error);
    if (error.response) {
      console.error('Error response:', error.response.data);
    }
    return false;
  }
};

// Test profile stats functionality
export const testProfileStats = async () => {
  try {
    const token = localStorage.getItem('token');
    if (!token) {
      console.error('No token found');
      return false;
    }

    console.log('Testing profile stats fetch...');

    const response = await axios.get(
      `${API_BASE_URL}/coordinator/profile/stats`,
      {
        headers: { Authorization: `Bearer ${token}` }
      }
    );

    console.log('Profile stats test response:', response.data);
    return true;
  } catch (error) {
    console.error('Profile stats test failed:', error);
    if (error.response) {
      console.error('Error response:', error.response.data);
    }
    return false;
  }
};

// Run all profile tests
export const runAllProfileTests = async () => {
  console.log('🧪 Running profile functionality tests...');
  
  const results = {
    fetch: await testProfileFetch(),
    stats: await testProfileStats(),
    update: await testProfileUpdate()
  };

  console.log('📊 Test Results:', results);
  
  const allPassed = Object.values(results).every(result => result === true);
  console.log(allPassed ? '✅ All tests passed!' : '❌ Some tests failed');
  
  return results;
};