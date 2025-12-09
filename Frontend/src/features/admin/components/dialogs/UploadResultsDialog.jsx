import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Alert,
  Typography,
  Paper,
  TableContainer,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Chip,
  Box,
  Stack
} from '@mui/material';

const UploadResultsDialog = ({ open, onClose, uploadResults }) => {
  const summary = uploadResults?.summary || {};
  const results = uploadResults?.results || {};

  return (
    <Dialog open={open} onClose={onClose} maxWidth="lg" fullWidth>
      <DialogTitle>Bulk Upload Results</DialogTitle>

      <DialogContent dividers>
        <Stack spacing={2}>
          {summary.total != null && (
            <Alert severity={summary.failed > 0 ? 'warning' : 'success'}>
              <Typography variant="body2">
                Total processed: <strong>{summary.total}</strong> • Successful: <strong>{summary.successful}</strong> • Failed: <strong>{summary.failed}</strong> • Warnings: <strong>{summary.warnings || 0}</strong>
              </Typography>
            </Alert>
          )}

          {results?.warnings?.length > 0 && (
            <Paper variant="outlined" sx={{ p: 2 }}>
              <Typography variant="subtitle2" sx={{ mb: 1 }}>Warnings</Typography>
              {results.warnings.map((w, idx) => (
                <Typography key={idx} variant="body2">• {w.message}</Typography>
              ))}
            </Paper>
          )}

          {results?.success?.length > 0 && (
            <Box>
              <Typography variant="h6" color="success.main" gutterBottom>Successfully Added Users ({results.success.length})</Typography>
              <TableContainer component={Paper} sx={{ maxHeight: 320 }}>
                <Table size="small" stickyHeader>
                  <TableHead>
                    <TableRow>
                      <TableCell>Row</TableCell>
                      <TableCell>Name</TableCell>
                      <TableCell>Email</TableCell>
                      <TableCell>Role</TableCell>
                      <TableCell>Department</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {results.success.map((u, i) => (
                      <TableRow key={i}>
                        <TableCell>{u.row ?? i + 1}</TableCell>
                        <TableCell>{u.name}</TableCell>
                        <TableCell>{u.email}</TableCell>
                        <TableCell><Chip label={u.role} size="small" /></TableCell>
                        <TableCell>{u.department}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Box>
          )}

          {results?.errors?.length > 0 && (
            <Box>
              <Typography variant="h6" color="error.main" gutterBottom>Failed to Add ({results.errors.length})</Typography>
              <TableContainer component={Paper} sx={{ maxHeight: 320 }}>
                <Table size="small" stickyHeader>
                  <TableHead>
                    <TableRow>
                      <TableCell>Row</TableCell>
                      <TableCell>Email</TableCell>
                      <TableCell>Error</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {results.errors.map((err, idx) => (
                      <TableRow key={idx}>
                        <TableCell>{err.row ?? idx + 1}</TableCell>
                        <TableCell>{err.email}</TableCell>
                        <TableCell>
                          <Typography variant="body2" color="error">{err.error}</Typography>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Box>
          )}
        </Stack>
      </DialogContent>

      <DialogActions sx={{ px: 3, py: 2 }}>
        <Button onClick={onClose} variant="contained">Close</Button>
      </DialogActions>
    </Dialog>
  );
};

export default UploadResultsDialog;
