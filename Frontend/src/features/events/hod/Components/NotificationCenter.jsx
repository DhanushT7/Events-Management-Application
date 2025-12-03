import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Typography,
  Paper,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Chip,
  Button,
  Divider,
  Badge,
  Card,
  CardContent,
  Grid,
  useTheme,
  alpha,
  Tabs,
  Tab,
  Menu,
  MenuItem
} from '@mui/material';
import {
  Notifications,
  Event,
  AttachMoney,
  Group,
  CheckCircle,
  Cancel,
  Schedule,
  MoreVert,
  MarkEmailRead,
  Delete,
  FilterList,
  NotificationsActive,
  NotificationsOff,
  PriorityHigh,
  Info,
  Warning,
  Error
} from '@mui/icons-material';
import { useSnackbar } from 'notistack';
import axios from 'axios';

const NotificationCenter = () => {
  const theme = useTheme();
  const { enqueueSnackbar } = useSnackbar();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState(0);
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedNotification, setSelectedNotification] = useState(null);

  // Fetch notifications
  const fetchNotifications = useCallback(async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await axios.get(
        `${import.meta.env.VITE_API_BASE_URL || 'http://10.5.12.1:4000/api'}/hod/notifications`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setNotifications(response.data.notifications || []);
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
      enqueueSnackbar('Failed to fetch notifications', { variant: 'error' });
    } finally {
      setLoading(false);
    }
  }, [enqueueSnackbar]);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  // Get notification icon
  const getNotificationIcon = (type, priority) => {
    const iconProps = { 
      sx: { 
        color: priority === 'high' ? 'error.main' : 
               priority === 'medium' ? 'warning.main' : 'info.main' 
      } 
    };

    switch (type) {
      case 'event_submitted':
      case 'event_updated':
        return <Event {...iconProps} />;
      case 'budget_request':
      case 'finance_update':
        return <AttachMoney {...iconProps} />;
      case 'participant_update':
        return <Group {...iconProps} />;
      case 'approval_required':
        return <Schedule {...iconProps} />;
      case 'system_update':
        return <Info {...iconProps} />;
      default:
        return <Notifications {...iconProps} />;
    }
  };

  // Get priority color
  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'error';
      case 'medium': return 'warning';
      case 'low': return 'info';
      default: return 'default';
    }
  };

  // Format relative time
  const formatRelativeTime = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMs = now - date;
    const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
    const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInHours < 24) return `${diffInHours}h ago`;
    if (diffInDays < 7) return `${diffInDays}d ago`;
    return date.toLocaleDateString();
  };

  // Mark notification as read
  const markAsRead = async (notificationId) => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(
        `${import.meta.env.VITE_API_BASE_URL || 'http://10.5.12.1:4000/api'}/hod/notifications/${notificationId}/read`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      setNotifications(prev => 
        prev.map(notif => 
          notif._id === notificationId 
            ? { ...notif, read: true }
            : notif
        )
      );
      enqueueSnackbar('Notification marked as read', { variant: 'success' });
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
      enqueueSnackbar('Failed to mark notification as read', { variant: 'error' });
    }
  };

  // Delete notification
  const deleteNotification = async (notificationId) => {
    try {
      const token = localStorage.getItem('token');
      await axios.delete(
        `${import.meta.env.VITE_API_BASE_URL || 'http://10.5.12.1:4000/api'}/hod/notifications/${notificationId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      setNotifications(prev => prev.filter(notif => notif._id !== notificationId));
      enqueueSnackbar('Notification deleted', { variant: 'success' });
    } catch (error) {
      console.error('Failed to delete notification:', error);
      enqueueSnackbar('Failed to delete notification', { variant: 'error' });
    }
  };

  // Mark all as read
  const markAllAsRead = async () => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(
        'http://10.5.12.1:4000/api/hod/notifications/mark-all-read',
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      setNotifications(prev => prev.map(notif => ({ ...notif, read: true })));
      enqueueSnackbar('All notifications marked as read', { variant: 'success' });
    } catch (error) {
      console.error('Failed to mark all notifications as read:', error);
      enqueueSnackbar('Failed to mark all notifications as read', { variant: 'error' });
    }
  };

  // Filter notifications based on active tab
  const filteredNotifications = notifications.filter(notif => {
    switch (activeTab) {
      case 0: return true; // All
      case 1: return !notif.read; // Unread
      case 2: return notif.priority === 'high'; // High Priority
      case 3: return notif.type === 'approval_required'; // Approvals
      default: return true;
    }
  });

  // Get notification stats
  const notificationStats = {
    total: notifications.length,
    unread: notifications.filter(n => !n.read).length,
    highPriority: notifications.filter(n => n.priority === 'high').length,
    approvals: notifications.filter(n => n.type === 'approval_required').length
  };

  // Handle menu actions
  const handleMenuClick = (event, notification) => {
    setAnchorEl(event.currentTarget);
    setSelectedNotification(notification);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedNotification(null);
  };

  return (
    <Box sx={{ p: 3, maxWidth: '1200px', mx: 'auto' }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: 600, mb: 1 }}>
          Notification Center
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Stay updated with important events, approvals, and system notifications
        </Typography>
      </Box>

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Badge badgeContent={notificationStats.total} color="primary" max={99}>
                <Notifications sx={{ fontSize: 40, color: 'primary.main', mb: 1 }} />
              </Badge>
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                Total
              </Typography>
              <Typography variant="body2" color="text.secondary">
                All notifications
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Badge badgeContent={notificationStats.unread} color="error" max={99}>
                <NotificationsActive sx={{ fontSize: 40, color: 'warning.main', mb: 1 }} />
              </Badge>
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                Unread
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Require attention
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Badge badgeContent={notificationStats.highPriority} color="error" max={99}>
                <PriorityHigh sx={{ fontSize: 40, color: 'error.main', mb: 1 }} />
              </Badge>
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                High Priority
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Urgent items
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Badge badgeContent={notificationStats.approvals} color="warning" max={99}>
                <Schedule sx={{ fontSize: 40, color: 'info.main', mb: 1 }} />
              </Badge>
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                Approvals
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Pending decisions
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Main Content */}
      <Paper sx={{ borderRadius: 2 }}>
        {/* Tabs and Actions */}
        <Box sx={{ p: 3, pb: 0 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Tabs value={activeTab} onChange={(e, newValue) => setActiveTab(newValue)}>
              <Tab label={`All (${notificationStats.total})`} />
              <Tab label={`Unread (${notificationStats.unread})`} />
              <Tab label={`High Priority (${notificationStats.highPriority})`} />
              <Tab label={`Approvals (${notificationStats.approvals})`} />
            </Tabs>
            
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Button
                variant="outlined"
                size="small"
                startIcon={<MarkEmailRead />}
                onClick={markAllAsRead}
                disabled={notificationStats.unread === 0}
              >
                Mark All Read
              </Button>
              <Button
                variant="outlined"
                size="small"
                startIcon={<FilterList />}
                onClick={fetchNotifications}
              >
                Refresh
              </Button>
            </Box>
          </Box>
        </Box>

        {/* Notifications List */}
        <Box sx={{ maxHeight: '600px', overflow: 'auto' }}>
          {filteredNotifications.length > 0 ? (
            <List sx={{ p: 0 }}>
              {filteredNotifications.map((notification, index) => (
                <React.Fragment key={notification._id}>
                  <ListItem
                    sx={{
                      backgroundColor: notification.read 
                        ? 'transparent' 
                        : alpha(theme.palette.primary.main, 0.05),
                      '&:hover': {
                        backgroundColor: alpha(theme.palette.primary.main, 0.08)
                      }
                    }}
                  >
                    <ListItemIcon>
                      {getNotificationIcon(notification.type, notification.priority)}
                    </ListItemIcon>
                    
                    <ListItemText
                      primary={
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Typography 
                            variant="body1" 
                            sx={{ 
                              fontWeight: notification.read ? 400 : 600,
                              flex: 1
                            }}
                          >
                            {notification.title}
                          </Typography>
                          <Chip 
                            size="small" 
                            label={notification.priority} 
                            color={getPriorityColor(notification.priority)}
                            variant="outlined"
                          />
                        </Box>
                      }
                      secondary={
                        <Box sx={{ mt: 0.5 }}>
                          <Typography variant="body2" color="text.secondary">
                            {notification.message}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {formatRelativeTime(notification.createdAt)}
                          </Typography>
                        </Box>
                      }
                    />
                    
                    <ListItemSecondaryAction>
                      <IconButton
                        edge="end"
                        onClick={(e) => handleMenuClick(e, notification)}
                      >
                        <MoreVert />
                      </IconButton>
                    </ListItemSecondaryAction>
                  </ListItem>
                  
                  {index < filteredNotifications.length - 1 && <Divider />}
                </React.Fragment>
              ))}
            </List>
          ) : (
            <Box sx={{ textAlign: 'center', py: 8 }}>
              <NotificationsOff sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
              <Typography variant="h6" color="text.secondary" sx={{ mb: 1 }}>
                No notifications found
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {activeTab === 1 ? 'All notifications have been read' : 
                 activeTab === 2 ? 'No high priority notifications' :
                 activeTab === 3 ? 'No pending approvals' :
                 'You\'re all caught up!'}
              </Typography>
            </Box>
          )}
        </Box>
      </Paper>

      {/* Context Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        {selectedNotification && !selectedNotification.read && (
          <MenuItem 
            onClick={() => {
              markAsRead(selectedNotification._id);
              handleMenuClose();
            }}
          >
            <ListItemIcon>
              <MarkEmailRead fontSize="small" />
            </ListItemIcon>
            <ListItemText>Mark as Read</ListItemText>
          </MenuItem>
        )}
        
        <MenuItem 
          onClick={() => {
            deleteNotification(selectedNotification._id);
            handleMenuClose();
          }}
        >
          <ListItemIcon>
            <Delete fontSize="small" />
          </ListItemIcon>
          <ListItemText>Delete</ListItemText>
        </MenuItem>
      </Menu>
    </Box>
  );
};

export default NotificationCenter;