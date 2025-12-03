import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  Grid,
  Chip,
  IconButton,
  CircularProgress,
  Alert,
  Paper,
  Divider,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Tooltip,
  Zoom,
  Fade
} from '@mui/material';
import {
  Close,
  Download,
  Share,
  Verified,
  Event,
  LocationOn,
  CalendarToday,
  School,
  Print,
  ZoomIn,
  ZoomOut,
  Fullscreen,
  GetApp,
  Link as LinkIcon
} from '@mui/icons-material';
import { useSnackbar } from 'notistack';
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://10.5.12.1:4000/api';

const CertificatePreviewModal = ({ 
  open, 
  onClose, 
  certificateId, 
  certificate = null,
  showActions = true 
}) => {
  const { enqueueSnackbar } = useSnackbar();
  const [previewData, setPreviewData] = useState(certificate);
  const [previewImage, setPreviewImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [imageLoading, setImageLoading] = useState(false);
  const [downloadLoading, setDownloadLoading] = useState({});
  const [zoom, setZoom] = useState(1);
  const [fullscreen, setFullscreen] = useState(false);

  useEffect(() => {
    if (open && certificateId && !previewData) {
      fetchCertificatePreview();
    }
    if (open && certificateId) {
      fetchCertificateImage();
    }
  }, [open, certificateId]);

  const fetchCertificatePreview = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await axios.get(
        `${API_BASE_URL}/certificates/preview/${certificateId}`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      if (response.data.success) {
        setPreviewData(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching certificate preview:', error);
      enqueueSnackbar('Failed to load certificate details', { variant: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const fetchCertificateImage = async () => {
    try {
      setImageLoading(true);
      const token = localStorage.getItem('token');
      const response = await axios.get(
        `${API_BASE_URL}/certificates/image-preview/${certificateId}`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      if (response.data.success) {
        setPreviewImage(response.data.data.imageDataUrl);
      }
    } catch (error) {
      console.error('Error fetching certificate image:', error);
      enqueueSnackbar('Failed to load certificate image', { variant: 'error' });
    } finally {
      setImageLoading(false);
    }
  };

  const handleDownload = async (format = 'pdf') => {
    try {
      setDownloadLoading(prev => ({ ...prev, [format]: true }));
      
      const token = localStorage.getItem('token');
      const response = await axios.get(
        `${API_BASE_URL}/certificates/download/${format}/${certificateId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
          responseType: 'blob'
        }
      );

      // Create download link
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `certificate-${certificateId}.${format}`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      enqueueSnackbar(`Certificate downloaded successfully`, { variant: 'success' });
    } catch (error) {
      console.error('Error downloading certificate:', error);
      enqueueSnackbar('Failed to download certificate', { variant: 'error' });
    } finally {
      setDownloadLoading(prev => ({ ...prev, [format]: false }));
    }
  };

  const handleShare = async () => {
    try {
      if (navigator.share && previewData) {
        await navigator.share({
          title: `Certificate - ${previewData.eventTitle}`,
          text: `Check out my certificate for ${previewData.eventTitle}`,
          url: previewData.verification.verificationUrl
        });
      } else if (previewData) {
        // Fallback: copy to clipboard
        await navigator.clipboard.writeText(previewData.verification.verificationUrl);
        enqueueSnackbar('Verification link copied to clipboard', { variant: 'success' });
      }
    } catch (error) {
      console.error('Error sharing certificate:', error);
      enqueueSnackbar('Failed to share certificate', { variant: 'error' });
    }
  };

  const handlePrint = () => {
    if (previewImage) {
      const printWindow = window.open('', '_blank');
      printWindow.document.write(`
        <html>
          <head>
            <title>Certificate - ${previewData?.eventTitle || 'Certificate'}</title>
            <style>
              body { margin: 0; padding: 20px; text-align: center; }
              img { max-width: 100%; height: auto; }
              @media print { body { padding: 0; } }
            </style>
          </head>
          <body>
            <img src="${previewImage}" alt="Certificate" />
          </body>
        </html>
      `);
      printWindow.document.close();
      printWindow.print();
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

  const handleZoomIn = () => setZoom(prev => Math.min(prev + 0.25, 3));
  const handleZoomOut = () => setZoom(prev => Math.max(prev - 0.25, 0.5));
  const handleResetZoom = () => setZoom(1);

  return (
    <>
      <Dialog 
        open={open && !fullscreen} 
        onClose={onClose}
        maxWidth="lg"
        fullWidth
        PaperProps={{
          sx: { minHeight: '80vh' }
        }}
      >
        <DialogTitle>
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Typography variant="h6">
              Certificate Preview
              {previewData && ` - ${previewData.eventTitle}`}
            </Typography>
            <Box>
              <Tooltip title="Fullscreen">
                <IconButton onClick={() => setFullscreen(true)}>
                  <Fullscreen />
                </IconButton>
              </Tooltip>
              <IconButton onClick={onClose}>
                <Close />
              </IconButton>
            </Box>
          </Box>
        </DialogTitle>
        
        <DialogContent>
          <Grid container spacing={3}>
            {/* Certificate Image */}
            <Grid item xs={12} md={8}>
              <Paper sx={{ p: 2, textAlign: 'center', minHeight: 400 }}>
                {imageLoading ? (
                  <Box display="flex" justifyContent="center" alignItems="center" minHeight={400}>
                    <CircularProgress />
                  </Box>
                ) : previewImage ? (
                  <Box>
                    <Box display="flex" justifyContent="center" alignItems="center" mb={2} gap={1}>
                      <Tooltip title="Zoom Out">
                        <IconButton onClick={handleZoomOut} disabled={zoom <= 0.5}>
                          <ZoomOut />
                        </IconButton>
                      </Tooltip>
                      <Typography variant="body2">
                        {Math.round(zoom * 100)}%
                      </Typography>
                      <Tooltip title="Zoom In">
                        <IconButton onClick={handleZoomIn} disabled={zoom >= 3}>
                          <ZoomIn />
                        </IconButton>
                      </Tooltip>
                      <Button size="small" onClick={handleResetZoom}>
                        Reset
                      </Button>
                    </Box>
                    <Box 
                      sx={{ 
                        overflow: 'auto',
                        maxHeight: 500,
                        border: '1px solid #ddd',
                        borderRadius: 1
                      }}
                    >
                      <img 
                        src={previewImage} 
                        alt="Certificate Preview"
                        style={{ 
                          transform: `scale(${zoom})`,
                          transformOrigin: 'center',
                          transition: 'transform 0.2s ease',
                          maxWidth: zoom <= 1 ? '100%' : 'none',
                          height: 'auto'
                        }}
                      />
                    </Box>
                  </Box>
                ) : (
                  <Alert severity="error">
                    Failed to load certificate preview
                  </Alert>
                )}
              </Paper>
            </Grid>

            {/* Certificate Details */}
            <Grid item xs={12} md={4}>
              {loading ? (
                <Box display="flex" justifyContent="center" alignItems="center" minHeight={200}>
                  <CircularProgress />
                </Box>
              ) : previewData ? (
                <Paper sx={{ p: 2 }}>
                  <Typography variant="h6" gutterBottom>
                    Certificate Details
                  </Typography>
                  
                  <List dense>
                    <ListItem disablePadding sx={{ mb: 1 }}>
                      <ListItemText
                        primary="Certificate ID"
                        secondary={previewData.certificateId}
                      />
                    </ListItem>
                    
                    <ListItem disablePadding sx={{ mb: 1 }}>
                      <ListItemText
                        primary="Status"
                        secondary={
                          <Chip 
                            label={previewData.status} 
                            color={getStatusColor(previewData.status)}
                            size="small"
                          />
                        }
                      />
                    </ListItem>

                    <Divider sx={{ my: 1 }} />

                    <ListItem disablePadding sx={{ mb: 1 }}>
                      <ListItemIcon sx={{ minWidth: 32 }}>
                        <CalendarToday fontSize="small" />
                      </ListItemIcon>
                      <ListItemText
                        primary="Issued Date"
                        secondary={formatDate(previewData.issuedDate)}
                      />
                    </ListItem>
                    
                    <ListItem disablePadding sx={{ mb: 1 }}>
                      <ListItemIcon sx={{ minWidth: 32 }}>
                        <Event fontSize="small" />
                      </ListItemIcon>
                      <ListItemText
                        primary="Event Dates"
                        secondary={`${formatDate(previewData.eventDates.startDate)} - ${formatDate(previewData.eventDates.endDate)}`}
                      />
                    </ListItem>

                    <ListItem disablePadding sx={{ mb: 1 }}>
                      <ListItemIcon sx={{ minWidth: 32 }}>
                        <LocationOn fontSize="small" />
                      </ListItemIcon>
                      <ListItemText
                        primary="Venue"
                        secondary={previewData.venue}
                      />
                    </ListItem>

                    <ListItem disablePadding sx={{ mb: 1 }}>
                      <ListItemText
                        primary="Mode"
                        secondary={previewData.mode}
                      />
                    </ListItem>

                    {previewData.skills && previewData.skills.length > 0 && (
                      <>
                        <Divider sx={{ my: 1 }} />
                        <ListItem disablePadding sx={{ mb: 1 }}>
                          <ListItemIcon sx={{ minWidth: 32 }}>
                            <School fontSize="small" />
                          </ListItemIcon>
                          <ListItemText
                            primary="Skills"
                            secondary={
                              <Box sx={{ mt: 0.5 }}>
                                {previewData.skills.map((skill, index) => (
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
                      </>
                    )}

                    <Divider sx={{ my: 1 }} />

                    <ListItem disablePadding sx={{ mb: 1 }}>
                      <ListItemIcon sx={{ minWidth: 32 }}>
                        <Verified fontSize="small" color="success" />
                      </ListItemIcon>
                      <ListItemText
                        primary="Verification"
                        secondary="Verified Certificate"
                      />
                    </ListItem>

                    {previewData.downloadCount > 0 && (
                      <ListItem disablePadding sx={{ mb: 1 }}>
                        <ListItemIcon sx={{ minWidth: 32 }}>
                          <GetApp fontSize="small" />
                        </ListItemIcon>
                        <ListItemText
                          primary="Downloads"
                          secondary={`${previewData.downloadCount} times`}
                        />
                      </ListItem>
                    )}
                  </List>

                  {/* Buffer Information */}
                  {previewData.hasImageBuffer !== undefined && (
                    <>
                      <Divider sx={{ my: 2 }} />
                      <Typography variant="subtitle2" gutterBottom>
                        Available Formats
                      </Typography>
                      <Box display="flex" gap={1}>
                        {previewData.hasImageBuffer && (
                          <Chip 
                            label="Image" 
                            size="small" 
                            variant="outlined"
                            color="primary"
                          />
                        )}
                        {previewData.hasPdfBuffer && (
                          <Chip 
                            label="PDF" 
                            size="small" 
                            variant="outlined"
                            color="secondary"
                          />
                        )}
                      </Box>
                    </>
                  )}
                </Paper>
              ) : (
                <Alert severity="error">
                  Failed to load certificate details
                </Alert>
              )}
            </Grid>
          </Grid>
        </DialogContent>

        {showActions && (
          <DialogActions sx={{ p: 2 }}>
            <Button onClick={onClose}>
              Close
            </Button>
            
            {previewData && (
              <>
                <Button 
                  startIcon={<Print />}
                  onClick={handlePrint}
                  disabled={!previewImage}
                >
                  Print
                </Button>
                
                <Button 
                  startIcon={<Share />}
                  onClick={handleShare}
                >
                  Share
                </Button>
                
                <Button 
                  startIcon={<LinkIcon />}
                  onClick={() => {
                    navigator.clipboard.writeText(previewData.verification.verificationUrl);
                    enqueueSnackbar('Verification link copied', { variant: 'success' });
                  }}
                >
                  Copy Link
                </Button>
                
                <Button 
                  variant="contained"
                  startIcon={
                    downloadLoading.pdf ? 
                    <CircularProgress size={16} /> : <Download />
                  }
                  onClick={() => handleDownload('pdf')}
                  disabled={downloadLoading.pdf}
                >
                  Download PDF
                </Button>
              </>
            )}
          </DialogActions>
        )}
      </Dialog>

      {/* Fullscreen Dialog */}
      <Dialog
        open={fullscreen}
        onClose={() => setFullscreen(false)}
        fullScreen
        TransitionComponent={Fade}
      >
        <Box
          sx={{
            position: 'relative',
            width: '100%',
            height: '100%',
            bgcolor: 'black',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          <IconButton
            sx={{
              position: 'absolute',
              top: 16,
              right: 16,
              color: 'white',
              bgcolor: 'rgba(0,0,0,0.5)',
              '&:hover': { bgcolor: 'rgba(0,0,0,0.7)' }
            }}
            onClick={() => setFullscreen(false)}
          >
            <Close />
          </IconButton>
          
          {previewImage && (
            <img 
              src={previewImage} 
              alt="Certificate Fullscreen"
              style={{ 
                maxWidth: '95%',
                maxHeight: '95%',
                objectFit: 'contain'
              }}
            />
          )}
        </Box>
      </Dialog>
    </>
  );
};

export default CertificatePreviewModal;