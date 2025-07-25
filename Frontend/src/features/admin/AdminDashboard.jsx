import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Container,
  Grid,
  Paper,
  Typography,
  Card,
  CardContent,
  AppBar,
  Toolbar,
  IconButton,
  Menu,
  MenuItem,
  Avatar,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  CircularProgress,
  Alert,
  Fab,
  Tooltip
} from '@mui/material';
import {
  Dashboard,
  People,
  Event,
  ExitToApp,
  Add,
  Edit,
  Delete,
  Upload,
  Download,
  Search,
  FilterList,
  Refresh
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useSnackbar } from 'notistack';
import axios from 'axios';

const AdminDashboard = () => {
  const [anchorEl, setAnchorEl] = useState(null);
  const [stats, setStats] = useState({});
  const [users, setUsers] = useState([]);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [openAddUser, setOpenAddUser] = useState(false);
  const [openEditUser, setOpenEditUser] = useState(false);
  const [openBulkUpload, setOpenBulkUpload] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploadResults, setUploadResults] = useState(null);
  const [showResults, setShowResults] = useState(false);
  const [newUser, setNewUser] = useState({
    email: '',
    role: '',
    department: ''
  });
  const [editingUser, setEditingUser] = useState({
    _id: '',
    name: '',
    email: '',
    role: '',
    department: '',
    isActive: true
  });
  const [filters, setFilters] = useState({
    search: '',
    role: 'all',
    department: 'all'
  });

  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();

  const adminName = localStorage.getItem('name') || 'Admin';
  const token = localStorage.getItem('token');

  const fetchDashboardData = useCallback(async () => {
    if (!token) return;
    
    try {
      setLoading(true);
      const [statsRes, usersRes, eventsRes] = await Promise.all([
        axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/admin/dashboard/stats`, {
          headers: { Authorization: `Bearer ${token}` }
        }),
        axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/admin/users`, {
          headers: { Authorization: `Bearer ${token}` }
        }),
        axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/admin/events`, {
          headers: { Authorization: `Bearer ${token}` }
        })
      ]);

      setStats(statsRes.data);
      setUsers(usersRes.data.users);
      setEvents(eventsRes.data.events);
    } catch (error) {
      enqueueSnackbar('Error fetching dashboard data', { variant: 'error' });
    } finally {
      setLoading(false);
    }
  }, [token, enqueueSnackbar]);

  useEffect(() => {
    if (!token) {
      navigate('/admin/login');
      return;
    }
    fetchDashboardData();
  }, [token, navigate, fetchDashboardData]);

  const handleLogout = () => {
    localStorage.clear();
    navigate('/admin/login');
  };

  const handleAddUser = async () => {
    try {
      await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/api/admin/users`,
        newUser,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      enqueueSnackbar('User added successfully', { variant: 'success' });
      setOpenAddUser(false);
      setNewUser({ email: '', role: '', department: '' });
      fetchDashboardData();
    } catch (error) {
      enqueueSnackbar(error.response?.data?.message || 'Error adding user', { variant: 'error' });
    }
  };

  const handleBulkUpload = async () => {
    if (!selectedFile) {
      enqueueSnackbar('Please select a file', { variant: 'warning' });
      return;
    }

    const formData = new FormData();
    formData.append('file', selectedFile);

    try {
      const response = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/api/admin/users/bulk`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data'
          }
        }
      );

      const { results, summary } = response.data;
      setUploadResults({ results, summary });
      setShowResults(true);
      
      enqueueSnackbar(
        `Bulk upload completed: ${summary.successful} added, ${summary.failed} errors`,
        { variant: summary.failed > 0 ? 'warning' : 'success' }
      );
      
      setOpenBulkUpload(false);
      setSelectedFile(null);
      fetchDashboardData();
    } catch (error) {
      enqueueSnackbar(error.response?.data?.message || 'Error uploading file', { variant: 'error' });
    }
  };

  const downloadTemplate = () => {
    // Create CSV template content
    const csvContent = `email,role,department
john.doe@gmail.com,student,CSE
jane.smith@gmail.com,coordinator,ECE
admin.head@gmail.com,hod,CSE`;

    // Create blob and download
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', 'bulk_upload_template.csv');
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    enqueueSnackbar('Template downloaded successfully', { variant: 'success' });
  };

  const handleEditUser = (user) => {
    setEditingUser({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      department: user.department,
      isActive: user.isActive
    });
    setOpenEditUser(true);
  };

  const handleUpdateUser = async () => {
    try {
      await axios.put(
        `${import.meta.env.VITE_BACKEND_URL}/api/admin/users/${editingUser._id}`,
        {
          name: editingUser.name,
          email: editingUser.email,
          role: editingUser.role,
          department: editingUser.department,
          isActive: editingUser.isActive
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      enqueueSnackbar('User updated successfully', { variant: 'success' });
      setOpenEditUser(false);
      setEditingUser({
        _id: '',
        name: '',
        email: '',
        role: '',
        department: '',
        isActive: true
      });
      fetchDashboardData();
    } catch (error) {
      enqueueSnackbar(error.response?.data?.message || 'Error updating user', { variant: 'error' });
    }
  };

  const handleDeleteUser = async (userId) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      try {
        await axios.delete(
          `${import.meta.env.VITE_BACKEND_URL}/api/admin/users/${userId}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        
        enqueueSnackbar('User deleted successfully', { variant: 'success' });
        fetchDashboardData();
      } catch (error) {
        enqueueSnackbar(error.response?.data?.message || 'Error deleting user', { variant: 'error' });
      }
    }
  };

  const StatCard = ({ title, value, icon, color = 'primary' }) => (
    <Card>
      <CardContent>
        <Box display="flex" alignItems="center" justifyContent="space-between">
          <Box>
            <Typography color="textSecondary" gutterBottom variant="h6">
              {title}
            </Typography>
            <Typography variant="h4" component="h2">
              {value}
            </Typography>
          </Box>
          <Avatar sx={{ bgcolor: `${color}.main` }}>
            {icon}
          </Avatar>
        </Box>
      </CardContent>
    </Card>
  );

  const renderDashboard = () => (
    <Grid container spacing={3}>
      <Grid item xs={12} sm={6} md={3}>
        <StatCard
          title="Total Users"
          value={stats.totalUsers || 0}
          icon={<People />}
          color="primary"
        />
      </Grid>
      <Grid item xs={12} sm={6} md={3}>
        <StatCard
          title="Total Events"
          value={stats.totalEvents || 0}
          icon={<Event />}
          color="secondary"
        />
      </Grid>
      <Grid item xs={12} sm={6} md={3}>
        <StatCard
          title="Active Events"
          value={stats.activeEvents || 0}
          icon={<Event />}
          color="success"
        />
      </Grid>
      <Grid item xs={12} sm={6} md={3}>
        <StatCard
          title="HODs"
          value={stats.usersByRole?.hod || 0}
          icon={<People />}
          color="warning"
        />
      </Grid>

      {/* Recent Users */}
      <Grid item xs={12} md={6}>
        <Paper sx={{ p: 2 }}>
          <Typography variant="h6" gutterBottom>
            Recent Users
          </Typography>
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Name</TableCell>
                  <TableCell>Role</TableCell>
                  <TableCell>Department</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {stats.recentUsers?.slice(0, 5).map((user) => (
                  <TableRow key={user._id}>
                    <TableCell>{user.name}</TableCell>
                    <TableCell>
                      <Chip label={user.role} size="small" />
                    </TableCell>
                    <TableCell>{user.department}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      </Grid>

      {/* Recent Events */}
      <Grid item xs={12} md={6}>
        <Paper sx={{ p: 2 }}>
          <Typography variant="h6" gutterBottom>
            Recent Events
          </Typography>
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Title</TableCell>
                  <TableCell>Coordinator</TableCell>
                  <TableCell>Status</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {stats.recentEvents?.slice(0, 5).map((event) => (
                  <TableRow key={event._id}>
                    <TableCell>{event.title}</TableCell>
                    <TableCell>{event.coordinatorId?.name}</TableCell>
                    <TableCell>
                      <Chip 
                        label={event.status} 
                        size="small" 
                        color={event.status === 'active' ? 'success' : 'default'}
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      </Grid>
    </Grid>
  );

  const renderUsers = () => (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h5">User Management</Typography>
        <Box>
          <Button
            variant="outlined"
            startIcon={<Upload />}
            onClick={() => setOpenBulkUpload(true)}
            sx={{ mr: 1 }}
          >
            Bulk Upload
          </Button>
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={() => setOpenAddUser(true)}
          >
            Add User
          </Button>
        </Box>
      </Box>

      <Paper sx={{ p: 2 }}>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Name</TableCell>
                <TableCell>Email</TableCell>
                <TableCell>Role</TableCell>
                <TableCell>Department</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {users.map((user) => (
                <TableRow key={user._id}>
                  <TableCell>{user.name}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>
                    <Chip label={user.role} size="small" />
                  </TableCell>
                  <TableCell>{user.department}</TableCell>
                  <TableCell>
                    <Chip 
                      label={user.isActive ? 'Active' : 'Inactive'} 
                      size="small"
                      color={user.isActive ? 'success' : 'default'}
                    />
                  </TableCell>
                  <TableCell>
                    <IconButton 
                      size="small" 
                      color="primary"
                      onClick={() => handleEditUser(user)}
                    >
                      <Edit />
                    </IconButton>
                    <IconButton 
                      size="small" 
                      color="error"
                      onClick={() => handleDeleteUser(user._id)}
                    >
                      <Delete />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
    </Box>
  );

  const renderEvents = () => (
    <Box>
      <Typography variant="h5" gutterBottom>
        Event Management
      </Typography>
      <Paper sx={{ p: 2 }}>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Title</TableCell>
                <TableCell>Coordinator</TableCell>
                <TableCell>HOD</TableCell>
                <TableCell>Department</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Created</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {events.map((event) => (
                <TableRow key={event._id}>
                  <TableCell>{event.title}</TableCell>
                  <TableCell>{event.coordinatorId?.name}</TableCell>
                  <TableCell>{event.hodId?.name}</TableCell>
                  <TableCell>{event.department}</TableCell>
                  <TableCell>
                    <Chip 
                      label={event.status} 
                      size="small"
                      color={event.status === 'active' ? 'success' : 'default'}
                    />
                  </TableCell>
                  <TableCell>
                    {new Date(event.createdAt).toLocaleDateString()}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
    </Box>
  );

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ flexGrow: 1 }}>
      {/* App Bar */}
      <AppBar position="static">
        <Toolbar>
          <Dashboard sx={{ mr: 2 }} />
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Admin Dashboard
          </Typography>
          <Button
            color="inherit"
            onClick={() => setActiveTab('dashboard')}
            sx={{ mr: 1 }}
          >
            Dashboard
          </Button>
          <Button
            color="inherit"
            onClick={() => setActiveTab('users')}
            sx={{ mr: 1 }}
          >
            Users
          </Button>
          <Button
            color="inherit"
            onClick={() => setActiveTab('events')}
            sx={{ mr: 2 }}
          >
            Events
          </Button>
          <IconButton
            color="inherit"
            onClick={(e) => setAnchorEl(e.currentTarget)}
          >
            <Avatar sx={{ width: 32, height: 32 }}>
              {adminName.charAt(0)}
            </Avatar>
          </IconButton>
          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={() => setAnchorEl(null)}
          >
            <MenuItem onClick={handleLogout}>
              <ExitToApp sx={{ mr: 1 }} />
              Logout
            </MenuItem>
          </Menu>
        </Toolbar>
      </AppBar>

      {/* Main Content */}
      <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
        {activeTab === 'dashboard' && renderDashboard()}
        {activeTab === 'users' && renderUsers()}
        {activeTab === 'events' && renderEvents()}
      </Container>

      {/* Add User Dialog */}
      <Dialog open={openAddUser} onClose={() => setOpenAddUser(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Add New User</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            label="Email"
            type="email"
            value={newUser.email}
            onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
            margin="normal"
            helperText="Enter a valid email address"
          />
          <FormControl fullWidth margin="normal">
            <InputLabel>Role</InputLabel>
            <Select
              value={newUser.role}
              onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
            >
              <MenuItem value="student">Student</MenuItem>
              <MenuItem value="coordinator">Coordinator</MenuItem>
              <MenuItem value="hod">HOD</MenuItem>
            </Select>
          </FormControl>
          <TextField
            fullWidth
            label="Department"
            value={newUser.department}
            onChange={(e) => setNewUser({ ...newUser, department: e.target.value })}
            margin="normal"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenAddUser(false)}>Cancel</Button>
          <Button onClick={handleAddUser} variant="contained">Add User</Button>
        </DialogActions>
      </Dialog>

      {/* Edit User Dialog */}
      <Dialog open={openEditUser} onClose={() => setOpenEditUser(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Edit User</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            label="Name"
            value={editingUser.name}
            onChange={(e) => setEditingUser({ ...editingUser, name: e.target.value })}
            margin="normal"
          />
          <TextField
            fullWidth
            label="Email"
            type="email"
            value={editingUser.email}
            onChange={(e) => setEditingUser({ ...editingUser, email: e.target.value })}
            margin="normal"
            helperText="Enter a valid email address"
          />
          <FormControl fullWidth margin="normal">
            <InputLabel>Role</InputLabel>
            <Select
              value={editingUser.role}
              onChange={(e) => setEditingUser({ ...editingUser, role: e.target.value })}
            >
              <MenuItem value="student">Student</MenuItem>
              <MenuItem value="coordinator">Coordinator</MenuItem>
              <MenuItem value="hod">HOD</MenuItem>
            </Select>
          </FormControl>
          <TextField
            fullWidth
            label="Department"
            value={editingUser.department}
            onChange={(e) => setEditingUser({ ...editingUser, department: e.target.value })}
            margin="normal"
          />
          <FormControl fullWidth margin="normal">
            <InputLabel>Status</InputLabel>
            <Select
              value={editingUser.isActive}
              onChange={(e) => setEditingUser({ ...editingUser, isActive: e.target.value })}
            >
              <MenuItem value={true}>Active</MenuItem>
              <MenuItem value={false}>Inactive</MenuItem>
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenEditUser(false)}>Cancel</Button>
          <Button onClick={handleUpdateUser} variant="contained">Update User</Button>
        </DialogActions>
      </Dialog>

      {/* Bulk Upload Dialog */}
      <Dialog open={openBulkUpload} onClose={() => setOpenBulkUpload(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          <Box display="flex" alignItems="center" justifyContent="space-between">
            Bulk Upload Users
            <Button
              variant="outlined"
              startIcon={<Download />}
              onClick={downloadTemplate}
              size="small"
            >
              Download Template
            </Button>
          </Box>
        </DialogTitle>
        <DialogContent>
          <Alert severity="info" sx={{ mb: 2 }}>
            <Typography variant="subtitle2" gutterBottom>
              Instructions for Bulk Upload:
            </Typography>
            <Typography variant="body2" component="div">
              1. Download the template file using the button above<br/>
              2. Fill in the template with user data (do not modify column headers)<br/>
              3. Save the file and upload it below<br/>
              4. Supported formats: CSV (.csv), Excel (.xlsx, .xls)
            </Typography>
          </Alert>

          <Alert severity="warning" sx={{ mb: 2 }}>
            <Typography variant="subtitle2" gutterBottom>
              Important Notes:
            </Typography>
            <Typography variant="body2" component="div">
              • Only email addresses are allowed<br/>
              • Valid roles: student, coordinator, hod<br/>
              • If uploading a new HOD, the existing HOD will be deactivated<br/>
              • Duplicate emails will be skipped<br/>
              • Names will be auto-generated from email addresses
            </Typography>
          </Alert>

          <Box sx={{ mt: 2, mb: 2 }}>
            <Typography variant="subtitle2" gutterBottom>
              Required Columns:
            </Typography>
            <Paper sx={{ p: 2, bgcolor: 'grey.50' }}>
              <Typography variant="body2" component="div" sx={{ fontFamily: 'monospace' }}>
                <strong>email</strong> - Email address (e.g., john.doe@domain.com)<br/>
                <strong>role</strong> - User role (student/coordinator/hod)<br/>
                <strong>department</strong> - Department name (e.g., CSE, ECE, MECH)
              </Typography>
            </Paper>
          </Box>

          <Box sx={{ mt: 3 }}>
            <Typography variant="subtitle2" gutterBottom>
              Select File to Upload:
            </Typography>
            <input
              type="file"
              accept=".csv,.xlsx,.xls"
              onChange={(e) => setSelectedFile(e.target.files[0])}
              style={{ 
                marginTop: 8,
                padding: '8px',
                border: '1px solid #ccc',
                borderRadius: '4px',
                width: '100%'
              }}
            />
            {selectedFile && (
              <Typography variant="body2" color="success.main" sx={{ mt: 1 }}>
                Selected: {selectedFile.name}
              </Typography>
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => {
            setOpenBulkUpload(false);
            setSelectedFile(null);
          }}>
            Cancel
          </Button>
          <Button 
            onClick={handleBulkUpload} 
            variant="contained"
            disabled={!selectedFile}
          >
            Upload Users
          </Button>
        </DialogActions>
      </Dialog>

      {/* Upload Results Dialog */}
      <Dialog open={showResults} onClose={() => setShowResults(false)} maxWidth="lg" fullWidth>
        <DialogTitle>Bulk Upload Results</DialogTitle>
        <DialogContent>
          {uploadResults && (
            <Box>
              {/* Summary */}
              <Alert severity={uploadResults.summary.failed > 0 ? 'warning' : 'success'} sx={{ mb: 2 }}>
                <Typography variant="subtitle2" gutterBottom>
                  Upload Summary:
                </Typography>
                <Typography variant="body2">
                  Total Processed: {uploadResults.summary.total}<br/>
                  Successfully Added: {uploadResults.summary.successful}<br/>
                  Failed: {uploadResults.summary.failed}<br/>
                  Warnings: {uploadResults.summary.warnings}
                </Typography>
              </Alert>

              {/* Warnings */}
              {uploadResults.results.warnings?.length > 0 && (
                <Alert severity="warning" sx={{ mb: 2 }}>
                  <Typography variant="subtitle2" gutterBottom>
                    Warnings:
                  </Typography>
                  {uploadResults.results.warnings.map((warning, index) => (
                    <Typography key={index} variant="body2">
                      • {warning.message}
                    </Typography>
                  ))}
                </Alert>
              )}

              {/* Successful Additions */}
              {uploadResults.results.success?.length > 0 && (
                <Box sx={{ mb: 2 }}>
                  <Typography variant="h6" gutterBottom color="success.main">
                    Successfully Added Users ({uploadResults.results.success.length})
                  </Typography>
                  <TableContainer component={Paper} sx={{ maxHeight: 300 }}>
                    <Table size="small">
                      <TableHead>
                        <TableRow>
                          <TableCell>Row</TableCell>
                          <TableCell>Name</TableCell>
                          <TableCell>Email</TableCell>
                          <TableCell>Role</TableCell>
                          <TableCell>Department</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {uploadResults.results.success.map((user, index) => (
                          <TableRow key={index}>
                            <TableCell>{user.row}</TableCell>
                            <TableCell>{user.name}</TableCell>
                            <TableCell>{user.email}</TableCell>
                            <TableCell>
                              <Chip label={user.role} size="small" color="success" />
                            </TableCell>
                            <TableCell>{user.department}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </Box>
              )}

              {/* Errors */}
              {uploadResults.results.errors?.length > 0 && (
                <Box>
                  <Typography variant="h6" gutterBottom color="error.main">
                    Failed to Add Users ({uploadResults.results.errors.length})
                  </Typography>
                  <TableContainer component={Paper} sx={{ maxHeight: 300 }}>
                    <Table size="small">
                      <TableHead>
                        <TableRow>
                          <TableCell>Row</TableCell>
                          <TableCell>Email</TableCell>
                          <TableCell>Error</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {uploadResults.results.errors.map((error, index) => (
                          <TableRow key={index}>
                            <TableCell>{error.row}</TableCell>
                            <TableCell>{error.email}</TableCell>
                            <TableCell>
                              <Typography variant="body2" color="error">
                                {error.error}
                              </Typography>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </Box>
              )}
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowResults(false)} variant="contained">
            Close
          </Button>
        </DialogActions>
      </Dialog>

      {/* Refresh FAB */}
      <Tooltip title="Refresh Data">
        <Fab
          color="primary"
          aria-label="refresh"
          sx={{ position: 'fixed', bottom: 16, right: 16 }}
          onClick={fetchDashboardData}
        >
          <Refresh />
        </Fab>
      </Tooltip>
    </Box>
  );
};

export default AdminDashboard;