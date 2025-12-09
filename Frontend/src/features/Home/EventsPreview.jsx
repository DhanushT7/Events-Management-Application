// EventsPreview.jsx — drop-in replacement
import React, { useEffect, useState } from 'react';
import {
  Box, Button, Chip, Container, Grid, Typography, CircularProgress, Stack
} from '@mui/material';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import { useNavigate } from 'react-router-dom';

const formatDateIST = (iso) =>
  iso ? new Intl.DateTimeFormat('en-GB', { dateStyle: 'medium', timeStyle: 'short', timeZone: 'Asia/Kolkata' }).format(new Date(iso)) : '';

const joinBasePath = (base, path) => {
  if (!base) return path;
  const b = base.replace(/\/+$/, '');
  const p = path.startsWith('/') ? path : '/' + path;
  if (/\/api$/i.test(b) && /^\/api(\/|$)/i.test(p)) {
    return b.replace(/\/api$/i, '') + p;
  }
  return b + p;
};

export default function EventsPreview({ apiPath = '/api/events/top?limit=3' }) {
  const navigate = useNavigate();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const base = (import.meta.env && import.meta.env.VITE_API_BASE_URL) || '';
  const url = joinBasePath(base, apiPath);

  useEffect(() => {
    let mounted = true;
    const controller = new AbortController();
    let timeoutId = null;

    const safeFetchJson = async (u) => {
      timeoutId = setTimeout(() => controller.abort(), 12000);
      const res = await fetch(u, { signal: controller.signal, credentials: 'include' });
      const txt = await res.text();
      console.log('[EventsPreview] RAW response from', u, txt.slice(0, 200)); // truncated for readability
      if (!res.ok) throw new Error(`HTTP ${res.status} - ${txt}`);
      let parsed;
      try { parsed = JSON.parse(txt); } catch (e) { parsed = txt; }
      if (timeoutId) { clearTimeout(timeoutId); timeoutId = null; }
      return parsed;
    };

    const run = async () => {
      setLoading(true);
      setError(null);
      try {
        // try top
        const topData = await safeFetchJson(url);
        let arr = Array.isArray(topData) ? topData : (topData?.events && Array.isArray(topData.events) ? topData.events : []);
        if (arr.length === 0) {
          // fallback to fetching all events and take first `limit`
          console.warn('[EventsPreview] top returned empty — falling back to /api/events');
          const allUrl = joinBasePath(base, '/api/events');
          const allData = await safeFetchJson(allUrl);
          const allArr = Array.isArray(allData) ? allData : allData?.events ?? allData?.data ?? [];
          arr = Array.isArray(allArr) ? allArr.slice(0, 3) : [];
        }
        if (mounted) setItems(arr);
      } catch (err) {
        console.error('EventsPreview fetch error:', err);
        if (mounted) setError(err.name === 'AbortError' ? 'Request aborted (timeout)' : (err.message || 'Failed to fetch'));
      } finally {
        if (timeoutId) { clearTimeout(timeoutId); timeoutId = null; }
        if (mounted) setLoading(false);
      }
    };

    run();

    return () => {
      mounted = false;
      if (timeoutId) clearTimeout(timeoutId);
      controller.abort();
    };
  }, [url]);

  return (
    <Box sx={{ mt: 4 }}>
      <Container maxWidth="lg">
        <Grid container spacing={2} alignItems="stretch">
          {loading ? (
            [0,1,2].map(i => (
              <Grid size={{ xs: 12, sm: 6, md: 4 }} key={i}>
                <Box sx={{ height: 130, borderRadius: 2, background: 'rgba(255,255,255,0.03)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <CircularProgress />
                </Box>
              </Grid>
            ))
          ) : error ? (
            <Grid size={{ xs: 12 }}>
              <Box sx={{ p: 2, borderRadius: 2, background: 'rgba(255,255,255,0.03)' }}>
                <Typography variant="h6" color="error" sx={{ fontWeight: 800 }}>Could not load events</Typography>
                <Typography variant="body2" sx={{ mt: 1, opacity: 0.85 }}>{error}</Typography>
                <Box sx={{ mt: 2, display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                  <Button variant="contained" onClick={() => window.location.reload()} sx={{ textTransform: 'none' }}>Retry</Button>
                  <Button variant="text" onClick={() => navigate('/events')} sx={{ textTransform: 'none' }}>View all events</Button>
                </Box>
              </Box>
            </Grid>
          ) : items.length === 0 ? (
            <Grid size={{ xs: 12 }}>
              <Typography sx={{ opacity: 0.8, py: 2 }}>No events to show.</Typography>
            </Grid>
          ) : (
            items.map(ev => (
              <Grid size={{ xs: 12, sm: 6, md: 4 }} key={ev._id || ev.title}>
                <Box sx={{ height: '100%', borderRadius: 2, background: 'rgba(255,255,255,0.03)', p: 2 }}>
                  <Stack spacing={1}>
                    <Typography variant="subtitle1" sx={{ fontWeight: 900 }}>{ev.title}</Typography>
                    <Typography variant="caption" sx={{ opacity: 0.85 }}>{formatDateIST(ev.startDate)} — {formatDateIST(ev.endDate)}</Typography>
                    <Chip icon={<CalendarTodayIcon />} label={ev.mode || '—'} size="small" sx={{ mt: 1, color: '#bbb' }} />
                  </Stack>
                </Box>
              </Grid>
            ))
          )}

          <Grid size={{ xs: 12 }} sx={{ display: 'flex', justifyContent: 'center', mt: 1 }}>
            <Button onClick={() => navigate('/events')} variant="outlined" sx={{ textTransform: 'none' }}>View all events</Button>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
}
