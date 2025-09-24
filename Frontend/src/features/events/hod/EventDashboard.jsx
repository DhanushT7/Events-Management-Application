import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Box,
  Container,
  Typography,
  Button,
  Card,
  CardContent,
  Grid ,
  Chip,
  IconButton,
  Avatar,
  Divider,
  Paper,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  CircularProgress,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Tabs,
  Tab,
  Badge,
  LinearProgress,
  FormControl,
  InputLabel,
  Select,
  MenuItem
} from "@mui/material";
import {
  ArrowBack,
  CheckCircle,
  Cancel,
  PendingActions,
  AttachFile,
  DateRange,
  People,
  MonetizationOn,
  Approval,
  Receipt,
  AccountBalance,
  EventAvailable,
  Download,
  Visibility,
  Analytics,
  Assignment,
  Group,
  Timeline,
  TrendingUp,
  Comment,
  Print,
  Email,
} from "@mui/icons-material";
import axios from "axios";
import { useSnackbar } from "notistack";
import { eventState } from "../../../shared/context/eventProvider";
import EnhancedParticipantDashboard from "../../../shared/components/EnhancedParticipantDashboard";
import FeedbackStatsCard from "../../../shared/components/FeedbackStatsCard";
import AddParticipantModal from "../../../shared/components/AddParticipantModal";
import { generateEventBrochure } from "../../../shared/services/advancedBrochureGenerator";

const HODEventDashboard = () => {
  const { eventId } = useParams();
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();
  const { user } = eventState();
  
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [tabValue, setTabValue] = useState(0);
  const [participants, setParticipants] = useState([]);
  const [approvalDialogOpen, setApprovalDialogOpen] = useState(false);
  const [newStatus, setNewStatus] = useState("");
  const [comments, setComments] = useState("");

  useEffect(() => {
    fetchEventDetails();
    fetchParticipants();
  }, [eventId]);

  const fetchEventDetails = async () => {
    try {
      const response = await axios.get(`${import.meta.env.VITE_API_BASE_URL || 'http://10.5.12.1:4000/api'}/hod/events/${eventId}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      setEvent(response.data);
    } catch (error) {
      console.error("Error fetching event details:", error);
      enqueueSnackbar("Error fetching event details", { variant: "error" });
    } finally {
      setLoading(false);
    }
  };

  const fetchParticipants = async () => {
    try {
      const response = await axios.get(`${import.meta.env.VITE_API_BASE_URL || 'http://10.5.12.1:4000/api'}/hod/events/${eventId}/participants`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      
      if (response.data.success) {
        setParticipants(response.data.participants || []);
      } else {
        setParticipants([]);
      }
    } catch (error) {

      setParticipants([]);
    }
  };

  const handleStatusUpdate = async () => {
    try {
      await axios.put(
        `${import.meta.env.VITE_API_BASE_URL || 'http://10.5.12.1:4000/api'}/hod/events/${eventId}/status`,
        { 
          status: newStatus,
          reviewComments: comments 
        },
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      );
      
      enqueueSnackbar(`Event ${newStatus} successfully`, { variant: "success" });
      setApprovalDialogOpen(false);
      fetchEventDetails(); // Refresh event data
    } catch (error) {
      console.error("Error updating status:", error);
      enqueueSnackbar("Error updating event status", { variant: "error" });
    }
  };

  const downloadProposalLetter = async () => {
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_API_BASE_URL || 'http://10.5.12.1:4000/api'}/hod/events/${eventId}/proposal-pdf`,
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
          responseType: "blob",
        }
      );
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `${event.title}_proposal.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error("Error downloading proposal:", error);
      enqueueSnackbar("Error downloading proposal", { variant: "error" });
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "approved": return "success";
      case "rejected": return "error";
      case "pending": return "warning";
      default: return "default";
    }
  };

  const getProgress = () => {
    if (!event) return { progress: 0, steps: [] };
    
    let progress = 0;
    let steps = [];
    
    // Step 1: Event Created (15%)
    progress += 15;
    steps.push("Event created");
    
    // Step 2: Basic Details Complete (10%)
    if (event.title && event.startDate && event.endDate && event.venue && 
        event.objectives && event.outcomes && event.targetAudience?.length > 0) {
      progress += 10;
      steps.push("Basic details complete");
    }
    
    // Step 3: Budget Breakdown Complete (15%)
    if (event.budgetBreakdown?.income?.length > 0 && 
        event.budgetBreakdown?.expenses?.length > 0) {
      progress += 15;
      steps.push("Budget breakdown complete");
    }
    
    // Step 4: Coordinators Added (10%)
    if (event.coordinators?.length > 0) {
      progress += 10;
      steps.push("Coordinators assigned");
    }
    
    // Step 5: Brochure Uploaded (15%)
    if (event.brochure) {
      progress += 15;
      steps.push("Brochure uploaded");
    }
    
    // Step 6: Event Approved by HOD (20%)
    if (event.status === "approved") {
      progress += 20;
      steps.push("Approved by HOD");
    } else if (event.status === "rejected") {
      // Don't add progress for rejection
      steps.push("Rejected by HOD");
    }
    
    // Step 7: Event Conducted (10%) - Check if event date has passed
    const eventEndDate = new Date(event.endDate);
    const currentDate = new Date();
    if (eventEndDate < currentDate && event.status === "approved") {
      progress += 10;
      steps.push("Event conducted");
    }
    
    // Step 8: Claim Bill Submitted (5%)
    if (event.claimSubmitted) {
      progress += 5;
      steps.push("Claim bill submitted");
    }
    
    return { progress: Math.min(progress, 100), steps };
  };

  const calculateTotalIncome = () => {
    if (!event.noteOrder?.income) return 0;
    return event.noteOrder.income.reduce((sum, item) => sum + (item.income || 0), 0);
  };

  const calculateTotalExpenses = () => {
    if (event.claimBill?.expenses) {
      // Use actual amounts from claim bill for final calculations
      return event.claimBill.expenses.reduce((sum, item) => sum + (item.actualAmount || 0), 0);
    }
    if (event.budgetBreakdown?.expenses) {
      return event.budgetBreakdown.expenses.reduce((sum, item) => sum + (item.amount || 0), 0);
    }
    return 0;
  };

  const downloadCompleteBrochure = async () => {
    try {
      // Generate the styled brochure using the frontend generator
      const doc = await generateEventBrochure(event);
      
      // Save as PDF blob and download
      const pdfBlob = doc.output('blob');
      
      // Create download link
      const url = URL.createObjectURL(pdfBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${event.title?.replace(/[^a-zA-Z0-9]/g, '_') || 'event'}_brochure.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      // Clean up
      URL.revokeObjectURL(url);
      
      enqueueSnackbar("Professional brochure downloaded successfully!", { 
        variant: "success" 
      });
      
    } catch (error) {
      console.error("Error generating brochure:", error);
      enqueueSnackbar("Failed to generate brochure. Please try again.", { 
        variant: "error" 
      });
    }
  };

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="50vh">
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  if (!event) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Alert severity="error">Event not found</Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      {/* Header */}
      <Box display="flex" alignItems="center" mb={3}>
        <IconButton onClick={() => navigate("/hod/dashboard")} sx={{ mr: 2 }}>
          <ArrowBack />
        </IconButton>
        <Typography variant="h4" component="h1" flexGrow={1}>
          {event.title}
        </Typography>
        <Box display="flex" gap={1}>
          <Button
            variant="contained"
            color="success"
            startIcon={<CheckCircle />}
            onClick={() => {
              setNewStatus("approved");
              setApprovalDialogOpen(true);
            }}
            disabled={event.status === "approved" || event.status === "rejected"}
          >
            Approve
          </Button>
          <Button
            variant="contained"
            color="error"
            startIcon={<Cancel />}
            onClick={() => {
              setNewStatus("rejected");
              setApprovalDialogOpen(true);
            }}
            disabled={event.status === "approved" || event.status === "rejected"}
          >
            Reject
          </Button>
          <Button
            variant="outlined"
            startIcon={<Download />}
            onClick={downloadProposalLetter}
          >
            Download Note Order
          </Button>
          <Button
            variant="outlined"
            startIcon={<Download />}
            onClick={downloadCompleteBrochure}
          >
            Download Brochure (PDF)
          </Button>
        </Box>
      </Box>

      {/* Status Alert */}
      {event.status !== "pending" && (
        <Alert 
          severity={getStatusColor(event.status)} 
          sx={{ mb: 3 }}
          icon={event.status === "approved" ? <CheckCircle /> : <Cancel />}
        >
          This event has been {event.status}
          {event.reviewComments && ` - ${event.reviewComments}`}
        </Alert>
      )}

      {/* Progress Bar */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Event Progress
        </Typography>
        <LinearProgress 
          variant="determinate" 
          value={getProgress().progress} 
          sx={{ height: 10, borderRadius: 5, mb: 1 }}
        />
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
          <Typography variant="body2" color="text.secondary">
            {getProgress().progress}% Complete
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {getProgress().steps.length} of 8 steps completed
          </Typography>
        </Box>
        
        {/* Progress Steps */}
        <Box>
          <Typography variant="subtitle2" sx={{ mb: 1 }}>Completed Steps:</Typography>
          <Box display="flex" flexWrap="wrap" gap={1}>
            {getProgress().steps.map((step, index) => (
              <Chip
                key={index}
                label={step}
                size="small"
                color={step.includes("Rejected") ? "error" : "success"}
                variant="outlined"
              />
            ))}
          </Box>
        </Box>
      </Paper>

      {/* Key Metrics */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid xs={12} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center">
                <Approval sx={{ mr: 1, color: getStatusColor(event.status) === "success" ? "green" : getStatusColor(event.status) === "error" ? "red" : "orange" }} />
                <Box>
                  <Typography variant="h6">Status</Typography>
                  <Chip 
                    label={event.status?.toUpperCase() || "PENDING"} 
                    color={getStatusColor(event.status)}
                    size="small"
                  />
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid xs={12} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center">
                <People sx={{ mr: 1, color: "blue" }} />
                <Box>
                  <Typography variant="h6">Participants</Typography>
                  <Typography variant="h4">{participants.length}</Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid xs={12} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center">
                <MonetizationOn sx={{ mr: 1, color: "green" }} />
                <Box>
                  <Typography variant="h6">Total Income</Typography>
                  <Typography variant="h4">₹{calculateTotalIncome().toLocaleString()}</Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid xs={12} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center">
                <Receipt sx={{ mr: 1, color: event.claimSubmitted ? "green" : "gray" }} />
                <Box>
                  <Typography variant="h6">Expenses</Typography>
                  <Typography variant="h4">₹{calculateTotalExpenses().toLocaleString()}</Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Tabs */}
      <Paper sx={{ width: "100%" }}>
        <Tabs value={tabValue} onChange={(e, newValue) => setTabValue(newValue)}>
          <Tab label="Overview" icon={<EventAvailable />} />
          <Tab label="Participants" icon={<People />} />
          <Tab label="Financials" icon={<MonetizationOn />} />
          <Tab label="Review" icon={<Assignment />} />
        </Tabs>

        {/* Tab Content */}
        <Box sx={{ p: 3 }}>
          {tabValue === 0 && (
            <Grid container spacing={3}>
              {/* Event Details */}
              <Grid xs={12} md={8}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      Event Details
                    </Typography>
                    <Grid container spacing={2}>
                      <Grid xs={6}>
                        <Typography variant="body2" color="text.secondary">Start Date</Typography>
                        <Typography variant="body1">{new Date(event.startDate).toLocaleDateString()}</Typography>
                      </Grid>
                      <Grid xs={6}>
                        <Typography variant="body2" color="text.secondary">End Date</Typography>
                        <Typography variant="body1">{new Date(event.endDate).toLocaleDateString()}</Typography>
                      </Grid>
                      <Grid xs={6}>
                        <Typography variant="body2" color="text.secondary">Venue</Typography>
                        <Typography variant="body1">{event.venue}</Typography>
                      </Grid>
                      <Grid xs={6}>
                        <Typography variant="body2" color="text.secondary">Mode</Typography>
                        <Typography variant="body1">{event.mode}</Typography>
                      </Grid>
                      <Grid xs={6}>
                        <Typography variant="body2" color="text.secondary">Duration</Typography>
                        <Typography variant="body1">{event.duration}</Typography>
                      </Grid>
                      <Grid xs={6}>
                        <Typography variant="body2" color="text.secondary">Type</Typography>
                        <Typography variant="body1">{event.type}</Typography>
                      </Grid>
                      <Grid xs={12}>
                        <Typography variant="body2" color="text.secondary">Target Audience</Typography>
                        <Box sx={{ mt: 1 }}>
                          {event.targetAudience?.map((audience, index) => (
                            <Chip key={index} label={audience} size="small" sx={{ mr: 1, mb: 1 }} />
                          ))}
                        </Box>
                      </Grid>
                      <Grid xs={12}>
                        <Typography variant="body2" color="text.secondary">Resource Persons</Typography>
                        <Box sx={{ mt: 1 }}>
                          {event.resourcePersons?.length > 0 ? (
                            event.resourcePersons.map((person, index) => (
                              <Chip key={index} label={person} size="small" sx={{ mr: 1, mb: 1 }} />
                            ))
                          ) : (
                            <Typography variant="body2" color="text.secondary">Not specified</Typography>
                          )}
                        </Box>
                      </Grid>
                    </Grid>
                  </CardContent>
                </Card>
              </Grid>

              {/* Coordinators */}
              <Grid xs={12} md={4}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      Coordinators
                    </Typography>
                    <List dense>
                      {event.coordinators?.map((coordinator, index) => (
                        <ListItem key={index}>
                          <ListItemIcon>
                            <Avatar sx={{ width: 32, height: 32 }}>
                              {coordinator.name?.charAt(0)}
                            </Avatar>
                          </ListItemIcon>
                          <ListItemText
                            primary={coordinator.name}
                            secondary={coordinator.designation}
                          />
                        </ListItem>
                      ))}
                    </List>
                  </CardContent>
                </Card>
              </Grid>

              {/* Objectives and Outcomes */}
              <Grid xs={12}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      Objectives
                    </Typography>
                    <Typography variant="body1" paragraph>
                      {event.objectives || 'No objectives specified'}
                    </Typography>
                    
                    <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
                      Expected Outcomes
                    </Typography>
                    <Typography variant="body1">
                      {event.outcomes || 'No expected outcomes specified'}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>

              {/* Registration Procedure */}
              {event.registrationProcedure && event.registrationProcedure.enabled && (
                <Grid xs={12}>
                  <Card>
                    <CardContent>
                      <Typography variant="h6" gutterBottom>
                        Registration Information
                      </Typography>
                      
                      {event.registrationProcedure.instructions && (
                        <>
                          <Typography variant="subtitle1" gutterBottom sx={{ mt: 2 }}>
                            Instructions
                          </Typography>
                          <Typography variant="body1" paragraph>
                            {event.registrationProcedure.instructions}
                          </Typography>
                        </>
                      )}

                      <Grid container spacing={2} sx={{ mt: 1 }}>
                        {event.registrationProcedure.registrationDeadline && (
                          <Grid xs={12} sm={6}>
                            <Typography variant="body2" color="text.secondary">Registration Deadline</Typography>
                            <Typography variant="body1">
                              {new Date(event.registrationProcedure.registrationDeadline).toLocaleDateString()}
                            </Typography>
                          </Grid>
                        )}
                        
                        {event.registrationProcedure.participantLimit && (
                          <Grid xs={12} sm={6}>
                            <Typography variant="body2" color="text.secondary">Participant Limit</Typography>
                            <Typography variant="body1">{event.registrationProcedure.participantLimit}</Typography>
                          </Grid>
                        )}

                        {event.registrationProcedure.selectionCriteria && 
                         event.registrationProcedure.selectionCriteria !== 'first come first served basis' && (
                          <Grid xs={12}>
                            <Typography variant="body2" color="text.secondary">Selection Criteria</Typography>
                            <Typography variant="body1">{event.registrationProcedure.selectionCriteria}</Typography>
                          </Grid>
                        )}

                        {event.registrationProcedure.confirmation && (
                          <Grid xs={12}>
                            <Typography variant="body2" color="text.secondary">Confirmation Process</Typography>
                            <Typography variant="body1">{event.registrationProcedure.confirmation}</Typography>
                          </Grid>
                        )}

                        {event.registrationProcedure.certificateRequirements && 
                         event.registrationProcedure.certificateRequirements.enabled && (
                          <Grid xs={12}>
                            <Typography variant="body2" color="text.secondary">Certificate Requirements</Typography>
                            <Typography variant="body1">Certificate will be provided based on specified criteria</Typography>
                          </Grid>
                        )}
                      </Grid>

                      {/* Payment Details */}
                      {event.registrationProcedure.paymentDetails && 
                       event.registrationProcedure.paymentDetails.enabled && (
                        <>
                          <Typography variant="subtitle1" gutterBottom sx={{ mt: 3 }}>
                            Payment Information
                          </Typography>
                          <Grid container spacing={2}>
                            {event.registrationProcedure.paymentDetails.accountName && (
                              <Grid xs={12} sm={6}>
                                <Typography variant="body2" color="text.secondary">Account Name</Typography>
                                <Typography variant="body1">{event.registrationProcedure.paymentDetails.accountName}</Typography>
                              </Grid>
                            )}
                            {event.registrationProcedure.paymentDetails.accountNumber && (
                              <Grid xs={12} sm={6}>
                                <Typography variant="body2" color="text.secondary">Account Number</Typography>
                                <Typography variant="body1">{event.registrationProcedure.paymentDetails.accountNumber}</Typography>
                              </Grid>
                            )}
                            {event.registrationProcedure.paymentDetails.ifscCode && (
                              <Grid xs={12} sm={6}>
                                <Typography variant="body2" color="text.secondary">IFSC Code</Typography>
                                <Typography variant="body1">{event.registrationProcedure.paymentDetails.ifscCode}</Typography>
                              </Grid>
                            )}
                            {event.registrationProcedure.paymentDetails.bankName && (
                              <Grid xs={12} sm={6}>
                                <Typography variant="body2" color="text.secondary">Bank Name</Typography>
                                <Typography variant="body1">{event.registrationProcedure.paymentDetails.bankName}</Typography>
                              </Grid>
                            )}
                            {event.registrationProcedure.paymentDetails.upiId && (
                              <Grid xs={12} sm={6}>
                                <Typography variant="body2" color="text.secondary">UPI ID</Typography>
                                <Typography variant="body1">{event.registrationProcedure.paymentDetails.upiId}</Typography>
                              </Grid>
                            )}
                            {event.registrationProcedure.paymentDetails.notes && (
                              <Grid xs={12}>
                                <Typography variant="body2" color="text.secondary">Payment Notes</Typography>
                                <Typography variant="body1">{event.registrationProcedure.paymentDetails.notes}</Typography>
                              </Grid>
                            )}
                          </Grid>
                        </>
                      )}

                      {/* Registration Form Template */}
                      {event.registrationProcedure.registrationForm && 
                       event.registrationProcedure.registrationForm.enabled && (
                        <>
                          <Typography variant="subtitle1" gutterBottom sx={{ mt: 3 }}>
                            Registration Form Fields
                          </Typography>
                          <Box sx={{ mt: 2 }}>
                            {event.registrationProcedure.registrationForm.fields && 
                             Object.entries(event.registrationProcedure.registrationForm.fields).map(([fieldKey, fieldValue]) => {
                              if (fieldKey === 'category' && fieldValue.enabled) {
                                return (
                                  <Chip 
                                    key={fieldKey} 
                                    label={`Category (select, Required)`}
                                    size="small" 
                                    sx={{ mr: 1, mb: 1 }}
                                    variant="outlined"
                                  />
                                );
                              } else if (typeof fieldValue === 'boolean' && fieldValue) {
                                return (
                                  <Chip 
                                    key={fieldKey} 
                                    label={`${fieldKey.charAt(0).toUpperCase() + fieldKey.slice(1)} (text, Required)`}
                                    size="small" 
                                    sx={{ mr: 1, mb: 1 }}
                                    variant="outlined"
                                  />
                                );
                              }
                              return null;
                            })}
                            {event.registrationProcedure.registrationForm.customFields && 
                             event.registrationProcedure.registrationForm.customFields.length > 0 && 
                             event.registrationProcedure.registrationForm.customFields.map((field, index) => (
                              <Chip 
                                key={`custom-${index}`} 
                                label={`${field.fieldName} (${field.fieldType}${field.required ? ', Required' : ''})`}
                                size="small" 
                                sx={{ mr: 1, mb: 1 }}
                                variant="outlined"
                              />
                            ))}
                          </Box>
                        </>
                      )}
                    </CardContent>
                  </Card>
                </Grid>
              )}
            </Grid>
          )}

          {tabValue === 1 && (
            <Box>
              {/* Feedback Statistics */}
              <Box sx={{ mb: 3 }}>
                <FeedbackStatsCard eventId={eventId} userRole="hod" />
              </Box>
              
              {/* Import and use the enhanced participant dashboard for HOD (approved participants only) */}
              <EnhancedParticipantDashboard 
                eventId={eventId} 
                eventTitle={event.title}
                userRole="hod"
              />
            </Box>
          )}

          {tabValue === 2 && (
            <Grid container spacing={3}>
              {/* Budget Overview */}
              <Grid xs={12}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      Financial Overview
                    </Typography>
                    <Grid container spacing={3}>
                      {/* Income */}
                      <Grid xs={12} md={6}>
                        <Typography variant="subtitle1" sx={{ mb: 2, color: "green" }}>
                          Income Sources
                        </Typography>
                        {event.noteOrder?.income?.map((item, index) => (
                          <Box key={index} display="flex" justifyContent="space-between" sx={{ mb: 1, p: 1, bgcolor: "grey.50", borderRadius: 1 }}>
                            <Box>
                              <Typography variant="body2" fontWeight="bold">{item.category}</Typography>
                              <Typography variant="caption" color="text.secondary">
                                {item.expectedParticipants} participants × ₹{item.perParticipantAmount}
                                {item.gstPercentage > 0 && ` + ${item.gstPercentage}% GST`}
                              </Typography>
                            </Box>
                            <Typography variant="body1" fontWeight="bold" color="green">
                              ₹{item.income?.toLocaleString()}
                            </Typography>
                          </Box>
                        ))}
                        <Divider sx={{ my: 2 }} />
                        <Box display="flex" justifyContent="space-between">
                          <Typography variant="h6">Total Income</Typography>
                          <Typography variant="h6" color="green">₹{calculateTotalIncome().toLocaleString()}</Typography>
                        </Box>
                      </Grid>

                      {/* Expenses */}
                      <Grid xs={12} md={6}>
                        <Typography variant="subtitle1" sx={{ mb: 2, color: "red" }}>
                          {event.claimSubmitted ? "Actual Expenses (Claimed)" : "Planned Expenses"}
                        </Typography>
                        {(event.claimSubmitted ? event.claimBill?.expenses : event.budgetBreakdown?.expenses)?.map((item, index) => (
                          <Box key={index} display="flex" justifyContent="space-between" sx={{ mb: 1, p: 1, bgcolor: "grey.50", borderRadius: 1 }}>
                            <Box>
                              <Typography variant="body2" fontWeight="bold">{item.category}</Typography>
                              {event.claimSubmitted && item.actualAmount !== undefined && (
                                <Typography variant="caption" color="text.secondary">
                                  Actual: ₹{item.actualAmount?.toLocaleString()} | Approved: ₹{item.approvedAmount?.toLocaleString()}
                                </Typography>
                              )}
                            </Box>
                            <Typography variant="body1" fontWeight="bold" color="red">
                              ₹{(event.claimSubmitted ? item.actualAmount : item.amount)?.toLocaleString()}
                            </Typography>
                          </Box>
                        ))}
                        <Divider sx={{ my: 2 }} />
                        <Box display="flex" justifyContent="space-between">
                          <Typography variant="h6">Total Expenses</Typography>
                          <Typography variant="h6" color="red">₹{calculateTotalExpenses().toLocaleString()}</Typography>
                        </Box>
                      </Grid>
                    </Grid>

                    {/* Summary */}
                    <Box sx={{ mt: 3, p: 2, bgcolor: "primary.light", borderRadius: 1 }}>
                      <Box display="flex" justifyContent="space-between" alignItems="center">
                        <Typography variant="h6" color="white">Net Amount</Typography>
                        <Typography variant="h5" fontWeight="bold" color="white">
                          ₹{(calculateTotalIncome() - calculateTotalExpenses()).toLocaleString()}
                        </Typography>
                      </Box>
                      {event.claimSubmitted && (
                        <Typography variant="body2" color="white" sx={{ mt: 1 }}>
                          Claim has been submitted for approval
                          {event.claimBill?.createdAt && (
                            <span> on {new Date(event.claimBill.createdAt).toLocaleDateString("en-IN")} at {new Date(event.claimBill.createdAt).toLocaleTimeString("en-IN")}</span>
                          )}
                        </Typography>
                      )}
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          )}

          {tabValue === 3 && (
            <Grid container spacing={3}>
              {/* Review Actions */}
              <Grid xs={12} md={6}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      Review Actions
                    </Typography>
                    
                    {event.status === "pending" ? (
                      <Box sx={{ mt: 2 }}>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                          This event is pending your review and approval.
                        </Typography>
                        <Box display="flex" gap={2}>
                          <Button
                            variant="contained"
                            color="success"
                            startIcon={<CheckCircle />}
                            onClick={() => {
                              setNewStatus("approved");
                              setApprovalDialogOpen(true);
                            }}
                          >
                            Approve Event
                          </Button>
                          <Button
                            variant="contained"
                            color="error"
                            startIcon={<Cancel />}
                            onClick={() => {
                              setNewStatus("rejected");
                              setApprovalDialogOpen(true);
                            }}
                          >
                            Reject Event
                          </Button>
                        </Box>
                      </Box>
                    ) : (
                      <Alert severity={getStatusColor(event.status)}>
                        Event has been {event.status}
                        {event.reviewComments && (
                          <Box sx={{ mt: 1 }}>
                            <Typography variant="body2">
                              <strong>Comments:</strong> {event.reviewComments}
                            </Typography>
                          </Box>
                        )}
                      </Alert>
                    )}
                  </CardContent>
                </Card>
              </Grid>

              {/* Document Actions */}
              <Grid xs={12} md={6}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      Documents
                    </Typography>
                    <List>
                      <ListItem>
                        <ListItemIcon>
                          <Print />
                        </ListItemIcon>
                        <ListItemText primary="Note Order Letter" secondary="Download the note order" />
                        <Button variant="outlined" size="small" onClick={downloadProposalLetter}>
                          Download
                        </Button>
                      </ListItem>
                      
                      {event.brochure && (
                        <ListItem>
                          <ListItemIcon>
                            <AttachFile />
                          </ListItemIcon>
                          <ListItemText primary="Event Brochure" secondary="Uploaded by coordinator" />
                          <Button variant="outlined" size="small">
                            View
                          </Button>
                        </ListItem>
                      )}
                      
                      {event.claimSubmitted && (
                        <ListItem>
                          <ListItemIcon>
                            <Receipt />
                          </ListItemIcon>
                          <ListItemText primary="Claim Bill" secondary="Submitted expenses" />
                          <Button variant="outlined" size="small">
                            Review
                          </Button>
                        </ListItem>
                      )}
                    </List>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          )}
        </Box>
      </Paper>

      {/* Approval Dialog */}
      <Dialog open={approvalDialogOpen} onClose={() => setApprovalDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          {newStatus === "approved" ? "Approve Event" : "Reject Event"}
        </DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Are you sure you want to {newStatus} this event?
          </Typography>
          
          <TextField
            fullWidth
            label="Comments (Optional)"
            multiline
            rows={3}
            value={comments}
            onChange={(e) => setComments(e.target.value)}
            placeholder={`Add comments about the ${newStatus} decision...`}
            sx={{ mt: 2 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setApprovalDialogOpen(false)}>Cancel</Button>
          <Button 
            variant="contained" 
            color={newStatus === "approved" ? "success" : "error"}
            onClick={handleStatusUpdate}
          >
            {newStatus === "approved" ? "Approve" : "Reject"}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default HODEventDashboard;
