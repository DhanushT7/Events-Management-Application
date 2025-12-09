// UsersToolbar.jsx
import React from 'react';
import { Box, Typography, Button } from '@mui/material';
import { DeleteSweep, Upload, Add, LockReset } from '@mui/icons-material';

const UsersToolbar = ({ selectedCount, onBulkDelete, onOpenBulkUpload, onOpenAddUser, onBulkReset }) => (
  <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
    <Typography variant="h5">User Management</Typography>
    <Box>
      {selectedCount > 0 && (
        <>
          <Button
            variant="outlined"
            color="error"
            startIcon={<DeleteSweep />}
            onClick={() => onBulkDelete()}
            sx={{ mr: 1 }}
          >
            Delete Selected ({selectedCount})
          </Button>

          <Button
            variant="outlined"
            color="secondary"
            startIcon={<LockReset />}
            onClick={() => onBulkReset()}
            sx={{ mr: 1 }}
          >
            Reset Passwords ({selectedCount})
          </Button>
        </>
      )}

      <Button
        variant="outlined"
        startIcon={<Upload />}
        onClick={onOpenBulkUpload}
        sx={{ mr: 1 }}
      >
        Bulk Upload
      </Button>
      <Button
        variant="contained"
        startIcon={<Add />}
        onClick={onOpenAddUser}
      >
        Add User
      </Button>
    </Box>
  </Box>
);

export default UsersToolbar;
