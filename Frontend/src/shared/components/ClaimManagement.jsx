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
  Grid,
  Alert,
  CircularProgress,
  IconButton,
  Tooltip,
  Collapse,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Badge,
  Tabs,
  Tab,
  Stepper,
  Step,
  StepLabel,
  StepContent,
  Pagination,
  InputAdornment,
  Fab,
  SpeedDial,
  SpeedDialAction,
  SpeedDialIcon,
} from '@mui/material';
import {
  CheckCircle,
  Cancel,
  Pending,
  Visibility,
  ExpandMore,
  ExpandLess,
  History,
  Receipt,
  MonetizationOn,
  TrendingUp,
  TrendingDown,
  Assessment,
  Comment,
  Schedule,
  Person,
  Event as EventIcon,
  Add,
  FilterList,
  Search,
  Download,
  Upload,
  Edit,
  Delete,
  Refresh,
  Print,
  Email,
  AttachFile,
  CloudUpload,
  ManageAccounts,
} from '@mui/icons-material';
import { useSnackbar } from 'notistack';
import axios from 'axios';
import ClaimItemManagement from './ClaimItemManagement';

const ClaimManagement = ({ eventId }) => {
  const [claims, setClaims] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedClaim, setSelectedClaim] = useState(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [approvalDialogOpen, setApprovalDialogOpen] = useState(false);
  const [approvalAction, setApprovalAction] = useState('');
  const [approvalComments, setApprovalComments] = useState('');
  const [expandedClaim, setExpandedClaim] = useState(null);
  const [statistics, setStatistics] = useState({
    totalClaims: 0,
    pendingClaims: 0,
    approvedClaims: 0,
    rejectedClaims: 0,
    amounts: {
      totalBudgetAmount: 0,
      totalActualAmount: 0,
      totalSavings: 0
    },
    recentClaims: []
  });
  const [tabValue, setTabValue] = useState(0);
  const [filterStatus, setFilterStatus] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState(null);
  const [submitClaimOpen, setSubmitClaimOpen] = useState(false);
  const [newClaimData, setNewClaimData] = useState({
    expenses: [],
    description: '',
    attachments: []
  });
  const [eventData, setEventData] = useState(null);
  const { enqueueSnackbar } = useSnackbar();

  useEffect(() => {
    fetchClaims();
    fetchStatistics();
    if (eventId) {
      fetchEventData();
    }
  }, [eventId, filterStatus, page]);

  const fetchEventData = async () => {
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_API_BASE_URL || 'http://10.5.12.1:4000/api'}/coordinator/programmes/${eventId}`,
        {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        }
      );
      setEventData(response.data);
      
      // Initialize claim data from budget breakdown
      if (response.data.budgetBreakdown?.expenses) {
        setNewClaimData(prev => ({
          ...prev,
          expenses: response.data.budgetBreakdown.expenses.map(expense => ({
            category: expense.category,
            budgetAmount: expense.amount,
            actualAmount: 0,
            description: ''
          }))
        }));
      }
    } catch (error) {
      console.error('Error fetching event data:', error);
    }
  };

  const fetchClaims = async () => {
    try {
      setLoading(true);
      const response = await axios.get(
        eventId 
          ? `${import.meta.env.VITE_API_BASE_URL || 'http://10.5.12.1:4000/api'}/coordinator/events/${eventId}/claims`
          : `${import.meta.env.VITE_API_BASE_URL || 'http://10.5.12.1:4000/api'}/coordinator/claims`,
        {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        }
      );
      setClaims(eventId ? response.data : response.data.claims);
    } catch (error) {
      console.error('Error fetching claims:', error);
      enqueueSnackbar('Error fetching claims', { variant: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const fetchStatistics = async () => {
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000/api'}/coordinator/claims/statistics`,
        {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        }
      );
      
      // Ensure the response has the proper structure
      const data = response.data || {};
      setStatistics({
        totalClaims: data.totalClaims || 0,
        pendingClaims: data.pendingClaims || 0,
        approvedClaims: data.approvedClaims || 0,
        rejectedClaims: data.rejectedClaims || 0,
        amounts: {
          totalBudgetAmount: data.amounts?.totalBudgetAmount || 0,
          totalActualAmount: data.amounts?.totalActualAmount || 0,
          totalSavings: data.amounts?.totalSavings || 0
        },
        recentClaims: data.recentClaims || []
      });
    } catch (error) {
      console.error('Error fetching statistics:', error);
      // Keep the default structure if API fails
    }
  };

  const handleViewDetails = async (claimId) => {
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_API_BASE_URL || 'http://10.5.12.1:4000/api'}/coordinator/claims/${claimId}`,
        {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        }
      );
      setSelectedClaim(response.data);
      setDetailsOpen(true);
    } catch (error) {
      console.error('Error fetching claim details:', error);
      enqueueSnackbar('Error fetching claim details', { variant: 'error' });
    }
  };

  const handleApprovalAction = (action) => {
    setApprovalAction(action);
    setApprovalDialogOpen(true);
  };

  const submitApproval = async () => {
    try {
      await axios.put(
        `${import.meta.env.VITE_API_BASE_URL || 'http://10.5.12.1:4000/api'}/coordinator/claims/${selectedClaim._id}/status`,
        {
          status: approvalAction,
          comments: approvalComments,
        },
        {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        }
      );

      enqueueSnackbar(
        `Claim ${approvalAction} successfully`,
        { variant: 'success' }
      );

      setApprovalDialogOpen(false);
      setDetailsOpen(false);
      setApprovalComments('');
      fetchClaims();
      fetchStatistics();
    } catch (error) {
      console.error('Error updating claim status:', error);
      enqueueSnackbar('Error updating claim status', { variant: 'error' });
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'approved': return 'success';
      case 'rejected': return 'error';
      case 'pending': return 'warning';
      case 'under_review': return 'info';
      default: return 'default';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'approved': return <CheckCircle />;
      case 'rejected': return <Cancel />;
      case 'pending': return <Pending />;
      case 'under_review': return <Schedule />;
      default: return <Pending />;
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
    }).format(amount);
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const handleSubmitNewClaim = async () => {
    try {
      const formData = new FormData();
      
      // Add claim data
      formData.append('expenses', JSON.stringify(newClaimData.expenses));
      formData.append('description', newClaimData.description);
      
      // Add attachments if any
      newClaimData.attachments.forEach((file, index) => {
        formData.append('receipts', file);
      });

      const response = await axios.post(
        `${import.meta.env.VITE_API_BASE_URL || 'http://10.5.12.1:4000/api'}/coordinator/events/${eventId}/claims`,
        formData,
        {
          headers: { 
            Authorization: `Bearer ${localStorage.getItem('token')}`,
            'Content-Type': 'multipart/form-data'
          },
        }
      );

      enqueueSnackbar('Claim submitted successfully', { variant: 'success' });
      setSubmitClaimOpen(false);
      setNewClaimData({
        expenses: [],
        description: '',
        attachments: []
      });
      fetchClaims();
      fetchStatistics();
    } catch (error) {
      console.error('Error submitting claim:', error);
      enqueueSnackbar(
        error.response?.data?.message || 'Error submitting claim', 
        { variant: 'error' }
      );
    }
  };

  const handleExpenseChange = (index, field, value) => {
    const updatedExpenses = [...newClaimData.expenses];
    updatedExpenses[index][field] = value;
    setNewClaimData(prev => ({
      ...prev,
      expenses: updatedExpenses
    }));
  };

  const handleFileUpload = (event) => {
    const files = Array.from(event.target.files);
    setNewClaimData(prev => ({
      ...prev,
      attachments: [...prev.attachments, ...files]
    }));
  };

  const removeAttachment = (index) => {
    setNewClaimData(prev => ({
      ...prev,
      attachments: prev.attachments.filter((_, i) => i !== index)
    }));
  };

  const filteredClaims = claims.filter(claim => {
    const matchesStatus = filterStatus === 'all' || claim.status === filterStatus;
    const matchesSearch = searchTerm === '' || 
      claim.claimNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      claim.eventId?.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      claim.submittedBy?.name?.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesStatus && matchesSearch;
  });

  const canSubmitClaim = eventData && 
    eventData.status === 'approved' && 
    !eventData.claimSubmitted &&
    new Date(eventData.endDate) < new Date();

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="300px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      {/* Header with Actions */}
      <Box display="flex" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
        <Typography variant="h5" component="h2">
          {eventId ? 'Event Claim Management' : 'Claim Management'}
        </Typography>
        <Box display="flex" gap={2}>
          {eventId && canSubmitClaim && (
            <Button
              variant="contained"
              startIcon={<Add />}
              onClick={() => setSubmitClaimOpen(true)}
              color="primary"
            >
              Submit New Claim
            </Button>
          )}
          <Button
            variant="outlined"
            startIcon={<Refresh />}
            onClick={() => {
              fetchClaims();
              fetchStatistics();
            }}
          >
            Refresh
          </Button>
        </Box>
      </Box>

      {/* Tabs for different views */}
      {eventId && (
        <Card sx={{ mb: 3 }}>
          <Tabs
            value={tabValue}
            onChange={(e, newValue) => setTabValue(newValue)}
            variant="fullWidth"
          >
            <Tab 
              label="Claim Overview" 
              icon={<Receipt />} 
              iconPosition="start"
            />
            <Tab 
              label="Item Management" 
              icon={<ManageAccounts />} 
              iconPosition="start"
            />
          </Tabs>
        </Card>
      )}

      {/* Tab Content */}
      {eventId && tabValue === 1 ? (
        <ClaimItemManagement eventId={eventId} />
      ) : (
        <>

      {/* Filters and Search */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                placeholder="Search claims..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Search />
                    </InputAdornment>
                  ),
                }}
                size="small"
              />
            </Grid>
            <Grid item xs={12} md={3}>
              <FormControl fullWidth size="small">
                <InputLabel>Filter by Status</InputLabel>
                <Select
                  value={filterStatus}
                  label="Filter by Status"
                  onChange={(e) => setFilterStatus(e.target.value)}
                >
                  <MenuItem value="all">All Status</MenuItem>
                  <MenuItem value="pending">Pending</MenuItem>
                  <MenuItem value="approved">Approved</MenuItem>
                  <MenuItem value="rejected">Rejected</MenuItem>
                  <MenuItem value="under_review">Under Review</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={5}>
              <Box display="flex" gap={1} justifyContent="flex-end">
                <Tooltip title="Download Report">
                  <IconButton size="small">
                    <Download />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Print">
                  <IconButton size="small">
                    <Print />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Export">
                  <IconButton size="small">
                    <Email />
                  </IconButton>
                </Tooltip>
              </Box>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Statistics Cards */}
      {statistics && !eventId && (
        <Grid container spacing={3} sx={{ mb: 3 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Box display="flex" alignItems="center">
                  <Receipt sx={{ mr: 1, color: 'primary.main' }} />
                  <Box>
                    <Typography variant="h6">Total Claims</Typography>
                    <Typography variant="h4">{statistics.totalClaims}</Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Box display="flex" alignItems="center">
                  <Pending sx={{ mr: 1, color: 'warning.main' }} />
                  <Box>
                    <Typography variant="h6">Pending</Typography>
                    <Typography variant="h4">
                      <Badge badgeContent={statistics.pendingClaims} color="warning">
                        {statistics.pendingClaims}
                      </Badge>
                    </Typography>
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
                    <Typography variant="h4">{statistics.approvedClaims}</Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Box display="flex" alignItems="center">
                  <MonetizationOn sx={{ mr: 1, color: 'green' }} />
                  <Box>
                    <Typography variant="h6">Total Savings</Typography>
                    <Typography variant="h4" color={(statistics.amounts?.totalSavings || 0) >= 0 ? 'success.main' : 'error.main'}>
                      {formatCurrency(statistics.amounts?.totalSavings || 0)}
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {/* Claims Table */}
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            {eventId ? 'Event Claims' : 'All Claims'} ({claims.length})
          </Typography>
          
          {claims.length === 0 ? (
            <Alert severity="info">
              No claims submitted yet
            </Alert>
          ) : (
            <TableContainer component={Paper} sx={{ mt: 2 }}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Claim #</TableCell>
                    <TableCell>Event</TableCell>
                    <TableCell>Submitted By</TableCell><TableCell>Amount</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Submitted Date</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {claims.map((claim) => (
                    <React.Fragment key={claim._id}>
                      <TableRow hover>
                        <TableCell>
                          <Typography variant="body2" fontWeight="bold">
                            {claim.claimNumber || `CLM-${claim._id?.slice(-6)?.toUpperCase()}`}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2">
                            {claim.eventId?.title || claim.title || 'N/A'}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {(claim.eventId?.startDate || claim.startDate) && formatDate(claim.eventId?.startDate || claim.startDate)}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Box display="flex" alignItems="center">
                            <Person sx={{ mr: 1, fontSize: 16 }} />
                            <Box>
                              <Typography variant="body2">
                                {claim.submittedBy?.name || 'N/A'}
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                {claim.submittedBy?.email || 'N/A'}
                              </Typography>
                            </Box>
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Box>
                            <Typography variant="body2" fontWeight="bold">
                              {formatCurrency(claim.totalActualAmount)}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              Budget: {formatCurrency(claim.totalBudgetAmount)}
                            </Typography>
                            {claim.summary?.totalSavings !== undefined && claim.summary?.totalSavings !== 0 && (
                              <Box display="flex" alignItems="center" mt={0.5}>
                                {(claim.summary?.totalSavings || 0) > 0 ? (
                                  <TrendingDown sx={{ fontSize: 14, color: 'success.main', mr: 0.5 }} />
                                ) : (
                                  <TrendingUp sx={{ fontSize: 14, color: 'error.main', mr: 0.5 }} />
                                )}
                                <Typography 
                                  variant="caption" 
                                  color={(claim.summary?.totalSavings || 0) > 0 ? 'success.main' : 'error.main'}
                                >
                                  {(claim.summary?.totalSavings || 0) > 0 ? 'Saved' : 'Over'}: {formatCurrency(Math.abs(claim.summary?.totalSavings || 0))}
                                </Typography>
                              </Box>
                            )}
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Chip
                            icon={getStatusIcon(claim.status)}
                            label={claim.status.toUpperCase().replace('_', ' ')}
                            color={getStatusColor(claim.status)}
                            size="small"
                          />
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2">
                            {formatDate(claim.submissionDate)}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Box display="flex" gap={1}>
                            <Tooltip title="View Details">
                              <IconButton
                                size="small"
                                onClick={() => handleViewDetails(claim._id)}
                              >
                                <Visibility />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Expand/Collapse">
                              <IconButton
                                size="small"
                                onClick={() => setExpandedClaim(
                                  expandedClaim === claim._id ? null : claim._id
                                )}
                              >
                                {expandedClaim === claim._id ? <ExpandLess /> : <ExpandMore />}
                              </IconButton>
                            </Tooltip>
                          </Box>
                        </TableCell>
                      </TableRow>
                      
                      {/* Expanded Row */}
                      <TableRow>
                        <TableCell colSpan={7} sx={{ py: 0 }}>
                          <Collapse in={expandedClaim === claim._id}>
                            <Box sx={{ py: 2 }}>
                              <Typography variant="subtitle2" gutterBottom>
                                Expense Breakdown:
                              </Typography>
                              <Grid container spacing={2}>
                                {claim.expenses?.map((expense, index) => (
                                  <Grid item xs={12} sm={6} md={4} key={index}>
                                    <Paper sx={{ p: 2 }}>
                                      <Typography variant="body2" fontWeight="bold">
                                        {expense.category}
                                      </Typography>
                                      <Typography variant="body2">
                                        Budget: {formatCurrency(expense.budgetAmount)}
                                      </Typography>
                                      <Typography variant="body2">
                                        Actual: {formatCurrency(expense.actualAmount)}
                                      </Typography>
                                      {expense.description && (
                                        <Typography variant="caption" color="text.secondary">
                                          {expense.description}
                                        </Typography>
                                      )}
                                    </Paper>
                                  </Grid>
                                ))}
                              </Grid>
                            </Box>
                          </Collapse>
                        </TableCell>
                      </TableRow>
                    </React.Fragment>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </CardContent>
      </Card>

      {/* Claim Details Dialog */}
      <Dialog open={detailsOpen} onClose={() => setDetailsOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Typography variant="h6">
              Claim Details - {selectedClaim?.claimNumber}
            </Typography>
            <Chip
              icon={getStatusIcon(selectedClaim?.status)}
              label={selectedClaim?.status?.toUpperCase().replace('_', ' ')}
              color={getStatusColor(selectedClaim?.status)}
            />
          </Box>
        </DialogTitle>
        <DialogContent>
          {selectedClaim && (
            <Box>
              {/* Basic Information */}
              <Grid container spacing={2} sx={{ mb: 3 }}>
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2" color="text.secondary">Event</Typography>
                  <Typography variant="body1">{selectedClaim.eventId?.title}</Typography>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2" color="text.secondary">Submitted By</Typography>
                  <Typography variant="body1">{selectedClaim.submittedBy?.name}</Typography>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2" color="text.secondary">Submission Date</Typography>
                  <Typography variant="body1">{formatDate(selectedClaim.submissionDate)}</Typography>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2" color="text.secondary">Total Amount</Typography>
                  <Typography variant="body1" fontWeight="bold">
                    {formatCurrency(selectedClaim.totalActualAmount)}
                  </Typography>
                </Grid>
              </Grid>

              <Divider sx={{ my: 2 }} />

              {/* Financial Summary */}
              <Typography variant="h6" gutterBottom>Financial Summary</Typography>
              <Grid container spacing={2} sx={{ mb: 3 }}>
                <Grid item xs={12} md={4}>
                  <Paper sx={{ p: 2, textAlign: 'center' }}>
                    <Typography variant="subtitle2" color="text.secondary">Budget Amount</Typography>
                    <Typography variant="h6">{formatCurrency(selectedClaim.totalBudgetAmount)}</Typography>
                  </Paper>
                </Grid>
                <Grid item xs={12} md={4}>
                  <Paper sx={{ p: 2, textAlign: 'center' }}>
                    <Typography variant="subtitle2" color="text.secondary">Actual Amount</Typography>
                    <Typography variant="h6">{formatCurrency(selectedClaim.totalActualAmount)}</Typography>
                  </Paper>
                </Grid>
                <Grid item xs={12} md={4}>
                  <Paper sx={{ p: 2, textAlign: 'center' }}>
                    <Typography variant="subtitle2" color="text.secondary">
                      {(selectedClaim.summary?.totalSavings || 0) >= 0 ? 'Savings' : 'Over Budget'}
                    </Typography>
                    <Typography 
                      variant="h6" 
                      color={(selectedClaim.summary?.totalSavings || 0) >= 0 ? 'success.main' : 'error.main'}
                    >
                      {formatCurrency(Math.abs(selectedClaim.summary?.totalSavings || 0))}
                    </Typography>
                  </Paper>
                </Grid>
              </Grid>

              <Divider sx={{ my: 2 }} />

              {/* Expense Details */}
              <Typography variant="h6" gutterBottom>Expense Breakdown</Typography>
              <TableContainer component={Paper} sx={{ mb: 3 }}>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Category</TableCell>
                      <TableCell align="right">Budget</TableCell>
                      <TableCell align="right">Actual</TableCell>
                      <TableCell align="right">Variance</TableCell>
                      <TableCell>Description</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {selectedClaim.expenses?.map((expense, index) => {
                      const variance = expense.actualAmount - expense.budgetAmount;
                      return (
                        <TableRow key={index}>
                          <TableCell>{expense.category}</TableCell>
                          <TableCell align="right">{formatCurrency(expense.budgetAmount)}</TableCell>
                          <TableCell align="right">{formatCurrency(expense.actualAmount)}</TableCell>
                          <TableCell align="right">
                            <Typography 
                              color={variance <= 0 ? 'success.main' : 'error.main'}
                              fontWeight="bold"
                            >
                              {variance > 0 ? '+' : ''}{formatCurrency(variance)}
                            </Typography>
                          </TableCell>
                          <TableCell>{expense.description || '-'}</TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </TableContainer>

              {/* Approval History */}
              {selectedClaim.approvalHistory?.length > 0 && (
                <>
                  <Typography variant="h6" gutterBottom>
                    <History sx={{ mr: 1, verticalAlign: 'middle' }} />
                    Approval History
                  </Typography>
                  <List>
                    {selectedClaim.approvalHistory.map((history, index) => (
                      <ListItem key={index}>
                        <ListItemIcon>
                          {getStatusIcon(history.action)}
                        </ListItemIcon>
                        <ListItemText
                          primary={`${history.action.toUpperCase()} by ${history.reviewedBy?.name}`}
                          secondary={
                            <Box>
                              <Typography variant="caption">
                                {formatDate(history.date)}
                              </Typography>
                              {history.comments && (
                                <Typography variant="body2" sx={{ mt: 0.5 }}>
                                  <Comment sx={{ fontSize: 14, mr: 0.5 }} />
                                  {history.comments}
                                </Typography>
                              )}
                            </Box>
                          }
                        />
                      </ListItem>
                    ))}
                  </List>
                </>
              )}

              {/* Current Review Comments */}
              {selectedClaim.reviewComments && (
                <Box sx={{ mt: 2 }}>
                  <Typography variant="subtitle2" gutterBottom>Review Comments</Typography>
                  <Paper sx={{ p: 2, bgcolor: 'grey.50' }}>
                    <Typography variant="body2">{selectedClaim.reviewComments}</Typography>
                  </Paper>
                </Box>
              )}
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          {selectedClaim?.status === 'pending' && (
            <>
              <Button
                variant="outlined"
                color="error"
                onClick={() => handleApprovalAction('rejected')}
              >
                Reject
              </Button>
              <Button
                variant="contained"
                color="success"
                onClick={() => handleApprovalAction('approved')}
              >
                Approve
              </Button>
            </>
          )}
          <Button onClick={() => setDetailsOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* Approval Dialog */}
      <Dialog open={approvalDialogOpen} onClose={() => setApprovalDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          {approvalAction === 'approved' ? 'Approve Claim' : 'Reject Claim'}
        </DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            multiline
            rows={4}
            label="Comments (Optional)"
            value={approvalComments}
            onChange={(e) => setApprovalComments(e.target.value)}
            sx={{ mt: 2 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setApprovalDialogOpen(false)}>Cancel</Button>
          <Button
            variant="contained"
            color={approvalAction === 'approved' ? 'success' : 'error'}
            onClick={submitApproval}
          >
            {approvalAction === 'approved' ? 'Approve' : 'Reject'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Submit New Claim Dialog */}
      <Dialog open={submitClaimOpen} onClose={() => setSubmitClaimOpen(false)} maxWidth="lg" fullWidth>
        <DialogTitle>
          <Typography variant="h6">Submit New Claim</Typography>
          <Typography variant="body2" color="text.secondary">
            Event: {eventData?.title}
          </Typography>
        </DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            {/* Expense Details */}
            <Typography variant="h6" gutterBottom>Expense Details</Typography>
            <Grid container spacing={2}>
              {newClaimData.expenses.map((expense, index) => (
                <Grid item xs={12} key={index}>
                  <Paper sx={{ p: 2, mb: 2 }}>
                    <Grid container spacing={2} alignItems="center">
                      <Grid item xs={12} md={3}>
                        <Typography variant="subtitle2" fontWeight="bold">
                          {expense.category}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Budget: {formatCurrency(expense.budgetAmount)}
                        </Typography>
                      </Grid>
                      <Grid item xs={12} md={3}>
                        <TextField
                          fullWidth
                          label="Actual Amount"
                          type="number"
                          value={expense.actualAmount}
                          onChange={(e) => handleExpenseChange(index, 'actualAmount', Number(e.target.value))}
                          InputProps={{
                            startAdornment: <InputAdornment position="start">₹</InputAdornment>,
                          }}
                          size="small"
                        />
                      </Grid>
                      <Grid item xs={12} md={6}>
                        <TextField
                          fullWidth
                          label="Description"
                          value={expense.description}
                          onChange={(e) => handleExpenseChange(index, 'description', e.target.value)}
                          multiline
                          rows={2}
                          size="small"
                        />
                      </Grid>
                    </Grid>
                  </Paper>
                </Grid>
              ))}
            </Grid>

            {/* Summary */}
            <Paper sx={{ p: 2, mt: 3, bgcolor: 'grey.50' }}>
              <Typography variant="h6" gutterBottom>Summary</Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} md={4}>
                  <Typography variant="body2" color="text.secondary">Total Budget</Typography>
                  <Typography variant="h6">
                    {formatCurrency(newClaimData.expenses.reduce((sum, exp) => sum + exp.budgetAmount, 0))}
                  </Typography>
                </Grid>
                <Grid item xs={12} md={4}>
                  <Typography variant="body2" color="text.secondary">Total Actual</Typography>
                  <Typography variant="h6">
                    {formatCurrency(newClaimData.expenses.reduce((sum, exp) => sum + exp.actualAmount, 0))}
                  </Typography>
                </Grid>
                <Grid item xs={12} md={4}>
                  <Typography variant="body2" color="text.secondary">
                    {newClaimData.expenses.reduce((sum, exp) => sum + exp.budgetAmount, 0) - 
                     newClaimData.expenses.reduce((sum, exp) => sum + exp.actualAmount, 0) >= 0 ? 'Savings' : 'Over Budget'}
                  </Typography>
                  <Typography 
                    variant="h6" 
                    color={
                      newClaimData.expenses.reduce((sum, exp) => sum + exp.budgetAmount, 0) - 
                      newClaimData.expenses.reduce((sum, exp) => sum + exp.actualAmount, 0) >= 0 ? 'success.main' : 'error.main'
                    }
                  >
                    {formatCurrency(Math.abs(
                      newClaimData.expenses.reduce((sum, exp) => sum + exp.budgetAmount, 0) - 
                      newClaimData.expenses.reduce((sum, exp) => sum + exp.actualAmount, 0)
                    ))}
                  </Typography>
                </Grid>
              </Grid>
            </Paper>

            {/* Additional Description */}
            <Box sx={{ mt: 3 }}>
              <TextField
                fullWidth
                label="Additional Description (Optional)"
                value={newClaimData.description}
                onChange={(e) => setNewClaimData(prev => ({ ...prev, description: e.target.value }))}
                multiline
                rows={3}
              />
            </Box>

            {/* File Attachments */}
            <Box sx={{ mt: 3 }}>
              <Typography variant="h6" gutterBottom>Attachments</Typography>
              <Button
                variant="outlined"
                component="label"
                startIcon={<CloudUpload />}
                sx={{ mb: 2 }}
              >
                Upload Receipts
                <input
                  type="file"
                  hidden
                  multiple
                  accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                  onChange={handleFileUpload}
                />
              </Button>
              
              {newClaimData.attachments.length > 0 && (
                <List>
                  {newClaimData.attachments.map((file, index) => (
                    <ListItem key={index}>
                      <ListItemIcon>
                        <AttachFile />
                      </ListItemIcon>
                      <ListItemText primary={file.name} secondary={`${(file.size / 1024).toFixed(2)} KB`} />
                      <IconButton onClick={() => removeAttachment(index)} size="small">
                        <Delete />
                      </IconButton>
                    </ListItem>
                  ))}
                </List>
              )}
            </Box>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSubmitClaimOpen(false)}>Cancel</Button>
          <Button
            variant="contained"
            onClick={handleSubmitNewClaim}
            disabled={newClaimData.expenses.every(exp => exp.actualAmount === 0)}
          >
            Submit Claim
          </Button>
        </DialogActions>
      </Dialog>
        </>
      )}
    </Box>
  );
};

export default ClaimManagement;