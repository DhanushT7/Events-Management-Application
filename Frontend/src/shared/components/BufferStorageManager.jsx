import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Button,
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
  CircularProgress,
  Alert,
  LinearProgress,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Checkbox,
  FormControlLabel,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemIcon
} from '@mui/material';
import {
  Storage,
  CloudDownload,
  Delete,
  Refresh,
  Assessment,
  Warning,
  CheckCircle,
  Error,
  Info,
  CleaningServices,
  Build,
  Visibility,
  GetApp
} from '@mui/icons-material';
import { useSnackbar } from 'notistack';
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://10.5.12.1:4000/api';

const BufferStorageManager = () => {
  const { enqueueSnackbar } = useSnackbar();
  const [storageStats, setStorageStats] = useState(null);
  const [certificates, setCertificates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [operationLoading, setOperationLoading] = useState(false);
  const [selectedCertificates, setSelectedCertificates] = useState([]);
  const [bulkOperationDialog, setBulkOperationDialog] = useState(false);
  const [selectedOperation, setSelectedOperation] = useState('');
  const [selectedFormats, setSelectedFormats] = useState(['pdf', 'image']);

  useEffect(() => {
    fetchStorageStats();
    fetchCertificates();
  }, []);

  const fetchStorageStats = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(
        `${API_BASE_URL}/certificates/buffer-stats`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      if (response.data.success) {
        setStorageStats(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching storage stats:', error);
      enqueueSnackbar('Failed to load storage statistics', { variant: 'error' });
    }
  };

  const fetchCertificates = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await axios.get(
        `${API_BASE_URL}/certificates/stats`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      if (response.data.success) {
        // This is a simplified approach - in a real implementation,
        // you'd want a dedicated endpoint for certificate buffer management
        setCertificates([]);
      }
    } catch (error) {
      console.error('Error fetching certificates:', error);
      enqueueSnackbar('Failed to load certificates', { variant: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleBulkOperation = async () => {
    if (selectedCertificates.length === 0) {
      enqueueSnackbar('Please select certificates to perform bulk operation', { variant: 'warning' });
      return;
    }

    try {
      setOperationLoading(true);
      const token = localStorage.getItem('token');
      
      const response = await axios.post(
        `${API_BASE_URL}/certificates/bulk-operations`,
        {
          operation: selectedOperation,
          certificateIds: selectedCertificates,
          formats: selectedFormats
        },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      if (response.data.success) {
        enqueueSnackbar(
          `Bulk ${selectedOperation} completed successfully. Processed: ${response.data.data.processed}, Errors: ${response.data.data.errors}`,
          { variant: 'success' }
        );
        
        // Refresh data
        fetchStorageStats();
        fetchCertificates();
        
        // Reset selections
        setSelectedCertificates([]);
        setBulkOperationDialog(false);
      }
    } catch (error) {
      console.error('Error performing bulk operation:', error);
      enqueueSnackbar('Failed to perform bulk operation', { variant: 'error' });
    } finally {
      setOperationLoading(false);
    }
  };

  const formatBytes = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getStorageUsagePercentage = () => {
    if (!storageStats) return 0;
    const totalStorage = storageStats.totalStorageUsed;
    const maxStorage = 1024 * 1024 * 1024; // 1GB as example limit
    return Math.min((totalStorage / maxStorage) * 100, 100);
  };

  const StorageStatsCard = ({ title, value, subtitle, icon, color = 'primary' }) => (
    <Card>
      <CardContent>
        <Box display="flex" alignItems="center" justifyContent="space-between">
          <Box>
            <Typography variant="h4" color={color}>
              {value}
            </Typography>
            <Typography variant="h6" gutterBottom>
              {title}
            </Typography>
            {subtitle && (
              <Typography variant="body2" color="text.secondary">
                {subtitle}
              </Typography>
            )}
          </Box>
          <Box color={`${color}.main`}>
            {icon}
          </Box>
        </Box>
      </CardContent>
    </Card>
  );

  if (loading && !storageStats) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight={400}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" component="h1">
          Buffer Storage Management
        </Typography>
        <Button
          startIcon={<Refresh />}
          onClick={() => {
            fetchStorageStats();
            fetchCertificates();
          }}
          variant="outlined"
        >
          Refresh
        </Button>
      </Box>

      {/* Storage Statistics */}
      {storageStats && (
        <Grid container spacing={3} mb={4}>
          <Grid item xs={12} sm={6} md={3}>
            <StorageStatsCard
              title="Total Certificates"
              value={storageStats.totalCertificates}
              icon={<Assessment sx={{ fontSize: 40 }} />}
              color="primary"
            />
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <StorageStatsCard
              title="PDF Buffers"
              value={storageStats.certificatesWithPdf}
              subtitle={storageStats.storageEfficiency.pdfCoverage}
              icon={<CloudDownload sx={{ fontSize: 40 }} />}
              color="secondary"
            />
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <StorageStatsCard
              title="Image Buffers"
              value={storageStats.certificatesWithImage}
              subtitle={storageStats.storageEfficiency.imageCoverage}
              icon={<Visibility sx={{ fontSize: 40 }} />}
              color="success"
            />
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <StorageStatsCard
              title="Total Storage"
              value={formatBytes(storageStats.totalStorageUsed)}
              subtitle={`${getStorageUsagePercentage().toFixed(1)}% used`}
              icon={<Storage sx={{ fontSize: 40 }} />}
              color="warning"
            />
          </Grid>
        </Grid>
      )}

      {/* Storage Usage Progress */}
      {storageStats && (
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Storage Usage Breakdown
            </Typography>
            
            <Box mb={2}>
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                <Typography variant="body2">Overall Storage Usage</Typography>
                <Typography variant="body2">{getStorageUsagePercentage().toFixed(1)}%</Typography>
              </Box>
              <LinearProgress 
                variant="determinate" 
                value={getStorageUsagePercentage()} 
                color={getStorageUsagePercentage() > 80 ? 'error' : getStorageUsagePercentage() > 60 ? 'warning' : 'primary'}
                sx={{ height: 8, borderRadius: 4 }}
              />
            </Box>

            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle2" gutterBottom>
                  PDF Storage
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {formatBytes(storageStats.totalPdfSize)} • Average: {formatBytes(storageStats.averagePdfSize)}
                </Typography>
              </Grid>
              
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle2" gutterBottom>
                  Image Storage
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {formatBytes(storageStats.totalImageSize)} • Average: {formatBytes(storageStats.averageImageSize)}
                </Typography>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      )}

      {/* Management Actions */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Buffer Management Actions
          </Typography>
          
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6} md={3}>
              <Button
                fullWidth
                variant="outlined"
                startIcon={<Build />}
                onClick={() => {
                  setSelectedOperation('regenerate');
                  setBulkOperationDialog(true);
                }}
              >
                Regenerate Buffers
              </Button>
            </Grid>
            
            <Grid item xs={12} sm={6} md={3}>
              <Button
                fullWidth
                variant="outlined"
                startIcon={<CleaningServices />}
                onClick={() => {
                  setSelectedOperation('cleanup');
                  setBulkOperationDialog(true);
                }}
                color="warning"
              >
                Cleanup Buffers
              </Button>
            </Grid>
            
            <Grid item xs={12} sm={6} md={3}>
              <Button
                fullWidth
                variant="outlined"
                startIcon={<CheckCircle />}
                onClick={() => {
                  setSelectedOperation('verify');
                  setBulkOperationDialog(true);
                }}
                color="success"
              >
                Verify Certificates
              </Button>
            </Grid>
            
            <Grid item xs={12} sm={6} md={3}>
              <Button
                fullWidth
                variant="outlined"
                startIcon={<GetApp />}
                onClick={() => {
                  // Export storage report
                  const reportData = {
                    timestamp: new Date().toISOString(),
                    stats: storageStats
                  };
                  const blob = new Blob([JSON.stringify(reportData, null, 2)], { type: 'application/json' });
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement('a');
                  a.href = url;
                  a.download = `storage-report-${new Date().toISOString().split('T')[0]}.json`;
                  a.click();
                  URL.revokeObjectURL(url);
                }}
              >
                Export Report
              </Button>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Recommendations */}
      {storageStats && (
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Storage Optimization Recommendations
            </Typography>
            
            <List>
              {getStorageUsagePercentage() > 80 && (
                <ListItem>
                  <ListItemIcon>
                    <Warning color="error" />
                  </ListItemIcon>
                  <ListItemText
                    primary="High Storage Usage"
                    secondary="Consider cleaning up unused buffers or archiving old certificates"
                  />
                </ListItem>
              )}
              
              {storageStats.storageEfficiency.pdfCoverage < '50%' && (
                <ListItem>
                  <ListItemIcon>
                    <Info color="info" />
                  </ListItemIcon>
                  <ListItemText
                    primary="Low PDF Buffer Coverage"
                    secondary="Many certificates don't have PDF buffers. Consider regenerating for better performance."
                  />
                </ListItem>
              )}
              
              {storageStats.storageEfficiency.imageCoverage < '50%' && (
                <ListItem>
                  <ListItemIcon>
                    <Info color="info" />
                  </ListItemIcon>
                  <ListItemText
                    primary="Low Image Buffer Coverage"
                    secondary="Many certificates don't have image buffers. Consider regenerating for preview functionality."
                  />
                </ListItem>
              )}
              
              {storageStats.averagePdfSize > 1024 * 1024 && (
                <ListItem>
                  <ListItemIcon>
                    <Warning color="warning" />
                  </ListItemIcon>
                  <ListItemText
                    primary="Large PDF File Sizes"
                    secondary="Average PDF size is quite large. Consider optimizing certificate generation settings."
                  />
                </ListItem>
              )}
            </List>
          </CardContent>
        </Card>
      )}

      {/* Bulk Operation Dialog */}
      <Dialog open={bulkOperationDialog} onClose={() => setBulkOperationDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          Bulk {selectedOperation.charAt(0).toUpperCase() + selectedOperation.slice(1)} Operation
        </DialogTitle>
        
        <DialogContent>
          <Alert severity="info" sx={{ mb: 2 }}>
            This operation will affect all certificates in the system. Please proceed with caution.
          </Alert>
          
          {selectedOperation === 'regenerate' && (
            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel>Formats to Generate</InputLabel>
              <Select
                multiple
                value={selectedFormats}
                onChange={(e) => setSelectedFormats(e.target.value)}
                renderValue={(selected) => selected.join(', ')}
              >
                <MenuItem value="pdf">
                  <Checkbox checked={selectedFormats.indexOf('pdf') > -1} />
                  PDF
                </MenuItem>
                <MenuItem value="image">
                  <Checkbox checked={selectedFormats.indexOf('image') > -1} />
                  Image
                </MenuItem>
              </Select>
            </FormControl>
          )}
          
          <Typography variant="body2" color="text.secondary">
            {selectedOperation === 'regenerate' && 'This will regenerate certificate buffers for all certificates.'}
            {selectedOperation === 'cleanup' && 'This will remove all stored buffer data to free up storage space.'}
            {selectedOperation === 'verify' && 'This will verify the integrity of all certificates.'}
          </Typography>
        </DialogContent>
        
        <DialogActions>
          <Button onClick={() => setBulkOperationDialog(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleBulkOperation}
            variant="contained"
            disabled={operationLoading}
            startIcon={operationLoading ? <CircularProgress size={16} /> : null}
          >
            {operationLoading ? 'Processing...' : 'Execute'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default BufferStorageManager;