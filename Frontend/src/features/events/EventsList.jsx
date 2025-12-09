import React, { useEffect, useMemo, useState } from 'react';
import {
  Box,
  Container,
  Grid,
  Tabs,
  Tab,
  Typography,
  Card,
  CardContent,
  List,
  ListItemButton,
  ListItemText,
  Divider,
  Chip,
  CircularProgress,
  Paper,
  InputBase,
  IconButton,
  Avatar,
  Stack,
  Skeleton,
  Badge,
  Tooltip,
  useTheme,
  alpha,
  ListItemAvatar,
  ListItemSecondaryAction
} from '@mui/material';
import {
  Search as SearchIcon,
  Event as EventIcon,
  Info as InfoIcon,
  LocationOn as LocationOnIcon,
  CalendarToday as CalendarTodayIcon
} from '@mui/icons-material';

// date helpers (unchanged)
const toDate = (v) => {
  if (!v) return null;
  const d = new Date(v);
  return Number.isNaN(d.getTime()) ? null : d;
};
const formatDateIST = (iso) => {
  const dt = toDate(iso);
  if (!dt) return '';
  return new Intl.DateTimeFormat('en-GB', {
    dateStyle: 'medium',
    timeStyle: 'short',
    timeZone: 'Asia/Kolkata',
  }).format(dt);
};

// classification (unchanged)
const classifyEvents = (events = []) => {
  const now = new Date();
  const ongoing = [];
  const comingSoon = [];
  const completed = [];
  if (!Array.isArray(events)) return { comingSoon: [], ongoing: [], completed: [] };
  events.forEach((ev) => {
    const s = toDate(ev.startDate);
    const e = toDate(ev.endDate);
    if (ev.status && typeof ev.status === 'string') {
      const st = ev.status.toLowerCase();
      if (st.includes('complete') || st.includes('done')) return completed.push(ev);
      if (st.includes('ongoing') || st.includes('running')) return ongoing.push(ev);
      if (st.includes('coming') || st.includes('upcoming')) return comingSoon.push(ev);
    }
    if (s && e) {
      if (s <= now && now <= e) ongoing.push(ev);
      else if (s > now) comingSoon.push(ev);
      else completed.push(ev);
    } else if (s && !e) {
      if (s <= now) ongoing.push(ev);
      else comingSoon.push(ev);
    } else if (!s && e) {
      if (e >= now) ongoing.push(ev);
      else completed.push(ev);
    } else {
      comingSoon.push({ ...ev, _noDates: true });
    }
  });
  comingSoon.sort((a, b) => (toDate(a.startDate) || Infinity) - (toDate(b.startDate) || Infinity));
  ongoing.sort((a, b) => (toDate(a.endDate) || Infinity) - (toDate(b.endDate) || Infinity));
  completed.sort((a, b) => (toDate(b.endDate) || 0) - (toDate(a.endDate) || 0));
  return { comingSoon, ongoing, completed };
};

export default function EventsList({ onEventClick }) {
  const theme = useTheme();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState(1); // Ongoing
  const [error, setError] = useState(null);
  const [q, setQ] = useState('');
  const [modeFilter, setModeFilter] = useState('all');

  const backendBase = import.meta.env.VITE_BACKEND_URL || '';

  useEffect(() => {
    let mounted = true;
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const url = backendBase ? `${backendBase.replace(/\/$/, '')}/api/events` : '/api/events';
        const res = await fetch(url, { credentials: 'include' });
        if (!res.ok) {
          const text = await res.text().catch(()=>`${res.status} ${res.statusText}`);
          throw new Error(text || `${res.status}`);
        }
        const data = await res.json();
        if (mounted) setEvents(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error('EventsList fetch error:', err);
        if (mounted) setError(err.message || 'Error fetching events');
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => (mounted = false);
  }, [backendBase]);

  const groups = useMemo(() => classifyEvents(events), [events]);

  // client-side filtering/search
  const filteredLists = useMemo(() => {
    const filterItem = (ev) => {
      const byMode = modeFilter === 'all' ? true : ((ev.mode || '').toLowerCase() === modeFilter);
      const qLower = q.trim().toLowerCase();
      const byQ = !qLower || ((ev.title || '').toLowerCase().includes(qLower)) || ((ev.description || '').toLowerCase().includes(qLower));
      return byMode && byQ;
    };
    return {
      completed: groups.completed.filter(filterItem),
      ongoing: groups.ongoing.filter(filterItem),
      comingSoon: groups.comingSoon.filter(filterItem),
    };
  }, [groups, q, modeFilter]);

  const lists = [filteredLists.completed, filteredLists.ongoing, filteredLists.comingSoon];
  const labels = ['Completed', 'Ongoing', 'Coming Soon'];
  const currentList = lists[tab] || [];

  const modeChips = ['all', 'online', 'offline', 'hybrid'];
  const statusColor = (i) => (i === 1 ? theme.palette.success.main : i === 2 ? theme.palette.warning.main : theme.palette.grey[600]);

  return (
    <Box sx={{ bgcolor: '#0b0c10', color: '#fff', minHeight: '70vh', py: 6 }}>
      <Container maxWidth="lg">
        <Grid container spacing={3} alignItems="center">
          <Grid item xs={12} md={8}>
            <Typography variant="h4" sx={{ fontWeight: 900, mb: 0.5, color: '#fff' }}>
              Events Directory
            </Typography>
            <Typography variant="body2" sx={{ color: alpha('#fff', 0.72), mb: 2 }}>
              Browse departmental events — register, track attendance, and download certificates.
            </Typography>
          </Grid>

          <Grid item xs={12} md={4} sx={{ display: 'flex', justifyContent: { xs: 'flex-start', md: 'flex-end' } }}>
            <Paper sx={{ display: 'flex', alignItems: 'center', gap: 1, px: 2, py: 1, bgcolor: alpha('#fff', 0.03), borderRadius: 2 }}>
              <EventIcon sx={{ color: '#fff' }} />
              <Box sx={{ textAlign: 'right' }}>
                <Typography variant="caption" sx={{ display: 'block', color: alpha('#ff0000', 0.6) }}>Live</Typography>
                <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#9f2' }}>{groups.ongoing.length} ongoing</Typography>
              </Box>
            </Paper>
          </Grid>

          <Grid item xs={12}>
            <Card elevation={0} sx={{ background: alpha('#000', 0.25), borderRadius: 2, overflow: 'hidden', border: `1px solid ${alpha('#fff', 0.03)}` }}>
              <CardContent sx={{ p: { xs: 2, md: 3 } }}>
                {/* Controls: tabs + search + filters */}
                <Box sx={{ display: 'flex', gap: 2, flexDirection: { xs: 'column', md: 'row' }, alignItems: 'center', mb: 2 }}>
                  <Tabs
                    value={tab}
                    onChange={(e, v) => setTab(v)}
                    aria-label="events tabs"
                    textColor="inherit"
                    TabIndicatorProps={{ sx: { backgroundColor: '#58a6ff', height: 3, borderRadius: 2 } }}
                    sx={{
                      '& .MuiTab-root': { color: alpha('#fff', 0.85), textTransform: 'uppercase', fontWeight: 800, minWidth: 120 },
                      '& .Mui-selected': { color: '#fff' }
                    }}
                  >
                    <Tab label={`Completed (${groups.completed.length})`} />
                    <Tab label={`Ongoing (${groups.ongoing.length})`} />
                    <Tab label={`Coming Soon (${groups.comingSoon.length})`} />
                  </Tabs>

                  <Box sx={{ ml: 'auto', display: 'flex', gap: 1, alignItems: 'center' }}>
                    <Paper component="form" sx={{ display: 'flex', alignItems: 'center', px: 1, py: 0.5, bgcolor: alpha('#fff', 0.04), borderRadius: 2 }}>
                      <InputBase
                        value={q}
                        onChange={(e) => setQ(e.target.value)}
                        placeholder="Search title or description..."
                        inputProps={{ 'aria-label': 'search events' }}
                        sx={{ color: '#fff', pl: 1, width: { xs: 160, md: 300 } }}
                      />
                      <IconButton type="button" sx={{ p: 0.5 }}>
                        <SearchIcon sx={{ color: alpha('#fff', 0.7) }} />
                      </IconButton>
                    </Paper>

                    <Stack direction="row" spacing={1}>
                      {modeChips.map((m) => (
                        <Chip
                          key={m}
                          label={m === 'all' ? 'All' : m[0].toUpperCase() + m.slice(1)}
                          clickable
                          size="small"
                          onClick={() => setModeFilter(m)}
                          variant={modeFilter === m ? 'filled' : 'outlined'}
                          sx={{
                            color: modeFilter === m ? '#000' : '#fff',
                            bgcolor: modeFilter === m ? '#fff' : 'transparent',
                            borderColor: alpha('#fff', 0.08),
                            textTransform: 'capitalize',
                            fontWeight: 700
                          }}
                        />
                      ))}
                    </Stack>
                  </Box>
                </Box>

                {/* Body */}
                <Box>
                  {loading ? (
                    <Box>
                      {[0,1,2].map(i => (
                        <Box key={i} sx={{ display: 'flex', gap: 2, alignItems: 'center', mb: 2 }}>
                          <Skeleton variant="rectangular" width={8} height={64} sx={{ borderRadius: 1 }} />
                          <Skeleton variant="circular" width={48} height={48} />
                          <Box sx={{ flex: 1 }}>
                            <Skeleton width="45%" height={20} sx={{ mb: 1 }} />
                            <Skeleton width="60%" height={16} />
                          </Box>
                          <Skeleton width={80} height={32} />
                        </Box>
                      ))}
                    </Box>
                  ) : error ? (
                    <Typography color="error">{error}</Typography>
                  ) : (
                    <List disablePadding>
                      {currentList.length === 0 ? (
                        <Paper elevation={0} sx={{ p: 4, textAlign: 'center', bgcolor: alpha('#fff', 0.02) }}>
                          <InfoIcon sx={{ fontSize: 36, color: alpha('#fff', 0.7), mb: 1 }} />
                          <Typography variant="h6" sx={{ fontWeight: 800, color: '#fff', mb: 1 }}>No events found</Typography>
                          <Typography variant="body2" sx={{ color: alpha('#fff', 0.7) }}>
                            Try switching tabs, clearing filters, or removing the search query.
                          </Typography>
                        </Paper>
                      ) : (
                        currentList.map((ev, idx) => {
                          const key = ev._id || `${ev.title || 'untitled'}-${ev.startDate || ''}-${ev.endDate || ''}`;
                          const secondary = ev.startDate ? formatDateIST(ev.startDate) : (ev._noDates ? 'Date not set' : 'TBA');
                          const accent = statusColor(tab);
                          const avatarLetter = ((ev.mode || 'E').charAt(0) || 'E').toUpperCase();
                          return (
                            <Box key={key} sx={{ mb: 1.25 }}>
                              <ListItemButton
                                onClick={() => onEventClick ? onEventClick(ev) : null}
                                sx={{
                                  gap: 2,
                                  alignItems: 'center',
                                  py: 1.25,
                                  px: 2,
                                  bgcolor: alpha('#000', 0.32),
                                  borderRadius: 2,
                                  transition: 'transform 180ms ease, box-shadow 180ms ease',
                                  '&:hover': { transform: 'translateY(-4px)', boxShadow: `0 12px 30px ${alpha('#000', 0.6)}` }
                                }}
                                aria-label={`Open event ${ev.title || 'Untitled'}`}
                              >
                                {/* accent bar */}
                                <Box sx={{ width: 10, height: 64, background: accent, borderRadius: 1 }} />

                                {/* avatar */}
                                <ListItemAvatar>
                                  <Avatar sx={{ bgcolor: alpha('#ffffff', 0.06), color: '#fff', width: 52, height: 52, fontWeight: 800 }}>
                                    {avatarLetter}
                                  </Avatar>
                                </ListItemAvatar>

                                {/* content */}
                                <ListItemText
                                  primary={<Typography sx={{ fontWeight: 900, color: '#fff', fontSize: 16 }}>{ev.title || 'Untitled Event'}</Typography>}
                                  secondary={
                                    <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', mt: 0.25 }}>
                                      <Typography variant="caption" sx={{ color: alpha('#fff', 0.78) }}>{secondary}</Typography>
                                      {ev.venue && (
                                        <Box sx={{ display: 'flex', gap: 0.5, alignItems: 'center', color: alpha('#fff', 0.66) }}>
                                          <LocationOnIcon sx={{ fontSize: 14 }} /> <Typography variant="caption">{ev.venue}</Typography>
                                        </Box>
                                      )}
                                      {ev.mode && <Chip label={ev.mode} size="small" sx={{ ml: 1, height: 26, color: '#fff', bgcolor: alpha('#ffffff', 0.06), borderColor: alpha('#fff', 0.06) }} />}
                                    </Box>
                                  }
                                />

                                {/* right side */}
                                <ListItemSecondaryAction sx={{ right: 12, display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 1 }}>
                                  <Chip label={ev.category || 'General'} size="small" variant="outlined" sx={{ color: '#fff', borderColor: alpha('#fff', 0.08) }} />
                                  <Typography variant="caption" sx={{ color: alpha('#fff', 0.66) }}>{ev.participants ? `${ev.participants} joined` : '—'}</Typography>
                                </ListItemSecondaryAction>
                              </ListItemButton>
                              <Divider sx={{ borderColor: alpha('#fff', 0.04), mt: 1 }} />
                            </Box>
                          );
                        })
                      )}
                    </List>
                  )}
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
}
