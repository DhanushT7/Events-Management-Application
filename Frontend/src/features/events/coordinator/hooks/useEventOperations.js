import { useCallback } from 'react';
import axios from 'axios';

export const useEventOperations = (setEvents, setLoading, setError, enqueueSnackbar) => {
  
  const fetchEvents = useCallback(async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const response = await axios.get(
        "http://10.5.12.1:4000/api/coordinator/programmes",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setEvents(Array.isArray(response.data) ? response.data : []);
    } catch (err) {
      console.error("Failed to fetch events:", err);
      setError(err.message);
      enqueueSnackbar("Failed to load events", { variant: "error" });
    } finally {
      setLoading(false);
    }
  }, [setEvents, setLoading, setError, enqueueSnackbar]);

  const handleEdit = useCallback(async (id) => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(
        `http://10.5.12.1:4000/api/coordinator/programmes/${id}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      const data = response.data;
      
      // Return the data for the calling component to handle
      return {
        ...data,
        startDate: new Date(data.startDate),
        endDate: new Date(data.endDate),
      };
    } catch (error) {
      console.error("❌ Error loading programme for editing:", error);
      enqueueSnackbar("Failed to load programme details", { variant: "error" });
      throw error;
    }
  }, [enqueueSnackbar]);

  const handleDelete = useCallback(async (id) => {
    if (!window.confirm("Are you sure you want to delete this note order?"))
      return;

    try {
      const token = localStorage.getItem("token");
      await axios.delete(
        `${import.meta.env.VITE_API_BASE_URL || 'http://10.5.12.1:4000/api'}/coordinator/programmes/${id}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      enqueueSnackbar("Note Order deleted successfully", {
        variant: "success",
      });
      await fetchEvents(); // refresh list
    } catch (error) {
      console.error("❌ Error deleting programme:", error);
      enqueueSnackbar("Failed to delete Note Order", { variant: "error" });
    }
  }, [fetchEvents, enqueueSnackbar]);

  const handleGeneratePDF = useCallback(async (event) => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(
        `${import.meta.env.VITE_API_BASE_URL || 'http://10.5.12.1:4000/api'}/coordinator/programmes/${event._id}/pdf`,
        {
          responseType: "blob",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      const blob = new Blob([response.data], {
        type: "application/pdf",
      });
      const url = window.URL.createObjectURL(blob);
      window.open(url, "_blank");
    } catch (error) {
      console.error("PDF generation failed:", error.message);
      enqueueSnackbar(
        "⚠️ PDF cannot be opened. Backend server is not running.",
        {
          variant: "error",
          autoHideDuration: 4000,
        }
      );
    }
  }, [enqueueSnackbar]);

  const handleViewBrochure = useCallback(async (event) => {
    try {
      // Import the advanced brochure generator dynamically
      const { generateEventBrochure } = await import('../../../../shared/services/advancedBrochureGenerator');
      
      // Generate the advanced AI brochure
      const doc = await generateEventBrochure(event);
      
      // Convert to blob and view in new window
      const pdfBlob = doc.output('blob');
      const pdfUrl = URL.createObjectURL(pdfBlob);
      const newWindow = window.open(pdfUrl);
      
      // Check if popup was blocked
      if (!newWindow || newWindow.closed || typeof newWindow.closed === 'undefined') {
        // Fallback: trigger download instead
        const link = document.createElement('a');
        link.href = pdfUrl;
        link.download = `${event.title?.replace(/[^a-zA-Z0-9]/g, '_') || 'event'}_advanced_brochure.pdf`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        enqueueSnackbar('Advanced AI brochure downloaded successfully!', { variant: 'success' });
      }

      // Clean up
      setTimeout(() => {
        URL.revokeObjectURL(pdfUrl);
      }, 4000);
      
      // Also try to save to backend
      try {
        const formData = new FormData();
        formData.append('brochurePDF', pdfBlob, `Advanced_Brochure_${event.title?.replace(/[^a-zA-Z0-9]/g, '_') || 'event'}.pdf`);
        
        const token = localStorage.getItem("token");
        await fetch(`${import.meta.env.VITE_API_BASE_URL || 'http://10.5.12.1:4000/api'}/coordinator/programmes/${event._id}/brochure/save`, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: formData
        });
      } catch (saveError) {
        console.warn("Failed to save advanced brochure to backend:", saveError.message);
      }
      
    } catch (error) {
      console.error("Error generating advanced brochure:", error.message);
      enqueueSnackbar(`Failed to generate advanced brochure: ${error.message}`, { variant: 'error' });
    }
  }, [enqueueSnackbar]);

  return {
    fetchEvents,
    handleEdit,
    handleDelete,
    handleGeneratePDF,
    handleViewBrochure
  };
};