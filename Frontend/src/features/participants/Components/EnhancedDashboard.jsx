// EnhancedParticipantDashboard.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Drawer,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  CssBaseline,
  Box,
  Button,
  Divider,
  Avatar,
  Badge,
  Tooltip,
  Grid,
  Paper,
  FormControlLabel,
  Switch,
  Fade,
  ThemeProvider,
  createTheme
} from '@mui/material';
import {
  Menu as MenuIcon,
  Logout as LogoutIcon,
  Event as EventIcon,
  Dashboard as DashboardIcon,
  Assignment as AssignmentIcon,
  Feedback as FeedbackIcon,
  EmojiEvents as EmojiEventsIcon,
  Person as PersonIcon,
  LightMode as LightModeIcon,
  DarkMode as DarkModeIcon,
  Refresh as RefreshIcon,
  Notifications as NotificationsIcon
} from '@mui/icons-material';

import EnhancedDashboardHome from './EnhancedDashboardHome';
import EnhancedEventsList from './EnhancedEventsList';
import EnhancedMyEvents from './EnhancedMyEvents';
import EnhancedFeedbackPortal from './EnhancedFeedbackPortal';
import EnhancedCertificates from './EnhancedCertificates';
import EnhancedProfile from './EnhancedProfile';
//import EnhancedNotifications from './EnhancedNotifications';

const drawerWidth = 280;

const EnhancedParticipantDashboard = () => {
  const navigate = useNavigate();

  // view state and animations
  const [view, setView] = useState('dashboard');
  const [fadeIn, setFadeIn] = useState(true);

  // UI state
  const [drawerOpen, setDrawerOpen] = useState(true);
  const [darkMode, setDarkMode] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0);

  // data state
  //const [notifications, setNotifications] = useState([]);
  const [userStats, setUserStats] = useState({
    totalEvents: 0,
    attendedEvents: 0,
    certificates: 0,
    pendingFeedback: 0
  });

  // user info
  const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}');
  const userName = userInfo.name || 'Participant';
  const userEmail = userInfo.email || '';
  const participantId = userInfo._id;

  // dynamic theme
  const theme = createTheme({
    palette: {
      mode: darkMode ? 'dark' : 'light',
      primary: {
        main: darkMode ? '#90caf9' : '#1976d2',
      },
      secondary: {
        main: darkMode ? '#f48fb1' : '#dc004e',
      },
      background: {
        default: darkMode ? '#0a0a0a' : '#f5f5f5',
        paper: darkMode ? '#1a1a1a' : '#ffffff',
      },
    },
    components: {
      MuiCard: {
        styleOverrides: {
          root: {
            backdropFilter: 'blur(10px)',
            background: darkMode
              ? 'rgba(26, 26, 26, 0.8)'
              : 'rgba(255, 255, 255, 0.9)',
            border: `1px solid ${darkMode ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)'}`,
          },
        },
      },
      MuiDrawer: {
        styleOverrides: {
          paper: {
            backdropFilter: 'blur(12px)',
            background: darkMode
              ? 'rgba(18,18,18,0.95)'
              : 'rgba(255,255,255,0.95)',
          },
        },
      },
      MuiAppBar: {
        styleOverrides: {
          root: {
            backdropFilter: 'blur(8px)',
            background: darkMode
              ? 'rgba(26, 26, 26, 0.95)'
              : 'rgba(255, 255, 255, 0.95)',
          },
        },
      },
    },
  });

  const menuItems = [
    { label: 'Dashboard', icon: <DashboardIcon />, view: 'dashboard', description: 'Overview and statistics' },
    { label: 'Browse Events', icon: <EventIcon />, view: 'events', description: 'Discover and register for events' },
    { label: 'My Events', icon: <AssignmentIcon />, view: 'myevents', description: 'Track your registrations' },
    { label: 'Feedback Portal', icon: <FeedbackIcon />, view: 'feedback', description: 'Submit feedback for attended events', badge: userStats.pendingFeedback },
    { label: 'My Certificates', icon: <EmojiEventsIcon />, view: 'certificates', description: 'Download your certificates', badge: userStats.certificates },
    { label: 'Profile', icon: <PersonIcon />, view: 'profile', description: 'Manage your profile' }
  ];

  // Fetch user stats (events, certificates, etc.)
  const fetchUserStats = async () => {
    try {
      const token = localStorage.getItem('token');
      let totalEvents = 0;
      let attendedEvents = 0;
      let pendingFeedback = 0;
      let certificates = 0;

      // fetch all approved events (optional, depends on your API)
      const eventsResp = await fetch(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000/api'}/participant/events`, {
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      });
      if (eventsResp.ok) {
        const ev = await eventsResp.json();
        if (Array.isArray(ev)) totalEvents = ev.length;
        else totalEvents = ev.total || ev.length || 0;
      }

      // fetch participant's registrations
      if (participantId) {
        const myResp = await fetch(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000/api'}/participant/my-events/${participantId}`, {
          headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        });
        if (myResp.ok) {
          const myEvents = await myResp.json();
          attendedEvents = Array.isArray(myEvents) ? myEvents.filter(e => e.attended).length : 0;
          pendingFeedback = Array.isArray(myEvents) ? myEvents.filter(e => e.attended && !e.feedbackGiven).length : 0;
        }

        // fetch certificates
        const certResp = await fetch(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000/api'}/participant/certificates/${participantId}`, {
          headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        });
        if (certResp.ok) {
          const certData = await certResp.json();
          if (certData && certData.success && Array.isArray(certData.data)) certificates = certData.data.length;
          else if (Array.isArray(certData)) certificates = certData.length;
        }
      }

      setUserStats({ totalEvents, attendedEvents, certificates, pendingFeedback });
    } catch (err) {
      // keep silent; optionally show toast
      // console.error('fetchUserStats error', err);
    }
  };

 /* // Fetch notifications
  const fetchNotifications = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!participantId) return;
      const resp = await fetch(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000/api'}/participant/notifications/${participantId}`, {
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      });
      if (resp.ok) {
        const data = await resp.json();
        const unread = Array.isArray(data) ? data.filter(n => !n.read) : [];
        setNotifications(unread);
      }
    } catch (err) {
      // console.error('fetchNotifications error', err);
    }
  };
*/
  // refresh wrapper
  const refreshData = () => {
    setRefreshKey(prev => prev + 1);
    fetchUserStats();
    //fetchNotifications();
  };

  useEffect(() => {
    if (participantId) {
      fetchUserStats();
      //fetchNotifications();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [participantId]);

  // auto refresh on focus
  useEffect(() => {
    const onFocus = () => refreshData();
    window.addEventListener('focus', onFocus);
    return () => window.removeEventListener('focus', onFocus);
  }, []);

  // view routing with a small fade transition
  const handleViewChange = (newView) => {
    if (newView === view) return;
    setFadeIn(false);
    setTimeout(() => {
      setView(newView);
      setFadeIn(true);
    }, 180);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userInfo');
    navigate('/');
  };

  const viewComponents = {
    dashboard: <EnhancedDashboardHome key={`dashboard-${refreshKey}`} userStats={userStats} onRefresh={refreshData} onNavigate={handleViewChange} />,
    events: <EnhancedEventsList key={`events-${refreshKey}`} onDataChange={refreshData} />,
    myevents: <EnhancedMyEvents key={`myevents-${refreshKey}`} onDataChange={refreshData} />,
    feedback: <EnhancedFeedbackPortal key={`feedback-${refreshKey}`} onDataChange={refreshData} />,
    certificates: <EnhancedCertificates key={`certificates-${refreshKey}`} onDataChange={refreshData} />,
    profile: <EnhancedProfile key={`profile-${refreshKey}`} onDataChange={refreshData} />,
   // notifications: <EnhancedNotifications key={`notifications-${refreshKey}`} notifications={notifications} onDataChange={refreshData} />
  };

  return (
    <ThemeProvider theme={theme}>
      <Box sx={{ display: 'flex', minHeight: '100vh' }}>
        <CssBaseline />

        {/* Drawer */}
        <Drawer
          variant="permanent"
          anchor="left"
          open={drawerOpen}
          sx={{
            width: drawerOpen ? drawerWidth : 64,
            '& .MuiDrawer-paper': {
              width: drawerOpen ? drawerWidth : 64,
              boxSizing: 'border-box',
              transition: 'width 0.25s ease',
              overflowX: 'hidden',
              borderRight: 'none',
            },
          }}
        >
          <Box sx={{ p: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            {drawerOpen && <Typography variant="h6" sx={{ fontWeight: 'bold' }}>Participant Portal</Typography>}
            <IconButton onClick={() => setDrawerOpen(v => !v)}>
              <MenuIcon />
            </IconButton>
          </Box>

          <Divider />

          {/* User info */}
          {drawerOpen && (
            <Box sx={{ p: 2, textAlign: 'center' }}>
              <Avatar sx={{ width: 60, height: 60, mx: 'auto', mb: 1 }}>{(userName || 'P').charAt(0).toUpperCase()}</Avatar>
              <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>{userName}</Typography>
              <Typography variant="caption" color="text.secondary">{userEmail}</Typography>

              <Grid container spacing={1} sx={{ mt: 2 }}>
                <Grid item xs={6}>
                  <Paper sx={{ p: 1, textAlign: 'center' }}>
                    <Typography variant="h6" color="primary">{userStats.totalEvents}</Typography>
                    <Typography variant="caption">Events</Typography>
                  </Paper>
                </Grid>
                <Grid item xs={6}>
                  <Paper sx={{ p: 1, textAlign: 'center' }}>
                    <Typography variant="h6" color="success.main">{userStats.certificates}</Typography>
                    <Typography variant="caption">Certificates</Typography>
                  </Paper>
                </Grid>
              </Grid>
            </Box>
          )}

          <Divider />

          {/* Menu */}
          <List sx={{ flexGrow: 1, px: 1 }}>
            {menuItems.map(item => (
              <Tooltip key={item.label} title={!drawerOpen ? item.description : ''} placement="right">
                <ListItemButton
                  onClick={() => handleViewChange(item.view)}
                  selected={view === item.view}
                  sx={{
                    borderRadius: 2,
                    mb: 0.5,
                    '&.Mui-selected': { bgcolor: 'primary.main', color: 'primary.contrastText' },
                    '&:hover': { transform: 'translateX(6px)' }
                  }}
                >
                  <ListItemIcon sx={{ minWidth: 40, color: view === item.view ? 'inherit' : 'text.primary' }}>
                    <Badge badgeContent={item.badge || 0} color="error">{item.icon}</Badge>
                  </ListItemIcon>
                  {drawerOpen && <ListItemText primary={item.label} secondary={item.description} />}
                </ListItemButton>
              </Tooltip>
            ))}
          </List>

          {drawerOpen && (
            <Box sx={{ p: 2 }}>
              <FormControlLabel
                control={<Switch checked={darkMode} onChange={(e) => setDarkMode(e.target.checked)} />}
                label={darkMode ? <><DarkModeIcon fontSize="small" /> Dark</> : <><LightModeIcon fontSize="small" /> Light</>}
              />
            </Box>
          )}
        </Drawer>

        {/* Main area */}
        <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
          <AppBar position="fixed"
            sx={{
              ml: drawerOpen ? `${drawerWidth}px` : '64px',
              width: drawerOpen ? `calc(100% - ${drawerWidth}px)` : 'calc(100% - 64px)',
              transition: 'margin-left 0.25s ease, width 0.25s ease',
              zIndex: (theme) => theme.zIndex.drawer + 1
            }}>
            <Toolbar>
              <Typography variant="h6" sx={{ flexGrow: 1, fontWeight: 'bold' }}>
                {menuItems.find(m => m.view === view)?.label || 'Participant Portal'}
              </Typography>

              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Tooltip title="Refresh">
                  <IconButton color="inherit" onClick={refreshData}>
                    <RefreshIcon />
                  </IconButton>
                </Tooltip>

                

                <Tooltip title="Profile">
                  <IconButton onClick={() => handleViewChange('profile')}>
                    <Avatar sx={{ width: 32, height: 32 }}>{(userName || 'P').charAt(0).toUpperCase()}</Avatar>
                  </IconButton>
                </Tooltip>

                <Button color="inherit" variant="outlined" onClick={handleLogout} startIcon={<LogoutIcon />}>Logout</Button>
              </Box>
            </Toolbar>
          </AppBar>

          <Box component="main" sx={{ flexGrow: 1, p: 3, mt: 8 }}>
            <Fade in={fadeIn} timeout={240}>
              <Box>
                {viewComponents[view]}
              </Box>
            </Fade>
          </Box>
        </Box>
      </Box>
    </ThemeProvider>
  );
};

export default EnhancedParticipantDashboard;
