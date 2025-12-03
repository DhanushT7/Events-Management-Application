import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://10.5.12.1:4000/api';

// Get auth token from localStorage
const getAuthToken = () => {
  return localStorage.getItem('token');
};

// Create axios instance with default config
const api = axios.create({
  baseURL: `${API_BASE_URL}/certificates`,
});

// Add auth token to requests
api.interceptors.request.use((config) => {
  const token = getAuthToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Certificate service functions
export const certificateService = {
  // Generate single certificate
  generateCertificate: async (participantId, eventId) => {
    const response = await api.post('/generate', {
      participantId,
      eventId,
    });
    return response.data;
  },

  // Generate bulk certificates for an event
  bulkGenerateCertificates: async (eventId) => {
    const response = await api.post('/bulk-generate', {
      eventId,
    });
    return response.data;
  },

  // Download certificate
  downloadCertificate: async (certificateId) => {
    const response = await api.get(`/download/${certificateId}`, {
      responseType: 'blob',
    });
    return response.data;
  },

  // Get certificate details
  getCertificate: async (certificateId) => {
    const response = await api.get(`/${certificateId}`);
    return response.data;
  },

  // Verify certificate (public endpoint)
  verifyCertificate: async (certificateId) => {
    const response = await axios.get(`${API_BASE_URL}/certificates/verify/${certificateId}`);
    return response.data;
  },

  // Get certificates by participant
  getCertificatesByParticipant: async (participantId) => {
    const response = await api.get(`/participant/${participantId}`);
    return response.data;
  },

  // Get certificates by event
  getCertificatesByEvent: async (eventId) => {
    const response = await api.get(`/event/${eventId}`);
    return response.data;
  },

  // Update template configuration (admin only)
  updateTemplateConfig: async (templateConfig) => {
    const response = await api.put('/template-config', {
      templateConfig,
    });
    return response.data;
  },

  // Helper function to create download link
  createDownloadLink: (blob, filename) => {
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  },

  // Helper function to share certificate
  shareCertificate: async (certificate) => {
    const shareUrl = `${window.location.origin}/verify-certificate/${certificate.certificateId}`;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Certificate - ${certificate.eventTitle}`,
          text: `Check out my certificate for ${certificate.eventTitle}`,
          url: shareUrl,
        });
        return { success: true, method: 'native' };
      } catch (error) {
        console.error('Native sharing failed:', error);
      }
    }
    
    // Fallback: copy to clipboard
    try {
      await navigator.clipboard.writeText(shareUrl);
      return { success: true, method: 'clipboard', url: shareUrl };
    } catch (error) {
      console.error('Clipboard copy failed:', error);
      return { success: false, error: 'Could not share certificate' };
    }
  },

  // Format date helper
  formatDate: (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  },

  // Format date range helper
  formatDateRange: (startDate, endDate) => {
    const start = certificateService.formatDate(startDate);
    const end = certificateService.formatDate(endDate);
    return start === end ? start : `${start} - ${end}`;
  },

  // Validate certificate ID format
  validateCertificateId: (certificateId) => {
    const pattern = /^CERT-\d+-[A-Z0-9]+$/;
    return pattern.test(certificateId);
  },

  // Get certificate status color
  getStatusColor: (status) => {
    switch (status) {
      case 'generated':
        return 'success';
      case 'issued':
        return 'primary';
      case 'draft':
        return 'warning';
      case 'revoked':
        return 'error';
      default:
        return 'default';
    }
  },

  // Get certificate verification URL
  getVerificationUrl: (certificateId) => {
    return `${window.location.origin}/verify-certificate/${certificateId}`;
  },
};

export default certificateService;