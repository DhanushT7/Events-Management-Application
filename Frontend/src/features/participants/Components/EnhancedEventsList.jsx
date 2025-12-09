// EnhancedEventsList.jsx
import React, { useState, useEffect, useMemo } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Button,
  Chip,
  TextField,
  InputAdornment,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Pagination,
  Skeleton,
  Paper,
  Stack
} from '@mui/material';
import Avatar from '@mui/material/Avatar';
import {
  Search as SearchIcon,
  Event as EventIcon,
  CalendarToday as CalendarIcon,
  LocationOn as LocationIcon,
  Schedule as ScheduleIcon,
  Group as GroupIcon,
  EmojiEvents as EmojiEventsIcon
} from '@mui/icons-material';
import { useSnackbar } from 'notistack';
import { useNavigate } from 'react-router-dom';

const useDebouncedValue = (value, delay = 350) => {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const handle = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(handle);
  }, [value, delay]);
  return debounced;
};

const categories = ['workshop', 'seminar', 'conference', 'guest lecture'];
const statusOptions = ['upcoming', 'ongoing', 'completed'];
const sortOptions = [
  { value: 'date', label: 'Date' },
  { value: 'title', label: 'Title' },
  { value: 'popularity', label: 'Popularity' }
];

const EnhancedEventsList = ({ onDataChange }) => {
  const { enqueueSnackbar } = useSnackbar();
  const navigate = useNavigate();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [limit] = useState(6);

  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('all');
  const [status, setStatus] = useState('all');
  const [sortBy, setSortBy] = useState('date'); // <-- fixed typo here
  const [registering, setRegistering] = useState(null);

  const debouncedSearch = useDebouncedValue(search);
  const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}');
  const participantId = userInfo?._id;

  const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000/api';

  const buildQuery = () => {
    const params = new URLSearchParams();
    if (debouncedSearch) params.set('q', debouncedSearch);
    if (category !== 'all') params.set('category', category);
    if (status !== 'all') params.set('status', status);
    if (sortBy) params.set('sort', sortBy);
    params.set('page', page);
    params.set('limit', limit);
    return params.toString();
  };

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const query = buildQuery();
      const response = await fetch(`${baseUrl}/participant/events${query ? `?${query}` : ''}`, {
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' }
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(error.message || 'Unable to load events');
      }

      const payload = await response.json();
      if (Array.isArray(payload)) {
        setEvents(payload);
        setTotalPages(1);
      } else {
        setEvents(payload.events || []);
        setTotalPages(payload.totalPages || 1);
        if (payload.page) setPage(payload.page);
      }
    } catch (error) {
      console.error('Events fetch error', error);
      enqueueSnackbar(error.message || 'Unable to fetch events', { variant: 'error' });
      setEvents([]);
      setTotalPages(1);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSearch, category, status, sortBy, page, limit]);

  const registerForEvent = async (eventId) => {
    try {
      if (!participantId) {
        enqueueSnackbar('You must be logged in to register', { variant: 'warning' });
        return;
      }
      setRegistering(eventId);
      const token = localStorage.getItem('token');
      const response = await fetch(`${baseUrl}/participant/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ participantId, eventId })
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(error.message || 'Registration failed');
      }

      enqueueSnackbar('Registration submitted. Await coordinator approval.', { variant: 'success' });
      fetchEvents();
      onDataChange?.();
    } catch (error) {
      enqueueSnackbar(error.message || 'Unable to register', { variant: 'error' });
    } finally {
      setRegistering(null);
    }
  };

  const stats = useMemo(() => {
    const now = new Date();
    const upcoming = events.filter((event) => new Date(event.startDate) > now).length;
    const ongoing = events.filter((event) => new Date(event.startDate) <= now && new Date(event.endDate) >= now).length;
    const completed = events.length - upcoming - ongoing;
    return [
      { label: 'Listed', value: events.length, color: 'primary.main' },
      { label: 'Upcoming', value: upcoming, color: 'success.main' },
      { label: 'Ongoing', value: ongoing, color: 'warning.main' },
      { label: 'Completed', value: completed, color: 'text.secondary' }
    ];
  }, [events]);

  const renderSkeleton = () => (
    <Grid container spacing={3}>
      {Array.from({ length: 6 }).map((_, index) => (
        <Grid item xs={12} md={6} lg={4} key={`sk-${index}`}>
          <Card>
            <Skeleton variant="rectangular" height={140} />
            <CardContent>
              <Skeleton variant="text" height={32} />
              <Skeleton variant="text" height={20} />
              <Skeleton variant="text" height={20} width="80%" />
            </CardContent>
          </Card>
        </Grid>
      ))}
    </Grid>
  );

  return (
    <Box sx={{ maxWidth: 1400, mx: 'auto' }}>
      <Card
        sx={{
          mb: 3,
          background: 'linear-gradient(135deg, #0ea5e9 0%, #6366f1 60%, #9333ea 100%)',
          color: '#fff'
        }}
      >
        <CardContent>
          <Grid container spacing={3} alignItems="center">
            <Grid item xs={12} md={8}>
              <Typography variant="overline" sx={{ letterSpacing: 2 }}>Discover & Register</Typography>
              <Typography variant="h4" fontWeight={700}>Explore curated university events</Typography>
              <Typography variant="subtitle1" sx={{ opacity: 0.85, maxWidth: 560, mt: 1 }}>
                Filter by category, status, or popularity and register with one click. Your selections sync instantly with the dashboard.
              </Typography>
            </Grid>
            <Grid item xs={12} md={4}>
              <Stack direction="row" spacing={2} justifyContent="flex-end" sx={{ flexWrap: 'wrap', gap: 1 }}>
                <Button variant="contained" color="secondary" startIcon={<EventIcon />} onClick={() => navigate()}>
                  My Registrations
                </Button>
                <Button variant="outlined" color="inherit" onClick={() => setPage(1)}>
                  Reset Filters
                </Button>
              </Stack>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      <Paper sx={{ p: 3, mb: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              placeholder="Search title, speaker, or tag"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              InputProps={{ startAdornment: <InputAdornment position="start"><SearchIcon /></InputAdornment> }}
            />
          </Grid>
          <Grid item xs={12} sm={4} md={2}>
            <FormControl fullWidth>
              <InputLabel>Category</InputLabel>
              <Select value={category} label="Category" onChange={(e) => { setCategory(e.target.value); setPage(1); }}>
                <MenuItem value="all">All</MenuItem>
                {categories.map((cat) => (
                  <MenuItem key={cat} value={cat}>{cat}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={4} md={2}>
            <FormControl fullWidth>
              <InputLabel>Status</InputLabel>
              <Select value={status} label="Status" onChange={(e) => { setStatus(e.target.value); setPage(1); }}>
                <MenuItem value="all">All</MenuItem>
                {statusOptions.map((option) => (
                  <MenuItem key={option} value={option}>{option}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={4} md={2}>
            <FormControl fullWidth>
              <InputLabel>Sort By</InputLabel>
              <Select value={sortBy} label="Sort By" onChange={(e) => setSortBy(e.target.value)}>
                {sortOptions.map((option) => (
                  <MenuItem key={option.value} value={option.value}>{option.label}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={2}>
            <Typography variant="body2" color="text.secondary" textAlign="right">
              Showing page {page} of {totalPages}
            </Typography>
          </Grid>
        </Grid>
      </Paper>

      <Grid container spacing={2} sx={{ mb: 3 }}>
        {stats.map((stat) => (
          <Grid item xs={6} md={3} key={stat.label}>
            <Card sx={{ textAlign: 'center', py: 2 }}>
              <Typography variant="h4" fontWeight={700} color={stat.color}>{stat.value}</Typography>
              <Typography variant="body2" color="text.secondary">{stat.label}</Typography>
            </Card>
          </Grid>
        ))}
      </Grid>

      {loading ? renderSkeleton() : (
        events.length === 0 ? (
          <Card>
            <CardContent sx={{ textAlign: 'center', py: 6 }}>
              <Avatar sx={{ mx: 'auto', mb: 2, bgcolor: 'primary.light', width: 72, height: 72 }}>
                <EventIcon sx={{ fontSize: 36 }} />
              </Avatar>
              <Typography variant="h6">No events match your filters</Typography>
              <Typography color="text.secondary">Try adjusting category or date filters.</Typography>
            </CardContent>
          </Card>
        ) : (
          <>
            <Grid container spacing={3}>
              {events.map((event) => {
                const start = new Date(event.startDate);
                const end = new Date(event.endDate);
                return (
                  <Grid item xs={12} md={6} lg={4} key={event._id}>
                    <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column', borderRadius: 4 }}>
                      <Box sx={{
                        px: 3,
                        py: 2,
                        background: 'linear-gradient(135deg, rgba(59,130,246,0.15), rgba(147,51,234,0.15))'
                      }}>
                        <Stack direction="row" spacing={1} alignItems="center" justifyContent="space-between">
                          <Typography variant="body2" color="text.secondary">
                            {start.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })} - {end.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                          </Typography>
                          <Chip size="small" label={event.mode || 'Mode'} color="primary" variant="outlined" />
                        </Stack>
                        <Typography variant="h6" fontWeight={600} sx={{ mt: 1 }} noWrap>
                          {event.title || 'Event title'}
                        </Typography>
                        <Typography variant="body2" color="text.secondary" noWrap>
                          {event.description || 'Event description'}
                        </Typography>
                      </Box>
                      <CardContent sx={{ flexGrow: 1 }}>
                        <Stack spacing={1.2}>
                          <Stack direction="row" spacing={1} alignItems="center">
                            <CalendarIcon fontSize="small" color="primary" />
                            <Typography variant="body2">{start.toLocaleString()}</Typography>
                          </Stack>
                          <Stack direction="row" spacing={1} alignItems="center">
                            <LocationIcon fontSize="small" color="primary" />
                            <Typography variant="body2">{event.venue || event.location || 'Venue TBA'}</Typography>
                          </Stack>
                          <Stack direction="row" spacing={1} alignItems="center">
                            <GroupIcon fontSize="small" color="primary" />
                            <Typography variant="body2">{event.department || 'Coordinator'}</Typography>
                          </Stack>
                          {event.certificateTemplate && (
                            <Stack direction="row" spacing={1} alignItems="center">
                              <EmojiEventsIcon fontSize="small" color="secondary" />
                              <Typography variant="body2">Certificate available</Typography>
                            </Stack>
                          )}
                        </Stack>
                      </CardContent>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', p: 2, borderTop: '1px solid', borderColor: 'divider' }}>
                        <Button size="small" onClick={() => navigate(`/participant/register?eventId=${event._id}`)}>
                          Details
                        </Button>
                        <Button
                          variant="contained"
                          size="small"
                          onClick={() => registerForEvent(event._id)}
                          disabled={!participantId || registering === event._id}
                        >
                          {registering === event._id ? 'Submitting…' : 'Register'}
                        </Button>
                      </Box>
                    </Card>
                  </Grid>
                );
              })}
            </Grid>

            <Box display="flex" justifyContent="center" mt={4}>
              <Pagination count={totalPages} page={page} onChange={(_, value) => setPage(value)} color="primary" />
            </Box>
          </>
        )
      )}
    </Box>
  );
};

export default EnhancedEventsList;
