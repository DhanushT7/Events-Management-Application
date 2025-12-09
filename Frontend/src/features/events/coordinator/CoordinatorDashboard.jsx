import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  Box,
  Container,
  Typography,
  Button,
  CircularProgress,
  Alert,
  Paper,
  Grid,
  Card,
  CardContent,
  Fade,
  Zoom,
  useTheme,
  alpha
} from "@mui/material";
import { 
  Add, 
  TrendingUp, 
  EventNote, 
  Assessment,
  Notifications,
  Schedule
} from "@mui/icons-material";
import { useSnackbar } from "notistack";
import { eventState } from "../../../shared/context/eventProvider";

// Import modular components
import DashboardHeader from "./components/DashboardHeader";
import EventsGrid from "./components/EventsGrid";
import EventFormDialog from "./components/EventFormDialog";
import ClaimBillDialog from "./components/ClaimBillDialog";
import { useEventOperations } from "./hooks/useEventOperations";
import { useFormState } from "./hooks/useFormState";
import { useClaimOperations } from "./hooks/useClaimOperations";

const CoordinatorDashboard = () => {
  const { enqueueSnackbar } = useSnackbar();
  const { user } = eventState();
  const navigate = useNavigate();
  const location = useLocation();

  // State management
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [openForm, setOpenForm] = useState(false);

  // Custom hooks for operations
  const {
    fetchEvents,
    handleEdit: getEventForEdit,
    handleDelete,
    handleGeneratePDF,
    handleViewBrochure
  } = useEventOperations(setEvents, setLoading, setError, enqueueSnackbar);

  const {
    formData,
    setFormData,
    editId,
    setEditId,
    activeStep,
    setActiveStep,
    submitting,
    resetForm,
    handleSubmit,
    newTargetAudience,
    setNewTargetAudience,
    newResourcePerson,
    setNewResourcePerson
  } = useFormState(setOpenForm, fetchEvents, enqueueSnackbar);

  const {
    claimData,
    setClaimData,
    incomeData,
    setIncomeData,
    openClaimDialog,
    setOpenClaimDialog,
    selectedProgramme,
    setSelectedProgramme,
    handleApplyClaim,
    handleSubmitClaim,
    handleViewFinalBudget
  } = useClaimOperations(setEvents, enqueueSnackbar);

  // Handle logout
  const handleLogOut = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userInfo");
    navigate("/");
  };

  // Handle create new event
  const handleCreateNew = () => {
    resetForm();
    setEditId(null);
    setActiveStep(0);
    setOpenForm(true);
  };

  const handleNavigateToEvent = (eventId, tabKey) => {
    if (tabKey) {
      navigate(`/coordinator/event/${eventId}`, { state: { defaultTab: tabKey } });
    } else {
      navigate(`/coordinator/event/${eventId}`);
    }
  };

  // Handle edit event
  const editEvent = async (eventId) => {
    try {
      const eventData = await getEventForEdit(eventId);
      if (eventData) {
        setFormData(eventData);
        setEditId(eventId);
        setActiveStep(0);
        setOpenForm(true);
      }
    } catch (error) {
      enqueueSnackbar('Failed to load event for editing', { variant: 'error' });
    }
  };

  // Handle edit mode from navigation
  useEffect(() => {
    const editingEvent = location.state?.editingEvent;
    const isEditMode = location.state?.editMode;

    if (isEditMode && editingEvent) {
      // Populate form with editing event data
      setFormData(editingEvent);
      setEditId(editingEvent._id);
      setOpenForm(true);
      
      // Clear the location state
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, [location.state, navigate, setFormData, setEditId]);

  // Initial data fetch
  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  // Error state
  if (error) {
    return (
      <Container maxWidth="xl" sx={{ py: 4 }}>
        <Alert severity="error">
          Failed to load dashboard data: {error}
          <Button onClick={() => window.location.reload()} sx={{ ml: 2 }}>
            Retry
          </Button>
        </Alert>
      </Container>
    );
  }

  // Loading state
  if (loading) {
    return (
      <Container maxWidth="xl" sx={{ py: 4 }}>
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            height: "80vh",
          }}
        >
          <CircularProgress size={60} />
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      {/* Dashboard Header */}
      <DashboardHeader 
        onLogout={handleLogOut}
        onCreateNew={handleCreateNew}
      />

      {/* Events Grid */}
      <EventsGrid
        events={events}
        onEdit={editEvent}
        onDelete={handleDelete}
        onApplyClaim={handleApplyClaim}
        onGeneratePDF={handleGeneratePDF}
        onViewBrochure={handleViewBrochure}
        onViewFinalBudget={handleViewFinalBudget}
        onNavigateToEvent={handleNavigateToEvent}
      />

      {/* Event Form Dialog */}
      <EventFormDialog
        open={openForm}
        onClose={() => setOpenForm(false)}
        formData={formData}
        setFormData={setFormData}
        editId={editId}
        activeStep={activeStep}
        setActiveStep={setActiveStep}
        submitting={submitting}
        onSubmit={handleSubmit}
        newTargetAudience={newTargetAudience}
        setNewTargetAudience={setNewTargetAudience}
        newResourcePerson={newResourcePerson}
        setNewResourcePerson={setNewResourcePerson}
      />

      {/* Enhanced Claim Bill Dialog with Income Support */}
      <ClaimBillDialog
        open={openClaimDialog}
        onClose={() => setOpenClaimDialog(false)}
        claimData={claimData}
        setClaimData={setClaimData}
        incomeData={incomeData}
        setIncomeData={setIncomeData}
        selectedProgramme={selectedProgramme}
        onSubmit={handleSubmitClaim}
      />
    </Container>
  );
};

export default CoordinatorDashboard;