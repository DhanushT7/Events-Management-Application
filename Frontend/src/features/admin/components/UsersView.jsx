// UsersView.jsx
import React, { useState } from 'react';
import {
  Box, Paper, TableContainer, Table, TableHead, TableRow, TableCell, TableBody,
  Checkbox, Chip, IconButton, Dialog, DialogTitle, DialogContent, DialogActions,
  Button, Typography, CircularProgress
} from '@mui/material';
import { Edit, Delete } from '@mui/icons-material';
import LockResetIcon from '@mui/icons-material/LockReset';
import UsersToolbar from './UsersToolbar';

const UsersView = ({
  users = [],
  selectedUsers = [],
  onSelectUser,
  onSelectAll,
  onEditUser,
  onDeleteUser,
  onBulkDelete,
  onOpenAddUser,
  onOpenBulkUpload,
  onResetUser,   // function(userId) => Promise
  onBulkReset,   // function(userIds) => Promise
  openResetDialog: parentOpenResetDialog, // optional (backwards compat)
}) => {
  // Dialog state for single reset
  const [singleResetDialog, setSingleResetDialog] = useState({
    open: false,
    user: null,
  });

  // Dialog state for bulk reset
  const [bulkResetDialogOpen, setBulkResetDialogOpen] = useState(false);

  // Loading indicator while performing reset
  const [actionLoading, setActionLoading] = useState(false);

  // Open single-user reset dialog
  const openSingleResetDialog = (user) => {
    // prefer parent handler if provided (keeps compatibility), else use local dialog
    if (typeof parentOpenResetDialog === 'function') {
      parentOpenResetDialog(user);
      return;
    }
    setSingleResetDialog({ open: true, user });
  };

  const closeSingleResetDialog = () => setSingleResetDialog({ open: false, user: null });

  // Confirm single-user reset
  const confirmSingleReset = async () => {
    if (!singleResetDialog.user || !onResetUser) {
      closeSingleResetDialog();
      return;
    }
    setActionLoading(true);
    try {
      await onResetUser(singleResetDialog.user._id);
    } catch (err) {
      console.error('Single reset failed', err);
      // optionally show toast/snackbar in parent
    } finally {
      setActionLoading(false);
      closeSingleResetDialog();
    }
  };

  // Bulk handlers
  const openBulkResetDialog = () => setBulkResetDialogOpen(true);
  const closeBulkResetDialog = () => setBulkResetDialogOpen(false);

  const confirmBulkReset = async () => {
    if (!selectedUsers || selectedUsers.length === 0 || !onBulkReset) {
      closeBulkResetDialog();
      return;
    }
    setActionLoading(true);
    try {
      await onBulkReset(selectedUsers);
    } catch (err) {
      console.error('Bulk reset failed', err);
    } finally {
      setActionLoading(false);
      closeBulkResetDialog();
    }
  };

  return (
    <Box>
      <UsersToolbar
        selectedCount={selectedUsers.length}
        onBulkDelete={onBulkDelete}
        onOpenBulkUpload={onOpenBulkUpload}
        onOpenAddUser={onOpenAddUser}
        onBulkReset={openBulkResetDialog} // show bulk reset dialog from toolbar
      />

      <Paper sx={{ p: 2 }}>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell padding="checkbox">
                  <Checkbox
                    indeterminate={selectedUsers.length > 0 && selectedUsers.length < users.length}
                    checked={users.length > 0 && selectedUsers.length === users.length}
                    onChange={(e) => onSelectAll(e.target.checked)}
                    inputProps={{ 'aria-label': 'select all users' }}
                  />
                </TableCell>
                <TableCell>Name</TableCell>
                <TableCell>Email</TableCell>
                <TableCell>Role</TableCell>
                <TableCell>Department</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {users.map((user) => (
                <TableRow key={user._id}>
                  <TableCell padding="checkbox">
                    <Checkbox
                      checked={selectedUsers.includes(user._id)}
                      onChange={() => onSelectUser(user._id)}
                      inputProps={{ 'aria-label': `select user ${user.email}` }}
                    />
                  </TableCell>
                  <TableCell>{user.name}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>
                    <Chip label={user.role} size="small" />
                  </TableCell>
                  <TableCell>{user.department}</TableCell>
                  <TableCell>
                    <Chip
                      label={user.isActive ? 'Active' : 'Inactive'}
                      size="small"
                      color={user.isActive ? 'success' : 'default'}
                    />
                  </TableCell>
                  <TableCell>
                    <IconButton
                      size="small"
                      color="primary"
                      onClick={() => onEditUser(user)}
                      title="Edit user"
                    >
                      <Edit />
                    </IconButton>

                    {/* Reset password button (single user) */}
                    <IconButton
                      size="small"
                      title="Reset password to Password123"
                      onClick={() => openSingleResetDialog(user)}
                      sx={{ mx: 0.5 }}
                      aria-label={`reset-password-${user._id}`}
                    >
                      <LockResetIcon />
                    </IconButton>

                    <IconButton
                      size="small"
                      color="error"
                      onClick={() => onDeleteUser(user._id)}
                      title="Delete user"
                    >
                      <Delete />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      {/* Single-user Confirm Dialog */}
      <Dialog
        open={singleResetDialog.open}
        onClose={closeSingleResetDialog}
        aria-labelledby="single-reset-dialog-title"
      >
        <DialogTitle id="single-reset-dialog-title">Reset Password?</DialogTitle>
        <DialogContent>
          <Typography>
            Reset password for <strong>{singleResetDialog.user?.email}</strong> to <code>Password123</code>?
          </Typography>
          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>
            The user will be required to change their password on next login if your backend enforces that.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button onClick={closeSingleResetDialog} color="inherit" disabled={actionLoading}>
            Cancel
          </Button>
          <Button
            onClick={confirmSingleReset}
            variant="contained"
            color="primary"
            disabled={actionLoading}
            startIcon={actionLoading ? <CircularProgress size={16} /> : null}
          >
            {actionLoading ? 'Resetting...' : 'Reset Password'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Bulk Confirm Dialog */}
      <Dialog
        open={bulkResetDialogOpen}
        onClose={closeBulkResetDialog}
        aria-labelledby="bulk-reset-dialog-title"
      >
        <DialogTitle id="bulk-reset-dialog-title">Reset Passwords for Selected Users?</DialogTitle>
        <DialogContent>
          <Typography>
            Reset password to <code>Password123</code> for <strong>{selectedUsers.length}</strong> selected user(s)?
          </Typography>
          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>
            This will perform a password update for all selected users. Ensure you have selected the correct users.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button onClick={closeBulkResetDialog} color="inherit" disabled={actionLoading}>
            Cancel
          </Button>
          <Button
            onClick={confirmBulkReset}
            variant="contained"
            color="secondary"
            disabled={actionLoading || selectedUsers.length === 0}
            startIcon={actionLoading ? <CircularProgress size={16} /> : null}
          >
            {actionLoading ? 'Resetting...' : `Reset ${selectedUsers.length} Password(s)`}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default UsersView;
