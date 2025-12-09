// EventsView.jsx
import React, { useState, useMemo } from 'react';
import {
  Box,
  Typography,
  Paper,
  TableContainer,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Chip,
  Avatar,
  Tooltip,
  TablePagination,
  IconButton,
  Stack,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Button
} from '@mui/material';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import EventAvailableIcon from '@mui/icons-material/EventAvailable';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';

const statusColor = (status = '') => {
  const s = (status || '').toLowerCase();
  if (s === 'approved' || s === 'active' || s === 'completed') return 'success';
  if (s === 'pending' || s === 'in-review') return 'warning';
  if (s === 'rejected' || s === 'cancelled') return 'error';
  return 'default';
};

const safeGetName = (user) => {
  if (!user) return '—';
  if (typeof user === 'string') return user;
  return user.name || user.fullName || user.email || '—';
};

const parseDate = (iso) => {
  if (!iso) return null;
  try {
    return new Date(iso);
  } catch {
    const d = Date.parse(iso);
    return isNaN(d) ? null : new Date(d);
  }
};

const shortDate = (iso) => {
  const d = parseDate(iso);
  if (!d) return '—';
  return d.toLocaleString(undefined, { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' });
};

const fullDate = (iso) => {
  const d = parseDate(iso);
  if (!d) return '—';
  return d.toLocaleString();
};

const comparatorByField = (a, b, field) => {
  // field: 'coordinator' | 'start' | 'status' | 'created'
  if (field === 'coordinator') {
    const na = safeGetName(a.coordinator || a.coordinatorId || a.coordinatorBy || a.coordinatorName);
    const nb = safeGetName(b.coordinator || b.coordinatorId || b.coordinatorBy || b.coordinatorName);
    return na.localeCompare(nb, undefined, { sensitivity: 'base' });
  }
  if (field === 'start') {
    const da = parseDate(a.startDate || a.start || a.fromDate || a.startAt);
    const db = parseDate(b.startDate || b.start || b.fromDate || b.startAt);
    if (da === null && db === null) return 0;
    if (da === null) return 1;
    if (db === null) return -1;
    return da - db;
  }
  if (field === 'status') {
    // preserve natural alphabetical but put known statuses first by priority
    const order = { approved: 1, active: 1, completed: 2, pending: 3, 'in-review': 3, rejected: 4, cancelled: 4 };
    const sa = (a.status || '').toLowerCase();
    const sb = (b.status || '').toLowerCase();
    const oa = order[sa] ?? 99;
    const ob = order[sb] ?? 99;
    if (oa !== ob) return oa - ob;
    return sa.localeCompare(sb);
  }
  // default created
  const ca = parseDate(a.createdAt || a.createdOn || a.dateCreated);
  const cb = parseDate(b.createdAt || b.createdOn || b.dateCreated);
  if (ca === null && cb === null) return 0;
  if (ca === null) return 1;
  if (cb === null) return -1;
  return ca - cb;
};

const EventsView = ({ events = [] }) => {
  // toolbar & pagination state
  const [page, setPage] = useState(0);
  const rowsPerPage = 10; // fixed, no rowsPerPageOptions as requested
  const [sortField, setSortField] = useState('start'); // 'coordinator' | 'start' | 'status' | 'created'
  const [sortOrder, setSortOrder] = useState('asc'); // 'asc' | 'desc'
  const [statusFilter, setStatusFilter] = useState('all'); // 'all' or status string
  const [startFilter, setStartFilter] = useState(''); // yyyy-mm-dd
  const [endFilter, setEndFilter] = useState(''); // yyyy-mm-dd

  // normalize events into objects with useful derived fields for sorting/filtering
  const normalized = useMemo(() => events.map(e => ({
    ...e,
    coordinatorObj: e.coordinatorId || e.coordinator || e.coordinatorBy || e.coordinatorName || null,
    coordinatorName: safeGetName(e.coordinatorId || e.coordinator || e.coordinatorBy || e.coordinatorName),
    startDateParsed: parseDate(e.startDate || e.start || e.fromDate || e.startAt),
    endDateParsed: parseDate(e.endDate || e.end || e.toDate || e.endAt),
    createdAtParsed: parseDate(e.createdAt || e.createdOn || e.dateCreated)
  })), [events]);

  // filtered + sorted rows
  const filteredSorted = useMemo(() => {
    let rows = normalized.slice();

    // filter by status
    if (statusFilter !== 'all') {
      rows = rows.filter(r => ((r.status || '').toLowerCase()) === statusFilter.toLowerCase());
    }

    // filter by date range (startFilter <= event.startDate <= endFilter)
    if (startFilter) {
      const min = new Date(startFilter);
      min.setHours(0, 0, 0, 0);
      rows = rows.filter(r => {
        const s = r.startDateParsed;
        return s && s >= min;
      });
    }
    if (endFilter) {
      const max = new Date(endFilter);
      max.setHours(23, 59, 59, 999);
      rows = rows.filter(r => {
        const s = r.startDateParsed;
        return s && s <= max;
      });
    }

    // sort
    rows.sort((a, b) => {
      const base = comparatorByField(a, b, sortField);
      return sortOrder === 'asc' ? base : -base;
    });

    return rows;
  }, [normalized, statusFilter, startFilter, endFilter, sortField, sortOrder]);

  // pagination handlers
  const handleChangePage = (e, newPage) => setPage(newPage);

  // UI helper: list of distinct statuses for filter dropdown
  const statusOptions = useMemo(() => {
    const set = new Set();
    events.forEach(ev => {
      if (ev.status) set.add(ev.status);
    });
    return Array.from(set);
  }, [events]);

  // Reset page when filters/sort change
  React.useEffect(() => setPage(0), [statusFilter, startFilter, endFilter, sortField, sortOrder]);

  return (
    <Box>
      <Stack direction="row" alignItems="center" justifyContent="space-between" mb={2}>
        <Stack direction="row" alignItems="center" spacing={1}>
          <EventAvailableIcon color="primary" />
          <Typography variant="h5">Events</Typography>
          <Typography variant="body2" color="text.secondary">
            {filteredSorted.length} shown
          </Typography>
        </Stack>

        {/* Toolbar: sort + filters */}
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1} alignItems="center">
          <FormControl size="small" sx={{ minWidth: 160 }}>
            <InputLabel id="sort-field-label">Sort by</InputLabel>
            <Select
              labelId="sort-field-label"
              value={sortField}
              label="Sort by"
              onChange={(e) => setSortField(e.target.value)}
            >
              <MenuItem value="coordinator">Coordinator (A→Z)</MenuItem>
              <MenuItem value="start">Start Date (Timeline)</MenuItem>
              <MenuItem value="status">Status</MenuItem>
              <MenuItem value="created">Created Date</MenuItem>
            </Select>
          </FormControl>

          <Button
            variant="outlined"
            size="small"
            startIcon={sortOrder === 'asc' ? <ArrowUpwardIcon /> : <ArrowDownwardIcon />}
            onClick={() => setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc')}
            sx={{ minWidth: 44 }}
            aria-label="toggle sort order"
          >
            {sortOrder === 'asc' ? 'Asc' : 'Desc'}
          </Button>

          <FormControl size="small" sx={{ minWidth: 140 }}>
            <InputLabel id="status-filter-label">Status</InputLabel>
            <Select
              labelId="status-filter-label"
              value={statusFilter}
              label="Status"
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <MenuItem value="all">All</MenuItem>
              {statusOptions.map(s => <MenuItem key={s} value={s}>{s}</MenuItem>)}
            </Select>
          </FormControl>

          {/* date range filters */}
          <TextField
            size="small"
            label="Start from"
            type="date"
            InputLabelProps={{ shrink: true }}
            value={startFilter}
            onChange={(e) => setStartFilter(e.target.value)}
          />
          <TextField
            size="small"
            label="End until"
            type="date"
            InputLabelProps={{ shrink: true }}
            value={endFilter}
            onChange={(e) => setEndFilter(e.target.value)}
          />

          <Button size="small" onClick={() => { setStatusFilter('all'); setStartFilter(''); setEndFilter(''); }} >
            Reset
          </Button>
        </Stack>
      </Stack>

      <Paper sx={{ p: 1 }}>
        <TableContainer sx={{ maxHeight: 560 }}>
          <Table stickyHeader size="small">
            <TableHead>
              <TableRow>
                <TableCell sx={{ width: 260 }}>Title</TableCell>
                <TableCell sx={{ width: 220 }}>Coordinator</TableCell>
                <TableCell sx={{ width: 160 }}>Status</TableCell>
                <TableCell sx={{ width: 200 }}>Start — End</TableCell>
                <TableCell sx={{ width: 140 }}>Created</TableCell>
              </TableRow>
            </TableHead>

            <TableBody>
              {filteredSorted.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7}>
                    <Box py={6} textAlign="center">
                      <Typography variant="subtitle1" color="text.secondary">No events match the current filters</Typography>
                      <Typography variant="body2" color="text.secondary" mt={1}>Try clearing filters or adding events.</Typography>
                    </Box>
                  </TableCell>
                </TableRow>
              )}

              {filteredSorted.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((event) => {
                const creator =
                    event.createdBy !== undefined && event.createdBy !== null
                        ? event.createdBy
                        : event.createdById !== undefined && event.createdById !== null
                        ? event.createdById
                        : event.creator !== undefined && event.creator !== null
                        ? event.creator
                        : event.createdByUser;

                const title = event.title || 'Untitled Event';
                const start = event.startDate || event.start || event.fromDate || event.startAt;
                const end = event.endDate || event.end || event.toDate || event.endAt;
                const createdAt = event.createdAt || event.createdOn || event.dateCreated;

                return (
                  <TableRow key={event._id || event.id} hover>
                    {/* Title with tooltip */}
                    <TableCell>
                      <Tooltip title={title} placement="top" arrow>
                        <Typography
                          variant="subtitle2"
                          sx={{
                            fontWeight: 600,
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                            maxWidth: 420,
                            display: 'inline-block',
                          }}
                        >
                          {title}
                        </Typography>
                      </Tooltip>
                      <Typography variant="caption" display="block" color="text.secondary">
                        {event.type ? event.type : (event.mode ? `${event.mode}` : '')}
                      </Typography>
                    </TableCell>

                    {/* Coordinator & Creator */}
                    <TableCell>
                      <Stack direction="row" alignItems="center" spacing={1}>
                        <Box>
                          <Typography variant="caption" color="text.primary" sx={{ display: 'block' }}>
                            &nbsp;
                            <Tooltip title={safeGetName(creator)} arrow>
                              <span style={{ fontWeight: 600 }}>{safeGetName(creator)}</span>
                            </Tooltip>
                          </Typography>
                        </Box>
                      </Stack>
                    </TableCell>

                    {/* Status */}
                    <TableCell>
                      <Chip label={event.status || 'unknown'} size="small" color={statusColor(event.status)} sx={{ textTransform: 'capitalize', fontWeight: 600 }} />
                      {event.isPublished === false && <Typography variant="caption" color="text.secondary" display="block">Draft</Typography>}
                    </TableCell>

                    {/* Start - End */}
                    <TableCell>
                      <Stack spacing={0.3}>
                        <Tooltip title={fullDate(start)} arrow>
                          <Typography variant="body2" sx={{ fontWeight: 600 }}>{shortDate(start)}</Typography>
                        </Tooltip>
                        <Tooltip title={fullDate(end)} arrow>
                          <Typography variant="caption" color="text.secondary">{shortDate(end)}</Typography>
                        </Tooltip>
                      </Stack>
                    </TableCell>

                    {/* Created */}
                    <TableCell>
                      <Tooltip title={fullDate(createdAt)} arrow>
                        <Typography variant="body2">{shortDate(createdAt)}</Typography>
                      </Tooltip>
                      <Typography variant="caption" color="text.secondary">{event.createdByRole != null ? event.createdByRole : ''}</Typography>
                    </TableCell>

                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>

        {/* Pagination: fixed rowsPerPage and no rowsPerPageOptions */}
        <TablePagination
          component="div"
          count={filteredSorted.length}
          page={page}
          onPageChange={handleChangePage}
          rowsPerPage={rowsPerPage}
          rowsPerPageOptions={[]} // explicitly empty so no selects show
        />
      </Paper>
    </Box>
  );
};

export default EventsView;
