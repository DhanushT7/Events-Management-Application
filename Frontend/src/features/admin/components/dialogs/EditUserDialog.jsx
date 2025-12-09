import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  Stack,
  Typography,
  Switch,
  FormControlLabel
} from '@mui/material';

const roleOptions = [
  { value: 'participant', label: 'Participant' },
  { value: 'coordinator', label: 'Coordinator' },
  { value: 'hod', label: 'HOD' }
];

const EditUserDialog = ({ open, onClose, editingUser, setEditingUser, onUpdate }) => {
  const [local, setLocal] = useState(editingUser || {});
  const [errors, setErrors] = useState({});

  useEffect(() => {
    setLocal(editingUser || {});
    setErrors({});
  }, [editingUser, open]);

  const validate = () => {
    const e = {};
    if (!local.email) e.email = 'Email is required';
    else if (!/^\S+@\S+\.\S+$/.test(local.email)) e.email = 'Enter a valid email';
    if (!local.name) e.name = 'Name is required';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSave = () => {
    if (!validate()) return;
    // sync local back to parent editingUser
    setEditingUser(prev => ({ ...prev, ...local }));
    onUpdate();
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        <Typography variant="h6">Edit User</Typography>
        <Typography variant="caption" color="text.secondary">Modify user details. Leave password blank to keep existing password.</Typography>
      </DialogTitle>

      <DialogContent>
        <Stack spacing={2} mt={1}>
          <TextField
            label="Name"
            fullWidth
            value={local.name || ''}
            onChange={(e) => setLocal(s => ({ ...s, name: e.target.value }))}
            error={Boolean(errors.name)}
            helperText={errors.name}
            aria-label="name"
          />

          <TextField
            label="Email"
            type="email"
            fullWidth
            value={local.email || ''}
            onChange={(e) => setLocal(s => ({ ...s, email: e.target.value }))}
            error={Boolean(errors.email)}
            helperText={errors.email || 'Used for login'}
            aria-label="email"
          />

          <TextField
            label="New Password"
            type="password"
            fullWidth
            value={local.password || ''}
            onChange={(e) => setLocal(s => ({ ...s, password: e.target.value }))}
            helperText="Leave blank to keep current password"
            aria-label="new-password"
          />

          <FormControl fullWidth>
            <InputLabel id="edit-role-label">Role</InputLabel>
            <Select
              labelId="edit-role-label"
              label="Role"
              value={local.role || ''}
              onChange={(e) => setLocal(s => ({ ...s, role: e.target.value }))}
            >
              {roleOptions.map(r => <MenuItem key={r.value} value={r.value}>{r.label}</MenuItem>)}
            </Select>
          </FormControl>

          <TextField
            label="Department"
            fullWidth
            value={local.department || ''}
            onChange={(e) => setLocal(s => ({ ...s, department: e.target.value }))}
          />

          <FormControlLabel
            control={
              <Switch
                checked={Boolean(local.isActive)}
                onChange={(e) => setLocal(s => ({ ...s, isActive: e.target.checked }))}
                inputProps={{ 'aria-label': 'Active status' }}
              />
            }
            label={local.isActive ? 'Active' : 'Inactive'}
          />
        </Stack>
      </DialogContent>

      <DialogActions sx={{ px: 3, py: 2 }}>
        <Button onClick={onClose} color="inherit">Cancel</Button>
        <Button onClick={handleSave} variant="contained">Update User</Button>
      </DialogActions>
    </Dialog>
  );
};

export default EditUserDialog;
