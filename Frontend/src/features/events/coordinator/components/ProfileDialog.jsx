import React, { useState, useEffect, useCallback, useMemo, memo } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
  Button,
  Box,
  useTheme,
  alpha,
  Grid,
  TextField,
  Avatar,
  Paper,
  IconButton,
  LinearProgress
} from '@mui/material';
import {
  Person,
  Edit,
  Save,
  Cancel,
  Email,
  Phone,
  Business,
  Work,
  LocationOn,
  CalendarToday,
  Badge,
  Lock,
  Visibility,
  VisibilityOff
} from '@mui/icons-material';
import { eventState } from '../../../../shared/context/eventProvider';
import { useSnackbar } from 'notistack';
import axios from 'axios';

// Memoized input field component
const OptimizedTextField = memo(({ 
  label, 
  value, 
  onChange, 
  disabled, 
  icon: Icon, 
  type = 'text',
  multiline = false,
  rows = 1,
  placeholder = '',
  ...props 
}) => (
  <TextField
    fullWidth
    label={label}
    value={value || ''}
    onChange={onChange}
    disabled={disabled}
    type={type}
    multiline={multiline}
    rows={rows}
    placeholder={placeholder}
    InputProps={{
      startAdornment: Icon ? <Icon sx={{ mr: 1, color: 'text.secondary' }} /> : null
    }}
    InputLabelProps={type === 'date' ? { shrink: true } : undefined}
    {...props}
  />
));

const ProfileDialog = ({ open, onClose }) => {
  const theme = useTheme();
  const { user, setUser } = eventState();
  const { enqueueSnackbar } = useSnackbar();
  
  const [editMode, setEditMode] = useState(false);
  const [loading, setLoading] = useState(false);
  const [changePasswordMode, setChangePasswordMode] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [profileData, setProfileData] = useState({
    name: '',
    email: '',
    phone: '',
    designation: '',
    department: '',
    employeeId: '',
    joiningDate: '',
    address: '',
    bio: '',
    specializations: [],
    qualifications: []
  });
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  // Initialize profile data when dialog opens
  useEffect(() => {
    if (user && open) {
      setProfileData({
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || '',
        designation: user.designation || '',
        department: user.department || 'DEPARTMENT OF COMPUTER SCIENCE AND ENGINEERING (DCSE)',
        employeeId: user.employeeId || '',
        joiningDate: user.joiningDate || '',
        address: user.address || '',
        bio: user.bio || '',
        specializations: user.specializations || [],
        qualifications: user.qualifications || []
      });
    }
  }, [user, open]);

  // Optimized input change handler
  const handleInputChange = useCallback((event) => {
    const { name, value } = event.target;
    setProfileData(prev => ({
      ...prev,
      [name]: value
    }));
  }, []);

  // Password change handlers
  const handlePasswordInputChange = useCallback((event) => {
    const { name, value } = event.target;
    setPasswordData(prev => ({
      ...prev,
      [name]: value
    }));
  }, []);

  const handleChangePassword = useCallback(async () => {
    try {
      setPasswordLoading(true);
      const token = localStorage.getItem('token');
      
      if (!passwordData.currentPassword || !passwordData.newPassword || !passwordData.confirmPassword) {
        enqueueSnackbar('All password fields are required', { variant: 'error' });
        return;
      }

      if (passwordData.newPassword !== passwordData.confirmPassword) {
        enqueueSnackbar('New password and confirm password do not match', { variant: 'error' });
        return;
      }

      if (passwordData.newPassword.length < 6) {
        enqueueSnackbar('New password must be at least 6 characters long', { variant: 'error' });
        return;
      }

      const response = await axios.put(
        `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000/api'}/coordinator/change-password`,
        {
          currentPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword
        },
        {
          headers: { 
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.data.success) {
        setPasswordData({
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        });
        setChangePasswordMode(false);
        enqueueSnackbar('Password changed successfully!', { variant: 'success' });
      } else {
        throw new Error(response.data.message || 'Failed to change password');
      }
    } catch (error) {
      let errorMessage = 'Failed to change password';
      
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      enqueueSnackbar(errorMessage, { variant: 'error' });
    } finally {
      setPasswordLoading(false);
    }
  }, [passwordData, enqueueSnackbar]);

  const toggleChangePasswordMode = useCallback(() => {
    setChangePasswordMode(prev => !prev);
    setPasswordData({
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    });
  }, []);

  // Memoized save profile handler
  const handleSaveProfile = useCallback(async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      // Validate required fields
      if (!profileData.name || !profileData.email) {
        enqueueSnackbar('Name and email are required fields', { variant: 'error' });
        return;
      }

      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(profileData.email)) {
        enqueueSnackbar('Please enter a valid email address', { variant: 'error' });
        return;
      }

      const response = await axios.put(
        `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000/api'}/coordinator/profile`,
        profileData,
        {
          headers: { 
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.data.success) {
        setUser(response.data.user);
        setEditMode(false);
        enqueueSnackbar('Profile updated successfully!', { variant: 'success' });
      } else {
        throw new Error(response.data.message || 'Failed to update profile');
      }
    } catch (error) {
      let errorMessage = 'Failed to update profile';
      
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.response?.data?.details) {
        errorMessage = error.response.data.details.map(d => d.message).join(', ');
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      enqueueSnackbar(errorMessage, { variant: 'error' });
    } finally {
      setLoading(false);
    }
  }, [profileData, setUser, enqueueSnackbar]);

  // Memoized handlers
  const toggleEditMode = useCallback(() => {
    setEditMode(prev => !prev);
  }, []);

  // Memoized basic info fields
  const basicInfoFields = useMemo(() => (
    <Grid container spacing={2}>
      <Grid item xs={12} md={6}>
        <OptimizedTextField
          name="name"
          label="Full Name"
          value={profileData.name}
          onChange={handleInputChange}
          disabled={!editMode}
          icon={Person}
        />
      </Grid>
      <Grid item xs={12} md={6}>
        <OptimizedTextField
          name="email"
          label="Email Address"
          value={profileData.email}
          onChange={handleInputChange}
          disabled={!editMode}
          icon={Email}
        />
      </Grid>
      <Grid item xs={12} md={6}>
        <OptimizedTextField
          name="phone"
          label="Phone Number"
          value={profileData.phone}
          onChange={handleInputChange}
          disabled={!editMode}
          icon={Phone}
        />
      </Grid>
      <Grid item xs={12} md={6}>
        <OptimizedTextField
          name="employeeId"
          label="Employee ID"
          value={profileData.employeeId}
          onChange={handleInputChange}
          disabled={!editMode}
          icon={Badge}
        />
      </Grid>
    </Grid>
  ), [profileData.name, profileData.email, profileData.phone, profileData.employeeId, editMode, handleInputChange]);

  // Memoized professional info fields
  const professionalInfoFields = useMemo(() => (
    <Grid container spacing={2}>
      <Grid item xs={12} md={6}>
        <OptimizedTextField
          name="designation"
          label="Designation"
          value={profileData.designation}
          onChange={handleInputChange}
          disabled={!editMode}
          icon={Work}
        />
      </Grid>
      <Grid item xs={12} md={6}>
        <OptimizedTextField
          name="department"
          label="Department"
          value={profileData.department}
          onChange={handleInputChange}
          disabled={!editMode}
          icon={Business}
        />
      </Grid>
      <Grid item xs={12} md={6}>
        <OptimizedTextField
          name="joiningDate"
          label="Joining Date"
          type="date"
          value={profileData.joiningDate}
          onChange={handleInputChange}
          disabled={!editMode}
          icon={CalendarToday}
        />
      </Grid>
      <Grid item xs={12} md={6}>
        <OptimizedTextField
          name="address"
          label="Address"
          value={profileData.address}
          onChange={handleInputChange}
          disabled={!editMode}
          icon={LocationOn}
        />
      </Grid>
      <Grid item xs={12}>
        <OptimizedTextField
          name="bio"
          label="Bio / About"
          value={profileData.bio}
          onChange={handleInputChange}
          disabled={!editMode}
          multiline
          rows={3}
          placeholder="Tell us about yourself, your expertise, and interests..."
        />
      </Grid>
    </Grid>
  ), [profileData.designation, profileData.department, profileData.joiningDate, profileData.address, profileData.bio, editMode, handleInputChange]);

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 3,
          minHeight: '70vh'
        }
      }}
    >
      <DialogTitle 
        sx={{ 
          borderBottom: `1px solid ${theme.palette.divider}`,
          py: 3,
          background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.05)} 0%, ${alpha(theme.palette.primary.main, 0.02)} 100%)`
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Avatar 
            sx={{ 
              width: 60, 
              height: 60,
              backgroundColor: theme.palette.primary.main,
              fontSize: '1.5rem',
              fontWeight: 600
            }}
          >
            {user?.name?.charAt(0)?.toUpperCase() || 'C'}
          </Avatar>
          <Box sx={{ flex: 1 }}>
            <Typography variant="h5" component="div" sx={{ fontWeight: 600, mb: 0.5 }}>
              {editMode ? 'Edit Profile' : 'Coordinator Profile'}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Manage your personal information
            </Typography>
          </Box>
          <IconButton
            onClick={toggleEditMode}
            color="primary"
            sx={{
              backgroundColor: alpha(theme.palette.primary.main, 0.1),
              '&:hover': {
                backgroundColor: alpha(theme.palette.primary.main, 0.2)
              }
            }}
          >
            {editMode ? <Cancel /> : <Edit />}
          </IconButton>
        </Box>
      </DialogTitle>

      <DialogContent sx={{ p: 3 }}>
        <Grid container spacing={3}>
          {/* Basic Information */}
          <Grid item xs={12}>
            <Paper sx={{ p: 3, borderRadius: 2 }}>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                <Person color="primary" />
                Basic Information
              </Typography>
              {basicInfoFields}
            </Paper>
          </Grid>

          {/* Professional Information */}
          <Grid item xs={12}>
            <Paper sx={{ p: 3, borderRadius: 2 }}>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                <Work color="primary" />
                Professional Information
              </Typography>
              {professionalInfoFields}
            </Paper>
          </Grid>

          {/* Change Password Section */}
          <Grid item xs={12}>
            <Paper sx={{ p: 3, borderRadius: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                <Typography variant="h6" sx={{ fontWeight: 600, display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Lock color="primary" />
                  Security Settings
                </Typography>
                <Button
                  onClick={toggleChangePasswordMode}
                  variant={changePasswordMode ? "outlined" : "contained"}
                  startIcon={changePasswordMode ? <Cancel /> : <Lock />}
                  sx={{ 
                    borderRadius: 2,
                    textTransform: 'none'
                  }}
                >
                  {changePasswordMode ? 'Cancel' : 'Change Password'}
                </Button>
              </Box>

              {changePasswordMode && (
                <Grid container spacing={2}>
                  <Grid item xs={12} md={4}>
                    <TextField
                      fullWidth
                      name="currentPassword"
                      label="Current Password"
                      type={showCurrentPassword ? 'text' : 'password'}
                      value={passwordData.currentPassword}
                      onChange={handlePasswordInputChange}
                      InputProps={{
                        startAdornment: <Lock sx={{ mr: 1, color: 'text.secondary' }} />,
                        endAdornment: (
                          <IconButton
                            onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                            edge="end"
                          >
                            {showCurrentPassword ? <VisibilityOff /> : <Visibility />}
                          </IconButton>
                        )
                      }}
                    />
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <TextField
                      fullWidth
                      name="newPassword"
                      label="New Password"
                      type={showNewPassword ? 'text' : 'password'}
                      value={passwordData.newPassword}
                      onChange={handlePasswordInputChange}
                      InputProps={{
                        startAdornment: <Lock sx={{ mr: 1, color: 'text.secondary' }} />,
                        endAdornment: (
                          <IconButton
                            onClick={() => setShowNewPassword(!showNewPassword)}
                            edge="end"
                          >
                            {showNewPassword ? <VisibilityOff /> : <Visibility />}
                          </IconButton>
                        )
                      }}
                    />
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <TextField
                      fullWidth
                      name="confirmPassword"
                      label="Confirm New Password"
                      type={showConfirmPassword ? 'text' : 'password'}
                      value={passwordData.confirmPassword}
                      onChange={handlePasswordInputChange}
                      InputProps={{
                        startAdornment: <Lock sx={{ mr: 1, color: 'text.secondary' }} />,
                        endAdornment: (
                          <IconButton
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            edge="end"
                          >
                            {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                          </IconButton>
                        )
                      }}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
                      <Button
                        onClick={toggleChangePasswordMode}
                        variant="outlined"
                        sx={{ 
                          borderRadius: 2,
                          px: 3,
                          textTransform: 'none'
                        }}
                      >
                        Cancel
                      </Button>
                      <Button
                        onClick={handleChangePassword}
                        variant="contained"
                        disabled={passwordLoading}
                        startIcon={passwordLoading ? <LinearProgress size={20} /> : <Save />}
                        sx={{ 
                          borderRadius: 2,
                          px: 4,
                          textTransform: 'none',
                          fontWeight: 600
                        }}
                      >
                        {passwordLoading ? 'Changing...' : 'Change Password'}
                      </Button>
                    </Box>
                  </Grid>
                </Grid>
              )}

              {!changePasswordMode && (
                <Typography variant="body2" color="text.secondary">
                  Keep your account secure by regularly updating your password.
                </Typography>
              )}
            </Paper>
          </Grid>
        </Grid>
      </DialogContent>

      <DialogActions 
        sx={{ 
          p: 3, 
          borderTop: `1px solid ${theme.palette.divider}`,
          background: alpha(theme.palette.background.default, 0.5),
          gap: 2
        }}
      >
        <Button 
          onClick={onClose}
          sx={{ 
            borderRadius: 2,
            px: 3,
            textTransform: 'none'
          }}
        >
          Close
        </Button>
        
        {editMode && (
          <>
            <Button
              onClick={toggleEditMode}
              variant="outlined"
              sx={{ 
                borderRadius: 2,
                px: 3,
                textTransform: 'none'
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSaveProfile}
              variant="contained"
              disabled={loading}
              startIcon={loading ? <LinearProgress size={20} /> : <Save />}
              sx={{ 
                borderRadius: 2,
                px: 4,
                textTransform: 'none',
                fontWeight: 600
              }}
            >
              {loading ? 'Saving...' : 'Save Changes'}
            </Button>
          </>
        )}
      </DialogActions>
    </Dialog>
  );
};

export default ProfileDialog;