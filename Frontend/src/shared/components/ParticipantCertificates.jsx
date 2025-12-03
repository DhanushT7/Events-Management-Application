import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Grid,
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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Divider,
} from '@mui/material';
import {
  Download as DownloadIcon,
  Visibility as ViewIcon,
  VerifiedUser as VerifyIcon,
  EmojiEvents as CertificateIcon,
  Share as ShareIcon,
  QrCode as QrCodeIcon,
} from '@mui/icons-material';
import { useSnackbar } from 'notistack';
import axios from 'axios';

const ParticipantCertificates = ({ userId }) => {
  const [certificates, setCertificates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCertificate, setSelectedCertificate] = useState(null);
  const [detailsDialog, setDetailsDialog] = useState(false);
  const { enqueueSnackbar } = useSnackbar();

  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://10.5.12.1:4000/api';

  // Get auth token
  const getAuthToken = () => {
    return localStorage.getItem('token');
  };

  // Fetch participant's certificates
  const fetchCertificates = async () => {
    try {
      setLoading(true);
      const token = getAuthToken();
      const response = await axios.get(
        `${API_BASE_URL}/certificates/participant/${userId}`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      setCertificates(response.data.certificates || []);
    } catch (error) {
      console.error('Error fetching certificates:', error);
      enqueueSnackbar('Error fetching certificates', { variant: 'error' });
    } finally {
      setLoading(false);
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
      
      // Refresh certificates to update download count
      fetchCertificates();
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
      setDetailsDialog(true);
    } catch (error) {
      console.error('Error fetching certificate details:', error);
      enqueueSnackbar('Error fetching certificate details', { variant: 'error' });
    }
  };

  // Share certificate
  const shareCertificate = (certificate) => {
    const shareUrl = `${window.location.origin}/verify-certificate/${certificate.certificateId}`;
    
    if (navigator.share) {
      navigator.share({
        title: `Certificate - ${certificate.eventTitle}`,
        text: `Check out my certificate for ${certificate.eventTitle}`,
        url: shareUrl,
      }).catch(console.error);
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(shareUrl).then(() => {
        enqueueSnackbar('Certificate verification link copied to clipboard!', { variant: 'success' });
      }).catch(() => {
        enqueueSnackbar('Could not copy link to clipboard', { variant: 'error' });
      });
    }
  };

  // Verify certificate
  const verifyCertificate = async (certificateId) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/certificates/verify/${certificateId}`);
      
      if (response.data.valid) {
        enqueueSnackbar('Certificate is valid and verified!', { variant: 'success' });
      } else {
        enqueueSnackbar('Certificate verification failed', { variant: 'error' });
      }
    } catch (error) {
      console.error('Error verifying certificate:', error);
      enqueueSnackbar('Error verifying certificate', { variant: 'error' });
    }
  };

  useEffect(() => {
    if (userId) {
      fetchCertificates();
    }
  }, [userId]);

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const formatDateRange = (startDate, endDate) => {
    const start = formatDate(startDate);
    const end = formatDate(endDate);
    return start === end ? start : `${start} - ${end}`;
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 200 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h5" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
        <CertificateIcon color="primary" />
        My Certificates
      </Typography>

      {certificates.length === 0 ? (
        <Alert severity="info">
          <Typography variant="h6" gutterBottom>
            No Certificates Yet
          </Typography>
          You haven't earned any certificates yet. Complete events and submit feedback to earn certificates!
        </Alert>
      ) : (
        <>
          {/* Summary Cards */}
          <Grid container spacing={2} sx={{ mb: 3 }}>
            <Grid size={{ xs: 12, md: 4 }}>
              <Card>
                <CardContent sx={{ textAlign: 'center' }}>
                  <Typography variant="h3" color="primary">
                    {certificates.length}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Total Certificates
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid size={{ xs: 12, md: 4 }}>
              <Card>
                <CardContent sx={{ textAlign: 'center' }}>
                  <Typography variant="h3" color="success.main">
                    {certificates.reduce((sum, cert) => sum + cert.downloadCount, 0)}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Total Downloads
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid size={{ xs: 12, md: 4 }}>
              <Card>
                <CardContent sx={{ textAlign: 'center' }}>
                  <Typography variant="h3" color="info.main">
                    {certificates.filter(cert => cert.status === 'generated').length}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Active Certificates
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          {/* Certificates Table */}
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Certificate Details
              </Typography>
              <TableContainer component={Paper}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Event</TableCell>
                      <TableCell>Certificate ID</TableCell>
                      <TableCell>Event Date</TableCell>
                      <TableCell>Issued Date</TableCell>
                      <TableCell>Status</TableCell>
                      <TableCell>Downloads</TableCell>
                      <TableCell>Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {certificates.map((certificate) => (
                      <TableRow key={certificate.id}>
                        <TableCell>
                          <Typography variant="body2" fontWeight="medium">
                            {certificate.eventTitle}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" fontFamily="monospace">
                            {certificate.certificateId}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          {formatDateRange(certificate.eventDates.startDate, certificate.eventDates.endDate)}
                        </TableCell>
                        <TableCell>
                          {formatDate(certificate.issuedDate)}
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={certificate.status}
                            color={certificate.status === 'generated' ? 'success' : 'default'}
                            size="small"
                            sx={{ textTransform: 'capitalize' }}
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
                          <Tooltip title="Download Certificate">
                            <IconButton
                              size="small"
                              onClick={() => downloadCertificate(certificate.certificateId)}
                            >
                              <DownloadIcon />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Share Certificate">
                            <IconButton
                              size="small"
                              onClick={() => shareCertificate(certificate)}
                            >
                              <ShareIcon />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Verify Certificate">
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
            </CardContent>
          </Card>
        </>
      )}

      {/* Certificate Details Dialog */}
      <Dialog
        open={detailsDialog}
        onClose={() => setDetailsDialog(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Certificate Details</DialogTitle>
        <DialogContent>
          {selectedCertificate && (
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Typography variant="h6" gutterBottom color="primary">
                  Certificate Information
                </Typography>
                
                <Box sx={{ mb: 2 }}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Certificate ID
                  </Typography>
                  <Typography variant="body1" fontFamily="monospace" sx={{ wordBreak: 'break-all' }}>
                    {selectedCertificate.certificateId}
                  </Typography>
                </Box>

                <Box sx={{ mb: 2 }}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Status
                  </Typography>
                  <Chip 
                    label={selectedCertificate.status} 
                    color="success" 
                    size="small"
                    sx={{ textTransform: 'capitalize' }}
                  />
                </Box>

                <Box sx={{ mb: 2 }}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Issued Date
                  </Typography>
                  <Typography variant="body1">
                    {formatDate(selectedCertificate.issuedDate)}
                  </Typography>
                </Box>

                <Box sx={{ mb: 2 }}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Download Count
                  </Typography>
                  <Typography variant="body1">
                    {selectedCertificate.downloadCount} times
                  </Typography>
                </Box>
              </Grid>

              <Grid item xs={12} md={6}>
                <Typography variant="h6" gutterBottom color="primary">
                  Event Details
                </Typography>
                
                <Box sx={{ mb: 2 }}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Event Title
                  </Typography>
                  <Typography variant="body1" fontWeight="medium">
                    {selectedCertificate.eventTitle}
                  </Typography>
                </Box>

                <Box sx={{ mb: 2 }}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Duration
                  </Typography>
                  <Typography variant="body1">
                    {selectedCertificate.eventDuration}
                  </Typography>
                </Box>

                <Box sx={{ mb: 2 }}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Event Dates
                  </Typography>
                  <Typography variant="body1">
                    {formatDateRange(selectedCertificate.eventDates.startDate, selectedCertificate.eventDates.endDate)}
                  </Typography>
                </Box>

                <Box sx={{ mb: 2 }}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Venue
                  </Typography>
                  <Typography variant="body1">
                    {selectedCertificate.venue}
                  </Typography>
                </Box>

                <Box sx={{ mb: 2 }}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Mode
                  </Typography>
                  <Chip 
                    label={selectedCertificate.mode} 
                    variant="outlined" 
                    size="small"
                  />
                </Box>
              </Grid>

              {selectedCertificate.skills && selectedCertificate.skills.length > 0 && (
                <Grid item xs={12}>
                  <Divider sx={{ my: 2 }} />
                  <Typography variant="h6" gutterBottom color="primary">
                    Skills & Competencies
                  </Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                    {selectedCertificate.skills.map((skill, index) => (
                      <Chip 
                        key={index} 
                        label={skill} 
                        variant="outlined" 
                        color="primary"
                      />
                    ))}
                  </Box>
                </Grid>
              )}

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
          <Button onClick={() => setDetailsDialog(false)}>Close</Button>
          {selectedCertificate && (
            <>
              <Button
                onClick={() => downloadCertificate(selectedCertificate.certificateId)}
                startIcon={<DownloadIcon />}
                variant="contained"
              >
                Download
              </Button>
              <Button
                onClick={() => shareCertificate(selectedCertificate)}
                startIcon={<ShareIcon />}
              >
                Share
              </Button>
            </>
          )}
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ParticipantCertificates;