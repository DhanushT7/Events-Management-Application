import React, { useState, useEffect, useCallback, useMemo, memo } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Chip,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Checkbox,
  FormControlLabel,
  Tooltip,
  Badge,
  LinearProgress,
  Alert,
  Tabs,
  Tab,
  Divider,
  Avatar,
  ListItemText,
  ListItemAvatar,
  List,
  ListItem,
  Switch,
} from '@mui/material';
import {
  CheckCircle,
  Cancel,
  PendingActions,
  PersonAdd,
  FileUpload,
  FileDownload,
  Edit,
  Delete,
  Visibility,
  MarkEmailRead,
  Group,
  Analytics,
  Assignment,
  EventAvailable,
  School,
  Business,
  Phone,
  Email,
  CalendarToday,
  TrendingUp,
  People,
  Refresh,
  FilterList,
  Search,
  Send,
} from '@mui/icons-material';
import { useSnackbar } from 'notistack';
import axios from 'axios';
import AddParticipantModal from './AddParticipantModal';

const EnhancedParticipantDashboard = ({ eventId, eventTitle, userRole = 'coordinator' }) => {
  const { enqueueSnackbar } = useSnackbar();
  const [participants, setParticipants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tabValue, setTabValue] = useState(0);
  const [selectedParticipants, setSelectedParticipants] = useState([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogType, setDialogType] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterDepartment, setFilterDepartment] = useState('');
  const [addParticipantModalOpen, setAddParticipantModalOpen] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');

  // Debounced search to prevent excessive filtering
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
  
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  useEffect(() => {
    fetchParticipants();
  }, [eventId]);

  // Helper function to get participant registration - moved before stats calculation
  const getParticipantRegistration = (participant) => {
    if (userRole === 'hod') {
      return participant.eventRegistration || { approved: true, attended: false }; // HOD only sees approved
    }
    return participant.eventRegistrations?.find(reg => reg.eventId._id === eventId);
  };

  // Memoized stats calculation to prevent recalculation on every render
  const stats = useMemo(() => {
    if (participants.length === 0) {
      return {
        totalRegistered: 0,
        totalApproved: 0,
        totalAttended: 0,
        totalRejected: 0,
        totalPending: 0,
        attendanceRate: 0
      };
    }

    const totalRegistered = participants.length;
    const totalApproved = participants.filter(p => {
      if (userRole === 'hod') return true; // HOD only sees approved
      const registration = getParticipantRegistration(p);
      return registration?.approved === true;
    }).length;
    
    const totalAttended = participants.filter(p => {
      const registration = getParticipantRegistration(p);
      return registration?.approved === true && registration?.attended === true;
    }).length;
    
    const totalRejected = participants.filter(p => {
      const registration = getParticipantRegistration(p);
      return registration?.approved === false && registration?.rejectionReason;
    }).length;
    
    const totalPending = participants.filter(p => {
      const registration = getParticipantRegistration(p);
      return registration?.approved !== true && !registration?.rejectionReason;
    }).length;
    
    const attendanceRate = totalApproved > 0 ? Math.round((totalAttended / totalApproved) * 100) : 0;
    
    return {
      totalRegistered,
      totalApproved,
      totalAttended,
      totalRejected,
      totalPending,
      attendanceRate
    };
  }, [participants, userRole]);

  const fetchParticipants = useCallback(async () => {
    try {
      setLoading(true);
      
      if (userRole === 'hod') {
        // For HOD, fetch only approved participants using the HOD API
        try {
          const response = await axios.get(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000/api'}/hod/events/${eventId}/participants`, {
            headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
          });
          
          if (response.data.success) {
            setParticipants(response.data.participants || []);
          } else {
            setParticipants([]);
            enqueueSnackbar('No approved participants found', { variant: 'info' });
          }
        } catch (error) {
          console.error('Error fetching approved participants for HOD:', error);
          // Fallback: show empty list for HOD if API fails
          setParticipants([]);
          if (error.response?.status === 404) {
            enqueueSnackbar('Event not found or no participants', { variant: 'info' });
          } else {
            enqueueSnackbar('Error fetching participants', { variant: 'error' });
          }
        }
      } else {
        // For coordinator, use the existing API
        try {
          const response = await axios.get(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000/api'}/coordinator/events/${eventId}/participants`, {
            headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
          });
          
          if (response.data.success) {
            setParticipants(response.data.participants || []);
          } else {
            setParticipants([]);
          }
        } catch (error) {
          console.error('Error fetching participants for coordinator:', error);
          if (error.response?.status === 404) {
            enqueueSnackbar('Event not found or no participants', { variant: 'info' });
          } else {
            enqueueSnackbar('Error fetching participants', { variant: 'error' });
          }
          setParticipants([]);
        }
      }
    } catch (error) {
      console.error('Error in fetchParticipants:', error);
      setParticipants([]);
    } finally {
      setLoading(false);
    }
  });

  
  const handleApproveParticipant = async (participantId) => {
    try {
      await axios.put(
        `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000/api'}/coordinator/participants/approve`,
        { participantId, eventId },
        { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
      );
      
      enqueueSnackbar('Participant approved successfully', { variant: 'success' });
      fetchParticipants();
    } catch (error) {
      enqueueSnackbar('Error approving participant', { variant: 'error' });
    }
  };

  const handleRejectParticipant = async (participantId) => {
    try {
      await axios.put(
        `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000/api'}/coordinator/participants/reject`,
        { participantId, eventId, rejectionReason },
        { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
      );
      
      enqueueSnackbar('Participant rejected', { variant: 'success' });
      setDialogOpen(false);
      setRejectionReason('');
      fetchParticipants();
    } catch (error) {
      enqueueSnackbar('Error rejecting participant', { variant: 'error' });
    }
  };

  const handleMarkAttendance = async (participantId, attended) => {
    try {
      await axios.put(
        `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000/api'}/coordinator/participants/attendance`,
        { participantId, eventId, attended },
        { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
      );
      
      enqueueSnackbar(`Attendance ${attended ? 'marked' : 'unmarked'}`, { variant: 'success' });
      fetchParticipants();
    } catch (error) {
      enqueueSnackbar('Error updating attendance', { variant: 'error' });
    }
  };

  const handleBulkApprove = async () => {
    try {
      await axios.put(
        `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000/api'}/coordinator/participants/bulk-approve`,
        { participantIds: selectedParticipants, eventId },
        { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
      );
      
      enqueueSnackbar(`${selectedParticipants.length} participants approved`, { variant: 'success' });
      setSelectedParticipants([]);
      fetchParticipants();
    } catch (error) {
      enqueueSnackbar('Error bulk approving participants', { variant: 'error' });
    }
  };

  const handleBulkAttendance = async (attended) => {
    try {
      await axios.put(
        `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000/api'}/coordinator/participants/bulk-attendance`,
        { participantIds: selectedParticipants, eventId, attended },
        { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
      );
      
      enqueueSnackbar(`Bulk attendance ${attended ? 'marked' : 'unmarked'}`, { variant: 'success' });
      setSelectedParticipants([]);
      fetchParticipants();
    } catch (error) {
      enqueueSnackbar('Error bulk updating attendance', { variant: 'error' });
    }
  };

  const handleAddParticipant = async () => {
    try {
      await axios.post(
        `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000/api'}/coordinator/participants/add`,
        { ...newParticipant, eventId },
        { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
      );
      
      enqueueSnackbar('Participant added successfully', { variant: 'success' });
      setDialogOpen(false);
      setNewParticipant({
        name: '',
        email: '',
        dateOfBirth: '',
        department: '',
        phone: '',
        institution: '',
        designation: 'UG Student'
      });
      fetchParticipants();
    } catch (error) {
      enqueueSnackbar('Error adding participant', { variant: 'error' });
    }
  };

  const handleExport = async () => {
    try {
      const endpoint = userRole === 'hod'
        ? `${import.meta.env.VITE_API_BASE_URL || 'http://10.5.12.1:4000/api'}/hod/events/${eventId}/participants/export`
        : `${import.meta.env.VITE_API_BASE_URL || 'http://10.5.12.1:4000/api'}/coordinator/participants/export/${eventId}`;
        
      const response = await axios.get(endpoint, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        responseType: 'blob'
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${eventTitle}_participants.xlsx`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      
      enqueueSnackbar('Participants exported successfully', { variant: 'success' });
    } catch (error) {
      enqueueSnackbar('Error exporting participants', { variant: 'error' });
    }
  };

  const handleSendNotification = async () => {
    try {
      await axios.post(
        `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000/api'}/coordinator/participants/notify`,
        { participantIds: selectedParticipants, eventId, message: 'Event update notification' },
        { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
      );
      
      enqueueSnackbar(`Notification sent to ${selectedParticipants.length} participants`, { variant: 'success' });
      setSelectedParticipants([]);
    } catch (error) {
      enqueueSnackbar('Error sending notification', { variant: 'error' });
    }
  };

  const getStatusColor = (registration) => {
    if (userRole === 'hod') return 'success'; // HOD only sees approved participants
    
    if (registration.approved === true) return 'success';
    if (registration.approved === false && registration.rejectionReason) return 'error';
    return 'warning';
  };

  const getStatusText = (registration) => {
    if (userRole === 'hod') return 'Approved'; // HOD only sees approved participants
    
    if (registration.approved === true) return 'Approved';
    if (registration.approved === false && registration.rejectionReason) return 'Rejected';
    return 'Pending';
  };

  const getUniqueDepartments = () => {
    const departments = participants.map(p => p.department).filter(Boolean);
    return [...new Set(departments)];
  };

  const filteredParticipants = participants.filter(participant => {
    // Apply search filter
    const matchesSearch = !searchTerm || 
      participant.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      participant.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      participant.department?.toLowerCase().includes(searchTerm.toLowerCase());

    // Apply department filter
    const matchesDepartment = !filterDepartment || participant.department === filterDepartment;

    if (!matchesSearch || !matchesDepartment) return false;

    if (userRole === 'hod') {
      // For HOD, show all participants (they're already filtered to approved only)
      if (tabValue === 0) return true; // All approved
      if (tabValue === 1) return participant.eventRegistration?.attended === true; // Attended
      return true;
    }
    
    const registration = getParticipantRegistration(participant);
    if (!registration) return false;
    
    if (tabValue === 0) return true; // All
    if (tabValue === 1) return registration.approved === true; // Approved
    if (tabValue === 2) return registration.approved === false && registration.rejectionReason; // Rejected
    if (tabValue === 3) return registration.approved !== true && !registration.rejectionReason; // Pending
    if (tabValue === 4) return registration.approved === true && registration.attended; // Attended
    return true;
  });

  if (loading) {
    return (
      <Box sx={{ p: 3 }}>
        <LinearProgress />
        <Typography sx={{ mt: 2 }}>Loading participants...</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h5" component="h2">
          Participant Management - {eventTitle}
        </Typography>
        
        <Box display="flex" gap={1}>
          <IconButton onClick={fetchParticipants} title="Refresh">
            <Refresh />
          </IconButton>
          
          {userRole === 'coordinator' && (
            <>
              <Button
                variant="outlined"
                startIcon={<PersonAdd />}
                onClick={() => setAddParticipantModalOpen(true)}
              >
                Add Participants
              </Button>
              <Button
                variant="outlined"
                startIcon={<FileDownload />}
                onClick={handleExport}
              >
                Export
              </Button>
            </>
          )}
          
          {userRole === 'hod' && (
            <Button
              variant="outlined"
              startIcon={<FileDownload />}
              onClick={handleExport}
            >
              Export Approved
            </Button>
          )}
        </Box>
      </Box>

      {/* Search and Filter */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} sm={6} md={4}>
              <TextField
                fullWidth
                placeholder="Search participants..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                InputProps={{
                  startAdornment: <Search sx={{ mr: 1, color: 'text.secondary' }} />
                }}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <FormControl fullWidth>
                <InputLabel>Filter by Department</InputLabel>
                <Select
                  value={filterDepartment}
                  onChange={(e) => setFilterDepartment(e.target.value)}
                  startAdornment={<FilterList sx={{ mr: 1, color: 'text.secondary' }} />}
                >
                  <MenuItem value="">All Departments</MenuItem>
                  {getUniqueDepartments().map(dept => (
                    <MenuItem key={dept} value={dept}>{dept}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={12} md={5}>
              <Typography variant="body2" color="text.secondary">
                Showing {filteredParticipants.length} of {participants.length} participants
              </Typography>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Statistics Cards */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center">
                <People sx={{ mr: 1, color: 'primary.main' }} />
                <Box>
                  <Typography variant="h6">Total Registered</Typography>
                  <Typography variant="h4">{stats.totalRegistered || 0}</Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center">
                <CheckCircle sx={{ mr: 1, color: 'success.main' }} />
                <Box>
                  <Typography variant="h6">Approved</Typography>
                  <Typography variant="h4">{stats.totalApproved || 0}</Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center">
                <EventAvailable sx={{ mr: 1, color: 'info.main' }} />
                <Box>
                  <Typography variant="h6">Attended</Typography>
                  <Typography variant="h4">{stats.totalAttended || 0}</Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center">
                <TrendingUp sx={{ mr: 1, color: 'warning.main' }} />
                <Box>
                  <Typography variant="h6">Attendance Rate</Typography>
                  <Typography variant="h4">{stats.attendanceRate || 0}%</Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Bulk Actions */}
      {userRole === 'coordinator' && selectedParticipants.length > 0 && (
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Bulk Actions ({selectedParticipants.length} selected)
            </Typography>
            <Box display="flex" gap={1} flexWrap="wrap">
              <Button
                variant="contained"
                color="success"
                startIcon={<CheckCircle />}
                onClick={handleBulkApprove}
              >
                Approve Selected
              </Button>
              <Button
                variant="contained"
                color="primary"
                startIcon={<EventAvailable />}
                onClick={() => handleBulkAttendance(true)}
              >
                Mark Attended
              </Button>
              <Button
                variant="outlined"
                startIcon={<Cancel />}
                onClick={() => handleBulkAttendance(false)}
              >
                Mark Not Attended
              </Button>
              <Button
                variant="outlined"
                startIcon={<Send />}
                onClick={handleSendNotification}
              >
                Send Notification
              </Button>
            </Box>
          </CardContent>
        </Card>
      )}

      {/* Tabs */}
      <Paper sx={{ width: '100%' }}>
        <Tabs value={tabValue} onChange={(e, newValue) => setTabValue(newValue)}>
          {userRole === 'hod' ? [
            <Tab key="all-approved" label={`All Approved (${participants.length})`} />,
            <Tab key="attended" label={`Attended (${stats.totalAttended || 0})`} />
          ] : [
            <Tab key="all" label={`All (${participants.length})`} />,
            <Tab key="approved" label={`Approved (${stats.totalApproved || 0})`} />,
            <Tab key="rejected" label={`Rejected (${stats.totalRejected || 0})`} />,
            <Tab key="pending" label={`Pending (${stats.totalPending || 0})`} />,
            <Tab key="attended" label={`Attended (${stats.totalAttended || 0})`} />
          ]}
        </Tabs>

        {/* Participants Table */}
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                {userRole === 'coordinator' && (
                  <TableCell padding="checkbox">
                    <Checkbox
                      indeterminate={selectedParticipants.length > 0 && selectedParticipants.length < filteredParticipants.length}
                      checked={filteredParticipants.length > 0 && selectedParticipants.length === filteredParticipants.length}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedParticipants(filteredParticipants.map(p => p._id));
                        } else {
                          setSelectedParticipants([]);
                        }
                      }}
                    />
                  </TableCell>
                )}
                <TableCell>Participant</TableCell>
                <TableCell>Contact</TableCell>
                <TableCell>Institution</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Attendance</TableCell>
                {userRole === 'coordinator' && <TableCell>Actions</TableCell>}
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredParticipants.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={userRole === 'coordinator' ? 7 : 6} align="center">
                    <Typography variant="body2" color="text.secondary" sx={{ py: 4 }}>
                      No participants found matching your criteria
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                filteredParticipants.map((participant) => {
                  const registration = getParticipantRegistration(participant);
                  if (!registration) return null;

                  return (
                    <TableRow key={participant._id} hover>
                      {userRole === 'coordinator' && (
                        <TableCell padding="checkbox">
                          <Checkbox
                            checked={selectedParticipants.includes(participant._id)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setSelectedParticipants([...selectedParticipants, participant._id]);
                              } else {
                                setSelectedParticipants(selectedParticipants.filter(id => id !== participant._id));
                              }
                            }}
                          />
                        </TableCell>
                      )}
                      
                      <TableCell>
                        <Box display="flex" alignItems="center">
                          <Avatar sx={{ mr: 2 }}>
                            {participant.name?.charAt(0)}
                          </Avatar>
                          <Box>
                            <Typography variant="subtitle2">{participant.name}</Typography>
                            <Typography variant="caption" color="text.secondary">
                              {participant.designation}
                            </Typography>
                          </Box>
                        </Box>
                      </TableCell>
                      
                      <TableCell>
                        <Box>
                          <Typography variant="body2" display="flex" alignItems="center">
                            <Email sx={{ mr: 1, fontSize: 16 }} />
                            {participant.email}
                          </Typography>
                          {participant.phone && (
                            <Typography variant="body2" display="flex" alignItems="center">
                              <Phone sx={{ mr: 1, fontSize: 16 }} />
                              {participant.phone}
                            </Typography>
                          )}
                        </Box>
                      </TableCell>
                      
                      <TableCell>
                        <Box>
                          <Typography variant="body2" display="flex" alignItems="center">
                            <School sx={{ mr: 1, fontSize: 16 }} />
                            {participant.department || 'N/A'}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {participant.institution || 'N/A'}
                          </Typography>
                        </Box>
                      </TableCell>
                      
                      <TableCell>
                        <Chip
                          label={getStatusText(registration)}
                          color={getStatusColor(registration)}
                          size="small"
                        />
                        {registration.rejectionReason && (
                          <Tooltip title={registration.rejectionReason}>
                            <Typography variant="caption" display="block" color="error">
                              Reason: {registration.rejectionReason.substring(0, 30)}...
                            </Typography>
                          </Tooltip>
                        )}
                      </TableCell>
                      
                      <TableCell>
                        {registration.approved === true ? (
                          <Box display="flex" alignItems="center">
                            <Chip
                              label={registration.attended ? 'Present' : 'Absent'}
                              color={registration.attended ? 'success' : 'default'}
                              size="small"
                            />
                            {userRole === 'coordinator' && (
                              <Box ml={1}>
                                <Switch
                                  checked={registration.attended || false}
                                  onChange={(e) => handleMarkAttendance(participant._id, e.target.checked)}
                                  size="small"
                                  color="primary"
                                />
                              </Box>
                            )}
                          </Box>
                        ) : (
                          <Typography variant="caption" color="text.secondary">
                            N/A
                          </Typography>
                        )}
                      </TableCell>
                      
                      {userRole === 'coordinator' && (
                        <TableCell>
                          <Box display="flex" gap={1}>
                            {registration.approved !== true && !registration.rejectionReason && (
                              <>
                                <Tooltip title="Approve">
                                  <IconButton
                                    size="small"
                                    color="success"
                                    onClick={() => handleApproveParticipant(participant._id)}
                                  >
                                    <CheckCircle />
                                  </IconButton>
                                </Tooltip>
                                <Tooltip title="Reject">
                                  <IconButton
                                    size="small"
                                    color="error"
                                    onClick={() => {
                                      setDialogType('reject');
                                      setSelectedParticipants([participant._id]);
                                      setDialogOpen(true);
                                    }}
                                  >
                                    <Cancel />
                                  </IconButton>
                                </Tooltip>
                              </>
                            )}
                            <Tooltip title="View Details">
                              <IconButton size="small">
                                <Visibility />
                              </IconButton>
                            </Tooltip>
                          </Box>
                        </TableCell>
                      )}
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      {/* Enhanced Add Participant Modal */}
      <AddParticipantModal
        open={addParticipantModalOpen}
        onClose={() => setAddParticipantModalOpen(false)}
        eventId={eventId}
        onParticipantAdded={fetchParticipants}
      />

      {/* Reject Participant Dialog */}
      <Dialog open={dialogOpen && dialogType === 'reject'} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Reject Participant</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Please provide a reason for rejecting this participant's registration.
          </Typography>
          <TextField
            fullWidth
            label="Rejection Reason"
            multiline
            rows={3}
            value={rejectionReason}
            onChange={(e) => setRejectionReason(e.target.value)}
            placeholder="Enter reason for rejection..."
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
          <Button 
            variant="contained" 
            color="error" 
            onClick={() => handleRejectParticipant(selectedParticipants[0])}
            disabled={!rejectionReason.trim()}
          >
            Reject
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default EnhancedParticipantDashboard;