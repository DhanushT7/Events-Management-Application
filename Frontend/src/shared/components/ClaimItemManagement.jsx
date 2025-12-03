import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  IconButton,
  Tooltip,
  Grid,
  Divider,
  CircularProgress
} from '@mui/material';
import {
  CheckCircle,
  Cancel,
  Receipt,
  Download,
  Visibility,
  Edit,
  Save,
  Close
} from '@mui/icons-material';
import { useSnackbar } from 'notistack';
import axios from 'axios';

const ClaimItemManagement = ({ eventId }) => {
  const [claimItems, setClaimItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [eventTitle, setEventTitle] = useState('');
  const [totalApprovedAmount, setTotalApprovedAmount] = useState(0);
  const [overallStatus, setOverallStatus] = useState('pending');
  const [selectedItem, setSelectedItem] = useState(null);
  const [actionDialog, setActionDialog] = useState(false);
  const [action, setAction] = useState('');
  const [approvedAmount, setApprovedAmount] = useState('');
  const [rejectionReason, setRejectionReason] = useState('');
  const [receiptDialog, setReceiptDialog] = useState(false);
  const { enqueueSnackbar } = useSnackbar();

  useEffect(() => {
    fetchClaimItems();
  }, [eventId]);

  const fetchClaimItems = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');

      const response = await axios.get(
        `${import.meta.env.VITE_API_BASE_URL || 'http://10.5.12.1:4000/api'}/claims/events/${eventId}/claim-items`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setClaimItems(response.data.claimItems);
      setEventTitle(response.data.eventTitle);
      setTotalApprovedAmount(response.data.totalApprovedAmount);
      setOverallStatus(response.data.overallStatus);
    } catch (error) {
      console.error('Error fetching claim items:', error);
      
      if (error.response?.status === 404) {
        enqueueSnackbar('No claim items found for this event', { variant: 'info' });
      } else {
        enqueueSnackbar('Error fetching claim items', { variant: 'error' });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleItemAction = async () => {
    try {
      const token = localStorage.getItem('token');
      const payload = {
        action,
        approvedAmount: action === 'approved' ? parseFloat(approvedAmount) : 0,
        rejectionReason: action === 'rejected' ? rejectionReason : ''
      };

      await axios.put(
        `${import.meta.env.VITE_API_BASE_URL || 'http://10.5.12.1:4000/api'}/claims/events/${eventId}/claim-items/${selectedItem.index}/status`,
        payload,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      enqueueSnackbar(`Claim item ${action} successfully`, { variant: 'success' });
      setActionDialog(false);
      resetActionForm();
      fetchClaimItems();
    } catch (error) {
      console.error('Error updating claim item:', error);
      enqueueSnackbar('Error updating claim item', { variant: 'error' });
    }
  };

  const generateReceipt = async (itemIndex) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(
        `${import.meta.env.VITE_API_BASE_URL || 'http://10.5.12.1:4000/api'}/claims/events/${eventId}/claim-items/${itemIndex}/receipt`,
        {},
        {
          responseType: 'blob',
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      // Create blob URL and download
      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `Receipt_${claimItems[itemIndex].receiptNumber}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      enqueueSnackbar('Receipt generated successfully', { variant: 'success' });
      fetchClaimItems();
    } catch (error) {
      console.error('Error generating receipt:', error);
      enqueueSnackbar('Error generating receipt', { variant: 'error' });
    }
  };

  const downloadReceipt = async (itemIndex) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(
        `${import.meta.env.VITE_API_BASE_URL || 'http://10.5.12.1:4000/api'}/claims/events/${eventId}/claim-items/${itemIndex}/receipt`,
        {
          responseType: 'blob',
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      // Create blob URL and download
      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `Receipt_${claimItems[itemIndex].receiptNumber}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      enqueueSnackbar('Receipt downloaded successfully', { variant: 'success' });
    } catch (error) {
      console.error('Error downloading receipt:', error);
      enqueueSnackbar('Error downloading receipt', { variant: 'error' });
    }
  };

  const openActionDialog = (item, actionType) => {
    setSelectedItem(item);
    setAction(actionType);
    setApprovedAmount((item.actualAmount || 0).toString());
    setActionDialog(true);
  };

  const resetActionForm = () => {
    setSelectedItem(null);
    setAction('');
    setApprovedAmount('');
    setRejectionReason('');
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'approved': return 'success';
      case 'rejected': return 'error';
      case 'pending': return 'warning';
      default: return 'default';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'approved': return <CheckCircle />;
      case 'rejected': return <Cancel />;
      case 'pending': return <CircularProgress size={16} />;
      default: return null;
    }
  };

  const formatCurrency = (amount) => {
    // Handle undefined, null, or NaN values
    const numAmount = Number(amount);
    if (isNaN(numAmount) || amount === undefined || amount === null) {
      return '₹0.00';
    }
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(numAmount);
  };

  const formatDate = (date) => {
    return date ? new Date(date).toLocaleDateString('en-IN') : 'N/A';
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      {/* Header */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h5" gutterBottom>
            Claim Item Management
          </Typography>
          <Typography variant="h6" color="text.secondary" gutterBottom>
            {eventTitle}
          </Typography>
          
          <Grid container spacing={3} sx={{ mt: 2 }}>
            <Grid item xs={12} md={4}>
              <Paper sx={{ p: 2, textAlign: 'center' }}>
                <Typography variant="h6" color="primary">
                  Total Items
                </Typography>
                <Typography variant="h4">
                  {claimItems.length}
                </Typography>
              </Paper>
            </Grid>
            <Grid item xs={12} md={4}>
              <Paper sx={{ p: 2, textAlign: 'center' }}>
                <Typography variant="h6" color="success.main">
                  Approved Amount
                </Typography>
                <Typography variant="h4">
                  {formatCurrency(totalApprovedAmount)}
                </Typography>
              </Paper>
            </Grid>
            <Grid item xs={12} md={4}>
              <Paper sx={{ p: 2, textAlign: 'center' }}>
                <Typography variant="h6" color="text.secondary">
                  Overall Status
                </Typography>
                <Chip
                  icon={getStatusIcon(overallStatus)}
                  label={overallStatus.toUpperCase().replace('_', ' ')}
                  color={getStatusColor(overallStatus)}
                  size="large"
                />
              </Paper>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Claim Items Table */}
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Claim Items ({claimItems.length})
          </Typography>
          
          {claimItems.length === 0 ? (
            <Alert severity="info">No claim items found</Alert>
          ) : (
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Category</TableCell>
                    <TableCell align="right">Actual Amount</TableCell>
                    <TableCell align="center">Status</TableCell>
                    <TableCell align="right">Approved Amount</TableCell>
                    <TableCell>Review Date</TableCell>
                    <TableCell>Receipt</TableCell>
                    <TableCell align="center">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {claimItems.map((item, index) => (
                    <TableRow key={index} hover>
                      <TableCell>
                        <Typography variant="body2" fontWeight="bold">
                          {item.category}
                        </Typography>
                        {item.rejectionReason && (
                          <Typography variant="caption" color="error">
                            Reason: {item.rejectionReason}
                          </Typography>
                        )}
                      </TableCell>
                      <TableCell align="right">
                        <Typography variant="body2" fontWeight="bold">
                          {formatCurrency(item.actualAmount)}
                        </Typography>
                      </TableCell>
                      <TableCell align="center">
                        <Chip
                          icon={getStatusIcon(item.itemStatus)}
                          label={item.itemStatus.toUpperCase()}
                          color={getStatusColor(item.itemStatus)}
                          size="small"
                        />
                      </TableCell>
                      <TableCell align="right">
                        <Typography 
                          variant="body2" 
                          fontWeight="bold"
                          color={item.itemStatus === 'approved' ? 'success.main' : 'text.secondary'}
                        >
                          {item.approvedAmount > 0 ? formatCurrency(item.approvedAmount) : '-'}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">
                          {formatDate(item.reviewDate)}
                        </Typography>
                        {item.reviewedBy && (
                          <Typography variant="caption" color="text.secondary">
                            by {item.reviewedBy.name}
                          </Typography>
                        )}
                      </TableCell>
                      <TableCell>
                        {item.itemStatus === 'approved' && (
                          <Box display="flex" gap={1}>
                            {item.receiptGenerated ? (
                              <Tooltip title="Download Receipt">
                                <IconButton
                                  size="small"
                                  onClick={() => downloadReceipt(index)}
                                  color="primary"
                                >
                                  <Download />
                                </IconButton>
                              </Tooltip>
                            ) : (
                              <Tooltip title="Generate Receipt">
                                <IconButton
                                  size="small"
                                  onClick={() => generateReceipt(index)}
                                  color="success"
                                >
                                  <Receipt />
                                </IconButton>
                              </Tooltip>
                            )}
                            {item.receiptNumber && (
                              <Typography variant="caption" color="text.secondary">
                                {item.receiptNumber}
                              </Typography>
                            )}
                          </Box>
                        )}
                      </TableCell>
                      <TableCell align="center">
                        {item.itemStatus === 'pending' && (
                          <Box display="flex" gap={1}>
                            <Tooltip title="Approve">
                              <IconButton
                                size="small"
                                onClick={() => openActionDialog(item, 'approved')}
                                color="success"
                              >
                                <CheckCircle />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Reject">
                              <IconButton
                                size="small"
                                onClick={() => openActionDialog(item, 'rejected')}
                                color="error"
                              >
                                <Cancel />
                              </IconButton>
                            </Tooltip>
                          </Box>
                        )}
                        {item.itemStatus !== 'pending' && (
                          <Tooltip title="Edit Decision">
                            <IconButton
                              size="small"
                              onClick={() => openActionDialog(item, item.itemStatus)}
                              color="primary"
                            >
                              <Edit />
                            </IconButton>
                          </Tooltip>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </CardContent>
      </Card>

      {/* Action Dialog */}
      <Dialog open={actionDialog} onClose={() => setActionDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          {action === 'approved' ? 'Approve' : 'Reject'} Claim Item
        </DialogTitle>
        <DialogContent>
          {selectedItem && (
            <Box>
              <Typography variant="body1" gutterBottom>
                <strong>Category:</strong> {selectedItem.category}
              </Typography>
              <Typography variant="body1" gutterBottom>
                <strong>Actual Amount:</strong> {formatCurrency(selectedItem.actualAmount)}
              </Typography>
              
              <Divider sx={{ my: 2 }} />

              {action === 'approved' ? (
                <TextField
                  fullWidth
                  label="Approved Amount"
                  type="number"
                  value={approvedAmount}
                  onChange={(e) => setApprovedAmount(e.target.value)}
                  helperText="Enter the amount to approve (can be different from actual amount)"
                  sx={{ mt: 2 }}
                />
              ) : (
                <TextField
                  fullWidth
                  label="Rejection Reason"
                  multiline
                  rows={3}
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  helperText="Provide reason for rejection"
                  sx={{ mt: 2 }}
                />
              )}
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setActionDialog(false)}>Cancel</Button>
          <Button
            variant="contained"
            onClick={handleItemAction}
            color={action === 'approved' ? 'success' : 'error'}
            disabled={
              (action === 'approved' && !approvedAmount) ||
              (action === 'rejected' && !rejectionReason)
            }
          >
            {action === 'approved' ? 'Approve' : 'Reject'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ClaimItemManagement;