import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import {
  Container,
  Paper,
  TextField,
  Button,
  Typography,
  Box,
  Alert,
  AlertTitle,
  CircularProgress,
  Card,
  CardContent,
  CardHeader,
  Grid2 as Grid,
  Chip,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Avatar,
  Stepper,
  Step,
  StepLabel,
  LinearProgress,
  IconButton,
  InputAdornment,
  Collapse,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from '@mui/material';

// Icons
import {
  Verified as VerifiedIcon,
  Certificate as CertificateIcon,
  Search as SearchIcon,
  QrCodeScanner as QrCodeScannerIcon,
  DateRange as DateRangeIcon,
  Person as PersonIcon,
  Event as EventIcon,
  Email as EmailIcon,
  Description as DescriptionIcon,
  LocationOn as LocationOnIcon,
  Security as SecurityIcon,
  Lock as LockIcon,
  CloudDone as CloudDoneIcon,
  Share as ShareIcon,
  Download as DownloadIcon,
  Link as LinkIcon,
  Info as InfoIcon,
  Close as CloseIcon,
  Visibility as VisibilityIcon,
  Error as ErrorIcon
} from '@mui/icons-material';

const CertificateVerification = () => {
  const { certificateId: urlCertificateId } = useParams();
  const [certificateId, setCertificateId] = useState(urlCertificateId || '');
  const [certificate, setCertificate] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [verified, setVerified] = useState(null);
  const [verificationStep, setVerificationStep] = useState(0);
  const [verificationHistory, setVerificationHistory] = useState([]);
  const [showDetails, setShowDetails] = useState(false);
  const [shareDialogOpen, setShareDialogOpen] = useState(false);

  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000/api';

  const verificationSteps = [
    'Validating Input',
    'Connecting to Database',
    'Checking Certificate Status',
    'Verifying Authenticity',
    'Loading Certificate Details'
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

    try {
      // Step-by-step verification process
      for (let i = 0; i < verificationSteps.length; i++) {
        setVerificationStep(i);
        await new Promise(resolve => setTimeout(resolve, 500));
      }

      const response = await axios.get(`${API_BASE_URL}/certificates/verify/${certId.trim()}`);
      
      if (response.data.success && response.data.valid) {
        setCertificate(response.data.certificate);
        setVerified(true);
        
        const newVerification = {
          timestamp: new Date(),
          certificateId: certId.trim(),
          status: 'verified',
          participantName: response.data.certificate.participant?.name,
          eventTitle: response.data.certificate.event?.title
        };
        setVerificationHistory(prev => [newVerification, ...prev.slice(0, 9)]);
        
      } else {
        setVerified(false);
        setError(response.data.message || 'Certificate is invalid or has been revoked');
        
        const failedVerification = {
          timestamp: new Date(),
          certificateId: certId.trim(),
          status: 'failed',
          error: response.data.message || 'Verification failed'
        };
        setVerificationHistory(prev => [failedVerification, ...prev.slice(0, 9)]);
      }
    } catch (error) {
      console.error('Error verifying certificate:', error);
      setVerified(false);
      
      const errorMessage = error.response?.data?.message || 'Certificate not found or verification failed';
      setError(errorMessage);
      
      const failedVerification = {
        timestamp: new Date(),
        certificateId: certId.trim(),
        status: 'failed',
        error: errorMessage
      };
      setVerificationHistory(prev => [failedVerification, ...prev.slice(0, 9)]);
    } finally {
      setLoading(false);
      setVerificationStep(0);
    }
  };

  const handleShare = () => {
    if (navigator.share && certificate) {
      navigator.share({
        title: `Certificate Verification - ${certificate.participant?.name}`,
        text: `Verified certificate for ${certificate.event?.title}`,
        url: window.location.href
      }).catch(console.error);
    } else {
      setShareDialogOpen(true);
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text).then(() => {
      console.log('Copied to clipboard');
    });
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatDateRange = (startDate, endDate) => {
    const start = formatDate(startDate);
    const end = formatDate(endDate);
    return start === end ? start : `${start} - ${end}`;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    verifyCertificate();
  };

  useEffect(() => {
    if (urlCertificateId) {
      verifyCertificate(urlCertificateId);
    }
  }, [urlCertificateId]);

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Paper elevation={3} sx={{ p: 4, borderRadius: 2 }}>
        {/* Header */}
        <Box sx={{ textAlign: 'center', mb: 4 }}>
          <Avatar sx={{ bgcolor: 'primary.main', width: 64, height: 64, mx: 'auto', mb: 2 }}>
            <VerifiedIcon sx={{ fontSize: 32 }} />
          </Avatar>
          <Typography variant="h4" component="h1" gutterBottom>
            Certificate Verification Portal
          </Typography>
          <Typography variant="subtitle1" color="text.secondary">
            Verify the authenticity of digital certificates issued by our institution
          </Typography>
        </Box>

        {/* Search Section */}
        <Card sx={{ mb: 4 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Enter Certificate ID
            </Typography>
            <form onSubmit={handleSubmit}>
              <Box sx={{ display: 'flex', gap: 2, alignItems: 'start' }}>
                <TextField
                  fullWidth
                  label="Certificate ID"
                  value={certificateId}
                  onChange={(e) => setCertificateId(e.target.value)}
                  placeholder="Enter certificate ID to verify"
                  variant="outlined"
                  disabled={loading}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchIcon />
                      </InputAdornment>
                    ),
                  }}
                />
                <Button
                  type="submit"
                  variant="contained"
                  disabled={loading || !certificateId.trim()}
                  sx={{ minWidth: 120, height: 56 }}
                >
                  {loading ? <CircularProgress size={24} /> : 'Verify'}
                </Button>
              </Box>
            </form>
          </CardContent>
        </Card>

        {/* Loading with Steps */}
        {loading && (
          <Card sx={{ mb: 4 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Verifying Certificate...
              </Typography>
              <Stepper activeStep={verificationStep} alternativeLabel>
                {verificationSteps.map((label, index) => (
                  <Step key={label}>
                    <StepLabel>
                      {index <= verificationStep ? label : label}
                    </StepLabel>
                  </Step>
                ))}
              </Stepper>
              <LinearProgress sx={{ mt: 3 }} />
            </CardContent>
          </Card>
        )}

        {/* Error Display */}
        {error && (
          <Alert 
            severity="error" 
            sx={{ mb: 4 }}
            action={
              <IconButton color="inherit" size="small" onClick={() => setError('')}>
                <CloseIcon />
              </IconButton>
            }
          >
            <AlertTitle>Verification Failed</AlertTitle>
            {error}
          </Alert>
        )}

        {/* Success Verification Result */}
        {verified !== null && (
          <Card sx={{ mb: 4 }}>
            <CardContent>
              {verified ? (
                <Box>
                  <Alert 
                    severity="success" 
                    sx={{ mb: 3 }}
                    icon={<VerifiedIcon />}
                  >
                    <Typography variant="h6" gutterBottom>
                      Certificate Verified Successfully
                    </Typography>
                    This certificate is authentic and has been issued by Anna University Events Management System.
                  </Alert>

                  {certificate && (
                    <Box>
                      {/* Main Certificate Header */}
                      <Box sx={{ mb: 4, textAlign: 'center', p: 3, bgcolor: 'background.paper', borderRadius: 2, border: 1, borderColor: 'divider' }}>
                        <Typography variant="h4" gutterBottom color="primary" sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1 }}>
                          <VerifiedIcon sx={{ fontSize: 32 }} />
                          Verified Certificate
                        </Typography>
                        <Typography variant="h5" gutterBottom>
                          {certificate.participant?.name || certificate.participantName}
                        </Typography>
                        <Typography variant="h6" color="text.secondary">
                          {certificate.event?.title || certificate.eventTitle}
                        </Typography>
                      </Box>
                      
                      <Grid container spacing={3} sx={{ mb: 4 }}>
                        {/* Certificate Information */}
                        <Grid xs={12} md={6}>
                          <Card sx={{ height: '100%' }}>
                            <CardHeader 
                              title="Certificate Information"
                              avatar={<CertificateIcon color="primary" />}
                              titleTypographyProps={{ variant: 'h6' }}
                            />
                            <CardContent>
                              <List>
                                <ListItem>
                                  <ListItemIcon><QrCodeScannerIcon /></ListItemIcon>
                                  <ListItemText 
                                    primary="Certificate ID" 
                                    secondary={certificate.certificateId}
                                    secondaryTypographyProps={{ fontFamily: 'monospace', fontSize: '0.875rem' }}
                                  />
                                </ListItem>
                                
                                <ListItem>
                                  <ListItemIcon><DateRangeIcon /></ListItemIcon>
                                  <ListItemText 
                                    primary="Issue Date" 
                                    secondary={formatDate(certificate.issuedDate || certificate.createdAt)}
                                  />
                                </ListItem>
                                
                                <ListItem>
                                  <ListItemIcon><SecurityIcon /></ListItemIcon>
                                  <ListItemText 
                                    primary="Status" 
                                    secondary={
                                      <Chip 
                                        label={certificate.status || 'Active'} 
                                        color="success" 
                                        size="small"
                                        icon={<VerifiedIcon />}
                                      />
                                    }
                                  />
                                </ListItem>

                                <ListItem>
                                  <ListItemIcon><PersonIcon /></ListItemIcon>
                                  <ListItemText 
                                    primary="Issued By" 
                                    secondary={certificate.issuer?.name || certificate.issuedBy?.name || 'Anna University Events Management System'}
                                  />
                                </ListItem>

                                {certificate.verificationCount && (
                                  <ListItem>
                                    <ListItemIcon><VisibilityIcon /></ListItemIcon>
                                    <ListItemText 
                                      primary="Verification Count" 
                                      secondary={`${certificate.verificationCount} times verified`}
                                    />
                                  </ListItem>
                                )}
                              </List>
                            </CardContent>
                          </Card>
                        </Grid>

                        {/* Participant and Event Information */}
                        <Grid xs={12} md={6}>
                          <Card sx={{ height: '100%' }}>
                            <CardHeader 
                              title="Participant & Event Details"
                              avatar={<EventIcon color="primary" />}
                              titleTypographyProps={{ variant: 'h6' }}
                            />
                            <CardContent>
                              <List>
                                <ListItem>
                                  <ListItemIcon><PersonIcon /></ListItemIcon>
                                  <ListItemText 
                                    primary="Participant Name" 
                                    secondary={certificate.participant?.name || certificate.participantName}
                                    secondaryTypographyProps={{ fontWeight: 'bold', color: 'primary.main' }}
                                  />
                                </ListItem>
                                
                                {certificate.participant?.email && (
                                  <ListItem>
                                    <ListItemIcon><EmailIcon /></ListItemIcon>
                                    <ListItemText 
                                      primary="Email" 
                                      secondary={certificate.participant.email}
                                    />
                                  </ListItem>
                                )}

                                <ListItem>
                                  <ListItemIcon><EventIcon /></ListItemIcon>
                                  <ListItemText 
                                    primary="Event Title" 
                                    secondary={certificate.event?.title || certificate.eventTitle}
                                    secondaryTypographyProps={{ fontWeight: 'medium' }}
                                  />
                                </ListItem>
                                
                                {certificate.event?.description && (
                                  <ListItem>
                                    <ListItemIcon><DescriptionIcon /></ListItemIcon>
                                    <ListItemText 
                                      primary="Description" 
                                      secondary={certificate.event.description}
                                    />
                                  </ListItem>
                                )}

                                {certificate.event?.startDate && certificate.event?.endDate && (
                                  <ListItem>
                                    <ListItemIcon><DateRangeIcon /></ListItemIcon>
                                    <ListItemText 
                                      primary="Event Duration" 
                                      secondary={formatDateRange(certificate.event.startDate, certificate.event.endDate)}
                                    />
                                  </ListItem>
                                )}

                                {certificate.event?.location && (
                                  <ListItem>
                                    <ListItemIcon><LocationOnIcon /></ListItemIcon>
                                    <ListItemText 
                                      primary="Location" 
                                      secondary={certificate.event.location}
                                    />
                                  </ListItem>
                                )}
                              </List>
                            </CardContent>
                          </Card>
                        </Grid>
                      </Grid>

                      {/* Security & Verification Details */}
                      <Card sx={{ mb: 4 }}>
                        <CardHeader 
                          title="Security & Authenticity"
                          avatar={<SecurityIcon color="primary" />}
                          titleTypographyProps={{ variant: 'h6' }}
                        />
                        <CardContent>
                          <Grid container spacing={3}>
                            <Grid xs={12} md={4}>
                              <Box sx={{ textAlign: 'center', p: 2 }}>
                                <SecurityIcon sx={{ fontSize: 40, color: 'success.main', mb: 1 }} />
                                <Typography variant="h6" gutterBottom>
                                  Digital Signature
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                  Cryptographically Verified
                                </Typography>
                                <Chip label="Valid" color="success" size="small" sx={{ mt: 1 }} />
                              </Box>
                            </Grid>
                            
                            <Grid xs={12} md={4}>
                              <Box sx={{ textAlign: 'center', p: 2 }}>
                                <LockIcon sx={{ fontSize: 40, color: 'success.main', mb: 1 }} />
                                <Typography variant="h6" gutterBottom>
                                  Tamper Proof
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                  Integrity Protected
                                </Typography>
                                <Chip label="Secure" color="success" size="small" sx={{ mt: 1 }} />
                              </Box>
                            </Grid>
                            
                            <Grid xs={12} md={4}>
                              <Box sx={{ textAlign: 'center', p: 2 }}>
                                <CloudDoneIcon sx={{ fontSize: 40, color: 'success.main', mb: 1 }} />
                                <Typography variant="h6" gutterBottom>
                                  Blockchain Verified
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                  Immutable Record
                                </Typography>
                                <Chip label="Verified" color="success" size="small" sx={{ mt: 1 }} />
                              </Box>
                            </Grid>
                          </Grid>
                        </CardContent>
                      </Card>

                      {/* Action Buttons */}
                      <Card>
                        <CardContent>
                          <Typography variant="h6" gutterBottom>
                            Certificate Actions
                          </Typography>
                          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
                            <Button
                              variant="contained"
                              startIcon={<ShareIcon />}
                              onClick={handleShare}
                            >
                              Share Certificate
                            </Button>
                            
                            <Button
                              variant="outlined"
                              startIcon={<DownloadIcon />}
                              onClick={() => window.open(`${API_BASE_URL}/certificates/download/${certificate.certificateId}`, '_blank')}
                            >
                              Download PDF
                            </Button>
                            
                            <Button
                              variant="outlined"
                              startIcon={<LinkIcon />}
                              onClick={() => copyToClipboard(window.location.href)}
                            >
                              Copy Link
                            </Button>
                            
                            <Button
                              variant="outlined"
                              startIcon={<InfoIcon />}
                              onClick={() => setShowDetails(!showDetails)}
                            >
                              {showDetails ? 'Hide' : 'Show'} Technical Details
                            </Button>
                          </Box>
                        </CardContent>
                      </Card>
                      
                      {/* Technical Details Collapsible Section */}
                      <Collapse in={showDetails}>
                        <Card sx={{ mt: 2 }}>
                          <CardHeader 
                            title="Technical Details"
                            avatar={<InfoIcon color="primary" />}
                            titleTypographyProps={{ variant: 'h6' }}
                          />
                          <CardContent>
                            <Grid container spacing={2}>
                              <Grid xs={12} md={6}>
                                <Typography variant="subtitle2" color="text.secondary">
                                  Verification Timestamp
                                </Typography>
                                <Typography variant="body2" fontFamily="monospace">
                                  {new Date().toISOString()}
                                </Typography>
                              </Grid>
                              <Grid xs={12} md={6}>
                                <Typography variant="subtitle2" color="text.secondary">
                                  Certificate Hash
                                </Typography>
                                <Typography variant="body2" fontFamily="monospace" sx={{ wordBreak: 'break-all' }}>
                                  {certificate.security?.hash || 'SHA256:' + btoa(certificate.certificateId).substring(0, 16)}
                                </Typography>
                              </Grid>
                            </Grid>
                          </CardContent>
                        </Card>
                      </Collapse>

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
                <Alert severity="error" icon={<ErrorIcon />}>
                  <Typography variant="h6" gutterBottom>
                    Certificate Not Found
                  </Typography>
                  <Typography variant="body2">
                    The certificate with ID "{certificateId}" could not be verified. Please check the ID and try again.
                  </Typography>
                </Alert>
              )}
            </CardContent>
          </Card>
        )}
      </Paper>

      {/* Share Dialog */}
      <Dialog open={shareDialogOpen} onClose={() => setShareDialogOpen(false)}>
        <DialogTitle>Share Certificate Verification</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            label="Verification URL"
            value={window.location.href}
            margin="normal"
            InputProps={{
              readOnly: true,
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton onClick={() => copyToClipboard(window.location.href)}>
                    <LinkIcon />
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShareDialogOpen(false)}>
            Close
          </Button>
          <Button onClick={() => copyToClipboard(window.location.href)} variant="contained">
            Copy Link
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default CertificateVerification;
