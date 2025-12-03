import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  Alert,
  CircularProgress,
  Grid,
  Divider,
  Chip,
  Paper,
  Container,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Badge,
  Tooltip,
  IconButton,
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
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Stepper,
  Step,
  StepLabel,
  StepContent,
} from '@mui/material';
import {
  VerifiedUser as VerifiedIcon,
  Error as ErrorIcon,
  Search as SearchIcon,
  EmojiEvents as CertificateIcon,
  QrCode as QrCodeIcon,
  Download as DownloadIcon,
  Share as ShareIcon,
  Print as PrintIcon,
  Security as SecurityIcon,
  History as HistoryIcon,
  Info as InfoIcon,
  CheckCircle as CheckCircleIcon,
  Warning as WarningIcon,
  ExpandMore as ExpandMoreIcon,
  Person as PersonIcon,
  Event as EventIcon,
  LocationOn as LocationIcon,
  CalendarToday as CalendarIcon,
  School as SchoolIcon,
  Assignment as AssignmentIcon,
  Visibility as ViewIcon,
  ContentCopy as CopyIcon,
  OpenInNew as OpenIcon,
  Timeline as TimelineIcon,
  Fingerprint as FingerprintIcon,
  Shield as ShieldIcon,
} from '@mui/icons-material';
import { useParams } from 'react-router-dom';
import axios from 'axios';

const CertificateVerificationBoard = () => {
  const { certificateId: urlCertificateId } = useParams();
  const [certificateId, setCertificateId] = useState(urlCertificateId || '');
  const [certificate, setCertificate] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [verified, setVerified] = useState(null);
  const [verificationHistory, setVerificationHistory] = useState([]);
  const [showAdvancedDetails, setShowAdvancedDetails] = useState(false);
  const [shareDialogOpen, setShareDialogOpen] = useState(false);
  const [verificationStep, setVerificationStep] = useState(0);

  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://10.5.12.1:4000/api';

  const verificationSteps = [
    'Certificate ID Validation',
    'Database Lookup',
    'Authenticity Check',
    'Status Verification',
    'Details Retrieval'
  ];

  const verifyCertificate = async (certId = certificateId) => {
    if (!certId.trim()) {
      setError('Please enter a certificate ID');
      return;
    }

    setLoading(true);
    setError('');
    setCertificate(null);
    setVerified(null);
    setVerificationStep(0);

    // Simulate verification steps for better UX
    const stepDelay = 300;
    
    try {
      // Step 1: Certificate ID Validation
      setVerificationStep(1);
      await new Promise(resolve => setTimeout(resolve, stepDelay));
      
      // Step 2: Database Lookup
      setVerificationStep(2);
      await new Promise(resolve => setTimeout(resolve, stepDelay));
      
      // Step 3: Authenticity Check
      setVerificationStep(3);
      await new Promise(resolve => setTimeout(resolve, stepDelay));
      
      const response = await axios.get(`${API_BASE_URL}/certificates/verify/${certId.trim()}`);
      
      // Step 4: Status Verification
      setVerificationStep(4);
      await new Promise(resolve => setTimeout(resolve, stepDelay));
      
      // Step 5: Details Retrieval
      setVerificationStep(5);
      await new Promise(resolve => setTimeout(resolve, stepDelay));
      
      if (response.data.success) {
        setCertificate(response.data.data);
        setVerified(true);
        
        // Add to verification history
        const newVerification = {
          timestamp: new Date(),
          certificateId: certId.trim(),
          status: 'verified',
          participantName: response.data.data.participantName,
          eventTitle: response.data.data.eventTitle
        };
        setVerificationHistory(prev => [newVerification, ...prev.slice(0, 4)]);
      } else {
        setVerified(false);
        setError(response.data.message || 'Certificate is invalid or has been revoked');
      }
    } catch (error) {
      console.error('Error verifying certificate:', error);
      setVerified(false);
      setError(
        error.response?.data?.message || 
        'Certificate not found or verification failed'
      );
      
      // Add failed verification to history
      const failedVerification = {
        timestamp: new Date(),
        certificateId: certId.trim(),
        status: 'failed',
        error: error.response?.data?.message || 'Verification failed'
      };
      setVerificationHistory(prev => [failedVerification, ...prev.slice(0, 4)]);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    verifyCertificate();
  };

  const handleDownloadCertificate = async () => {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/certificates/download/pdf/${certificate.certificateId}`,
        { responseType: 'blob' }
      );
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `certificate-${certificate.certificateId}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading certificate:', error);
    }
  };

  const handleShareCertificate = () => {
    setShareDialogOpen(true);
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
  };

  // Auto-verify if certificate ID is provided in URL
  useEffect(() => {
    if (urlCertificateId) {
      verifyCertificate(urlCertificateId);
    }
  }, [urlCertificateId]);

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const formatDateTime = (dateString) => {
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatDateRange = (startDate, endDate) => {
    const start = formatDate(startDate);
    const end = formatDate(endDate);
    return start === end ? start : `${start} - ${end}`;
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'issued':
      case 'generated':
        return 'success';
      case 'draft':
        return 'warning';
      case 'revoked':
        return 'error';
      default:
        return 'default';
    }
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Header */}
      <Box sx={{ textAlign: 'center', mb: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 2, mb: 2 }}>
          <ShieldIcon sx={{ fontSize: 60, color: 'primary.main' }} />
          <Typography variant="h3" component="h1">
            Certificate Verification Board
          </Typography>
        </Box>
        <Typography variant="h6" color="text.secondary" sx={{ mb: 2 }}>
          Advanced Certificate Authentication & Validation System
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Verify the authenticity of certificates issued by Anna University Events Management System
        </Typography>
      </Box>

      <Grid container spacing={4}>
        {/* Left Column - Search and Verification */}
        <Grid item xs={12} lg={8}>
          {/* Search Form */}
          <Card sx={{ mb: 4 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <SearchIcon color="primary" />
                Certificate Verification
              </Typography>
              
              <form onSubmit={handleSubmit}>
                <Grid container spacing={2} alignItems="center">
                  <Grid item xs={12} md={8}>
                    <TextField
                      fullWidth
                      label="Certificate ID"
                      placeholder="Enter certificate ID (e.g., 1234567890-ABCDEF123)"
                      value={certificateId}
                      onChange={(e) => setCertificateId(e.target.value)}
                      disabled={loading}
                      helperText="Enter the complete certificate ID to verify its authenticity"
                      variant="outlined"
                    />
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <Button
                      type="submit"
                      variant="contained"
                      fullWidth
                      size="large"
                      disabled={loading || !certificateId.trim()}
                      startIcon={loading ? <CircularProgress size={20} /> : <SearchIcon />}
                    >
                      {loading ? 'Verifying...' : 'Verify Certificate'}
                    </Button>
                  </Grid>
                </Grid>
              </form>

              {/* Verification Progress */}
              {loading && (
                <Box sx={{ mt: 3 }}>
                  <Typography variant="subtitle2" gutterBottom>
                    Verification Progress
                  </Typography>
                  <Stepper activeStep={verificationStep - 1} orientation="horizontal">
                    {verificationSteps.map((label, index) => (
                      <Step key={label}>
                        <StepLabel>{label}</StepLabel>
                      </Step>
                    ))}
                  </Stepper>
                </Box>
              )}
            </CardContent>
          </Card>

          {/* Error Message */}
          {error && (
            <Alert 
              severity="error" 
              sx={{ mb: 4 }}
              icon={<ErrorIcon />}
              action={
                <Button color="inherit" size="small" onClick={() => setError('')}>
                  Dismiss
                </Button>
              }
            >
              <Typography variant="h6" gutterBottom>
                Verification Failed
              </Typography>
              {error}
            </Alert>
          )}

          {/* Verification Result */}
          {verified !== null && (
            <Card sx={{ mb: 4 }}>
              <CardContent>
                {verified ? (
                  <Box>
                    {/* Success Header */}
                    <Alert 
                      severity="success" 
                      sx={{ mb: 3 }}
                      icon={<VerifiedIcon />}
                      action={
                        <Box>
                          <Tooltip title="Download Certificate">
                            <IconButton 
                              color="inherit" 
                              size="small" 
                              onClick={handleDownloadCertificate}
                            >
                              <DownloadIcon />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Share Certificate">
                            <IconButton 
                              color="inherit" 
                              size="small" 
                              onClick={handleShareCertificate}
                            >
                              <ShareIcon />
                            </IconButton>
                          </Tooltip>
                        </Box>
                      }
                    >
                      <Typography variant="h6" gutterBottom>
                        ✅ Certificate Verified Successfully
                      </Typography>
                      This certificate is authentic and has been issued by Anna University Events Management System.
                    </Alert>

                    {certificate && (
                      <Box>
                        {/* Certificate Overview */}
                        <Paper sx={{ p: 3, mb: 3, background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white' }}>
                          <Grid container spacing={3} alignItems="center">
                            <Grid item xs={12} md={8}>
                              <Typography variant="h4" gutterBottom sx={{ fontWeight: 'bold' }}>
                                {certificate.participantName}
                              </Typography>
                              <Typography variant="h6" sx={{ opacity: 0.9 }}>
                                {certificate.eventTitle}
                              </Typography>
                              <Box sx={{ display: 'flex', gap: 2, mt: 2, flexWrap: 'wrap' }}>
                                <Chip 
                                  label={certificate.status} 
                                  color={getStatusColor(certificate.status)}
                                  sx={{ textTransform: 'capitalize', fontWeight: 'bold' }}
                                />
                                <Chip 
                                  label={certificate.mode} 
                                  variant="outlined" 
                                  sx={{ color: 'white', borderColor: 'white' }}
                                />
                              </Box>
                            </Grid>
                            <Grid item xs={12} md={4} sx={{ textAlign: 'center' }}>
                              <CertificateIcon sx={{ fontSize: 80, opacity: 0.8 }} />
                              <Typography variant="body2" sx={{ mt: 1, opacity: 0.8 }}>
                                Certificate ID: {certificate.certificateId}
                              </Typography>
                            </Grid>
                          </Grid>
                        </Paper>

                        {/* Detailed Information */}
                        <Grid container spacing={3}>
                          {/* Certificate Information */}
                          <Grid item xs={12} md={6}>
                            <Paper sx={{ p: 3, height: '100%' }}>
                              <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <FingerprintIcon color="primary" />
                                Certificate Information
                              </Typography>
                              
                              <List dense>
                                <ListItem>
                                  <ListItemIcon>
                                    <AssignmentIcon />
                                  </ListItemIcon>
                                  <ListItemText
                                    primary="Certificate ID"
                                    secondary={
                                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                        <Typography variant="body2" fontFamily="monospace">
                                          {certificate.certificateId}
                                        </Typography>
                                        <IconButton 
                                          size="small" 
                                          onClick={() => copyToClipboard(certificate.certificateId)}
                                        >
                                          <CopyIcon fontSize="small" />
                                        </IconButton>
                                      </Box>
                                    }
                                  />
                                </ListItem>
                                
                                <ListItem>
                                  <ListItemIcon>
                                    <CalendarIcon />
                                  </ListItemIcon>
                                  <ListItemText
                                    primary="Issued Date"
                                    secondary={formatDate(certificate.issuedDate)}
                                  />
                                </ListItem>

                                <ListItem>
                                  <ListItemIcon>
                                    <PersonIcon />
                                  </ListItemIcon>
                                  <ListItemText
                                    primary="Issued By"
                                    secondary={certificate.issuedBy || 'Anna University Events Management System'}
                                  />
                                </ListItem>

                                <ListItem>
                                  <ListItemIcon>
                                    <SecurityIcon />
                                  </ListItemIcon>
                                  <ListItemText
                                    primary="Verification Status"
                                    secondary={
                                      <Chip 
                                        label={certificate.verified ? 'Verified' : 'Unverified'} 
                                        color={certificate.verified ? 'success' : 'warning'}
                                        size="small"
                                      />
                                    }
                                  />
                                </ListItem>
                              </List>
                            </Paper>
                          </Grid>

                          {/* Event Information */}
                          <Grid item xs={12} md={6}>
                            <Paper sx={{ p: 3, height: '100%' }}>
                              <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <EventIcon color="primary" />
                                Event Details
                              </Typography>
                              
                              <List dense>
                                <ListItem>
                                  <ListItemIcon>
                                    <SchoolIcon />
                                  </ListItemIcon>
                                  <ListItemText
                                    primary="Event Title"
                                    secondary={certificate.eventTitle}
                                  />
                                </ListItem>

                                <ListItem>
                                  <ListItemIcon>
                                    <CalendarIcon />
                                  </ListItemIcon>
                                  <ListItemText
                                    primary="Event Dates"
                                    secondary={formatDateRange(certificate.eventDates.startDate, certificate.eventDates.endDate)}
                                  />
                                </ListItem>

                                <ListItem>
                                  <ListItemIcon>
                                    <TimelineIcon />
                                  </ListItemIcon>
                                  <ListItemText
                                    primary="Duration"
                                    secondary={certificate.eventDuration}
                                  />
                                </ListItem>

                                <ListItem>
                                  <ListItemIcon>
                                    <LocationIcon />
                                  </ListItemIcon>
                                  <ListItemText
                                    primary="Venue"
                                    secondary={certificate.venue}
                                  />
                                </ListItem>
                              </List>
                            </Paper>
                          </Grid>

                          {/* Skills & Competencies */}
                          {certificate.skills && certificate.skills.length > 0 && (
                            <Grid item xs={12}>
                              <Paper sx={{ p: 3 }}>
                                <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                  <SchoolIcon color="primary" />
                                  Skills & Competencies
                                </Typography>
                                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                                  {certificate.skills.map((skill, index) => (
                                    <Chip 
                                      key={index} 
                                      label={skill} 
                                      variant="outlined" 
                                      color="primary"
                                    />
                                  ))}
                                </Box>
                              </Paper>
                            </Grid>
                          )}
                        </Grid>

                        {/* Advanced Details Accordion */}
                        <Accordion sx={{ mt: 3 }}>
                          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                            <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <InfoIcon color="primary" />
                              Advanced Certificate Details
                            </Typography>
                          </AccordionSummary>
                          <AccordionDetails>
                            <Grid container spacing={2}>
                              <Grid item xs={12} md={6}>
                                <Typography variant="subtitle2" color="text.secondary">
                                  Participant Email
                                </Typography>
                                <Typography variant="body2" gutterBottom>
                                  {certificate.participantEmail || 'Not available'}
                                </Typography>
                              </Grid>
                              <Grid item xs={12} md={6}>
                                <Typography variant="subtitle2" color="text.secondary">
                                  Verification URL
                                </Typography>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                  <Typography variant="body2" sx={{ wordBreak: 'break-all', flex: 1 }}>
                                    {window.location.origin}/verify-certificate/{certificate.certificateId}
                                  </Typography>
                                  <IconButton 
                                    size="small" 
                                    onClick={() => copyToClipboard(`${window.location.origin}/verify-certificate/${certificate.certificateId}`)}
                                  >
                                    <CopyIcon fontSize="small" />
                                  </IconButton>
                                </Box>
                              </Grid>
                            </Grid>
                          </AccordionDetails>
                        </Accordion>

                        {/* Verification Notice */}
                        <Alert severity="info" sx={{ mt: 3 }}>
                          <Typography variant="body2">
                            <strong>Verification Notice:</strong> This certificate has been digitally verified against 
                            Anna University's Events Management System database. The information displayed above 
                            confirms the authenticity and validity of this certificate.
                          </Typography>
                        </Alert>
                      </Box>
                    )}
                  </Box>
                ) : (
                  <Alert 
                    severity="error"
                    icon={<ErrorIcon />}
                  >
                    <Typography variant="h6" gutterBottom>
                      Certificate Not Valid
                    </Typography>
                    The certificate ID you entered is either invalid, has been revoked, or does not exist in our system.
                  </Alert>
                )}
              </CardContent>
            </Card>
          )}
        </Grid>

        {/* Right Column - Sidebar */}
        <Grid item xs={12} lg={4}>
          {/* Verification History */}
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <HistoryIcon color="primary" />
                Recent Verifications
              </Typography>
              
              {verificationHistory.length === 0 ? (
                <Typography variant="body2" color="text.secondary">
                  No recent verifications
                </Typography>
              ) : (
                <List dense>
                  {verificationHistory.map((verification, index) => (
                    <ListItem key={index} divider={index < verificationHistory.length - 1}>
                      <ListItemIcon>
                        {verification.status === 'verified' ? (
                          <CheckCircleIcon color="success" />
                        ) : (
                          <ErrorIcon color="error" />
                        )}
                      </ListItemIcon>
                      <ListItemText
                        primary={verification.participantName || verification.certificateId}
                        secondary={
                          <Box>
                            <Typography variant="caption" display="block">
                              {verification.eventTitle || verification.error}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {formatDateTime(verification.timestamp)}
                            </Typography>
                          </Box>
                        }
                      />
                    </ListItem>
                  ))}
                </List>
              )}
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Quick Actions
              </Typography>
              
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                <Button
                  variant="outlined"
                  startIcon={<QrCodeIcon />}
                  fullWidth
                  disabled
                >
                  Scan QR Code
                </Button>
                <Button
                  variant="outlined"
                  startIcon={<ViewIcon />}
                  fullWidth
                  disabled={!certificate}
                  onClick={() => window.open(`/certificate-preview/${certificate?.certificateId}`, '_blank')}
                >
                  Preview Certificate
                </Button>
                <Button
                  variant="outlined"
                  startIcon={<PrintIcon />}
                  fullWidth
                  disabled={!certificate}
                  onClick={() => window.print()}
                >
                  Print Details
                </Button>
              </Box>
            </CardContent>
          </Card>

          {/* Instructions */}
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                How to Verify
              </Typography>
              
              <List dense>
                <ListItem>
                  <ListItemIcon>
                    <Typography variant="body2" sx={{ 
                      backgroundColor: 'primary.main', 
                      color: 'white', 
                      borderRadius: '50%', 
                      width: 24, 
                      height: 24, 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'center',
                      fontSize: '0.75rem'
                    }}>
                      1
                    </Typography>
                  </ListItemIcon>
                  <ListItemText
                    primary="Locate Certificate ID"
                    secondary="Find the unique ID on your certificate"
                  />
                </ListItem>
                
                <ListItem>
                  <ListItemIcon>
                    <Typography variant="body2" sx={{ 
                      backgroundColor: 'primary.main', 
                      color: 'white', 
                      borderRadius: '50%', 
                      width: 24, 
                      height: 24, 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'center',
                      fontSize: '0.75rem'
                    }}>
                      2
                    </Typography>
                  </ListItemIcon>
                  <ListItemText
                    primary="Enter ID"
                    secondary="Type or paste the complete certificate ID"
                  />
                </ListItem>
                
                <ListItem>
                  <ListItemIcon>
                    <Typography variant="body2" sx={{ 
                      backgroundColor: 'primary.main', 
                      color: 'white', 
                      borderRadius: '50%', 
                      width: 24, 
                      height: 24, 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'center',
                      fontSize: '0.75rem'
                    }}>
                      3
                    </Typography>
                  </ListItemIcon>
                  <ListItemText
                    primary="Verify"
                    secondary="Click verify to check authenticity"
                  />
                </ListItem>
              </List>
              
              <Divider sx={{ my: 2 }} />
              
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <QrCodeIcon color="primary" fontSize="small" />
                <Typography variant="body2" color="text.secondary">
                  You can also scan the QR code on the certificate
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Share Dialog */}
      <Dialog open={shareDialogOpen} onClose={() => setShareDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Share Certificate</DialogTitle>
        <DialogContent>
          {certificate && (
            <Box>
              <Typography variant="body2" gutterBottom>
                Share this certificate verification link:
              </Typography>
              <TextField
                fullWidth
                value={`${window.location.origin}/verify-certificate/${certificate.certificateId}`}
                InputProps={{
                  readOnly: true,
                  endAdornment: (
                    <IconButton 
                      onClick={() => copyToClipboard(`${window.location.origin}/verify-certificate/${certificate.certificateId}`)}
                    >
                      <CopyIcon />
                    </IconButton>
                  ),
                }}
                sx={{ mb: 2 }}
              />
              
              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                <Button
                  variant="outlined"
                  startIcon={<OpenIcon />}
                  onClick={() => window.open(`mailto:?subject=Certificate Verification&body=Please verify this certificate: ${window.location.origin}/verify-certificate/${certificate.certificateId}`)}
                >
                  Email
                </Button>
                <Button
                  variant="outlined"
                  startIcon={<ShareIcon />}
                  onClick={() => {
                    if (navigator.share) {
                      navigator.share({
                        title: 'Certificate Verification',
                        text: `Verify this certificate for ${certificate.participantName}`,
                        url: `${window.location.origin}/verify-certificate/${certificate.certificateId}`
                      });
                    }
                  }}
                >
                  Share
                </Button>
              </Box>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShareDialogOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default CertificateVerificationBoard;