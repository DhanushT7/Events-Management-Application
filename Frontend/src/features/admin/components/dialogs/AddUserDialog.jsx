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
  Box,
  Autocomplete
} from '@mui/material';

const roles = [
  { value: 'participant', label: 'Participant' },
  { value: 'coordinator', label: 'Coordinator' },
  { value: 'hod', label: 'HOD' }
];

// Suggested departments (user may type any other value)
const suggestedDepartments = ['CSE', 'ECE', 'MECH', 'IT', 'EEE'];

const AddUserDialog = ({ open, onClose, newUser, setNewUser, onAdd }) => {
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (!open) setErrors({});
    // ensure department has default 'CSE' when dialog opens and it's empty
    if (open && (!newUser.department || newUser.department === '')) {
      setNewUser(prev => ({ ...prev, department: 'CSE' }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const validate = () => {
    const e = {};
    if (!newUser.email) e.email = 'Email is required';
    else if (!/^\S+@\S+\.\S+$/.test(newUser.email)) e.email = 'Enter a valid email';
    if (!newUser.role) e.role = 'Please select a role';
    if (!newUser.department) e.department = 'Department is required';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleAdd = () => {
    if (!validate()) return;
    onAdd();
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        <Typography variant="h6">Add New User</Typography>
        <Typography variant="caption" color="text.secondary">Create an account by providing required details</Typography>
      </DialogTitle>

      <DialogContent>
        <Stack spacing={2} mt={1}>
          <TextField
            label="Email"
            type="email"
            fullWidth
            value={newUser.email}
            onChange={(e) => setNewUser(prev => ({ ...prev, email: e.target.value }))}
            helperText={errors.email || 'Enter a valid email address (will be used as username)'}
            error={Boolean(errors.email)}
            autoFocus
            aria-label="email"
          />

          <FormControl fullWidth error={Boolean(errors.role)}>
            <InputLabel id="role-label">Role</InputLabel>
            <Select
              labelId="role-label"
              label="Role"
              value={newUser.role}
              onChange={(e) => setNewUser(prev => ({ ...prev, role: e.target.value }))}
            >
              {roles.map(r => <MenuItem key={r.value} value={r.value}>{r.label}</MenuItem>)}
            </Select>
            {errors.role ? <Typography variant="caption" color="error">{errors.role}</Typography> : <Typography variant="caption" color="text.secondary">Select the role for the user</Typography>}
          </FormControl>

          {/* Department: Autocomplete with freeSolo so user can type any value.
              Defaults to 'CSE' when dialog opens if empty. */}
          <Autocomplete
            freeSolo
            options={suggestedDepartments}
            value={newUser.department || ''}
            onChange={(e, value) => {
              // onChange fires when selecting an option; value might be null
              setNewUser(prev => ({ ...prev, department: value || '' }));
            }}
            onInputChange={(e, value) => {
              // onInputChange fires when typing
              setNewUser(prev => ({ ...prev, department: value }));
            }}
            renderInput={(params) => (
              <TextField
                {...params}
                label="Department"
                error={Boolean(errors.department)}
                helperText={errors.department || 'Suggested: CSE — you may type any other department'}
                aria-label="department"
                fullWidth
              />
            )}
          />
        </Stack>
      </DialogContent>

      <DialogActions sx={{ px: 3, py: 2 }}>
        <Box sx={{ flex: 1 }}>
          <Button onClick={() => { onClose(); setNewUser({ email: '', role: '', department: 'CSE' }); }} color="inherit">
            Cancel
          </Button>
        </Box>

        <Button onClick={handleAdd} variant="contained" disableElevation>
          Add User
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default AddUserDialog;
