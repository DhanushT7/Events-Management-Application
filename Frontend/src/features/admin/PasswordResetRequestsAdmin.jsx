import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Container,
  Typography,
  Card,
  CardContent,
  Button,
  Box,
  Chip,
  Grid,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Alert,
  Paper
} from '@mui/material';
import { useSnackbar } from 'notistack';
import { Person, Email, CheckCircle, Cancel, Security } from '@mui/icons-material';

const PasswordResetRequestsAdmin = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [rejectDialog, setRejectDialog] = useState({ open: false, requestId: null });
  const [rejectReason, setRejectReason] = useState('');
  const { enqueueSnackbar } = useSnackbar();

  const token = localStorage.getItem('token');

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000/api'}/admin/password-reset-requests`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setRequests(response.data.requests || []);
    } catch (error) {
      console.error('Error fetching requests:', error);
      // Fallback to empty array if API fails
      setRequests([]);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (requestId) => {
    setLoading(true);
    try {
      const response = await axios.post(
        `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000/api'}/admin/password-reset-requests/${requestId}/approve`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      enqueueSnackbar(response.data.message || 'Password reset approved successfully!', { variant: 'success' });
      setRequests(prev => prev.map(req => (
        req.id === requestId 
          ? { ...req, status: 'approved', processedAt: new Date().toISOString() }
          : req
      )));
      // Refresh data to get latest state
      fetchRequests();
    } catch (error) {
      console.error('Error approving request:', error);
      enqueueSnackbar(error.response?.data?.message || 'Error approving request', { variant: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleReject = async () => {
    if (!rejectReason.trim()) {
      enqueueSnackbar('Please provide a reason for rejection', { variant: 'warning' });
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post(
        `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000/api'}/admin/password-reset-requests/${rejectDialog.requestId}/reject`,
        { reason: rejectReason },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      // Update local state
      setRequests(prev => prev.map(req => (
        req.id === rejectDialog.requestId 
          ? { ...req, status: 'rejected', processedAt: new Date().toISOString(), reason: rejectReason }
          : req
      )));
      setRejectDialog({ open: false, requestId: null });
      setRejectReason('');
      enqueueSnackbar(response.data.message || 'Password reset request rejected.', { variant: 'info' });
      // Refresh data to get latest state
      fetchRequests();
    } catch (error) {
      console.error('Error rejecting request:', error);
      enqueueSnackbar(error.response?.data?.message || 'Error rejecting request', { variant: 'error' });
    } finally {
      setLoading(false);
    }
  };
    

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'warning';
      case 'approved': return 'success';
      case 'rejected': return 'error';
      default: return 'default';
    }
  };

  const pendingRequests = requests.filter(req => req.status === 'pending');
  const processedRequests = requests.filter(req => req.status !== 'pending');

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" gutterBottom sx={{ display: 'flex', alignItems: 'center', color: '#1976d2' }}>
          <Security sx={{ mr: 2 }} />
          Password Reset Requests
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Manage user password reset requests. 
        </Typography>
      </Box>

      {/* Pending Requests */}
      <Paper elevation={2} sx={{ p: 3, mb: 4 }}>
        <Typography variant="h5" gutterBottom sx={{ color: '#ed6c02' }}>
          Pending Requests ({pendingRequests.length})
        </Typography>
        
        {pendingRequests.length === 0 ? (
          <Alert severity="info">No pending password reset requests.</Alert>
        ) : (
          <Grid container spacing={3}>
            {pendingRequests.map((request) => (
              <Grid item xs={12} md={6} key={request.id}>
                <Card elevation={3} sx={{ height: '100%' }}>
                  <CardContent>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                      <Chip 
                        label={request.status.toUpperCase()} 
                        color={getStatusColor(request.status)}
                        size="small"
                      />
                      <Typography variant="body2" color="text.secondary">
                        {new Date(request.requestedAt).toLocaleString()}
                      </Typography>
                    </Box>
                    
                    <Box sx={{ mb: 2 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                        <Person sx={{ mr: 1, color: '#1976d2' }} />
                        <Typography variant="subtitle1" fontWeight="bold">
                          {request.userName}
                        </Typography>
                      </Box>
                      
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                        <Email sx={{ mr: 1, color: '#1976d2' }} />
                        <Typography variant="body2">
                          {request.email}
                        </Typography>
                      </Box>
                      
                      <Chip 
                        label={request.role.toUpperCase()} 
                        variant="outlined" 
                        size="small"
                        sx={{ mt: 1 }}
                      />
                    </Box>

                    <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                      <Button
                        variant="contained"
                        color="success"
                        size="small"
                        startIcon={<CheckCircle />}
                        onClick={() => handleApprove(request.id)}
                        disabled={loading}
                      >
                        Approve
                      </Button>
                      <Button
                        variant="contained"
                        color="error"
                        size="small"
                        startIcon={<Cancel />}
                        onClick={() => setRejectDialog({ open: true, requestId: request.id })}
                        disabled={loading}
                      >
                        Reject
                      </Button>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}
      </Paper>

      {/* Processed Requests */}
      <Paper elevation={2} sx={{ p: 3 }}>
        <Typography variant="h5" gutterBottom sx={{ color: '#2e7d32' }}>
          Processed Requests ({processedRequests.length})
        </Typography>
        
        {processedRequests.length === 0 ? (
          <Alert severity="info">No processed requests yet.</Alert>
        ) : (
          <Grid container spacing={3}>
            {processedRequests.map((request) => (
              <Grid item xs={12} md={6} key={request.id}>
                <Card elevation={1} sx={{ height: '100%', opacity: 0.8 }}>
                  <CardContent>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                      <Chip 
                        label={request.status.toUpperCase()} 
                        color={getStatusColor(request.status)}
                        size="small"
                      />
                      <Typography variant="body2" color="text.secondary">
                        Processed: {new Date(request.processedAt).toLocaleString()}
                      </Typography>
                    </Box>
                    
                    <Box sx={{ mb: 2 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                        <Person sx={{ mr: 1, color: '#666' }} />
                        <Typography variant="subtitle1">
                          {request.userName}
                        </Typography>
                      </Box>
                      
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                        <Email sx={{ mr: 1, color: '#666' }} />
                        <Typography variant="body2" color="text.secondary">
                          {request.email}
                        </Typography>
                      </Box>
                      
                      <Chip 
                        label={request.role.toUpperCase()} 
                        variant="outlined" 
                        size="small"
                        sx={{ mt: 1 }}
                      />
                    </Box>

                    {request.reason && (
                      <Alert severity="warning" sx={{ mt: 2 }}>
                        <Typography variant="body2">
                          <strong>Rejection Reason:</strong> {request.reason}
                        </Typography>
                      </Alert>
                    )}
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}
      </Paper>

      {/* Reject Dialog */}
      <Dialog open={rejectDialog.open} onClose={() => setRejectDialog({ open: false, requestId: null })}>
        <DialogTitle>Reject Password Reset Request</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Reason for rejection"
            fullWidth
            multiline
            rows={3}
            variant="outlined"
            value={rejectReason}
            onChange={(e) => setRejectReason(e.target.value)}
            placeholder="Please provide a reason for rejecting this request..."
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setRejectDialog({ open: false, requestId: null })}>
            Cancel
          </Button>
          <Button onClick={handleReject} variant="contained" color="error">
            Reject Request
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default PasswordResetRequestsAdmin;
