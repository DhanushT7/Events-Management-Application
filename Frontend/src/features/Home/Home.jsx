import React, { useEffect, useState } from 'react';
import {
  AppBar,
  Avatar,
  Box,
  Button,
  Card,
  CardActionArea,
  Chip,
  Container,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  Fab,
  Grid,
  IconButton,
  InputBase,
  Slide,
  Stack,
  Toolbar,
  Typography,
} from '@mui/material';
import {
  ArrowForward,
  CloudDownload,
  Description,
  Groups,
  KeyboardArrowUp,
  Menu,
  ReceiptLong,
  Shield,
  UploadFile,
} from '@mui/icons-material';
import CloseIcon from '@mui/icons-material/Close';
import SearchIcon from '@mui/icons-material/Search';
import VisibilityIcon from '@mui/icons-material/Visibility';
import GroupsIcon from '@mui/icons-material/Groups';
import { useNavigate } from 'react-router-dom';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import EventsPreview from './EventsPreview';

import DashboardGuide from './DashboardGuide';
import Footer from '../../shared/components/Footer';

import { motion } from 'framer-motion';
import { CircularProgress } from '@mui/material';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import SupervisorAccountIcon from '@mui/icons-material/SupervisorAccount';
import EngineeringIcon from '@mui/icons-material/Engineering';
import HowToRegIcon from '@mui/icons-material/HowToReg';


const roleConfigs = {
  admin: {
    label: 'Admin',
    color: '#8e2b2b', // burgundy
    icon: <AdminPanelSettingsIcon />,
    route: '/login/admin',
  },
  hod: {
    label: 'HOD',
    color: '#4a0f0f', // darker burgundy
    icon: <SupervisorAccountIcon />,
    route: '/login/hod',
  },
  coordinator: {
    label: 'Coordinator',
    color: '#6f1d1b', // medium burgundy
    icon: <EngineeringIcon />,
    route: '/login/coordinator',
  },
  participant: {
    label: 'Participant',
    color: '#e9c46a', // gold (contrast)
    icon: <HowToRegIcon />,
    route: '/login/participant',
  },
};
/* --- teamMembers data (your provided array) --- */
const teamMembers = [
  { name: 'Siva Sankar S', rollNo: '2023103082', batch: '2023-27', photo: '' },
  { name: 'Dhanush T', rollNo: '2023103507', batch: '2023-27', photo: '' },
  { name: 'Viswa S', rollNo: '2023103564', batch: '2023-27', photo: '' },
  { name: 'Kathir Kalidass B', rollNo: '2023103546', batch: '2023-27', photo: '' },
  { name: 'Magesh Gumar M', rollNo: '2023103612', batch: '2023-27', photo: '' },
];

/* Transition for the dialog */
const Transition = React.forwardRef(function Transition(props, ref) {
  return <Slide direction="up" ref={ref} {...props} />;
});


/**
 * Props:
 * - inline (boolean) — render horizontally (default true)
 * - hideLabels (boolean) — show icons only on small screens
 */
// LoginSection component (paste inside Home.jsx)
function LoginSection() {
  const navigate = useNavigate();
  const [loadingRole, setLoadingRole] = useState(null);

  const roleConfigs = {
    admin: {
      label: 'Admin',
      color: '#8e2b2b',
      icon: <AdminPanelSettingsIcon />,
      route: '/login/admin',
    },
    hod: {
      label: 'HOD',
      color: '#4a0f0f',
      icon: <SupervisorAccountIcon />,
      route: '/login/hod',
    },
    coordinator: {
      label: 'Coordinator',
      color: '#6f1d1b',
      icon: <EngineeringIcon />,
      route: '/login/coordinator',
    },
    participant: {
      label: 'Participant',
      color: '#e9c46a',
      icon: <HowToRegIcon />,
      route: '/login/participant',
      darkText: true,
    },
  };

  const handleClick = (role) => {
    setLoadingRole(role);
    // small UX delay for loader animation; remove timeout to navigate immediately
    setTimeout(() => {
      setLoadingRole(null);
      navigate(roleConfigs[role].route);
    }, 450);
  };

  // Button renderer
  const Btn = ({ role, idx }) => {
    const cfg = roleConfigs[role];
    const isLoading = loadingRole === role;
    return (
      <motion.div
        initial={{ opacity: 0, y: 18, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.55, delay: 0.08 * idx }}
        whileHover={{ translateY: -6, scale: 1.02 }}
        style={{ display: 'flex', justifyContent: 'center', width: '100%' }}
      >
        <Button
          onClick={() => handleClick(role)}
          disabled={!!loadingRole && !isLoading}
          aria-label={`Login as ${cfg.label}`}
          startIcon={
            isLoading ? (
              <CircularProgress size={18} thickness={5} sx={{ color: cfg.darkText ? '#3b2c1a' : '#fff' }} />
            ) : (
              cfg.icon
            )
          }
          sx={{
            textTransform: 'none',
            fontWeight: 800,
            px: { xs: 2, sm: 3 },
            py: { xs: 0.7, sm: 1.05 },
            borderRadius: 3,
            minWidth: 170,
            display: 'inline-flex',
            alignItems: 'center',
            gap: 1,
            color: cfg.darkText ? '#3b2c1a' : '#fff',
            background:
              role === 'participant'
                ? 'linear-gradient(90deg, rgba(233,196,106,1), rgba(242,210,131,0.95))'
                : `linear-gradient(180deg, ${cfg.color}, ${cfg.color}CC)`,
            border: '1px solid rgba(255,255,255,0.06)',
            boxShadow:
              role === 'participant'
                ? '0 10px 32px rgba(233,196,106,0.12)'
                : '0 12px 36px rgba(0,0,0,0.38)',
            '&:hover': {
              filter: 'brightness(1.03)',
              boxShadow:
                role === 'participant'
                  ? '0 18px 48px rgba(233,196,106,0.18)'
                  : '0 20px 60px rgba(0,0,0,0.5)',
            },
            '&.Mui-disabled': {
              opacity: 0.75,
              cursor: 'default',
              boxShadow: 'none',
            },
          }}
        >
          <Box sx={{ display: { xs: 'none', sm: 'flex' }, alignItems: 'center' }}>{cfg.label}</Box>
          <Box sx={{ display: { xs: 'flex', sm: 'none' }, alignItems: 'center' }}>{cfg.label}</Box>
        </Button>
      </motion.div>
    );
  };

  return (
    <Box
      sx={{
        gridColumn: '1 / -1',
        p: { xs: 2.5, sm: 3 },
        mt: 2,
        mb: 3,
        borderRadius: 3,
        background: 'linear-gradient(180deg, rgba(255,255,255,0.02), rgba(255,255,255,0.01))',
        border: '1px solid rgba(255,255,255,0.06)',
        boxShadow: '0 8px 28px rgba(0,0,0,0.24)',
        backdropFilter: 'blur(8px)',
        WebkitBackdropFilter: 'blur(8px)',
      }}
    >
      {/* Heading - left aligned */}
      <Box sx={{ width: '100%', mb: { xs: 1, sm: 2 } }}>
        <Typography
          variant="h5"
          sx={{
            fontWeight: 900,
            color: palette.gold,
            letterSpacing: 0.6,
            textShadow: '0 6px 18px rgba(0,0,0,0.35)',
            textAlign: 'left',
          }}
        >
          Login
        </Typography>
      </Box>

      {/* Grid for buttons */}
      <Box
        sx={{
          width: '100%',
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr 1fr' },
          gap: 2,
          justifyItems: 'center',
          alignItems: 'center',
        }}
      >
        {/* Top row: Admin | HOD | Coordinator */}
        <Box sx={{ gridColumn: { xs: '1 / -1', sm: '1 / 2' }, width: '100%', display: 'flex', justifyContent: 'center' }}>
          <Btn role="admin" idx={0} />
        </Box>

        <Box sx={{ gridColumn: { xs: '1 / -1', sm: '2 / 3' }, width: '100%', display: 'flex', justifyContent: 'center' }}>
          <Btn role="hod" idx={1} />
        </Box>

        <Box sx={{ gridColumn: { xs: '1 / -1', sm: '3 / 4' }, width: '100%', display: 'flex', justifyContent: 'center' }}>
          <Btn role="coordinator" idx={2} />
        </Box>

        {/* Participant centered below middle column */}
        <Box sx={{ gridColumn: { xs: '1 / -1', sm: '2 / 3' }, width: '100%', mt: { xs: 1, sm: 2 }, display: 'flex', justifyContent: 'center' }}>
          <motion.div initial={{ opacity: 0, y: 14, scale: 0.98 }} animate={{ opacity: 1, y: 0, scale: 1 }} transition={{ duration: 0.6, delay: 0.4 }} style={{ width: '100%', display: 'flex', justifyContent: 'center' }}>
            <Btn role="participant" idx={3} />
          </motion.div>
        </Box>
      </Box>
    </Box>
  );
}


/* TeamModal component: responsive, search, detail sub-modal */
function TeamModal({ open, onClose }) {
  const [query, setQuery] = React.useState('');
  const [selected, setSelected] = React.useState(null);

  const filtered = teamMembers.filter((m) =>
    (m.name + m.rollNo + m.batch).toLowerCase().includes(query.toLowerCase())
  );

  return (
    <>
      <Dialog
        fullWidth
        maxWidth="md"
        open={open}
        onClose={onClose}
        TransitionComponent={Transition}
        PaperProps={{
          sx: {
            background: 'linear-gradient(180deg, rgba(18,6,6,0.85), rgba(22,11,11,0.92))',
            color: '#fff',
            borderRadius: 3,
            p: 0,
          },
        }}
      >
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <GroupsIcon sx={{ color: '#e9c46a' }} />
          <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
            <Typography variant="h6" sx={{ fontWeight: 800 }}>
              Team Members
            </Typography>
            <Typography variant="caption" sx={{ opacity: 0.75 }}>
              Department of Computer Science & Engineering — DCSE
            </Typography>
          </Box>

          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 1,
              background: 'rgba(255,255,255,0.03)',
              borderRadius: 99,
              px: 1,
            }}
          >
            <SearchIcon sx={{ opacity: 0.7 }} />
            <InputBase
              placeholder="Search by name / roll / batch"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              sx={{ color: '#fff', ml: 1 }}
            />
          </Box>

          <IconButton onClick={onClose} sx={{ color: '#fff', ml: 1 }}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>

        <DialogContent dividers sx={{ pt: 1 }}>
          <Grid container spacing={2}>
            {filtered.map((m) => (
              <Grid item key={m.rollNo} xs={12} sm={6} md={4}>
                <CardActionArea
                  onClick={() => setSelected(m)}
                  sx={{
                    borderRadius: 2,
                    p: 1,
                    display: 'block',
                    textAlign: 'center',
                    background: 'rgba(255,255,255,0.02)',
                    '&:hover': { transform: 'translateY(-6px)', boxShadow: '0 12px 30px rgba(0,0,0,0.5)' },
                  }}
                >
                  <Box sx={{ display: 'flex', justifyContent: 'center', mt: 0.5 }}>
                    <Avatar
                      src={m.photo || undefined}
                      alt={m.name}
                      sx={{ width: 92, height: 92, boxShadow: '0 8px 20px rgba(0,0,0,0.45)' }}
                    >
                      {m.name.split(' ').slice(0,2).map(n=>n[0]).join('')}
                    </Avatar>
                  </Box>

                  <Typography variant="subtitle1" sx={{ mt: 1, fontWeight: 800 }}>
                    {m.name}
                  </Typography>
                  <Typography variant="body2" sx={{ opacity: 0.85 }}>
                    {m.rollNo}
                  </Typography>

                  <Chip
                    label={m.batch}
                    size="small"
                    sx={{ mt: 1, background: 'rgba(233,196,106,0.14)', color: '#e9c46a', fontWeight: 700 }}
                  />

                  <Box sx={{ mt: 1 }}>
                    <Button
                      size="small"
                      variant="contained"
                      startIcon={<VisibilityIcon />}
                      onClick={(ev) => {
                        ev.stopPropagation();
                        setSelected(m);
                      }}
                      sx={{
                        textTransform: 'none',
                        mt: 1,
                        borderRadius: 99,
                        background: 'linear-gradient(90deg,#e9c46a,#f2d283)',
                        color: '#3b2c1a',
                        fontWeight: 800,
                      }}
                    >
                      View
                    </Button>
                  </Box>
                </CardActionArea>
              </Grid>
            ))}
          </Grid>
        </DialogContent>

        <DialogActions sx={{ py: 1, px: 2 }}>
          <Typography variant="caption" sx={{ opacity: 0.7, ml: 1 }}>
            Tip: Click a card or "View" to open details.
          </Typography>
          <Box sx={{ flex: 1 }} />
          <Button onClick={onClose} sx={{ color: '#fff' }}>
            Close
          </Button>
        </DialogActions>
      </Dialog>

      {/* Detail sub-modal: shows member details (no navigation, just design) */}
      <Dialog
        open={!!selected}
        onClose={() => setSelected(null)}
        maxWidth="xs"
        fullWidth
        PaperProps={{ sx: { borderRadius: 3, background: '#1a0f0f', color: '#fff' } }}
      >
        {selected && (
          <>
            <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Avatar src={selected.photo || undefined} sx={{ width: 56, height: 56 }}>
                {selected.name.split(' ').slice(0,2).map(n=>n[0]).join('')}
              </Avatar>
              <Box>
                <Typography variant="subtitle1" sx={{ fontWeight: 900 }}>
                  {selected.name}
                </Typography>
                <Typography variant="caption" sx={{ opacity: 0.85 }}>
                  {selected.rollNo} • {selected.batch}
                </Typography>
              </Box>
              <Box sx={{ flex: 1 }} />
              <IconButton onClick={() => setSelected(null)} sx={{ color: '#fff' }}>
                <CloseIcon />
              </IconButton>
            </DialogTitle>

            <DialogContent dividers>
              <Typography variant="body2" sx={{ mb: 1 }}>
                <strong>Role:</strong> Student • Team Member
              </Typography>
              <Typography variant="body2" sx={{ mb: 1 }}>
                <strong>Contributions:</strong> Event coordination, brochure design, certificates, frontend.
              </Typography>

              <Box sx={{ mt: 1, display: 'flex', gap: 1 }}>
                <Button size="small" variant="outlined" sx={{ textTransform: 'none' }}>
                  Contact
                </Button>
                <Button size="small" variant="outlined" sx={{ textTransform: 'none' }}>
                  Portfolio
                </Button>
              </Box>
            </DialogContent>

            <DialogActions>
              <Button onClick={() => setSelected(null)} sx={{ color: '#fff' }}>
                Close
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>
    </>
  );
}

/* ------------------- end paste ------------------- */

const palette = {
  burgundy: '#6f1d1b',
  burgundyDark: '#4a0f0f',
  burgundyLight: '#8e2b2b',
  gold: '#e9c46a',
  sand: '#f4ede1',
  card: 'rgba(255,255,255,0.07)',
};

const heroBackground = {
  backgroundImage:
    'linear-gradient(140deg, rgba(74,15,15,0.9) 0%, rgba(111,29,27,0.92) 60%, rgba(25,15,10,0.94) 100%), url("/anna univ photo.avif")',
  backgroundSize: 'cover',
  backgroundPosition: 'center',
};

const GlassCard = ({ children, hover = true, border = true, sx }) => (
  <Card
    elevation={0}
    sx={{
      background: palette.card,
      border: border ? '1px solid rgba(255,255,255,0.08)' : 'none',
      borderRadius: 3,
      backdropFilter: 'blur(12px)',
      color: '#fff',
      transition: 'all 0.25s ease',
      ...(hover && {
        '&:hover': {
          transform: 'translateY(-4px)',
          borderColor: 'rgba(233,196,106,0.6)',
          boxShadow: '0 10px 30px rgba(0,0,0,0.25)',
        },
      }),
      ...sx,
    }}
  >
    {children}
  </Card>
);

const Home = () => {
  const navigate = useNavigate();
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [guideOpen, setGuideOpen] = useState(false);
  const [teamOpen, setTeamOpen] = useState(false);
  useEffect(() => {
    const handleScroll = () => setShowScrollTop(window.pageYOffset > 280);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <Box sx={{ bgcolor: '#160b0b', color: '#f6f1ee', minHeight: '100vh' }}>
      <AppBar
        position="fixed"
        elevation={0}
        sx={{
          background: 'rgba(34,12,12,0.7)',
          backdropFilter: 'blur(12px)',
          borderBottom: '1px solid rgba(255,255,255,0.08)',
        }}
      >
        <Toolbar
          sx={{
            display: 'grid',
            gridTemplateColumns: 'auto 1fr auto',
            gap: 2,
            alignItems: 'center',
            minHeight: { xs: 64, sm: 72 },
            px: { xs: 1.5, sm: 3 },
          }}
        >
          {/* left: logo + title */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Box
              sx={{
                width: 45,
                height: 45,
                borderRadius: '50%',
                flex: '0 0 44px',
              }}
            >
              <img
                src="/event_logo.png"
                alt="Anna University"
                style={{ width: '100%', height: '120%', objectFit: 'cover', display: 'block' }}
              />
            </Box>

            {/* Animated hero title: high-design */}
            <Typography
              component={motion.div}
              variant="h4"
              initial={{ opacity: 0, y: 18, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.7, ease: 'easeOut' }}
              whileHover={{ scale: 1.02, y: -2 }}
              sx={{
                width: '100%',
                fontWeight: 900,
                letterSpacing: 0.6,
                lineHeight: 1,
                // responsive sizes
                fontSize: { xs: '1.15rem', sm: '1.6rem', md: '2.2rem' },
                // gradient text
                background: 'linear-gradient(90deg, rgba(242,210,131,1) 0%, rgba(233,196,106,1) 40%, rgba(255,245,199,1) 60%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                // 3D glow + subtle depth
                textShadow: '0 6px 18px rgba(0,0,0,0.55), 0 1px 0 rgba(255,255,255,0.02) inset',
                // create shimmer pseudo-element
                position: 'relative',
                overflow: 'visible',
                // floating animation (slow)
                '@keyframes floatY': {
                  '0%': { transform: 'translateY(0px)' },
                  '50%': { transform: 'translateY(-6px)' },
                  '100%': { transform: 'translateY(0px)' },
                },
                animation: 'floatY 6s ease-in-out infinite',
                // shiny sweep using before pseudo-element
                '&::before': {
                  content: '""',
                  position: 'absolute',
                  left: '-40%',
                  top: '-10%',
                  width: '120%',
                  height: '120%',
                  background:
                    'linear-gradient(120deg, rgba(255,255,255,0.0) 0%, rgba(255,255,255,0.18) 45%, rgba(255,255,255,0.0) 75%)',
                  transform: 'skewX(-18deg)',
                  filter: 'blur(10px)',
                  opacity: 0.0,
                  transition: 'opacity 0.45s ease, left 1.2s ease',
                  pointerEvents: 'none',
                },
                // make the shimmer sweep every 6s delayed a bit
                '&:hover::before': { opacity: 1, left: '120%' },
                // ensure block alignment left in the hero column
                textAlign: 'left',
                // spacing
                mt: { xs: 2, sm: 3, md: 4 },
                mb: { xs: 1, sm: 1.5, md: 2 },
                // small responsive transform tweak to keep crisp on mobile
                transformOrigin: 'center',
              }}
            >
              <Box component="span" sx={{ display: 'inline-flex', alignItems: 'center', gap: 1 }}>
                {/* the main title text */}
                <Box component="span" sx={{ pl: 1 }}>
                  Events Management System
                </Box>
              </Box>

              {/* animated underline / accent bar */}
              <Box
                component={motion.div}
                initial={{ width: 0, opacity: 0 }}
                animate={{ width: '56px', opacity: 1 }}
                transition={{ delay: 0.25, duration: 0.6, ease: 'easeOut' }}
                sx={{
                  height: 5,
                  borderRadius: 2,
                  mt: 1.25,
                  background: 'linear-gradient(90deg, rgba(233,196,106,1), rgba(242,210,131,0.9))',
                  boxShadow: '0 8px 24px rgba(233,196,106,0.12)',
                }}
              />
            </Typography>

          </Box>

          {/* center: (empty) keeps title visually centered */}
          <Box sx={{ justifySelf: 'center', display: 'flex', alignItems: 'center' }}>
            {/* optional: put a small center logo or leave empty to keep perfect centering */}
          </Box>

          {/* right: controls */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, justifySelf: 'end' }}>
            {/* View Events button (left of Team) */}
            <Button
              color="inherit"
              size="small"
              onClick={() => navigate('/events')}
              variant="outlined"
              sx={{
                textTransform: 'none',
                fontWeight: 700,
                px: 2,
                borderRadius: 999,
                border: '1px solid rgba(255,255,255,0.12)',
                mr: 0.5,
                display: { xs: 'none', sm: 'inline-flex' }, // hide on very small screens if desired
              }}
            >
              View Events
            </Button>

            {/* Team */}
            <Button
              color="inherit"
              size="small"
              startIcon={<GroupsIcon />}
              onClick={() => setTeamOpen(true)}
              sx={{
                borderRadius: 999,
                textTransform: 'none',
                fontWeight: 700,
                px: 2.5,
                border: '1px solid rgba(255,255,255,0.10)',
              }}
            >
              Team
            </Button>

            {/* Login */}
            <Button
              color="inherit"
              size="small"
              endIcon={<ArrowForward />}
              onClick={() => navigate('/login')}
              sx={{
                borderRadius: 999,
                textTransform: 'none',
                fontWeight: 700,
                px: 2.5,
                border: '1px solid rgba(255,255,255,0.18)',
              }}
            >
              Login
            </Button>

            <IconButton color="inherit" sx={{ display: { xs: 'flex', sm: 'none' } }}>
              <Menu />
            </IconButton>
          </Box>

        </Toolbar>
      </AppBar>


      <Fab
        color="primary"
        sx={{
          position: 'fixed',
          bottom: 20,
          right: 20,
          bgcolor: palette.gold,
          color: '#3b2c1a',
          '&:hover': { bgcolor: '#f2d283' },
          boxShadow: '0 10px 30px rgba(0,0,0,0.35)',
          opacity: showScrollTop ? 1 : 0,
          pointerEvents: showScrollTop ? 'auto' : 'none',
          transition: 'opacity 0.2s ease',
        }}
        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
      >
        <KeyboardArrowUp />
      </Fab>

      <Box component="main" sx={{ pt: 10 }}>
        {/* Hero */}
        <Box sx={{ ...heroBackground, position: 'relative', overflow: 'hidden', pb: 10 }}>
          <Box
            sx={{
              position: 'absolute',
              inset: 0,
              background: 'radial-gradient(circle at 20% 20%, rgba(233,196,106,0.08), transparent 35%)',
            }}
          />
          <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 1, pt: 6 }}>
            <Grid container spacing={6} alignItems="center" justifyContent="center">
              {/* <-- FIXED: use item xs/md/lg props not `size` */}
              <Grid item xs={12} md={8} lg={7} sx={{ mx: 'auto' }}>
                <Stack spacing={3} alignItems="center">
                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 3,
                      textAlign: 'center',
                      flexWrap: 'wrap',
                    }}
                  >
                    <Box
                      sx={{
                        width: { xs: 76, sm: 88 },
                        height: { xs: 76, sm: 88 },
                        borderRadius: '100%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <img
                        src="/anna-university-logo.jpg"
                        alt="Anna University"
                        style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                      />
                    </Box>

                    <Stack spacing={1} alignItems="center" textAlign="center">
                      <Typography
                        variant="h4"
                        sx={{
                          fontWeight: 900,
                          letterSpacing: 0.3,
                          background: 'linear-gradient(90deg, #f2d283, #e9c46a, #f7e6b5)',
                          WebkitBackgroundClip: 'text',
                          WebkitTextFillColor: 'transparent',
                          lineHeight: 1.05,
                        }}
                      >
                        Anna University
                      </Typography>
                      <Typography variant="h5" sx={{ fontWeight: 800, letterSpacing: 0.2, color: '#f6f1ee' }}>
                        College of Engineering, Guindy
                      </Typography>
                      <Typography variant="h6" sx={{ fontWeight: 700, letterSpacing: 0.2, color: '#f6f1ee', opacity: 0.9 }}>
                        Department of Computer Science and Engineering
                      </Typography>
                      
                    </Stack>

                    <Box
                      sx={{
                        width: { xs: 76, sm: 88 },
                        height: { xs: 76, sm: 88 },
                        borderRadius: '100%',
                        overflow: 'hidden',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <img
                        src="/CEG_logo.png"
                        alt="CEG"
                        style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                      />
                    </Box>
                  </Box>

                  <Stack direction="row" spacing={2} flexWrap="wrap">
                    <Button
                      variant="outlined"
                      size="large"
                      color="inherit"
                      onClick={() => setGuideOpen(true)}
                      sx={{
                        textTransform: 'none',
                        fontWeight: 700,
                        px: 3.5,
                        py: 1.5,
                        borderRadius: 999,
                        borderColor: 'rgba(255,255,255,0.35)',
                        '&:hover': {
                          borderColor: palette.gold,
                          color: palette.gold,
                          background: 'rgba(233,196,106,0.08)',
                        },
                      }}
                    >
                      Need a quick tour?
                    </Button>
                  </Stack>
                  
                  {/* Insert centered fancy login block */}
                  <LoginSection />


                  <Typography
                      variant="h5"
                      sx={{
                        fontWeight: 800,
                        textAlign: 'left',
                        width: '100%',
                        mt: 4,
                        mb: 1,
                        color: palette.gold,
                        letterSpacing: 0.5,
                      }}
                    >
                      Highlights
                    </Typography>

                  {/* Top-3 events preview injected below hero */}
                  <EventsPreview />
                </Stack>
              </Grid>
            </Grid>
          </Container>
        </Box>
      </Box>

      <DashboardGuide open={guideOpen} onClose={() => setGuideOpen(false)} />
      <TeamModal open={teamOpen} onClose={() => setTeamOpen(false)} />
      <Footer />
    </Box>
  );
};

export default Home;