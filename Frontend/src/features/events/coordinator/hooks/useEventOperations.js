import { useCallback } from 'react';
import axios from 'axios';

/**
 * Hook: useEventOperations
 *
 * - Uses import.meta.env.VITE_API_BASE_URL (with fallback) for all API calls.
 * - Exposes: fetchEvents, handleEdit, handleDelete, handleGeneratePDF, handleViewBrochure
 *
 * Usage:
 * const {
 *   fetchEvents,
 *   handleEdit,
 *   handleDelete,
 *   handleGeneratePDF,
 *   handleViewBrochure
 * } = useEventOperations(setEvents, setLoading, setError, enqueueSnackbar);
 *
 * NOTE: handleDelete no longer shows a browser confirm dialog. The caller (UI)
 * should present a confirmation dialog (MUI) and call handleDelete(id) after confirmation.
 */

const DEFAULT_API_BASE = 'http://10.5.12.1:4000/api'; // fallback if env missing
const API_BASE = (import.meta.env?.VITE_API_BASE_URL || DEFAULT_API_BASE).replace(/\/+$/, ''); // trim trailing slash

export const useEventOperations = (setEvents, setLoading, setError, enqueueSnackbar) => {
  // small helper to get token and common headers
  const getAuthHeaders = () => {
    const token = localStorage.getItem('token');
    return token ? { Authorization: `Bearer ${token}` } : {};
  };

  const fetchEvents = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const url = `${API_BASE}/coordinator/programmes`;
      const response = await axios.get(url, { headers: getAuthHeaders() });
      setEvents(Array.isArray(response?.data) ? response.data : []);
    } catch (err) {
      console.error('Failed to fetch events:', err);
      const message = err?.response?.data?.message || err.message || 'Unknown error';
      setError(message);
      enqueueSnackbar('Failed to load events', { variant: 'error' });
    } finally {
      setLoading(false);
    }
  }, [setEvents, setLoading, setError, enqueueSnackbar]);

  const handleEdit = useCallback(
    async (id) => {
      try {
        const url = `${API_BASE}/coordinator/programmes/${id}`;
        const response = await axios.get(url, { headers: getAuthHeaders() });
        const data = response.data || {};

        // Normalize date fields to Date objects if present
        const normalizeDate = (d) => (d ? new Date(d) : d);
        return {
          ...data,
          startDate: normalizeDate(data.startDate),
          endDate: normalizeDate(data.endDate),
        };
      } catch (error) {
        console.error('❌ Error loading programme for editing:', error);
        enqueueSnackbar('Failed to load programme details', { variant: 'error' });
        throw error;
      }
    },
    [enqueueSnackbar]
  );

  /**
   * handleDelete
   *
   * Performs the delete request immediately. Does NOT show any UI confirmation.
   * The caller should confirm with the user (MUI dialog) before invoking this.
   *
   * Returns a Promise that resolves when deletion completes (or rejects on error).
   */
  const handleDelete = useCallback(
    async (id) => {
      try {
        const url = `${API_BASE}/coordinator/programmes/${id}`;
        await axios.delete(url, { headers: getAuthHeaders() });

        enqueueSnackbar('Note Order deleted successfully', { variant: 'success' });
        // refresh list
        await fetchEvents();
      } catch (error) {
        console.error('❌ Error deleting programme:', error);
        const message = error?.response?.data?.message || error.message || 'Delete failed';
        enqueueSnackbar(`Failed to delete Note Order: ${message}`, { variant: 'error' });
        // rethrow so callers can handle if needed
        throw error;
      }
    },
    [fetchEvents, enqueueSnackbar]
  );

  const handleGeneratePDF = useCallback(
    async (event) => {
      if (!event?._id) {
        enqueueSnackbar('Event id missing for PDF generation', { variant: 'warning' });
        return;
      }

      try {
        const url = `${API_BASE}/coordinator/programmes/${event._id}/pdf`;
        const response = await axios.get(url, {
          headers: getAuthHeaders(),
          responseType: 'blob',
        });

        const blob = new Blob([response.data], { type: 'application/pdf' });
        const urlObj = window.URL.createObjectURL(blob);

        // try open in new tab/window
        const newWindow = window.open(urlObj, '_blank', 'noopener,noreferrer');
        if (!newWindow) {
          // popup blocked: fallback to download
          const link = document.createElement('a');
          link.href = urlObj;
          link.download = `${(event.title || 'programme').replace(/[^a-zA-Z0-9-_]/g, '_')}.pdf`;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
        }

        // cleanup
        setTimeout(() => URL.revokeObjectURL(urlObj), 5_000);
      } catch (error) {
        console.error('PDF generation failed:', error);
        const message = error?.response?.data?.message || error.message || 'PDF generation failed';
        enqueueSnackbar('⚠️ PDF cannot be opened. Backend server may be down.', {
          variant: 'error',
          autoHideDuration: 4000,
        });
      }
    },
    [enqueueSnackbar]
  );

  const handleViewBrochure = useCallback(
    async (event) => {
      if (!event) {
        enqueueSnackbar('Event data missing for brochure generation', { variant: 'warning' });
        return;
      }

      try {
        // dynamic import of your advanced brochure generator
        const { generateEventBrochure } = await import('../../../../shared/services/advancedBrochureGenerator');

        // generate doc (assumes generateEventBrochure returns a jsPDF-like instance with output('blob'))
        const doc = await generateEventBrochure(event);

        // handle jsPDF-style or raw Blob
        let pdfBlob;
        if (typeof doc?.output === 'function') {
          pdfBlob = doc.output('blob');
        } else if (doc instanceof Blob) {
          pdfBlob = doc;
        } else {
          // support for ArrayBuffer or Uint8Array
          if (doc instanceof ArrayBuffer || ArrayBuffer.isView(doc)) {
            pdfBlob = new Blob([doc], { type: 'application/pdf' });
          } else {
            throw new Error('Unsupported brochure output format');
          }
        }

        const pdfUrl = URL.createObjectURL(pdfBlob);

        // open in new window or fallback to download
        const newWindow = window.open(pdfUrl, '_blank', 'noopener,noreferrer');
        if (!newWindow) {
          const link = document.createElement('a');
          link.href = pdfUrl;
          link.download = `${(event.title || 'event').replace(/[^a-zA-Z0-9]/g, '_')}_advanced_brochure.pdf`;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);

          enqueueSnackbar('Advanced AI brochure downloaded successfully!', { variant: 'success' });
        } else {
          enqueueSnackbar('Advanced AI brochure opened in new tab', { variant: 'info' });
        }

        // cleanup URL
        setTimeout(() => URL.revokeObjectURL(pdfUrl), 5_000);

        // attempt to save to backend (non-blocking)
        (async () => {
          try {
            const formData = new FormData();
            formData.append(
              'brochurePDF',
              pdfBlob,
              `Advanced_Brochure_${(event.title || 'event').replace(/[^a-zA-Z0-9]/g, '_')}.pdf`
            );

            const saveUrl = `${API_BASE}/coordinator/programmes/${event._id}/brochure/save`;
            const token = localStorage.getItem('token');

            // use fetch to send FormData (axios can, but fetch keeps it simple here)
            await fetch(saveUrl, {
              method: 'POST',
              headers: token ? { Authorization: `Bearer ${token}` } : undefined,
              body: formData,
            });
          } catch (saveError) {
            console.warn('Failed to save advanced brochure to backend:', saveError);
          }
        })();
      } catch (error) {
        console.error('Error generating advanced brochure:', error);
        const message = error?.message || 'Brochure generation failed';
        enqueueSnackbar(`Failed to generate advanced brochure: ${message}`, { variant: 'error' });
      }
    },
    [enqueueSnackbar]
  );

  return {
    fetchEvents,
    handleEdit,
    handleDelete,
    handleGeneratePDF,
    handleViewBrochure,
  };
};
