import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Box,
  Container,
  Typography,
  Button,
  Card,
  CardContent,
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
  Tooltip,
  Collapse,
  Grid,
  useTheme,
  alpha,
  Fade
} from "@mui/material";
import {
  ArrowBack,
  Edit,
  Delete,
  CheckCircle,
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
  Upload,
  Visibility,
  Analytics,
  Assignment,
  Group,
  Timeline,
  TrendingUp,
  InfoOutlined,
  Cancel,
  LocationOn,
  Schedule,
  FileCopy
} from "@mui/icons-material";
import { DatePicker } from "@mui/x-date-pickers";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import axios from "axios";
import { useSnackbar } from "notistack";
import { eventState } from "../../../../shared/context/eventProvider";
import ClaimManagement from "../../../../shared/components/ClaimManagement";
import EnhancedParticipantDashboard from "../../../../shared/components/EnhancedParticipantDashboard";
import FeedbackStatsCard from "../../../../shared/components/FeedbackStatsCard";

const CoordinatorEventDashboard = () => {
  const { eventId } = useParams();
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();
  const { user } = eventState();
  const theme = useTheme();
  
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [tabValue, setTabValue] = useState(0);
  const [participants, setParticipants] = useState([]);
  const [claimDialogOpen, setClaimDialogOpen] = useState(false);
  const [claimData, setClaimData] = useState([]);
  const [showProgressDetails, setShowProgressDetails] = useState(false);

  useEffect(() => {
    fetchEventDetails();
    fetchParticipants();
  }, [eventId]);

  const fetchEventDetails = async () => {
    try {
      const response = await axios.get(`${import.meta.env.VITE_API_BASE_URL || 'http://10.5.12.1:4000/api'}/coordinator/programmes/${eventId}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      setEvent(response.data);
      
      // Initialize claim data with note order expenses (initial budget)
      if (response.data.noteOrder?.expenses) {
        setClaimData(response.data.noteOrder.expenses.map(expense => ({
          category: expense.category,
          budgetAmount: expense.amount,
          actualAmount: 0,
        })));
      }
    } catch (error) {
      console.error("Error fetching event details:", error);
      enqueueSnackbar("Error fetching event details", { variant: "error" });
    } finally {
      setLoading(false);
    }
  };

  const fetchParticipants = async () => {
    try {
      const response = await axios.get(`${import.meta.env.VITE_API_BASE_URL || 'http://10.5.12.1:4000/api'}/coordinator/events/${eventId}/participants`, {
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

  const handleEdit = () => {
    navigate("/coordinator/dashboard", { 
      state: { 
        editingEvent: event,
        editMode: true 
      } 
    });
  };

  const handleDelete = async () => {
    if (window.confirm("Are you sure you want to delete this event?")) {
      try {
        await axios.delete(`${import.meta.env.VITE_API_BASE_URL || 'http://10.5.12.1:4000/api'}/coordinator/programmes/${eventId}`, {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        });
        enqueueSnackbar("Event deleted successfully", { variant: "success" });
        navigate("/coordinator/dashboard");
      } catch (error) {
        console.error("Error deleting event:", error);
        enqueueSnackbar("Error deleting event", { variant: "error" });
      }
    }
  };

  const handleClaimSubmission = async () => {
    try {
      const totalExpenditure = claimData.reduce((sum, item) => sum + (item.actualAmount || 0), 0);
      
      const claimPayload = {
        expenses: claimData.map(item => ({
          category: item.category,
          amount: item.actualAmount || 0,
        })),
        totalExpenditure,
      };

      await axios.post(
        `http://10.5.12.1:4000/api/coordinator/programmes/${eventId}/claim`,
        claimPayload,
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      );
      
      enqueueSnackbar("Claim submitted successfully", { variant: "success" });
      setClaimDialogOpen(false);
      fetchEventDetails();
    } catch (error) {
      console.error("Error submitting claim:", error);
      enqueueSnackbar("Error submitting claim", { variant: "error" });
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
      steps.push("Rejected by HOD");
    }
    
    // Step 7: Event Conducted (10%)
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

  const viewProposalPDF = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL || 'http://10.5.12.1:4000/api'}/coordinator/programmes/${eventId}/pdf`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem("token")}`,
        },
      });
      
      if (!response.ok) {
        throw new Error(`Failed to generate programme PDF: ${response.status} ${response.statusText}`);
      }
      
      const pdfBlob = await response.blob();
      const pdfUrl = URL.createObjectURL(pdfBlob);
      const newWindow = window.open(pdfUrl, '_blank');
      
      if (!newWindow || newWindow.closed || typeof newWindow.closed === 'undefined') {
        const link = document.createElement('a');
        link.href = pdfUrl;
        link.download = `NoteOrder_${event.title?.replace(/[^a-zA-Z0-9]/g, '_') || 'event'}.pdf`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        enqueueSnackbar('Programme PDF downloaded (popup blocked)', { variant: 'info' });
      } else {
        enqueueSnackbar('Programme PDF opened in new tab', { variant: 'success' });
      }

      setTimeout(() => {
        URL.revokeObjectURL(pdfUrl);
      }, 10000);
      
    } catch (error) {
      console.error("Error opening programme PDF:", error.message);
      enqueueSnackbar(`Failed to open programme PDF: ${error.message}`, { variant: "error" });
    }
  };

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="50vh">
          <CircularProgress size={60} />
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
      {/* Enhanced Header */}
      <Fade in timeout={800}>
        <Paper
          sx={{
            p: 3,
            mb: 4,
            borderRadius: 3,
            background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.1)} 0%, ${alpha(theme.palette.secondary.main, 0.05)} 100%)`,
            border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`
          }}
        >
          <Box display="flex" alignItems="center" justifyContent="space-between">
            <Box display="flex" alignItems="center" gap={2}>
              <IconButton 
                onClick={() => navigate("/coordinator/dashboard")} 
                sx={{ 
                  backgroundColor: alpha(theme.palette.primary.main, 0.1),
                  '&:hover': { backgroundColor: alpha(theme.palette.primary.main, 0.2) }
                }}
              >
                <ArrowBack />
              </IconButton>
              <Box>
                <Typography variant="h4" component="h1" sx={{ fontWeight: 700, mb: 1 }}>
                  {event.title}
                </Typography>
                <Box display="flex" alignItems="center" gap={2}>
                  <Chip
                    icon={<EventAvailable />}
                    label={`${new Date(event.startDate).toLocaleDateString()} - ${new Date(event.endDate).toLocaleDateString()}`}
                    variant="outlined"
                    size="small"
                  />
                  <Chip
                    icon={<LocationOn />}
                    label={event.venue}
                    variant="outlined"
                    size="small"
                  />
                  <Chip
                    icon={<Schedule />}
                    label={`${event.mode} • ${event.duration}`}
                    variant="outlined"
                    size="small"
                  />
                </Box>
              </Box>
            </Box>
            
            <Box display="flex" gap={1}>
              <Button
                variant="outlined"
                startIcon={<Edit />}
                onClick={handleEdit}
                disabled={event.status === "approved"}
                sx={{ borderRadius: 2 }}
              >
                Edit
              </Button>
              <Button
                variant="outlined"
                color="error"
                startIcon={<Delete />}
                onClick={handleDelete}
                disabled={event.status === "approved"}
                sx={{ borderRadius: 2 }}
              >
                Delete
              </Button>
            </Box>
          </Box>
        </Paper>
      </Fade>

      {/* Enhanced Progress Section */}
      <Fade in timeout={1000}>
        <Paper sx={{ p: 3, mb: 4, borderRadius: 3 }}>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              🎯 Event Progress
            </Typography>
            <Tooltip title="Click to see progress details">
              <IconButton 
                size="small" 
                onClick={() => setShowProgressDetails(!showProgressDetails)}
                sx={{ 
                  backgroundColor: alpha(theme.palette.info.main, 0.1),
                  '&:hover': { backgroundColor: alpha(theme.palette.info.main, 0.2) }
                }}
              >
                <InfoOutlined />
              </IconButton>
            </Tooltip>
          </Box>
          
          <LinearProgress 
            variant="determinate" 
            value={getProgress().progress} 
            sx={{ 
              height: 12, 
              borderRadius: 6, 
              mb: 2,
              backgroundColor: alpha(theme.palette.primary.main, 0.1),
              '& .MuiLinearProgress-bar': {
                borderRadius: 6,
                background: `linear-gradient(90deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`
              }
            }}
          />
          
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
            <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 600 }}>
              {getProgress().progress}% Complete
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {getProgress().steps.length} of 8 steps completed
            </Typography>
          </Box>
          
          <Collapse in={showProgressDetails}>
            <Box sx={{ mt: 3, p: 2, backgroundColor: alpha(theme.palette.background.default, 0.5), borderRadius: 2 }}>
              <Typography variant="subtitle2" sx={{ mb: 2, fontWeight: 600 }}>
                📋 Progress Breakdown:
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <Typography variant="body2" sx={{ mb: 1, fontWeight: 600, color: theme.palette.success.main }}>
                    ✅ Completed Steps:
                  </Typography>
                  <Box display="flex" flexDirection="column" gap={1}>
                    {getProgress().steps.map((step, index) => (
                      <Chip
                        key={index}
                        label={step}
                        size="small"
                        color={step.includes("Rejected") ? "error" : "success"}
                        variant="filled"
                        icon={step.includes("Rejected") ? <Cancel /> : <CheckCircle />}
                        sx={{ justifyContent: 'flex-start' }}
                      />
                    ))}
                  </Box>
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <Typography variant="body2" sx={{ mb: 1, fontWeight: 600, color: theme.palette.info.main }}>
                    📊 Progress Steps (% each):
                  </Typography>
                  <List dense>
                    {[
                      { step: "Event created", percent: "15%", desc: "Basic event information submitted" },
                      { step: "Basic details complete", percent: "10%", desc: "All required fields filled" },
                      { step: "Budget breakdown complete", percent: "15%", desc: "Income and expense categories defined" },
                      { step: "Coordinators assigned", percent: "10%", desc: "Event coordinators added" },
                      { step: "Brochure uploaded", percent: "15%", desc: "Event brochure/document attached" },
                      { step: "Approved by HOD", percent: "20%", desc: "HOD approval received" },
                      { step: "Event conducted", percent: "10%", desc: "Event date has passed" },
                      { step: "Claim bill submitted", percent: "5%", desc: "Final expenses submitted" }
                    ].map((item, index) => (
                      <ListItem key={index} sx={{ py: 0.5 }}>
                        <ListItemText 
                          primary={`${item.step} (${item.percent})`}
                          secondary={item.desc}
                          primaryTypographyProps={{ variant: 'body2', fontWeight: 500 }}
                          secondaryTypographyProps={{ variant: 'caption' }}
                        />
                      </ListItem>
                    ))}
                  </List>
                </Grid>
              </Grid>
            </Box>
          </Collapse>
        </Paper>
      </Fade>

      {/* Enhanced Metrics Cards */}
      <Fade in timeout={1200}>
        <Grid container spacing={3} sx={{ mb: 4 }}>
          {[
            {
              title: "Status",
              value: event.status?.toUpperCase() || "PENDING",
              icon: <Approval />,
              color: getStatusColor(event.status),
              isChip: true
            },
            {
              title: "Participants",
              value: participants.length,
              icon: <People />,
              color: "info"
            },
            {
              title: "Budget",
              value: `₹${event.budget?.toLocaleString()}`,
              icon: <MonetizationOn />,
              color: "success"
            },
            {
              title: "Claim Status",
              value: event.claimSubmitted ? "SUBMITTED" : "PENDING",
              icon: <Receipt />,
              color: event.claimSubmitted ? "success" : "warning",
              isChip: true
            }
          ].map((metric, index) => (
            <Grid item xs={12} md={3} key={index}>
              <Card
                sx={{
                  p: 2,
                  borderRadius: 3,
                  background: `linear-gradient(135deg, ${alpha(theme.palette[metric.color].main, 0.1)} 0%, ${alpha(theme.palette[metric.color].main, 0.05)} 100%)`,
                  border: `1px solid ${alpha(theme.palette[metric.color].main, 0.2)}`,
                  transition: 'transform 0.2s ease-in-out',
                  '&:hover': {
                    transform: 'translateY(-2px)'
                  }
                }}
              >
                <Box display="flex" alignItems="center" gap={2}>
                  <Box
                    sx={{
                      p: 1,
                      borderRadius: 2,
                      backgroundColor: alpha(theme.palette[metric.color].main, 0.1)
                    }}
                  >
                    {React.cloneElement(metric.icon, { 
                      sx: { color: theme.palette[metric.color].main } 
                    })}
                  </Box>
                  <Box>
                    <Typography variant="h6" sx={{ fontWeight: 600 }}>
                      {metric.title}
                    </Typography>
                    {metric.isChip ? (
                      <Chip 
                        label={metric.value} 
                        color={metric.color}
                        size="small"
                        sx={{ fontWeight: 600 }}
                      />
                    ) : (
                      <Typography variant="h4" sx={{ fontWeight: 700, color: theme.palette[metric.color].main }}>
                        {metric.value}
                      </Typography>
                    )}
                  </Box>
                </Box>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Fade>

      {/* Enhanced Tabs */}
      <Paper sx={{ borderRadius: 3, overflow: 'hidden' }}>
        <Tabs 
          value={tabValue} 
          onChange={(e, newValue) => setTabValue(newValue)}
          sx={{
            backgroundColor: alpha(theme.palette.primary.main, 0.05),
            '& .MuiTab-root': {
              fontWeight: 600,
              textTransform: 'none'
            }
          }}
        >
          <Tab label="📋 Overview" icon={<EventAvailable />} iconPosition="start" />
          <Tab label="👥 Participants" icon={<People />} iconPosition="start" />
          <Tab label="💰 Financials" icon={<MonetizationOn />} iconPosition="start" />
          <Tab label="📄 Documents" icon={<AttachFile />} iconPosition="start" />
        </Tabs>

        <Box sx={{ p: 4 }}>
          {tabValue === 0 && (
            <Fade in timeout={600}>
              <Grid container spacing={4}>
                {/* Event Details */}
                <Grid item xs={12} md={8}>
                  <Card sx={{ borderRadius: 3, p: 3 }}>
                    <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, mb: 3 }}>
                      📝 Event Details
                    </Typography>
                    <Grid container spacing={3}>
                      {[
                        { label: "Start Date", value: new Date(event.startDate).toLocaleDateString() },
                        { label: "End Date", value: new Date(event.endDate).toLocaleDateString() },
                        { label: "Venue", value: event.venue },
                        { label: "Mode", value: event.mode },
                        { label: "Duration", value: event.duration },
                        { label: "Type", value: event.type }
                      ].map((detail, index) => (
                        <Grid item xs={6} key={index}>
                          <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 600 }}>
                            {detail.label}
                          </Typography>
                          <Typography variant="body1" sx={{ mt: 0.5 }}>
                            {detail.value}
                          </Typography>
                        </Grid>
                      ))}
                      
                      <Grid item xs={12}>
                        <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 600 }}>
                          Target Audience
                        </Typography>
                        <Box sx={{ mt: 1 }}>
                          {event.targetAudience?.map((audience, index) => (
                            <Chip 
                              key={index} 
                              label={audience} 
                              size="small" 
                              sx={{ mr: 1, mb: 1 }}
                              variant="outlined"
                            />
                          ))}
                        </Box>
                      </Grid>
                      
                      <Grid item xs={12}>
                        <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 600 }}>
                          Resource Persons
                        </Typography>
                        <Box sx={{ mt: 1 }}>
                          {event.resourcePersons?.length > 0 ? (
                            event.resourcePersons.map((person, index) => (
                              <Chip 
                                key={index} 
                                label={person} 
                                size="small" 
                                sx={{ mr: 1, mb: 1 }}
                                color="primary"
                                variant="outlined"
                              />
                            ))
                          ) : (
                            <Typography variant="body2" color="text.secondary">
                              Not specified
                            </Typography>
                          )}
                        </Box>
                      </Grid>
                    </Grid>
                  </Card>
                </Grid>

                {/* Coordinators */}
                <Grid item xs={12} md={4}>
                  <Card sx={{ borderRadius: 3, p: 3 }}>
                    <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, mb: 3 }}>
                      👨‍💼 Coordinators
                    </Typography>
                    <List dense>
                      {event.coordinators?.map((coordinator, index) => (
                        <ListItem key={index} sx={{ px: 0 }}>
                          <ListItemIcon>
                            <Avatar sx={{ width: 40, height: 40, backgroundColor: theme.palette.primary.main }}>
                              {coordinator.name?.charAt(0)}
                            </Avatar>
                          </ListItemIcon>
                          <ListItemText
                            primary={coordinator.name}
                            secondary={coordinator.designation}
                            primaryTypographyProps={{ fontWeight: 600 }}
                          />
                        </ListItem>
                      ))}
                    </List>
                  </Card>
                </Grid>

                {/* Objectives and Outcomes */}
                <Grid item xs={12}>
                  <Card sx={{ borderRadius: 3, p: 3 }}>
                    <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, mb: 3 }}>
                      🎯 Objectives & Outcomes
                    </Typography>
                    
                    <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 600, color: theme.palette.primary.main }}>
                      Objectives
                    </Typography>
                    <Typography variant="body1" paragraph sx={{ mb: 3 }}>
                      {typeof event.objectives === 'string' ? event.objectives : 'No objectives specified'}
                    </Typography>
                    
                    <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 600, color: theme.palette.secondary.main }}>
                      Expected Outcomes
                    </Typography>
                    <Typography variant="body1">
                      {typeof event.outcomes === 'string' ? event.outcomes : 'No expected outcomes specified'}
                    </Typography>
                  </Card>
                </Grid>
              </Grid>
            </Fade>
          )}

          {tabValue === 1 && (
            <Fade in timeout={600}>
              <Box>
                <Box sx={{ mb: 3 }}>
                  <FeedbackStatsCard eventId={eventId} userRole="coordinator" />
                </Box>
                <EnhancedParticipantDashboard 
                  eventId={eventId} 
                  eventTitle={event.title}
                  userRole="coordinator"
                />
              </Box>
            </Fade>
          )}

          {tabValue === 2 && (
            <Fade in timeout={600}>
              <Box>
                <Grid container spacing={4}>
                  {/* Budget Breakdown */}
                  <Grid item xs={12} md={6}>
                    <Card sx={{ borderRadius: 3, p: 3 }}>
                      <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, mb: 3 }}>
                        💰 Budget Breakdown
                      </Typography>
                      
                      {event.noteOrder?.income?.length > 0 && (
                        <>
                          <Typography variant="subtitle2" sx={{ mt: 2, mb: 1, color: theme.palette.success.main, fontWeight: 600 }}>
                            Income Sources
                          </Typography>
                          {event.noteOrder.income.map((item, index) => (
                            <Box key={index} display="flex" justifyContent="space-between" sx={{ mb: 1, p: 1, backgroundColor: alpha(theme.palette.success.main, 0.05), borderRadius: 1 }}>
                              <Typography variant="body2">{item.category}</Typography>
                              <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                ₹{Number(item.income || 0).toLocaleString()}
                              </Typography>
                            </Box>
                          ))}
                        </>
                      )}
                      
                      {event.noteOrder?.expenses?.length > 0 && (
                        <>
                          <Typography variant="subtitle2" sx={{ mt: 3, mb: 1, color: theme.palette.error.main, fontWeight: 600 }}>
                            Expense Categories
                          </Typography>
                          {event.noteOrder.expenses.map((item, index) => (
                            <Box key={index} display="flex" justifyContent="space-between" sx={{ mb: 1, p: 1, backgroundColor: alpha(theme.palette.error.main, 0.05), borderRadius: 1 }}>
                              <Typography variant="body2">{item.category}</Typography>
                              <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                ₹{Number(item.amount || 0).toLocaleString()}
                              </Typography>
                            </Box>
                          ))}
                        </>
                      )}
                    </Card>
                  </Grid>

                  {/* Quick Claim Submission */}
                  <Grid item xs={12} md={6}>
                    <Card sx={{ borderRadius: 3, p: 3 }}>
                      <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, mb: 3 }}>
                        📋 Quick Claim Submission
                      </Typography>
                      {event.claimSubmitted ? (
                        <Alert 
                          severity="success" 
                          sx={{ borderRadius: 2 }}
                          icon={<CheckCircle />}
                        >
                          Claim has been submitted for approval
                        </Alert>
                      ) : (
                        <Button
                          variant="contained"
                          startIcon={<Receipt />}
                          onClick={() => setClaimDialogOpen(true)}
                          disabled={event.status !== "approved"}
                          sx={{ borderRadius: 2, fontWeight: 600 }}
                          fullWidth
                        >
                          Submit Claim Bill
                        </Button>
                      )}
                    </Card>
                  </Grid>
                </Grid>

                {/* Claim Management Section */}
                <Box sx={{ mt: 4 }}>
                  <Typography variant="h5" gutterBottom sx={{ mb: 3, fontWeight: 600 }}>
                    📊 Claim Management
                  </Typography>
                  <ClaimManagement eventId={eventId} />
                </Box>
              </Box>
            </Fade>
          )}

          {tabValue === 3 && (
            <Fade in timeout={600}>
              <Grid container spacing={4}>
                <Grid item xs={12} md={6}>
                  <Card sx={{ borderRadius: 3, p: 3 }}>
                    <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, mb: 3 }}>
                      📄 Event Brochure
                    </Typography>
                    {event.brochure ? (
                      <Box>
                        <Alert severity="success" sx={{ mb: 2, borderRadius: 2 }}>
                          Brochure uploaded successfully
                        </Alert>
                        <Button 
                          variant="outlined" 
                          startIcon={<Download />}
                          sx={{ borderRadius: 2, mr: 2 }}
                        >
                          Download Brochure
                        </Button>
                      </Box>
                    ) : (
                      <Alert severity="warning" sx={{ borderRadius: 2 }}>
                        No brochure uploaded yet
                      </Alert>
                    )}
                    
                    <Box sx={{ mt: 3 }}>
                      <Button
                        variant="contained"
                        startIcon={<Visibility />}
                        onClick={async () => {
                          try {
                            const { generateEventBrochure } = await import('../../../../shared/services/advancedBrochureGenerator');
                            const doc = await generateEventBrochure(event);
                            const pdfBlob = doc.output('blob');
                            const pdfUrl = URL.createObjectURL(pdfBlob);
                            const newWindow = window.open(pdfUrl);
                            
                            if (!newWindow || newWindow.closed || typeof newWindow.closed === 'undefined') {
                              const link = document.createElement('a');
                              link.href = pdfUrl;
                              link.download = `${event.title?.replace(/[^a-zA-Z0-9]/g, '_') || 'event'}_advanced_brochure.pdf`;
                              document.body.appendChild(link);
                              link.click();
                              document.body.removeChild(link);
                              
                              enqueueSnackbar('Advanced AI brochure downloaded successfully!', { variant: 'success' });
                            }

                            setTimeout(() => {
                              URL.revokeObjectURL(pdfUrl);
                            }, 4000);
                            
                          } catch (error) {
                            console.error("Error generating advanced brochure:", error.message);
                            enqueueSnackbar(`Failed to generate advanced brochure: ${error.message}`, { variant: 'error' });
                          }
                        }}
                        sx={{ borderRadius: 2, fontWeight: 600 }}
                        fullWidth
                      >
                        Generate AI Brochure
                      </Button>
                    </Box>
                  </Card>
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <Card sx={{ borderRadius: 3, p: 3 }}>
                    <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, mb: 3 }}>
                      📋 Note Order
                    </Typography>
                    <Button 
                      variant="contained" 
                      startIcon={<Visibility />}
                      onClick={viewProposalPDF}
                      sx={{ borderRadius: 2, fontWeight: 600 }}
                      fullWidth
                    >
                      View Proposal PDF
                    </Button>
                  </Card>
                </Grid>
              </Grid>
            </Fade>
          )}
        </Box>
      </Paper>

      {/* Claim Dialog */}
      <Dialog open={claimDialogOpen} onClose={() => setClaimDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>Submit Claim Bill</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Enter the actual amounts spent for each budget category:
          </Typography>
          
          {claimData.map((item, index) => (
            <Box key={index} sx={{ mb: 2 }}>
              <Typography variant="subtitle2">{item.category}</Typography>
              <Box display="flex" alignItems="center" gap={2}>
                <Typography variant="body2" color="text.secondary">
                  Budget: ₹{item.budgetAmount?.toLocaleString()}
                </Typography>
                <TextField
                  label="Actual Amount"
                  type="number"
                  value={item.actualAmount || ""}
                  onChange={(e) => {
                    const newClaimData = [...claimData];
                    newClaimData[index].actualAmount = Number(e.target.value);
                    setClaimData(newClaimData);
                  }}
                  size="small"
                  InputProps={{ startAdornment: "₹" }}
                />
              </Box>
            </Box>
          ))}
          
          <Box sx={{ mt: 2, p: 2, bgcolor: "grey.100", borderRadius: 1 }}>
            <Typography variant="subtitle1">
              Total Expenditure: ₹{claimData.reduce((sum, item) => sum + (item.actualAmount || 0), 0).toLocaleString()}
            </Typography>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setClaimDialogOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleClaimSubmission}>
            Submit Claim
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default CoordinatorEventDashboard;