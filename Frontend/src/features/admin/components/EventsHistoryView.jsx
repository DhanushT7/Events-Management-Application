import React, { useEffect, useMemo, useState, useCallback } from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  TableContainer,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  TablePagination,
  Chip,
  Stack,
  Divider,
  CircularProgress
} from '@mui/material';
import axios from 'axios';
import { saveAs } from 'file-saver';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';


const ROWS_PER_PAGE = 10;

const EventsHistoryView = ({ apiBaseProp, token, enqueueSnackbar }) => {
  const apiBase = apiBaseProp || import.meta.env.VITE_API_BASE_URL || 'http://10.5.12.1:4000/api';

  const [loading, setLoading] = useState(false);
  const [events, setEvents] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [page, setPage] = useState(0);
  const [sortField, setSortField] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState('desc');

  // filters
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [deptFilter, setDeptFilter] = useState('');
  const [coordFilter, setCoordFilter] = useState('');
  const [startFilter, setStartFilter] = useState('');
  const [endFilter, setEndFilter] = useState('');

  const fetchEvents = useCallback(async () => {
    if (!token) {
      enqueueSnackbar?.('Auth token missing', { variant: 'warning' });
      return;
    }
    setLoading(true);
    try {
      const res = await axios.get(`${apiBase}/admin/events/history`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = res.data?.events ?? res.data ?? [];
      setEvents(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Error loading event history', err);
      enqueueSnackbar?.(err?.response?.data?.message || 'Unable to load event history', { variant: 'error' });
    } finally {
      setLoading(false);
    }
  }, [apiBase, token, enqueueSnackbar]);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  const parseDate = (v) => {
    if (!v) return null;
    const d = new Date(v);
    return isNaN(d) ? null : d;
  };
  const formatShort = (v) => {
    const d = parseDate(v); if (!d) return '—';
    return d.toLocaleString(undefined, { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  const statusOptions = useMemo(() => {
    const s = new Set();
    events.forEach(e => { if (e.status) s.add(e.status); });
    return Array.from(s).sort();
  }, [events]);

  const deptOptions = useMemo(() => {
    const s = new Set();
    events.forEach(e => { if (e.organizingDepartments?.primary) s.add(String(e.organizingDepartments.primary).toUpperCase()); (e.organizingDepartments?.associative || []).forEach(d => s.add(String(d).toUpperCase())); });
    return Array.from(s).sort();
  }, [events]);

  const coordOptions = useMemo(() => {
    const s = new Set();
    events.forEach(e => {
      const name = e.coordinatorId?.name || e.coordinator?.name || e.coordinator || e.coordinatorName || '';
      if (name) s.add(name);
      (e.coordinators || []).forEach(c => c.name && s.add(c.name));
    });
    return Array.from(s).sort();
  }, [events]);

  useEffect(() => {
    let rows = events.slice();

    if (search && search.trim()) {
      const q = search.trim().toLowerCase();
      rows = rows.filter(e => {
        const title = (e.title || '').toString().toLowerCase();
        const dept = ((e.organizingDepartments?.primary || '') + ' ' + (e.organizingDepartments?.associative || []).join(' ')).toLowerCase();
        const coord = (e.coordinatorId?.name || e.coordinator?.name || e.coordinator || e.coordinatorName || (e.coordinators || []).map(c=>c.name).join(' ')).toString().toLowerCase();
        return title.includes(q) || dept.includes(q) || coord.includes(q) || (e._id || '').toString().includes(q);
      });
    }

    if (statusFilter !== 'all') {
      rows = rows.filter(e => (e.status || '').toLowerCase() === statusFilter.toLowerCase());
    }

    if (deptFilter) {
      rows = rows.filter(e => {
        const allDepts = [e.organizingDepartments?.primary, ...(e.organizingDepartments?.associative || [])].filter(Boolean).map(d => String(d).toLowerCase());
        return allDepts.includes(String(deptFilter).toLowerCase());
      });
    }

    if (coordFilter) {
      rows = rows.filter(e => {
        const name = e.coordinatorId?.name || e.coordinator?.name || e.coordinator || e.coordinatorName || (e.coordinators || []).map(c=>c.name).join(' ');
        return String(name).toLowerCase() === coordFilter.toLowerCase();
      });
    }

    if (startFilter) {
      const min = new Date(startFilter); min.setHours(0,0,0,0);
      rows = rows.filter(e => {
        const s = parseDate(e.startDate || e.start || e.fromDate || e.startAt);
        return s && s >= min;
      });
    }
    if (endFilter) {
      const max = new Date(endFilter); max.setHours(23,59,59,999);
      rows = rows.filter(e => {
        const s = parseDate(e.startDate || e.start || e.fromDate || e.startAt);
        return s && s <= max;
      });
    }

    rows.sort((a, b) => {
      const af = a[sortField] ?? a.startDate ?? a.createdAt ?? '';
      const bf = b[sortField] ?? b.startDate ?? b.createdAt ?? '';
      const da = parseDate(af);
      const db = parseDate(bf);
      if (da || db) {
        if (!da && db) return sortOrder === 'asc' ? 1 : -1;
        if (da && !db) return sortOrder === 'asc' ? -1 : 1;
        const diff = (da - db);
        return sortOrder === 'asc' ? diff : -diff;
      }
      return sortOrder === 'asc' ? String(af).localeCompare(String(bf)) : String(bf).localeCompare(String(af));
    });

    setFiltered(rows);
    setPage(0);
  }, [events, search, statusFilter, deptFilter, coordFilter, startFilter, endFilter, sortField, sortOrder]);

  const handleChangePage = (e, newPage) => setPage(newPage);

  // Export functions (lean)
  const exportCSV = () => {
    try {
      if (!filtered || filtered.length === 0) {
        enqueueSnackbar?.('No rows to export', { variant: 'warning' });
        return;
      }

      const headers = [
        'Event ID','Title','Type','Mode','Venue',
        'Departments','Coordinators','Start','End','Duration',
        'Status','Created At','Created By','Budget','TotalIncome','TotalExpenditure',
        'ClaimTotalExpenditure','ClaimTotalApproved','CommitteeSize','ShortNotes'
      ];

      const rows = filtered.map(e => {
        const departments = [
          e.organizingDepartments?.primary,
          ...(e.organizingDepartments?.associative ?? [])
        ].filter(Boolean).join(', ');

        const coordinators = (e.coordinators || [])
          .map(c => `${c.name}${c.designation ? ' ('+c.designation+')' : ''}`)
          .join(', ') || e.coordinatorId?.name || '';

        const shortNotes = (e.reviewComments || '').replace(/\s+/g,' ').trim().slice(0,200);

        return [
          e._id || '',
          e.title || '',
          e.type || '',
          e.mode || '',
          e.venue || '',
          departments,
          coordinators,
          e.startDate ? new Date(e.startDate).toISOString().replace('T',' ').slice(0,16) : '',
          e.endDate ? new Date(e.endDate).toISOString().replace('T',' ').slice(0,16) : '',
          e.duration || '',
          e.status || '',
          e.createdAt ? new Date(e.createdAt).toISOString().replace('T',' ').slice(0,16) : '',
          e.createdBy?.email || e.createdBy?.name || '',
          Number(e.budget ?? 0).toFixed(2),
          Number(e.budgetBreakdown?.totalIncome ?? 0).toFixed(2),
          Number(e.budgetBreakdown?.totalExpenditure ?? 0).toFixed(2),
          Number(e.claimBill?.totalExpenditure ?? 0).toFixed(2),
          Number(e.claimBill?.totalApprovedAmount ?? 0).toFixed(2),
          (e.organizingCommittee || []).length,
          shortNotes
        ];
      });

      const csvLines = [headers.join(',')].concat(rows.map(r => r.map(c => `"${String(c||'').replace(/"/g,'""')}"`).join(',')));
      const blob = new Blob([csvLines.join('\n')], { type: 'text/csv;charset=utf-8;' });
      saveAs(blob, `EventHistory_lean_${new Date().toISOString().slice(0,10)}.csv`);
      enqueueSnackbar?.('CSV exported', { variant: 'success' });
    } catch (err) {
      console.error('CSV export error', err);
      enqueueSnackbar?.('Failed to export CSV', { variant: 'error' });
    }
  };

  const exportXLSX = () => {
    try {
      if (!filtered || filtered.length === 0) {
        enqueueSnackbar?.('No rows to export', { variant: 'warning' });
        return;
      }

      const eventsSheet = filtered.map(e => {
        const departments = [e.organizingDepartments?.primary, ...(e.organizingDepartments?.associative ?? [])].filter(Boolean).join(', ');
        const coordinators = (e.coordinators || []).map(c => `${c.name}${c.designation ? ' ('+c.designation+')' : ''}`).join(', ') || e.coordinatorId?.name || '';
        return {
          'Event ID': e._id || '',
          Title: e.title || '',
          Type: e.type || '',
          Mode: e.mode || '',
          Venue: e.venue || '',
          Departments: departments,
          Coordinators: coordinators,
          Start: e.startDate ? new Date(e.startDate) : '',
          End: e.endDate ? new Date(e.endDate) : '',
          Duration: e.duration || '',
          Status: e.status || '',
          'Created At': e.createdAt ? new Date(e.createdAt) : '',
          'Created By': e.createdBy?.email || e.createdBy?.name || '',
          Budget: Number(e.budget ?? 0),
          'Total Income': Number(e.budgetBreakdown?.totalIncome ?? 0),
          'Total Expenditure': Number(e.budgetBreakdown?.totalExpenditure ?? 0),
          'Claim Total Expenditure': Number(e.claimBill?.totalExpenditure ?? 0),
          'Claim Total Approved': Number(e.claimBill?.totalApprovedAmount ?? 0),
          'Committee Size': (e.organizingCommittee || []).length,
          'Short Notes': (e.reviewComments || '').replace(/\s+/g,' ').trim().slice(0,200)
        };
      });

      const wb = XLSX.utils.book_new();
      const wsEvents = XLSX.utils.json_to_sheet(eventsSheet, { dateNF: 'yyyy-mm-dd hh:mm' });
      wsEvents['!cols'] = [
        { wch: 18 }, { wch: 36 }, { wch: 12 }, { wch: 10 }, { wch: 18 },
        { wch: 20 }, { wch: 28 }, { wch: 18 }, { wch: 18 }, { wch: 10 },
        { wch: 18 }, { wch: 16 }, { wch: 16 }, { wch: 12 }, { wch: 14 },
        { wch: 16 }, { wch: 16 }, { wch: 12 }, { wch: 40 }
      ];
      XLSX.utils.book_append_sheet(wb, wsEvents, 'Events');

      const claims = [];
      filtered.forEach(e => {
        (e.claimBill?.expenses || []).forEach((exp, idx) => {
          claims.push({
            'Event ID': e._id || '',
            Title: e.title || '',
            Row: idx + 1,
            Category: exp.category || '',
            BudgetAmount: Number(exp.budgetAmount ?? 0),
            ActualAmount: Number(exp.actualAmount ?? 0),
            Amount: Number(exp.amount ?? 0),
            ItemStatus: exp.itemStatus || '',
            ApprovedAmount: Number(exp.approvedAmount ?? 0),
            RejectionReason: exp.rejectionReason || '',
            ReviewedBy: exp.reviewedBy || '',
            ReviewDate: exp.reviewDate ? new Date(exp.reviewDate) : '',
            ReceiptNumber: exp.receiptNumber || ''
          });
        });
      });
      if (claims.length) {
        const wsClaims = XLSX.utils.json_to_sheet(claims, { dateNF: 'yyyy-mm-dd hh:mm' });
        wsClaims['!cols'] = [{wch:18},{wch:32},{wch:6},{wch:14},{wch:12},{wch:12},{wch:12},{wch:12},{wch:12},{wch:18},{wch:16},{wch:18}];
        XLSX.utils.book_append_sheet(wb, wsClaims, 'Budgets_Claims');
      }

      const committeeRows = [];
      filtered.forEach(e => {
        (e.organizingCommittee || []).forEach((c, idx) => {
          committeeRows.push({
            'Event ID': e._id || '',
            Title: e.title || '',
            MemberId: c.member || '',
            MemberName: c.customName || '',
            Designation: c.customDesignation || '',
            Department: c.customDepartment || '',
            Order: c.order ?? idx + 1
          });
        });
      });
      if (committeeRows.length) {
        const wsComm = XLSX.utils.json_to_sheet(committeeRows);
        XLSX.utils.book_append_sheet(wb, wsComm, 'Committee');
      }

      const totalBudget = eventsSheet.reduce((s, r) => s + (r.Budget || 0), 0);
      const totalExp = eventsSheet.reduce((s, r) => s + (r['Total Expenditure'] || 0), 0);
      const overview = [
        ['Exported On', new Date().toLocaleString()],
        ['Total Events', eventsSheet.length],
        ['Total Budget', totalBudget],
        ['Total Expenditure', totalExp],
      ];
      const wsOverview = XLSX.utils.aoa_to_sheet(overview);
      XLSX.utils.book_append_sheet(wb, wsOverview, 'Overview');

      const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
      saveAs(new Blob([wbout], { type: 'application/octet-stream' }), `EventHistory_lean_${new Date().toISOString().slice(0,10)}.xlsx`);
      enqueueSnackbar?.('XLSX exported', { variant: 'success' });
    } catch (err) {
      console.error('XLSX export error', err);
      enqueueSnackbar?.('Failed to export XLSX', { variant: 'error' });
    }
  };

  const exportPDF = () => {
    try {
        if (!filtered || filtered.length === 0) {
        enqueueSnackbar?.('No rows to export', { variant: 'warning' });
        return;
        }

        // ensure plugin available
        if (typeof autoTable !== 'function') {
        console.error('jspdf-autotable plugin not available', autoTable);
        enqueueSnackbar?.('PDF export plugin missing. Ensure jspdf-autotable is installed.', { variant: 'error' });
        return;
        }

        const doc = new jsPDF('landscape', 'pt', 'a4');
        const title = 'Event History Report (Lean)';
        const now = new Date().toLocaleString();

        doc.setFontSize(18);
        doc.text(title, 40, 60);
        doc.setFontSize(11);
        doc.text(`Exported: ${now}`, 40, 82);
        doc.setDrawColor(200);
        doc.line(40, 112, doc.internal.pageSize.getWidth() - 40, 112);

        const totalEvents = filtered.length;
        const totalBudget = filtered.reduce((s, e) => s + (Number(e.budget) || 0), 0);
        doc.setFontSize(12);
        doc.text(`Total events: ${totalEvents}`, 40, 140);
        doc.text(`Total budget: ${totalBudget.toLocaleString()}`, 40, 158);

        const startY = 190;
        const head = [['ID','Title','Coordinator','Dept','Start','End','Status','Budget']];
        const body = filtered.map(e => [
        (e._id || '').toString().slice(0,12),
        e.title || '',
        (e.coordinators || []).map(c => c.name).join(', ') || e.coordinatorId?.name || '',
        [e.organizingDepartments?.primary, ...(e.organizingDepartments?.associative || [])].filter(Boolean).join(', '),
        e.startDate ? new Date(e.startDate).toLocaleString() : '',
        e.endDate ? new Date(e.endDate).toLocaleString() : '',
        e.status || '',
        e.budget ? Number(e.budget).toFixed(2) : ''
        ]);

        // call plugin as function
        autoTable(doc, {
        startY,
        head,
        body,
        theme: 'striped',
        styles: { fontSize: 8 },
        headStyles: { fillColor: [50, 100, 160] },
        margin: { left: 40, right: 40 },
        didDrawPage: function (data) {
            const page = doc.internal.getNumberOfPages();
            doc.setFontSize(9);
            doc.text(`Page ${page}`, doc.internal.pageSize.getWidth() - 60, doc.internal.pageSize.getHeight() - 20);
        }
        });

        // Appendix: claim rows (if any)
        const appendix = filtered.filter(e => (e.claimBill?.expenses || []).length > 0);
        appendix.forEach(e => {
        doc.addPage();
        doc.setFontSize(12);
        doc.text(`Event: ${e.title || e._id}`, 40, 40);
        const claimsBody = (e.claimBill.expenses || []).map((exp, idx) => [
            idx + 1,
            exp.category || '',
            Number(exp.budgetAmount || 0).toFixed(2),
            Number(exp.actualAmount || 0).toFixed(2),
            Number(exp.amount || 0).toFixed(2),
            exp.itemStatus || '',
            Number(exp.approvedAmount || 0).toFixed(2),
            exp.rejectionReason || ''
        ]);
        autoTable(doc, {
            startY: 64,
            head: [['#','Category','BudgetAmt','ActualAmt','Amount','Status','ApprovedAmt','RejectionReason']],
            body: claimsBody,
            styles: { fontSize: 9 },
            margin: { left: 40, right: 40 }
        });
        });

        doc.save(`EventHistory_lean_${new Date().toISOString().slice(0,10)}.pdf`);
        enqueueSnackbar?.('PDF exported', { variant: 'success' });
    } catch (err) {
        console.error('PDF export error', err);
        enqueueSnackbar?.('Failed to export PDF', { variant: 'error' });
    }
    };

  const clearFilters = () => {
    setSearch(''); setStatusFilter('all'); setDeptFilter(''); setCoordFilter(''); setStartFilter(''); setEndFilter('');
  };

  return (
    <Box>
      <Typography variant="h5" gutterBottom>
        Event History
      </Typography>

      <Paper sx={{ p: 2, mb: 2 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={3}>
            <TextField label="Search (title, id, coordinator)" size="small" fullWidth value={search} onChange={(e) => setSearch(e.target.value)} />
          </Grid>

          <Grid item xs={6} md={2}>
            <FormControl fullWidth size="small">
              <InputLabel>Status</InputLabel>
              <Select value={statusFilter} label="Status" onChange={(e) => setStatusFilter(e.target.value)}>
                <MenuItem value="all">All</MenuItem>
                {statusOptions.map(s => <MenuItem key={s} value={s}>{s}</MenuItem>)}
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={6} md={2}>
            <FormControl fullWidth size="small">
              <InputLabel>Department</InputLabel>
              <Select value={deptFilter} label="Department" onChange={(e) => setDeptFilter(e.target.value)}>
                <MenuItem value="">All</MenuItem>
                {deptOptions.map(d => <MenuItem key={d} value={d}>{d}</MenuItem>)}
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={6} md={2}>
            <FormControl fullWidth size="small">
              <InputLabel>Coordinator</InputLabel>
              <Select value={coordFilter} label="Coordinator" onChange={(e) => setCoordFilter(e.target.value)}>
                <MenuItem value="">All</MenuItem>
                {coordOptions.map(c => <MenuItem key={c} value={c}>{c}</MenuItem>)}
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={6} md={3}>
            <Stack direction="row" spacing={1}>
              <TextField label="Start from" type="date" size="small" InputLabelProps={{ shrink: true }} value={startFilter} onChange={(e) => setStartFilter(e.target.value)} sx={{ minWidth: 140 }} />
              <TextField label="End until" type="date" size="small" InputLabelProps={{ shrink: true }} value={endFilter} onChange={(e) => setEndFilter(e.target.value)} sx={{ minWidth: 140 }} />
            </Stack>
          </Grid>

          <Grid item xs={12} md={6}>
            <Stack direction="row" spacing={1}>
              <Button variant="contained" onClick={exportCSV}>Export CSV</Button>
              <Button variant="outlined" onClick={exportXLSX}>Export XLSX</Button>
              <Button variant="outlined" onClick={exportPDF}>Export PDF</Button>
              <Button variant="text" onClick={clearFilters}>Reset</Button>
            </Stack>
          </Grid>

          <Grid item xs={12} md={6} textAlign="right">
            <Stack direction="row" spacing={1} justifyContent="flex-end" alignItems="center">
              <Chip label={`Total: ${events.length}`} size="small" />
              <Chip label={`Shown: ${filtered.length}`} size="small" />
              <Button variant="text" onClick={fetchEvents}>Reload</Button>
            </Stack>
          </Grid>
        </Grid>
      </Paper>

      <Paper>
        <TableContainer sx={{ maxHeight: 520 }}>
          <Table stickyHeader size="small">
            <TableHead>
              <TableRow>
                <TableCell sx={{ width: 120, cursor: 'pointer' }} onClick={() => { setSortField('createdAt'); setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc'); }}>
                  ID
                </TableCell>
                <TableCell sx={{ minWidth: 220 }}>Title</TableCell>
                <TableCell sx={{ width: 200 }}>Coordinator</TableCell>
                <TableCell sx={{ width: 120 }}>Department</TableCell>
                <TableCell sx={{ width: 110 }}>Status</TableCell>
                <TableCell sx={{ width: 180 }}>Start</TableCell>
                <TableCell sx={{ width: 180 }}>End</TableCell>
                <TableCell sx={{ width: 160, cursor: 'pointer' }} onClick={() => { setSortField('createdAt'); setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc'); }}>
                  Created
                </TableCell>
              </TableRow>
            </TableHead>

            <TableBody>
              {loading ? (
                <TableRow><TableCell colSpan={8}><Box display="flex" justifyContent="center" py={6}><CircularProgress /></Box></TableCell></TableRow>
              ) : filtered.length === 0 ? (
                <TableRow><TableCell colSpan={8}><Box py={6} textAlign="center"><Typography color="text.secondary">No history found with the selected filters.</Typography></Box></TableCell></TableRow>
              ) : (
                filtered.slice(page * ROWS_PER_PAGE, page * ROWS_PER_PAGE + ROWS_PER_PAGE).map(evt => (
                  <TableRow key={evt._id || evt.id}>
                    <TableCell>{String(evt._id ?? evt.id ?? '').slice(0, 12)}</TableCell>
                    <TableCell>
                      <Typography sx={{ fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: 420 }}>{evt.title}</Typography>
                      <Typography variant="caption" color="text.secondary">{evt.type ?? ''}</Typography>
                    </TableCell>
                    <TableCell>{evt.coordinatorId?.name || evt.coordinator?.name || (evt.coordinators || []).map(c=>c.name).join(', ') || '—'}</TableCell>
                    <TableCell>{[evt.organizingDepartments?.primary, ...(evt.organizingDepartments?.associative || [])].filter(Boolean).join(', ') || '—'}</TableCell>
                    <TableCell>
                      <Chip label={evt.status || '—'} size="small" color={ (evt.status||'').toLowerCase().includes('approved') ? 'success' : (evt.status||'').toLowerCase().includes('reject') ? 'error' : 'default' } />
                    </TableCell>
                    <TableCell>{formatShort(evt.startDate || evt.start || evt.fromDate || evt.startAt)}</TableCell>
                    <TableCell>{formatShort(evt.endDate || evt.end || evt.toDate || evt.endAt)}</TableCell>
                    <TableCell>{formatShort(evt.createdAt || evt.createdOn || evt.dateCreated)}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>

        <Divider />

        <Box display="flex" justifyContent="space-between" alignItems="center" p={1}>
          <Typography variant="caption" color="text.secondary">Showing rows {Math.min(filtered.length, page * ROWS_PER_PAGE + 1)} — {Math.min(filtered.length, (page+1) * ROWS_PER_PAGE)} of {filtered.length}</Typography>
          <TablePagination
            component="div"
            count={filtered.length}
            page={page}
            onPageChange={handleChangePage}
            rowsPerPage={ROWS_PER_PAGE}
            rowsPerPageOptions={[]}
            labelDisplayedRows={({ from, to, count }) => `${from}–${to} of ${count}`}
          />
        </Box>
      </Paper>
    </Box>
  );
};

export default EventsHistoryView;
