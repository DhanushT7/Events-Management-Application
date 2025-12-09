// AdminDashboard.jsx
import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Container,
  AppBar,
  Toolbar,
  IconButton,
  Drawer,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Avatar,
  Button,
  Typography,
  TextField,
  InputAdornment,
  Grid,
  Paper,
  Fab,
  Tooltip,
  useTheme,
  Divider,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  CircularProgress
} from '@mui/material';
import useMediaQuery from '@mui/material/useMediaQuery';

import {
  Search,
  Refresh,
  Menu as MenuIcon,
  Home as HomeIcon,
  People as PeopleIcon,
  Event as EventIcon,
  Mail as MailIcon,
  Add as AddIcon,
  CloudUpload as CloudUploadIcon,
  ChevronLeft as ChevronLeftIcon,
  Delete as DeleteIcon
} from '@mui/icons-material';

import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useSnackbar } from 'notistack';
import axios from 'axios';

import UsersView from './components/UsersView';
import EventsView from './components/EventsView';
import MailSettingsView from './components/MailSettingsView';
import EventsHistoryView from './components/EventsHistoryView';
import StatCard from './components/StatCard';
import AddUserDialog from './components/dialogs/AddUserDialog';
import EditUserDialog from './components/dialogs/EditUserDialog';
import BulkUploadDialog from './components/dialogs/BulkUploadDialog';
import UploadResultsDialog from './components/dialogs/UploadResultsDialog';

const NAV_ITEMS = [
  { key: 'dashboard', label: 'Dashboard', icon: <HomeIcon /> },
  { key: 'users', label: 'Users', icon: <PeopleIcon /> },
  { key: 'events', label: 'Events', icon: <EventIcon /> },
  { key: 'mail-settings', label: 'Mail', icon: <MailIcon /> },
  { key: 'event-history', label: 'Event History', icon: <EventIcon /> }
];

const AdminDashboard = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();
  const isSm = useMediaQuery(theme.breakpoints.up('sm'));

  // UI state
  const [drawerOpen, setDrawerOpen] = useState(true);
  const [stats, setStats] = useState({});
  const [users, setUsers] = useState([]);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('dashboard');

  // Dialog states
  const [openAddUser, setOpenAddUser] = useState(false);
  const [openEditUser, setOpenEditUser] = useState(false);
  const [openBulkUpload, setOpenBulkUpload] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploadResults, setUploadResults] = useState(null);
  const [showResults, setShowResults] = useState(false);

  // Forms
  const [newUser, setNewUser] = useState({ email: '', role: '', department: '' });
  const [editingUser, setEditingUser] = useState({ _id: '', name: '', email: '', role: '', department: '', isActive: true, password: '' });
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [mailSettings, setMailSettings] = useState(null);
  const [mailForm, setMailForm] = useState({ fromEmail: '', appPassword: '', displayName: '', service: 'gmail' });
  const [mailLoading, setMailLoading] = useState(false);
  const [filters, setFilters] = useState({ search: '', role: 'all', department: 'all' });

  const apiBase = import.meta.env.VITE_API_BASE_URL || 'http://10.5.12.1:4000/api';
  const adminName = localStorage.getItem('name') || 'Admin';
  const token = localStorage.getItem('token');

  // Confirmation dialog state
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmLoading, setConfirmLoading] = useState(false);
  const [confirmPayload, setConfirmPayload] = useState({
    kind: 'single', // 'single' | 'bulk'
    userIds: [],    // array of ids to delete
    title: 'Confirm action',
    message: 'Are you sure you want to proceed?',
  });

  // Normalize incoming ids to a clean array of string ids; return skipped for debugging
  function normalizeUserIds(raw) {
    if (raw == null) return { ids: [], skipped: [] };
    // Ignore DOM nodes / events defensively
    if (typeof raw === 'object' && (('nodeType' in raw) || (typeof Element !== 'undefined' && raw instanceof Element))) {
      console.warn('normalizeUserIds: received DOM node — ignoring');
      return { ids: [], skipped: [raw] };
    }

    const arr = Array.isArray(raw) ? raw : [raw];
    const ids = [];
    const skipped = [];

    for (const item of arr) {
      if (item == null) { skipped.push(item); continue; }
      if (typeof item === 'string' || typeof item === 'number') { ids.push(String(item)); continue; }
      if (typeof item === 'object') {
        const id = item._id ?? item.id ?? item.userId ?? item.uid ?? null;
        if (id != null && (typeof id === 'string' || typeof id === 'number')) ids.push(String(id)); else skipped.push(item);
        continue;
      }
      skipped.push(item);
    }
    return { ids, skipped };
  }

  // ---------- Data fetch ----------
  const fetchDashboardData = useCallback(async () => {
    if (!token) return;
    try {
      setLoading(true);
      const [statsRes, usersRes, eventsRes] = await Promise.all([
        axios.get(`${apiBase}/admin/dashboard/stats`, { headers: { Authorization: `Bearer ${token}` } }),
        axios.get(`${apiBase}/admin/users`, { headers: { Authorization: `Bearer ${token}` } }),
        axios.get(`${apiBase}/admin/events`, { headers: { Authorization: `Bearer ${token}` } })
      ]);
      setStats(statsRes.data || {});
      setUsers(usersRes.data.users || []);
      setEvents(eventsRes.data.events || []);
    } catch (err) {
      enqueueSnackbar('Error fetching dashboard data', { variant: 'error' });
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [apiBase, token, enqueueSnackbar]);

  const fetchMailSettings = useCallback(async () => {
    if (!token) return;
    setMailLoading(true);
    try {
      const res = await axios.get(`${apiBase}/auth/admin/mail-settings`, { headers: { Authorization: `Bearer ${token}` }});
      const data = res.data || {};
      setMailSettings(data);
      setMailForm({ fromEmail: data.fromEmail || '', appPassword: '', displayName: data.displayName || '', service: data.service || 'gmail' });
    } catch (error) {
      enqueueSnackbar(error.response?.data?.message || 'Unable to load mail settings', { variant: 'error' });
    } finally {
      setMailLoading(false);
    }
  }, [apiBase, token, enqueueSnackbar]);

  useEffect(() => {
    if (!token) {
      navigate('/admin/login');
      return;
    }
    fetchDashboardData();
  }, [token, navigate, fetchDashboardData]);

  useEffect(() => {
    if (activeTab === 'mail-settings') fetchMailSettings();
  }, [activeTab, fetchMailSettings]);

  // ---------- Handlers ----------
  const handleLogout = () => {
    localStorage.clear();
    navigate('/login/admin');
  };

  const handleAddUser = async () => {
    try {
      await axios.post(`${apiBase}/admin/users`, newUser, { headers: { Authorization: `Bearer ${token}` } });
      enqueueSnackbar('User added successfully', { variant: 'success' });
      setOpenAddUser(false);
      setNewUser({ email: '', role: '', department: '' });
      fetchDashboardData();
    } catch (error) {
      enqueueSnackbar(error.response?.data?.message || 'Error adding user', { variant: 'error' });
    }
  };

  const handleBulkUpload = async () => {
    if (!selectedFile) return enqueueSnackbar('Please select a file', { variant: 'warning' });
    const formData = new FormData(); formData.append('file', selectedFile);
    try {
      const response = await axios.post(`${apiBase}/admin/users/bulk`, formData, { headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'multipart/form-data' }});
      const { results, summary } = response.data;
      setUploadResults({ results, summary });
      setShowResults(true);
      enqueueSnackbar(`Bulk upload: ${summary.successful} added, ${summary.failed} failed`, { variant: summary.failed ? 'warning' : 'success' });
      setOpenBulkUpload(false); setSelectedFile(null); fetchDashboardData();
    } catch (error) {
      enqueueSnackbar(error.response?.data?.message || 'Error uploading file', { variant: 'error' });
    }
  };

  const downloadTemplate = () => {
    const csvContent = `email,role,department
john.doe@gmail.com,participant,CSE
jane.smith@gmail.com,coordinator,ECE
admin.head@gmail.com,hod,CSE`;
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url); link.setAttribute('download', 'bulk_upload_template.csv');
    document.body.appendChild(link); link.click(); document.body.removeChild(link);
    enqueueSnackbar('Template downloaded', { variant: 'success' });
  };

  const handleEditUser = (user) => {
    setEditingUser({ _id: user._id, name: user.name, email: user.email, role: user.role, department: user.department, isActive: user.isActive, password: '' });
    setOpenEditUser(true);
  };

  const handleUpdateUser = async () => {
    try {
      const updatePayload = {
        name: editingUser.name,
        email: editingUser.email,
        role: editingUser.role,
        department: editingUser.department,
        isActive: editingUser.isActive
      };
      if (editingUser.password && editingUser.password.trim()) updatePayload.password = editingUser.password;
      await axios.put(`${apiBase}/admin/users/${editingUser._id}`, updatePayload, { headers: { Authorization: `Bearer ${token}` }});
      enqueueSnackbar('User updated', { variant: 'success' });
      setOpenEditUser(false);
      setEditingUser({ _id: '', name: '', email: '', role: '', department: '', isActive: true, password: '' });
      fetchDashboardData();
    } catch (error) {
      enqueueSnackbar(error.response?.data?.message || 'Error updating user', { variant: 'error' });
    }
  };

  // Reset password for a single user (keeps selection intact)
  const handleResetUser = async (userId) => {
    try {
      await axios.put(`${apiBase}/admin/users/${String(userId)}/reset-password`, { password: 'Password123' }, { headers: { Authorization: `Bearer ${token}` } });
      enqueueSnackbar('Password reset to Password123', { variant: 'success' });
      // Refresh data but do NOT clear selections
      await fetchDashboardData();
    } catch (error) {
      const msg = error?.response?.data?.message || 'Failed to reset password';
      enqueueSnackbar(msg, { variant: 'error' });
    }
  };

  // Bulk reset passwords (keeps selection intact)
  const handleBulkResetUsers = async (ids) => {
    const { ids: userIds } = normalizeUserIds(ids || selectedUsers);
    if (!userIds.length) { enqueueSnackbar('No users selected', { variant: 'warning' }); return; }
    try {
      await axios.put(`${apiBase}/admin/users/reset-password`, { userIds, password: 'Password123' }, { headers: { Authorization: `Bearer ${token}` } });
      enqueueSnackbar(`Passwords reset for ${userIds.length} user(s)`, { variant: 'success' });
      // Refresh data, keep selection array as-is (no uncheck)
      await fetchDashboardData();
    } catch (error) {
      const msg = error?.response?.data?.message || 'Failed to reset passwords';
      enqueueSnackbar(msg, { variant: 'error' });
    }
  };

  // Open confirm dialog for single user
  const confirmDeleteUser = (userId, displayName = '') => {
    const { ids } = normalizeUserIds(userId);
    setConfirmPayload({
      kind: 'single',
      userIds: ids,
      title: 'Delete user',
      message: `Delete ${displayName || 'this user'}? This action cannot be undone.`,
    });
    setConfirmOpen(true);
  };

  // Open confirm dialog for bulk delete
  const confirmBulkDelete = (ids) => {
    const { ids: normIds, skipped } = normalizeUserIds(ids);
    if (skipped.length) {
      console.warn('confirmBulkDelete skipped invalid items:', skipped);
      enqueueSnackbar(`Ignored ${skipped.length} invalid selection item(s).`, { variant: 'warning' });
    }
    setConfirmPayload({
      kind: 'bulk',
      userIds: normIds,
      title: `Delete ${normIds.length} users`,
      message: `Are you sure you want to permanently delete ${normIds.length} user(s)? This cannot be undone.`,
    });
    setConfirmOpen(true);
  };

  // wrappers expected by child components
  const handleDeleteUser = (userId, displayName) => confirmDeleteUser(userId, displayName);
  const handleBulkDeleteUsers = (ids) => confirmBulkDelete(ids || selectedUsers);

  const handleSelectUser = (userId) => {
    const idStr = String((userId && userId._id) ? userId._id : userId);
    setSelectedUsers(prev => prev.includes(idStr) ? prev.filter(id => id !== idStr) : [...prev, idStr]);
  };

  const handleSelectAllUsers = (checked) => {
    if (checked) setSelectedUsers(users.map(u => String(u._id)));
    else setSelectedUsers([]);
  };

  const toggleDrawer = () => setDrawerOpen(prev => !prev);

  // go to dashboard view
  const goHome = () => setActiveTab('dashboard');

  // confirm action handler (performs API call)
  // Replace your existing handleConfirmAction with this improved version:
  const handleConfirmAction = async () => {
    const raw = confirmPayload?.userIds;
    const { ids: userIds, skipped } = normalizeUserIds(raw || []);
    if (skipped && skipped.length) {
      console.warn('Some items were skipped when normalizing userIds:', skipped);
      enqueueSnackbar(`Ignored ${skipped.length} invalid item(s) while preparing delete.`, { variant: 'warning' });
    }
    if (!userIds || userIds.length === 0) {
      enqueueSnackbar('No valid user ids to delete.', { variant: 'warning' });
      setConfirmOpen(false);
      return;
    }

    setConfirmLoading(true);

    const getServerMessage = (err) => {
      try {
        return err?.response?.data?.message || err?.response?.data?.error || err?.message || JSON.stringify(err?.response?.data);
      } catch {
        return String(err);
      }
    };

    try {
      // Try multiple common payload shapes for bulk endpoints
      let bulkSucceeded = false;
      let bulkError = null;
      if (confirmPayload.kind === 'bulk') {
        const bulkPayloads = [ { userIds }, { ids: userIds }, { user_ids: userIds } ];
        for (const payload of bulkPayloads) {
          try {
            await axios.post(`${apiBase}/admin/users/bulk-delete`, payload, { headers: { Authorization: `Bearer ${token}` } });
            bulkSucceeded = true; break;
          } catch (err) {
            bulkError = err; console.warn('bulk-delete attempt failed for payload', payload, err);
          }
        }
      }

      if (bulkSucceeded) {
        enqueueSnackbar(`${userIds.length} user(s) deleted successfully`, { variant: 'success' });
        setSelectedUsers(prev => prev.filter(id => !userIds.includes(String(id))));
        await fetchDashboardData();
        setConfirmOpen(false);
        return;
      }

      if (confirmPayload.kind === 'bulk' && !bulkSucceeded) {
        enqueueSnackbar('Bulk delete failed — attempting individual deletes', { variant: 'warning' });
        if (bulkError) console.error('Bulk delete final error:', getServerMessage(bulkError), bulkError);
      }

      const results = { success: [], failed: [] };
      for (const id of userIds) {
        try {
          await axios.delete(`${apiBase}/admin/users/${id}`, { headers: { Authorization: `Bearer ${token}` } });
          results.success.push(id);
        } catch (err) {
          results.failed.push({ id, message: getServerMessage(err) });
          console.error(`Failed to delete ${id}:`, err);
        }
      }

      if (results.success.length) {
        enqueueSnackbar(`${results.success.length} user(s) deleted`, { variant: 'success' });
        setSelectedUsers(prev => prev.filter(id => !results.success.includes(id)));
      }
      if (results.failed.length) {
        const failedIds = results.failed.map(f => f.id).slice(0, 6).join(', ');
        const more = results.failed.length > 6 ? ` (+${results.failed.length - 6} more)` : '';
        enqueueSnackbar(`Failed to delete: ${failedIds}${more}`, { variant: 'error', persist: true });
        console.error('Sequential delete failures:', results.failed);
      }

      await fetchDashboardData();
      setConfirmOpen(false);
    } catch (err) {
      console.error('Unexpected error in delete flow', err);
      enqueueSnackbar(getServerMessage(err) || 'Error performing delete', { variant: 'error' });
    } finally {
      setConfirmLoading(false);
    }
  };


  // ---------- UI Rendering ----------
  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <Typography variant="h6" color="textSecondary">Loading dashboard...</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: '#f3f7fb' }}>
      {/* App Bar */}
      <AppBar position="fixed" elevation={3} sx={{
        bgcolor: '#ffffff',
        color: '#0f1724',
        zIndex: theme.zIndex.drawer + 2,
        borderBottom: '1px solid rgba(15,23,42,0.06)'
      }}>
        <Toolbar sx={{ minHeight: 72, px: { xs: 2, sm: 3 } }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Box
              sx={{
                width: 48,
                height: 48,
                borderRadius: 2,
                overflow: 'hidden',
                boxShadow: '0 6px 18px rgba(15,23,42,0.06)',
                border: '1px solid rgba(15,23,42,0.04)',
              }}
            >
              <img src="/event_logo.png" alt="Event logo" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
            </Box>
          </Box>

          <Box sx={{ flexGrow: 1, display: 'flex', justifyContent: 'left' }}>
            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <Button
                onClick={goHome}
                startIcon={<HomeIcon />}
                sx={{
                  background: 'linear-gradient(90deg, rgba(233,196,106,0.14), rgba(233,196,106,0.06))',
                  color: '#39707a',
                  px: 3,
                  py: 1,
                  borderRadius: 999,
                  textTransform: 'none',
                  fontWeight: 800,
                  boxShadow: '0 10px 28px rgba(15,23,42,0.06)',
                  border: '1px solid rgba(15,23,42,0.04)'
                }}
              >
                Dashboard
              </Button>
            </motion.div>
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Button variant="outlined" onClick={() => setOpenAddUser(true)} startIcon={<AddIcon />} sx={{ color: '#0f1724', borderColor: 'rgba(15,23,42,0.06)' }}>
              Add User
            </Button>

            <Button variant="text" onClick={() => setOpenBulkUpload(true)} startIcon={<CloudUploadIcon />} sx={{ color: '#0f1724' }}>
              Bulk Upload
            </Button>

            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, ml: 2 }}>
              <Typography variant="body2" sx={{ mr: 1 }}>{adminName}</Typography>
              <Avatar sx={{ width: 36, height: 36, bgcolor: '#e9c46a', color: '#3b2c1a' }}>{adminName.charAt(0)}</Avatar>
              <Button
                onClick={handleLogout}
                variant="contained"
                sx={{ ml: 1, bgcolor: '#0f1724', color: '#fff', borderRadius: 2 }}
              >
                Logout
              </Button>
              <IconButton color="inherit" onClick={toggleDrawer} sx={{ ml: 1 }}>
                {drawerOpen ? <ChevronLeftIcon /> : <MenuIcon />}
              </IconButton>
            </Box>
          </Box>
        </Toolbar>
      </AppBar>

      {/* Drawer */}
      <Drawer
        variant="persistent"
        open={drawerOpen}
        sx={{
          width: drawerOpen ? 220 : 72,
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: drawerOpen ? 220 : 72,
            mt: '72px',
            boxSizing: 'border-box',
            borderRight: 'none',
            background: '#ffffff',
            color: '#0f1724',
            boxShadow: '0 8px 30px rgba(15,23,42,0.04)'
          }
        }}
      >
        <Box sx={{ p: 2, pb: 1 }}>
          <Divider sx={{ borderColor: 'rgba(15,23,42,0.04)', mb: 1 }} />
          <List>
            {NAV_ITEMS.map((item) => (
              <ListItemButton
                key={item.key}
                selected={activeTab === item.key}
                onClick={() => setActiveTab(item.key)}
                sx={{
                  borderRadius: 1,
                  mb: 0.5,
                  px: drawerOpen ? 2 : 1,
                  justifyContent: drawerOpen ? 'flex-start' : 'center',
                  background: activeTab === item.key ? 'rgba(233,196,106,0.08)' : 'transparent'
                }}
              >
                <ListItemIcon sx={{ color: activeTab === item.key ? '#b07f2a' : 'rgba(15,23,42,0.7)', minWidth: 36 }}>
                  {item.icon}
                </ListItemIcon>
                <ListItemText primary={drawerOpen ? item.label : item.label.charAt(0)} sx={{ opacity: drawerOpen ? 1 : 0 }} />
              </ListItemButton>
            ))}
          </List>
        </Box>

        <Box sx={{ flexGrow: 1 }} />

        <Box sx={{ p: 2, display: 'flex', gap: 1, alignItems: 'center', justifyContent: drawerOpen ? 'space-between' : 'center' }}>
          {drawerOpen ? (
            <>
              <Typography variant="caption" sx={{ opacity: 0.6 }}>Logged in as</Typography>
              <Chip label={adminName} size="small" sx={{ bgcolor: 'rgba(15,23,42,0.04)', color: '#0f1724' }} />
            </>
          ) : (
            <Tooltip title={adminName}><Avatar sx={{ width: 36, height: 36, bgcolor: '#e9c46a', color: '#3b2c1a' }}>{adminName.charAt(0)}</Avatar></Tooltip>
          )}
        </Box>
      </Drawer>

      {/* Main content */}
      <Box component="main" sx={{ flexGrow: 1, p: { xs: 2, sm: 3, md: 4 }, mt: '72px' }}>
        <Container maxWidth="xl" sx={{ px: 0 }}>
          {activeTab === 'dashboard' && (
            <Grid container spacing={3} alignItems="stretch" sx={{ mb: 2 }}>
              <Grid item xs={12} md={8}>
                <Box
                  sx={{
                    p: 2,
                    borderRadius: 2,
                    display: 'flex',
                    gap: 2,
                    alignItems: 'stretch',
                    justifyContent: 'space-between',
                    background: 'linear-gradient(180deg, rgba(255,255,255,0.85), rgba(250,250,252,0.85))',
                    border: '1px solid rgba(15,23,42,0.04)',
                    boxShadow: '0 8px 30px rgba(15,23,42,0.04)'
                  }}
                >
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={4}>
                      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.06 }}>
                        <GlassStat>
                          <StatCard title="Events" value={stats.totalEvents ?? 0} subtitle="Total created" />
                        </GlassStat>
                      </motion.div>
                    </Grid>
                    <Grid item xs={12} sm={4}>
                      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.12 }}>
                        <GlassStat>
                          <StatCard title="Users" value={stats.totalUsers ?? users.length} subtitle="Registered" />
                        </GlassStat>
                      </motion.div>
                    </Grid>
                    <Grid item xs={12} sm={4}>
                      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.18 }}>
                        <GlassStat>
                          <StatCard title="Active" value={stats.activeEvents ?? 0} subtitle="Ongoing / Upcoming" />
                        </GlassStat>
                      </motion.div>
                    </Grid>
                  </Grid>
                </Box>
              </Grid>

              <Grid item xs={12} md={4}>
                <Paper elevation={0} sx={{ p: 2, borderRadius: 2, background: '#ffffff', border: '1px solid rgba(15,23,42,0.04)' }}>
                  <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', justifyContent: 'space-between' }}>
                    <Box>
                      <Typography variant="subtitle2" sx={{ opacity: 0.8 }}>Quick Actions</Typography>
                      <Typography variant="caption" sx={{ opacity: 0.7 }}>Add / Upload / Refresh</Typography>
                    </Box>

                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <Tooltip title="Add new user">
                        <Button size="small" startIcon={<AddIcon />} onClick={() => setOpenAddUser(true)} sx={{ textTransform: 'none' }}>Add</Button>
                      </Tooltip>
                      <Tooltip title="Bulk upload users">
                        <Button size="small" startIcon={<CloudUploadIcon />} onClick={() => setOpenBulkUpload(true)} sx={{ textTransform: 'none' }}>Upload</Button>
                      </Tooltip>
                    </Box>
                  </Box>

                  <Divider sx={{ my: 1.5, borderColor: 'rgba(15,23,42,0.04)' }} />
                </Paper>
              </Grid>
            </Grid>
          )}

          <Box sx={{ mt: 2 }}>
            <motion.div key={activeTab} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.28 }}>
              {activeTab === 'dashboard' && (
                <Box>
                  <Typography variant="h6" sx={{ mb: 2 }}>Overview</Typography>
                </Box>
              )}
              {activeTab === 'users' && (
                <UsersView
                  users={users}
                  selectedUsers={selectedUsers}
                  onSelectUser={handleSelectUser}
                  onSelectAll={handleSelectAllUsers}
                  onEditUser={handleEditUser}
                  onDeleteUser={handleDeleteUser}
                  onBulkDelete={handleBulkDeleteUsers}
                  onOpenAddUser={() => setOpenAddUser(true)}
                  onOpenBulkUpload={() => setOpenBulkUpload(true)}
                  onResetUser={handleResetUser}
                  onBulkReset={handleBulkResetUsers}
                />
              )}
              {activeTab === 'events' && <EventsView events={events} />}
              {activeTab === 'event-history' && (
                <EventsHistoryView
                  apiBaseProp={apiBase}
                  token={token}
                  enqueueSnackbar={enqueueSnackbar}
                />
              )}
              {activeTab === 'mail-settings' && <MailSettingsView
                mailForm={mailForm}
                setMailForm={setMailForm}
                mailSettings={mailSettings}
                mailLoading={mailLoading}
                // NOTE: MailSettingsView calls onSave(local) with the form, so accept it
                onSave={async (local) => {
                  if (!local?.fromEmail || !local?.appPassword) {
                    enqueueSnackbar('Email and app password are required', { variant: 'warning' });
                    return;
                  }
                  try {
                    setMailLoading(true);
                    const res = await axios.post(`${apiBase}/auth/admin/mail-settings`, local, { headers: { Authorization: `Bearer ${token}` }});
                    enqueueSnackbar(res.data.message || 'Mail settings saved', { variant: 'success' });
                    fetchMailSettings();
                  } catch (err) {
                    enqueueSnackbar(err.response?.data?.message || 'Unable to save mail settings', { variant: 'error' });
                  } finally {
                    setMailLoading(false);
                  }
                }}
                onRefresh={fetchMailSettings}
              />}
            </motion.div>
          </Box>
        </Container>

        {/* Dialogs */}
        <AddUserDialog open={openAddUser} onClose={() => setOpenAddUser(false)} newUser={newUser} setNewUser={setNewUser} onAdd={handleAddUser} />
        <EditUserDialog open={openEditUser} onClose={() => setOpenEditUser(false)} editingUser={editingUser} setEditingUser={setEditingUser} onUpdate={handleUpdateUser} />
        <BulkUploadDialog open={openBulkUpload} onClose={() => setOpenBulkUpload(false)} selectedFile={selectedFile} setSelectedFile={setSelectedFile} onUpload={handleBulkUpload} onDownloadTemplate={downloadTemplate} />
        <UploadResultsDialog open={showResults} onClose={() => setShowResults(false)} uploadResults={uploadResults} />

        {/* Confirmation Dialog */}
        <Dialog
          open={confirmOpen}
          onClose={() => { if (!confirmLoading) setConfirmOpen(false); }}
          aria-labelledby="confirm-dialog-title"
          aria-describedby="confirm-dialog-description"
          maxWidth="xs"
          fullWidth
        >
          <DialogTitle id="confirm-dialog-title" sx={{ color: 'error.main' }}>
            {confirmPayload.title}
          </DialogTitle>

          <DialogContent dividers>
            <DialogContentText id="confirm-dialog-description" sx={{ mb: 1 }}>
              {confirmPayload.message}
            </DialogContentText>

            {confirmPayload.userIds?.length > 0 && (
              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mt: 1 }}>
                {confirmPayload.userIds.slice(0, 6).map((id) => (
                  <Chip key={id} label={id} size="small" />
                ))}
                {confirmPayload.userIds.length > 6 && <Typography variant="caption">+{confirmPayload.userIds.length - 6} more</Typography>}
              </Box>
            )}
          </DialogContent>

          <DialogActions sx={{ px: 2, py: 1 }}>
            <Button
              onClick={() => setConfirmOpen(false)}
              disabled={confirmLoading}
              color="inherit"
            >
              Cancel
            </Button>

            <Button
              onClick={handleConfirmAction}
              variant="contained"
              color="error"
              disabled={confirmLoading}
              startIcon={confirmLoading ? <CircularProgress size={16} color="inherit" /> : <DeleteIcon />}
            >
              {confirmLoading ? 'Deleting...' : (confirmPayload.kind === 'bulk' ? 'Delete users' : 'Delete user')}
            </Button>
          </DialogActions>
        </Dialog>

        {/* Floating refresh FAB */}
        <Tooltip title="Refresh data">
          <Fab color="primary" sx={{ position: 'fixed', bottom: 20, right: 20 }} onClick={fetchDashboardData}>
            <Refresh />
          </Fab>
        </Tooltip>
      </Box>
    </Box>
  );
};

// small helper glass wrapper for stat cards
function GlassStat({ children }) {
  return (
    <Paper
      elevation={0}
      sx={{
        p: 2,
        borderRadius: 2,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'rgba(255,255,255,0.85)',
        border: '1px solid rgba(15,23,42,0.04)',
        boxShadow: '0 8px 30px rgba(15,23,42,0.04)',
        minHeight: 96
      }}
    >
      {children}
    </Paper>
  );
}

export default AdminDashboard;
