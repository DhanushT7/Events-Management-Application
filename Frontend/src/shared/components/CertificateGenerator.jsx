import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Grid,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  IconButton,
  Tooltip,
  Alert,
  CircularProgress,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
} from '@mui/material';
import {
  Add as AddIcon,
  Download as DownloadIcon,
  Visibility as ViewIcon,
  VerifiedUser as VerifyIcon,
  Group as GroupIcon,
  EmojiEvents as CertificateIcon,
  QrCode as QrCodeIcon,
  Refresh as RefreshIcon,
  Settings as SettingsIcon,
} from '@mui/icons-material';
import { useSnackbar } from 'notistack';
import axios from 'axios';

const CertificateGenerator = () => {
  const [events, setEvents] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState('');
  const [participants, setParticipants] = useState([]);
  const [certificates, setCertificates] = useState([]);
  const [loading, setLoading] = useState(false);
  const [bulkLoading, setBulkLoading] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedParticipant, setSelectedParticipant] = useState('');
  const [certificateDetailsDialog, setCertificateDetailsDialog] = useState(false);
  const [selectedCertificate, setSelectedCertificate] = useState(null);
  const [bulkResultDialog, setBulkResultDialog] = useState(false);
  const [bulkResults, setBulkResults] = useState(null);
  const { enqueueSnackbar } = useSnackbar();

  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://10.5.12.1:4000/api';

  // Get auth token
  const getAuthToken = () => {
    return localStorage.getItem('token');
  };

  // Fetch events
  const fetchEvents = async () => {
    try {
      const token = getAuthToken();
      const response = await axios.get(`${API_BASE_URL}/coordinator/events`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setEvents(response.data.events || []);
    } catch (error) {
      console.error('Error fetching events:', error);
      enqueueSnackbar('Error fetching events', { variant: 'error' });
    }
  };

  // Fetch participants for selected event
  const fetchParticipants = async (eventId) => {
    try {
      const token = getAuthToken();
      const response = await axios.get(`${API_BASE_URL}/coordinator/events/${eventId}/participants`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      // Filter participants who have given feedback but don't have certificates
      const eligibleParticipants = response.data.participants?.filter(
        p => p.feedbackGiven && !p.certificateGenerated
      ) || [];
      
      setParticipants(eligibleParticipants);
    } catch (error) {
      console.error('Error fetching participants:', error);
      enqueueSnackbar('Error fetching participants', { variant: 'error' });
    }
  };

  // Fetch certificates for selected event
  const fetchCertificates = async (eventId) => {
    try {
      const token = getAuthToken();
      const response = await axios.get(`${API_BASE_URL}/certificates/event/${eventId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setCertificates(response.data.certificates || []);
    } catch (error) {
      console.error('Error fetching certificates:', error);
      enqueueSnackbar('Error fetching certificates', { variant: 'error' });
    }
  };

  // Handle event selection
  const handleEventChange = (eventId) => {
    setSelectedEvent(eventId);
    if (eventId) {
      fetchParticipants(eventId);
      fetchCertificates(eventId);
    } else {
      setParticipants([]);
      setCertificates([]);
    }
  };

  // Generate single certificate
  const generateSingleCertificate = async () => {
    if (!selectedEvent || !selectedParticipant) {
      enqueueSnackbar('Please select event and participant', { variant: 'warning' });
      return;
    }

    setLoading(true);
    try {
      const token = getAuthToken();
      const response = await axios.post(
        `${API_BASE_URL}/certificates/generate`,
        {
          participantId: selectedParticipant,
          eventId: selectedEvent,
        },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      enqueueSnackbar('Certificate generated successfully!', { variant: 'success' });
      setDialogOpen(false);
      setSelectedParticipant('');
      
      // Refresh data
      fetchParticipants(selectedEvent);
      fetchCertificates(selectedEvent);
    } catch (error) {
      console.error('Error generating certificate:', error);
      enqueueSnackbar(
        error.response?.data?.message || 'Error generating certificate',
        { variant: 'error' }
      );
    } finally {
      setLoading(false);
    }
  };

  // Generate bulk certificates
  const generateBulkCertificates = async () => {
    if (!selectedEvent) {
      enqueueSnackbar('Please select an event', { variant: 'warning' });
      return;
    }

    if (participants.length === 0) {
      enqueueSnackbar('No eligible participants found for certificate generation', { variant: 'warning' });
      return;
    }

    setBulkLoading(true);
    try {
      const token = getAuthToken();
      const response = await axios.post(
        `${API_BASE_URL}/certificates/bulk-generate`,
        { eventId: selectedEvent },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      setBulkResults(response.data);
      setBulkResultDialog(true);
      
      // Refresh data
      fetchParticipants(selectedEvent);
      fetchCertificates(selectedEvent);
    } catch (error) {
      console.error('Error generating bulk certificates:', error);
      enqueueSnackbar(
        error.response?.data?.message || 'Error generating bulk certificates',
        { variant: 'error' }
      );
    } finally {
      setBulkLoading(false);
    }
  };

  // Download certificate
  const downloadCertificate = async (certificateId) => {
    try {
      const token = getAuthToken();
      const response = await axios.get(
        `${API_BASE_URL}/certificates/download/${certificateId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
          responseType: 'blob',
        }
      );

      // Create download link
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `certificate-${certificateId}.png`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      enqueueSnackbar('Certificate downloaded successfully!', { variant: 'success' });
    } catch (error) {
      console.error('Error downloading certificate:', error);
      enqueueSnackbar('Error downloading certificate', { variant: 'error' });
    }
  };

  // View certificate details
  const viewCertificateDetails = async (certificateId) => {
    try {
      const token = getAuthToken();
      const response = await axios.get(
        `${API_BASE_URL}/certificates/${certificateId}`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      setSelectedCertificate(response.data.certificate);
      setCertificateDetailsDialog(true);
    } catch (error) {
      console.error('Error fetching certificate details:', error);
      enqueueSnackbar('Error fetching certificate details', { variant: 'error' });
    }
  };

  // Verify certificate
  const verifyCertificate = async (certificateId) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/certificates/verify/${certificateId}`);
      
      if (response.data.valid) {
        enqueueSnackbar('Certificate is valid!', { variant: 'success' });
      } else {
        enqueueSnackbar('Certificate is invalid or revoked', { variant: 'error' });
      }
    } catch (error) {
      console.error('Error verifying certificate:', error);
      enqueueSnackbar('Error verifying certificate', { variant: 'error' });
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  const selectedEventData = events.find(e => e._id === selectedEvent);

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
        <CertificateIcon color="primary" />
        Certificate Generator
      </Typography>

      {/* Event Selection */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Select Event
          </Typography>
          <FormControl fullWidth>
            <InputLabel>Event</InputLabel>
            <Select
              value={selectedEvent}
              onChange={(e) => handleEventChange(e.target.value)}
              label="Event"
            >
              <MenuItem value="">
                <em>Select an event</em>
              </MenuItem>
              {events.map((event) => (
                <MenuItem key={event._id} value={event._id}>
                  {event.title} - {new Date(event.startDate).toLocaleDateString()}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </CardContent>
      </Card>

      {selectedEvent && (
        <>
          {/* Event Summary */}
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Event Summary
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <Typography variant="body2" color="text.secondary">
                    Event: {selectedEventData?.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Date: {new Date(selectedEventData?.startDate).toLocaleDateString()} - {new Date(selectedEventData?.endDate).toLocaleDateString()}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Venue: {selectedEventData?.venue}
                  </Typography>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="body2" color="text.secondary">
                    Eligible Participants: {participants.length}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Generated Certificates: {certificates.length}
                  </Typography>
                </Grid>
              </Grid>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Certificate Actions
              </Typography>
              <Grid container spacing={2}>
                <Grid item>
                  <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={() => setDialogOpen(true)}
                    disabled={participants.length === 0}
                  >
                    Generate Single Certificate
                  </Button>
                </Grid>
                <Grid item>
                  <Button
                    variant="contained"
                    color="secondary"
                    startIcon={bulkLoading ? <CircularProgress size={20} /> : <GroupIcon />}
                    onClick={generateBulkCertificates}
                    disabled={participants.length === 0 || bulkLoading}
                  >
                    Generate Bulk Certificates ({participants.length})
                  </Button>
                </Grid>
                <Grid item>
                  <Button
                    variant="outlined"
                    startIcon={<RefreshIcon />}
                    onClick={() => {
                      fetchParticipants(selectedEvent);
                      fetchCertificates(selectedEvent);
                    }}
                  >
                    Refresh
                  </Button>
                </Grid>
              </Grid>
            </CardContent>
          </Card>

          {/* Eligible Participants */}
          {participants.length > 0 && (
            <Card sx={{ mb: 3 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Eligible Participants ({participants.length})
                </Typography>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Participants who have submitted feedback but haven't received certificates yet.
                </Typography>
                <List>
                  {participants.slice(0, 5).map((participant) => (
                    <ListItem key={participant._id}>
                      <ListItemText
                        primary={participant.name}
                        secondary={participant.email}
                      />
                      <ListItemSecondaryAction>
                        <Chip
                          label="Feedback Given"
                          color="success"
                          size="small"
                        />
                      </ListItemSecondaryAction>
                    </ListItem>
                  ))}
                  {participants.length > 5 && (
                    <ListItem>
                      <ListItemText
                        primary={`... and ${participants.length - 5} more participants`}
                        secondary="Use bulk generation to create certificates for all"
                      />
                    </ListItem>
                  )}
                </List>
              </CardContent>
            </Card>
          )}

          {/* Generated Certificates */}
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Generated Certificates ({certificates.length})
              </Typography>
              {certificates.length === 0 ? (
                <Alert severity="info">
                  No certificates have been generated for this event yet.
                </Alert>
              ) : (
                <TableContainer component={Paper}>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>Participant</TableCell>
                        <TableCell>Certificate ID</TableCell>
                        <TableCell>Issued Date</TableCell>
                        <TableCell>Status</TableCell>
                        <TableCell>Downloads</TableCell>
                        <TableCell>Actions</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {certificates.map((certificate) => (
                        <TableRow key={certificate.id}>
                          <TableCell>{certificate.participantName}</TableCell>
                          <TableCell>
                            <Typography variant="body2" fontFamily="monospace">
                              {certificate.certificateId}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            {new Date(certificate.issuedDate).toLocaleDateString()}
                          </TableCell>
                          <TableCell>
                            <Chip
                              label={certificate.status}
                              color={certificate.status === 'generated' ? 'success' : 'default'}
                              size="small"
                            />
                          </TableCell>
                          <TableCell>{certificate.downloadCount}</TableCell>
                          <TableCell>
                            <Tooltip title="View Details">
                              <IconButton
                                size="small"
                                onClick={() => viewCertificateDetails(certificate.certificateId)}
                              >
                                <ViewIcon />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Download">
                              <IconButton
                                size="small"
                                onClick={() => downloadCertificate(certificate.certificateId)}
                              >
                                <DownloadIcon />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Verify">
                              <IconButton
                                size="small"
                                onClick={() => verifyCertificate(certificate.certificateId)}
                              >
                                <VerifyIcon />
                              </IconButton>
                            </Tooltip>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              )}
            </CardContent>
          </Card>
        </>
      )}

      {/* Single Certificate Generation Dialog */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Generate Single Certificate</DialogTitle>
        <DialogContent>
          <FormControl fullWidth sx={{ mt: 2 }}>
            <InputLabel>Participant</InputLabel>
            <Select
              value={selectedParticipant}
              onChange={(e) => setSelectedParticipant(e.target.value)}
              label="Participant"
            >
              {participants.map((participant) => (
                <MenuItem key={participant._id} value={participant._id}>
                  {participant.name} - {participant.email}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
          <Button
            onClick={generateSingleCertificate}
            variant="contained"
            disabled={loading || !selectedParticipant}
            startIcon={loading ? <CircularProgress size={20} /> : <AddIcon />}
          >
            Generate Certificate
          </Button>
        </DialogActions>
      </Dialog>

      {/* Certificate Details Dialog */}
      <Dialog
        open={certificateDetailsDialog}
        onClose={() => setCertificateDetailsDialog(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Certificate Details</DialogTitle>
        <DialogContent>
          {selectedCertificate && (
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle2" color="text.secondary">
                  Certificate ID
                </Typography>
                <Typography variant="body1" fontFamily="monospace" gutterBottom>
                  {selectedCertificate.certificateId}
                </Typography>

                <Typography variant="subtitle2" color="text.secondary">
                  Participant
                </Typography>
                <Typography variant="body1" gutterBottom>
                  {selectedCertificate.participantName}
                </Typography>

                <Typography variant="subtitle2" color="text.secondary">
                  Event
                </Typography>
                <Typography variant="body1" gutterBottom>
                  {selectedCertificate.eventTitle}
                </Typography>

                <Typography variant="subtitle2" color="text.secondary">
                  Duration
                </Typography>
                <Typography variant="body1" gutterBottom>
                  {selectedCertificate.eventDuration}
                </Typography>
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle2" color="text.secondary">
                  Venue
                </Typography>
                <Typography variant="body1" gutterBottom>
                  {selectedCertificate.venue}
                </Typography>

                <Typography variant="subtitle2" color="text.secondary">
                  Mode
                </Typography>
                <Typography variant="body1" gutterBottom>
                  {selectedCertificate.mode}
                </Typography>

                <Typography variant="subtitle2" color="text.secondary">
                  Issued Date
                </Typography>
                <Typography variant="body1" gutterBottom>
                  {new Date(selectedCertificate.issuedDate).toLocaleDateString()}
                </Typography>

                <Typography variant="subtitle2" color="text.secondary">
                  Downloads
                </Typography>
                <Typography variant="body1" gutterBottom>
                  {selectedCertificate.downloadCount}
                </Typography>
              </Grid>
              <Grid item xs={12}>
                <Divider sx={{ my: 2 }} />
                <Typography variant="subtitle2" color="text.secondary">
                  Verification URL
                </Typography>
                <Typography variant="body2" fontFamily="monospace" sx={{ wordBreak: 'break-all' }}>
                  {selectedCertificate.verificationUrl}
                </Typography>
              </Grid>
            </Grid>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCertificateDetailsDialog(false)}>Close</Button>
          {selectedCertificate && (
            <>
              <Button
                onClick={() => downloadCertificate(selectedCertificate.certificateId)}
                startIcon={<DownloadIcon />}
              >
                Download
              </Button>
              <Button
                onClick={() => verifyCertificate(selectedCertificate.certificateId)}
                startIcon={<VerifyIcon />}
              >
                Verify
              </Button>
            </>
          )}
        </DialogActions>
      </Dialog>

      {/* Bulk Generation Results Dialog */}
      <Dialog
        open={bulkResultDialog}
        onClose={() => setBulkResultDialog(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Bulk Certificate Generation Results</DialogTitle>
        <DialogContent>
          {bulkResults && (
            <Box>
              <Alert severity="success" sx={{ mb: 2 }}>
                {bulkResults.message}
              </Alert>
              
              <Grid container spacing={2} sx={{ mb: 2 }}>
                <Grid item xs={4}>
                  <Paper sx={{ p: 2, textAlign: 'center' }}>
                    <Typography variant="h4" color="primary">
                      {bulkResults.summary.total}
                    </Typography>
                    <Typography variant="body2">Total</Typography>
                  </Paper>
                </Grid>
                <Grid item xs={4}>
                  <Paper sx={{ p: 2, textAlign: 'center' }}>
                    <Typography variant="h4" color="success.main">
                      {bulkResults.summary.successful}
                    </Typography>
                    <Typography variant="body2">Successful</Typography>
                  </Paper>
                </Grid>
                <Grid item xs={4}>
                  <Paper sx={{ p: 2, textAlign: 'center' }}>
                    <Typography variant="h4" color="error.main">
                      {bulkResults.summary.failed}
                    </Typography>
                    <Typography variant="body2">Failed</Typography>
                  </Paper>
                </Grid>
              </Grid>

              {bulkResults.results.successful.length > 0 && (
                <Box sx={{ mb: 2 }}>
                  <Typography variant="h6" gutterBottom color="success.main">
                    Successfully Generated ({bulkResults.results.successful.length})
                  </Typography>
                  <List dense>
                    {bulkResults.results.successful.map((result, index) => (
                      <ListItem key={index}>
                        <ListItemText
                          primary={result.participantName}
                          secondary={`Certificate ID: ${result.certificateId}`}
                        />
                      </ListItem>
                    ))}
                  </List>
                </Box>
              )}

              {bulkResults.results.failed.length > 0 && (
                <Box>
                  <Typography variant="h6" gutterBottom color="error.main">
                    Failed ({bulkResults.results.failed.length})
                  </Typography>
                  <List dense>
                    {bulkResults.results.failed.map((result, index) => (
                      <ListItem key={index}>
                        <ListItemText
                          primary={result.participantName}
                          secondary={result.error}
                        />
                      </ListItem>
                    ))}
                  </List>
                </Box>
              )}
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setBulkResultDialog(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default CertificateGenerator;