import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  CardActions,
  Typography,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Grid,
  Chip,
  IconButton,
  Tooltip,
  CircularProgress,
  Alert,
  Divider,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Paper,
  Skeleton
} from '@mui/material';
import {
  Download,
  Visibility,
  VerifiedUser,
  Event,
  LocationOn,
  CalendarToday,
  School,
  Share,
  Print,
  Close,
  CheckCircle,
  Info,
  CloudDownload,
  Image as ImageIcon,
  PictureAsPdf
} from '@mui/icons-material';
import { useSnackbar } from 'notistack';
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://10.5.12.1:4000/api';

const EnhancedCertificateViewer = ({ userId, showPreview = true }) => {
  const { enqueueSnackbar } = useSnackbar();
  const [certificates, setCertificates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCertificate, setSelectedCertificate] = useState(null);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewImage, setPreviewImage] = useState(null);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [downloadLoading, setDownloadLoading] = useState({});

  useEffect(() => {
    fetchCertificates();
  }, [userId]);

  const fetchCertificates = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await axios.get(
        `${API_BASE_URL}/participant/certificates/${userId}?format=detailed&includePreview=${showPreview}`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      if (response.data.success) {
        setCertificates(response.data.data);
      } else {
        setCertificates(response.data || []);
      }
    } catch (error) {
      console.error('Error fetching certificates:', error);
      enqueueSnackbar('Failed to load certificates', { variant: 'error' });
      setCertificates([]);
    } finally {
      setLoading(false);
    }
  };

  const handlePreviewCertificate = async (certificate) => {
    try {
      setPreviewLoading(true);
      setSelectedCertificate(certificate);
      setPreviewOpen(true);

      // If preview image is already available, use it
      if (certificate.previewImage) {
        setPreviewImage(certificate.previewImage);
        setPreviewLoading(false);
        return;
      }

      // Otherwise, fetch the preview image
      const token = localStorage.getItem('token');
      const response = await axios.get(
        `${API_BASE_URL}/certificates/image-preview/${certificate.certificateId}`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      if (response.data.success) {
        setPreviewImage(response.data.data.imageDataUrl);
      } else {
        throw new Error('Failed to load preview');
      }
    } catch (error) {
      console.error('Error loading certificate preview:', error);
      enqueueSnackbar('Failed to load certificate preview', { variant: 'error' });
      setPreviewImage(null);
    } finally {
      setPreviewLoading(false);
    }
  };

  const handleDownloadCertificate = async (certificate, format = 'pdf') => {
    try {
      setDownloadLoading(prev => ({ ...prev, [`${certificate.certificateId}_${format}`]: true }));
      
      const token = localStorage.getItem('token');
      const response = await axios.get(
        `${API_BASE_URL}/certificates/download/${format}/${certificate.certificateId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
          responseType: 'blob'
        }
      );

      // Map format to correct file extension
      const getFileExtension = (format) => {
        switch (format) {
          case 'image':
            return 'jpg';
          case 'pdf':
            return 'pdf';
          default:
            return format;
        }
      };

      // Create download link
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `certificate-${certificate.certificateId}.${getFileExtension(format)}`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      enqueueSnackbar(`Certificate downloaded successfully`, { variant: 'success' });
      
      // Refresh certificates to update download count
      fetchCertificates();
    } catch (error) {
      console.error('Error downloading certificate:', error);
      enqueueSnackbar('Failed to download certificate', { variant: 'error' });
    } finally {
      setDownloadLoading(prev => ({ ...prev, [`${certificate.certificateId}_${format}`]: false }));
    }
  };

  const handleShareCertificate = async (certificate) => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: `Certificate - ${certificate.eventTitle}`,
          text: `Check out my certificate for ${certificate.eventTitle}`,
          url: certificate.verification.verificationUrl
        });
      } else {
        // Fallback: copy to clipboard
        await navigator.clipboard.writeText(certificate.verification.verificationUrl);
        enqueueSnackbar('Verification link copied to clipboard', { variant: 'success' });
      }
    } catch (error) {
      console.error('Error sharing certificate:', error);
      enqueueSnackbar('Failed to share certificate', { variant: 'error' });
    }
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'issued':
        return 'success';
      case 'generated':
        return 'primary';
      case 'draft':
        return 'warning';
      case 'revoked':
        return 'error';
      default:
        return 'default';
    }
  };

  const CertificateCard = ({ certificate }) => (
    <Card 
      sx={{ 
        height: '100%', 
        display: 'flex', 
        flexDirection: 'column',
        transition: 'transform 0.2s, box-shadow 0.2s',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: 4
        }
      }}
    >
      <CardContent sx={{ flexGrow: 1 }}>
        <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2}>
          <Typography variant="h6" component="h3" gutterBottom>
            {certificate.eventTitle}
          </Typography>
          <Chip 
            label={certificate.status} 
            color={getStatusColor(certificate.status)}
            size="small"
          />
        </Box>

        <List dense>
          <ListItem disablePadding>
            <ListItemIcon sx={{ minWidth: 32 }}>
              <CalendarToday fontSize="small" />
            </ListItemIcon>
            <ListItemText 
              primary="Issued Date"
              secondary={formatDate(certificate.issuedDate)}
            />
          </ListItem>
          
          <ListItem disablePadding>
            <ListItemIcon sx={{ minWidth: 32 }}>
              <Event fontSize="small" />
            </ListItemIcon>
            <ListItemText 
              primary="Event Dates"
              secondary={`${formatDate(certificate.eventDates.startDate)} - ${formatDate(certificate.eventDates.endDate)}`}
            />
          </ListItem>

          <ListItem disablePadding>
            <ListItemIcon sx={{ minWidth: 32 }}>
              <LocationOn fontSize="small" />
            </ListItemIcon>
            <ListItemText 
              primary="Venue"
              secondary={certificate.venue}
            />
          </ListItem>

          {certificate.skills && certificate.skills.length > 0 && (
            <ListItem disablePadding>
              <ListItemIcon sx={{ minWidth: 32 }}>
                <School fontSize="small" />
              </ListItemIcon>
              <ListItemText 
                primary="Skills"
                secondary={
                  <Box sx={{ mt: 0.5 }}>
                    {certificate.skills.map((skill, index) => (
                      <Chip 
                        key={index} 
                        label={skill} 
                        size="small" 
                        variant="outlined"
                        sx={{ mr: 0.5, mb: 0.5 }}
                      />
                    ))}
                  </Box>
                }
              />
            </ListItem>
          )}
        </List>

        {certificate.bufferInfo && (
          <Box mt={2}>
            <Typography variant="caption" color="text.secondary" gutterBottom display="block">
              Available Formats:
            </Typography>
            <Box display="flex" gap={1}>
              {certificate.bufferInfo.hasImageBuffer && (
                <Chip 
                  icon={<ImageIcon />} 
                  label="Image" 
                  size="small" 
                  variant="outlined"
                  color="primary"
                />
              )}
              {certificate.bufferInfo.hasPdfBuffer && (
                <Chip 
                  icon={<PictureAsPdf />} 
                  label="PDF" 
                  size="small" 
                  variant="outlined"
                  color="secondary"
                />
              )}
            </Box>
          </Box>
        )}

        {certificate.downloadCount > 0 && (
          <Box mt={1}>
            <Typography variant="caption" color="text.secondary">
              Downloaded {certificate.downloadCount} times
              {certificate.lastDownloaded && ` • Last: ${formatDate(certificate.lastDownloaded)}`}
            </Typography>
          </Box>
        )}
      </CardContent>

      <Divider />

      <CardActions sx={{ p: 2, justifyContent: 'space-between' }}>
        <Box>
          <Tooltip title="Preview Certificate">
            <IconButton 
              onClick={() => handlePreviewCertificate(certificate)}
              color="primary"
            >
              <Visibility />
            </IconButton>
          </Tooltip>
          
          <Tooltip title="Share Certificate">
            <IconButton 
              onClick={() => handleShareCertificate(certificate)}
              color="primary"
            >
              <Share />
            </IconButton>
          </Tooltip>
        </Box>

        <Box>
          <Button
            startIcon={
              downloadLoading[`${certificate.certificateId}_image`] ? 
              <CircularProgress size={16} /> : <ImageIcon />
            }
            onClick={() => handleDownloadCertificate(certificate, 'image')}
            disabled={downloadLoading[`${certificate.certificateId}_image`]}
            size="small"
            sx={{ mr: 1 }}
          >
            Image
          </Button>
          
          <Button
            variant="contained"
            startIcon={
              downloadLoading[`${certificate.certificateId}_pdf`] ? 
              <CircularProgress size={16} /> : <PictureAsPdf />
            }
            onClick={() => handleDownloadCertificate(certificate, 'pdf')}
            disabled={downloadLoading[`${certificate.certificateId}_pdf`]}
            size="small"
          >
            PDF
          </Button>
        </Box>
      </CardActions>
    </Card>
  );

  const PreviewDialog = () => (
    <Dialog 
      open={previewOpen} 
      onClose={() => setPreviewOpen(false)}
      maxWidth="lg"
      fullWidth
    >
      <DialogTitle>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Typography variant="h6">
            Certificate Preview - {selectedCertificate?.eventTitle}
          </Typography>
          <IconButton onClick={() => setPreviewOpen(false)}>
            <Close />
          </IconButton>
        </Box>
      </DialogTitle>
      
      <DialogContent>
        {previewLoading ? (
          <Box display="flex" justifyContent="center" alignItems="center" minHeight={400}>
            <CircularProgress />
          </Box>
        ) : previewImage ? (
          <Box textAlign="center">
            <img 
              src={previewImage} 
              alt="Certificate Preview"
              style={{ 
                maxWidth: '100%', 
                height: 'auto',
                border: '1px solid #ddd',
                borderRadius: '8px'
              }}
            />
          </Box>
        ) : (
          <Alert severity="error">
            Failed to load certificate preview
          </Alert>
        )}

        {selectedCertificate && (
          <Paper sx={{ mt: 2, p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Certificate Details
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <Typography variant="body2" color="text.secondary">Certificate ID</Typography>
                <Typography variant="body1">{selectedCertificate.certificateId}</Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="body2" color="text.secondary">Status</Typography>
                <Chip 
                  label={selectedCertificate.status} 
                  color={getStatusColor(selectedCertificate.status)}
                  size="small"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="body2" color="text.secondary">Mode</Typography>
                <Typography variant="body1">{selectedCertificate.mode}</Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="body2" color="text.secondary">Verification</Typography>
                <Box display="flex" alignItems="center">
                  <VerifiedUser color="success" fontSize="small" sx={{ mr: 0.5 }} />
                  <Typography variant="body1">Verified</Typography>
                </Box>
              </Grid>
            </Grid>
          </Paper>
        )}
      </DialogContent>

      <DialogActions>
        <Button onClick={() => setPreviewOpen(false)}>
          Close
        </Button>
        {selectedCertificate && (
          <>
            <Button 
              startIcon={<Share />}
              onClick={() => handleShareCertificate(selectedCertificate)}
            >
              Share
            </Button>
            <Button 
              variant="contained"
              startIcon={<Download />}
              onClick={() => handleDownloadCertificate(selectedCertificate, 'pdf')}
            >
              Download PDF
            </Button>
          </>
        )}
      </DialogActions>
    </Dialog>
  );

  if (loading) {
    return (
      <Box>
        <Typography variant="h5" gutterBottom>
          My Certificates
        </Typography>
        <Grid container spacing={3}>
          {[1, 2, 3].map((item) => (
            <Grid item xs={12} md={6} lg={4} key={item}>
              <Card>
                <CardContent>
                  <Skeleton variant="text" width="80%" height={32} />
                  <Skeleton variant="text" width="60%" height={24} />
                  <Skeleton variant="rectangular" width="100%" height={120} sx={{ mt: 2 }} />
                </CardContent>
                <CardActions>
                  <Skeleton variant="rectangular" width={80} height={32} />
                  <Skeleton variant="rectangular" width={80} height={32} />
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Box>
    );
  }

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h5" component="h2">
          My Certificates
        </Typography>
        <Chip 
          icon={<CheckCircle />}
          label={`${certificates.length} Certificate${certificates.length !== 1 ? 's' : ''}`}
          color="primary"
          variant="outlined"
        />
      </Box>

      {certificates.length === 0 ? (
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <School sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
          <Typography variant="h6" color="text.secondary" gutterBottom>
            No Certificates Yet
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Complete events and submit feedback to earn certificates
          </Typography>
        </Paper>
      ) : (
        <Grid container spacing={3}>
          {certificates.map((certificate) => (
            <Grid item xs={12} md={6} lg={4} key={certificate.certificateId}>
              <CertificateCard certificate={certificate} />
            </Grid>
          ))}
        </Grid>
      )}

      <PreviewDialog />
    </Box>
  );
};

export default EnhancedCertificateViewer;