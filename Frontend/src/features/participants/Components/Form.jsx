import React from 'react';
import { useSnackbar } from 'notistack';
import { Paper, Button, Typography, Box } from '@mui/material';
import { useLocation, useNavigate } from 'react-router-dom';
import { registerEvent } from './api';

const PForm = ({ user }) => {
  const { enqueueSnackbar } = useSnackbar();
  // Get eventId from query string
  const location = useLocation();
  const navigate = useNavigate();
  const params = new URLSearchParams(location.search);
  const eventId = params.get('eventId');

  // Assume user._id is available from context or props
  const participantId = "6857dbb542e87e57a8748a61"; // Replace with actual user ID

  // Helper function to format certificate requirements
  const formatCertificateRequirements = (certReq) => {
    if (!certReq || typeof certReq !== 'object') return 'Not specified';
    
    const parts = [];
    
    if (certReq.enabled) {
      if (certReq.attendanceRequired) {
        parts.push('Attendance required');
      }
      
      if (certReq.evaluation) {
        const evaluationMethods = [];
        
        if (certReq.evaluation.quiz?.enabled) {
          evaluationMethods.push(`Quiz (${certReq.evaluation.quiz.percentage}%)`);
        }
        if (certReq.evaluation.assignment?.enabled) {
          evaluationMethods.push(`Assignment (${certReq.evaluation.assignment.percentage}%)`);
        }
        if (certReq.evaluation.labWork?.enabled) {
          evaluationMethods.push(`Lab Work (${certReq.evaluation.labWork.percentage}%)`);
        }
        if (certReq.evaluation.finalTest?.enabled) {
          evaluationMethods.push(`Final Test (${certReq.evaluation.finalTest.percentage}%)`);
        }
        
        if (evaluationMethods.length > 0) {
          parts.push(`Evaluation: ${evaluationMethods.join(', ')}`);
        }
      }
      
      return parts.length > 0 ? parts.join('; ') : 'Certificate available upon completion';
    }
    
    return 'No certificate requirements';
  };

  // Fetch event details for display
  const [eventDetails, setEventDetails] = React.useState(null);
  React.useEffect(() => {
    if (!eventId) return;
    const fetchEvent = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await fetch(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000/api'}/participant/events`, {
          headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json"
          }
        });
        const allEvents = await res.json();
        const found = allEvents.find(ev => ev._id === eventId);
        setEventDetails(found);
      } catch (err) {
        console.error("❌ Error fetching event details:", err);
        setEventDetails(null);
      }
    };
    fetchEvent();
  }, [eventId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!participantId || !eventId) {
      enqueueSnackbar('Missing participant or event information.', { variant: 'warning' });
      return;
    }
    try {

      await registerEvent({ participantId, eventId });
      enqueueSnackbar('Registration successful! You will be redirected to the dashboard.', { variant: 'success' });
      
      // Redirect back to participant dashboard
      navigate('/participant/dashboard');
    } catch (err) {
      console.error("❌ Registration error:", err);
      enqueueSnackbar('Registration failed or already registered.', { variant: 'error' });
    }
  };

  return (
    <Box sx={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      position: 'relative',
      overflow: 'hidden',
      fontFamily: 'Roboto, Arial, sans-serif', // Match dashboard font
      color: '#fff', // Ensure all text is white
    }}>
      {/* Blurred background image */}
      <Box
        sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          backgroundImage: 'url(/Anna_University.jpg)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
          filter: 'blur(8px)',
          zIndex: 0,
        }}
      />
      {/* Foreground content */}
      <Paper sx={{
        p: 5,
        minWidth: 500,
        maxWidth: 700,
        maxHeight: '90vh',
        overflowY: 'auto',
        boxShadow: 6,
        zIndex: 1,
        position: 'relative',
        bgcolor: '#232323',
        color: '#fff',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        borderRadius: 5,
        fontFamily: 'Roboto, Arial, sans-serif', // Match dashboard font
      }}>
        <Typography variant="h4" gutterBottom sx={{ fontWeight: 600, color: '#fff', textAlign: 'center', fontFamily: 'inherit', fontSize: '2.1rem' }}>
          Register for Event
        </Typography>
        {eventDetails && (
          <Box sx={{ mb: 3, width: '100%', textAlign: 'left' }}>
            <Typography sx={{ color: '#fff', fontSize: '1.15rem', mb: 2, fontWeight: 500, fontFamily: 'inherit', textAlign: 'center' }}>
              <b>Event: {eventDetails.title || eventDetails.name}</b>
            </Typography>
            
            <Typography sx={{ color: '#fff', fontSize: '1.05rem', mb: 1, fontWeight: 400, fontFamily: 'inherit' }}>
              <b>Start Date:</b> {eventDetails.startDate ? new Date(eventDetails.startDate).toLocaleDateString() : '-'}
            </Typography>
            <Typography sx={{ color: '#fff', fontSize: '1.05rem', mb: 1, fontWeight: 400, fontFamily: 'inherit' }}>
              <b>End Date:</b> {eventDetails.endDate ? new Date(eventDetails.endDate).toLocaleDateString() : '-'}
            </Typography>
            <Typography sx={{ color: '#fff', fontSize: '1.05rem', mb: 1, fontWeight: 400, fontFamily: 'inherit' }}>
              <b>Venue:</b> {eventDetails.venue}
            </Typography>
            <Typography sx={{ color: '#fff', fontSize: '1.05rem', mb: 2, fontWeight: 400, fontFamily: 'inherit' }}>
              <b>Mode:</b> {eventDetails.mode}
            </Typography>

            {/* Registration Procedure Information */}
            {eventDetails.registrationProcedure && (
              <Box sx={{ mt: 3, p: 2, border: '1px solid rgba(255,255,255,0.3)', borderRadius: 1 }}>
                <Typography sx={{ color: '#fff', fontSize: '1.1rem', mb: 2, fontWeight: 500, fontFamily: 'inherit' }}>
                  Registration Information
                </Typography>
                
                {eventDetails.registrationProcedure.instructions && (
                  <Typography sx={{ color: '#fff', fontSize: '1rem', mb: 1.5, fontWeight: 400, fontFamily: 'inherit' }}>
                    <b>Instructions:</b> {eventDetails.registrationProcedure.instructions}
                  </Typography>
                )}

                {eventDetails.registrationProcedure.registrationDeadline && (
                  <Typography sx={{ color: '#fff', fontSize: '1rem', mb: 1, fontWeight: 400, fontFamily: 'inherit' }}>
                    <b>Registration Deadline:</b> {new Date(eventDetails.registrationProcedure.registrationDeadline).toLocaleDateString()}
                  </Typography>
                )}

                {eventDetails.registrationProcedure.participantLimit && (
                  <Typography sx={{ color: '#fff', fontSize: '1rem', mb: 1, fontWeight: 400, fontFamily: 'inherit' }}>
                    <b>Participant Limit:</b> {eventDetails.registrationProcedure.participantLimit}
                  </Typography>
                )}

                {eventDetails.registrationProcedure.selectionCriteria && (
                  <Typography sx={{ color: '#fff', fontSize: '1rem', mb: 1, fontWeight: 400, fontFamily: 'inherit' }}>
                    <b>Selection Criteria:</b> {eventDetails.registrationProcedure.selectionCriteria}
                  </Typography>
                )}

                {eventDetails.registrationProcedure.certificateRequirements && (
                  <Typography sx={{ color: '#fff', fontSize: '1rem', mb: 1, fontWeight: 400, fontFamily: 'inherit' }}>
                    <b>Certificate Requirements:</b> {formatCertificateRequirements(eventDetails.registrationProcedure.certificateRequirements)}
                  </Typography>
                )}

                {/* Payment Information */}
                {eventDetails.registrationProcedure.paymentDetails && (
                  <Box sx={{ mt: 2, p: 1.5, bgcolor: 'rgba(255,255,255,0.1)', borderRadius: 1 }}>
                    <Typography sx={{ color: '#fff', fontSize: '1rem', mb: 1, fontWeight: 500, fontFamily: 'inherit' }}>
                      Payment Details:
                    </Typography>
                    {eventDetails.registrationProcedure.paymentDetails.accountName && (
                      <Typography sx={{ color: '#fff', fontSize: '0.9rem', mb: 0.5, fontWeight: 400, fontFamily: 'inherit' }}>
                        Account: {eventDetails.registrationProcedure.paymentDetails.accountName}
                      </Typography>
                    )}
                    {eventDetails.registrationProcedure.paymentDetails.accountNumber && (
                      <Typography sx={{ color: '#fff', fontSize: '0.9rem', mb: 0.5, fontWeight: 400, fontFamily: 'inherit' }}>
                        Account Number: {eventDetails.registrationProcedure.paymentDetails.accountNumber}
                      </Typography>
                    )}
                    {eventDetails.registrationProcedure.paymentDetails.ifscCode && (
                      <Typography sx={{ color: '#fff', fontSize: '0.9rem', mb: 0.5, fontWeight: 400, fontFamily: 'inherit' }}>
                        IFSC: {eventDetails.registrationProcedure.paymentDetails.ifscCode}
                      </Typography>
                    )}
                    {eventDetails.registrationProcedure.paymentDetails.upiId && (
                      <Typography sx={{ color: '#fff', fontSize: '0.9rem', mb: 0.5, fontWeight: 400, fontFamily: 'inherit' }}>
                        UPI ID: {eventDetails.registrationProcedure.paymentDetails.upiId}
                      </Typography>
                    )}
                    {eventDetails.registrationProcedure.paymentDetails.notes && (
                      <Typography sx={{ color: '#fff', fontSize: '0.9rem', mb: 0.5, fontWeight: 400, fontFamily: 'inherit' }}>
                        Notes: {eventDetails.registrationProcedure.paymentDetails.notes}
                      </Typography>
                    )}
                  </Box>
                )}
              </Box>
            )}
          </Box>
        )}
        <Box component="form" onSubmit={handleSubmit} noValidate autoComplete="off" sx={{ width: '100%', textAlign: 'center' }}>
          <Typography sx={{ mb: 3, color: '#fff', fontSize: '1.05rem', fontWeight: 400, fontFamily: 'inherit' }}>Are you sure you want to register for this event?</Typography>
          <Button 
            variant="contained" 
            type="submit"
            sx={{
              bgcolor: '#232323', // match table bg
              color: '#fff', // match table text color
              border: '1.5px solid #fff',
              fontSize: '1rem',
              px: 3,
              py: 1.2,
              fontWeight: 500,
              fontFamily: 'inherit',
              boxShadow: 'none',
              '&:hover': { bgcolor: '#333', boxShadow: 'none' }
            }}
          >
            REGISTER
          </Button>
        </Box>
      </Paper>
    </Box>
  );
};

export default PForm;
