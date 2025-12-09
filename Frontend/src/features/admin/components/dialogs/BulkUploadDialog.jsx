import React, { useRef, useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Alert,
  Typography,
  Paper,
  Box,
  Stack
} from '@mui/material';
import DownloadIcon from '@mui/icons-material/Download';

const BulkUploadDialog = ({ open, onClose, selectedFile, setSelectedFile, onUpload, onDownloadTemplate }) => {
  const fileRef = useRef(null);
  const [localError, setLocalError] = useState('');

  const handleFileChange = (e) => {
    setLocalError('');
    const f = e.target.files?.[0];
    if (!f) {
      setSelectedFile(null);
      return;
    }
    const allowed = ['text/csv', 'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'];
    // some browsers don't provide MIME for csv, allow by extension fallback
    if (!allowed.includes(f.type) && !f.name.match(/\.(csv|xls|xlsx)$/i)) {
      setLocalError('Unsupported file type. Use .csv, .xls or .xlsx');
      setSelectedFile(null);
      return;
    }
    setSelectedFile(f);
  };

  const clearFile = () => {
    setSelectedFile(null);
    if (fileRef.current) fileRef.current.value = null;
  };

  return (
    <Dialog open={open} onClose={() => { onClose(); clearFile(); }} maxWidth="md" fullWidth>
      <DialogTitle>
        <Stack direction="row" alignItems="center" justifyContent="space-between">
          <Box>
            <Typography variant="h6">Bulk Upload Users</Typography>
            <Typography variant="caption" color="text.secondary">Upload multiple users via CSV / Excel</Typography>
          </Box>

          <Button variant="outlined" startIcon={<DownloadIcon />} onClick={onDownloadTemplate} size="small">
            Download Template
          </Button>
        </Stack>
      </DialogTitle>

      <DialogContent>
        <Stack spacing={2}>
          <Alert severity="info">
            <Typography variant="subtitle2">Instructions</Typography>
            <Typography variant="body2">
              Download the template, fill rows (email,role,department) and upload. Column headers must not be changed.
            </Typography>
          </Alert>

          <Alert severity="warning">
            <Typography variant="subtitle2">Important Notes</Typography>
            <Typography variant="body2">
              Roles allowed: participant, coordinator, hod. Duplicate emails are skipped. If a new HOD is uploaded, existing HOD will be deactivated.
            </Typography>
          </Alert>

          <Paper variant="outlined" sx={{ p: 2, bgcolor: 'grey.50' }}>
            <Typography variant="subtitle2" sx={{ mb: 1 }}>Required columns</Typography>
            <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>
              <strong>email</strong>, <strong>role</strong>, <strong>department</strong>
            </Typography>
          </Paper>

          <Box>
            <Typography variant="subtitle2" gutterBottom>Select file to upload</Typography>
            <input
              ref={fileRef}
              type="file"
              accept=".csv,.xlsx,.xls"
              onChange={handleFileChange}
              style={{ display: 'block', marginTop: 6 }}
              aria-label="bulk upload file"
            />
            {localError && <Typography variant="caption" color="error" sx={{ mt: 1 }}>{localError}</Typography>}
            {selectedFile && (
              <Paper sx={{ mt: 2, p: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="body2">Selected: {selectedFile.name}</Typography>
                <Box>
                  <Button size="small" onClick={clearFile}>Remove</Button>
                </Box>
              </Paper>
            )}
          </Box>
        </Stack>
      </DialogContent>

      <DialogActions sx={{ px: 3, py: 2 }}>
        <Button onClick={() => { onClose(); clearFile(); }} color="inherit">Cancel</Button>
        <Button onClick={onUpload} variant="contained" disabled={!selectedFile}>
          Upload Users
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default BulkUploadDialog;
