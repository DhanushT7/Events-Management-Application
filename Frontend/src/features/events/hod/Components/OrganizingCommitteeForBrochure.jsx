import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Typography,
  Alert,
  Snackbar,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Chip,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Tooltip,
  Divider,
  Card,
  CardContent,
  CardHeader,
  Grid
} from '@mui/material';
import { 
  Edit, 
  Delete, 
  Add, 
  ExpandMore, 
  Settings,
  Group,
  AdminPanelSettings,
  School,
  Business,
  LocationOn,
  People,
  Preview,
  Download
} from '@mui/icons-material';
import { convenorCommitteeAPI } from '../../../services/api';
import { ORGANIZING_COMMITTEE } from '../../../constants/universityInfo';

const OrganizingCommitteeForBrochure = () => {
  const [members, setMembers] = useState([]);
  const [open, setOpen] = useState(false);
  const [editingMember, setEditingMember] = useState(null);
  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [availableRoles, setAvailableRoles] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    designation: '',
    department: '',
    role: 'Member',
    roleCategory: 'COMMITTEE',
    description: '',
    isDefault: false
  });

  // Fetch members and available roles on component mount
  useEffect(() => {
    fetchMembers();
    fetchAvailableRoles();
  }, []);

  const fetchMembers = async () => {
    try {
      setLoading(true);
      const response = await convenorCommitteeAPI.getAll();
      setMembers(response.data || []);
    } catch (error) {
      showSnackbar('Error fetching members: ' + error.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const fetchAvailableRoles = async () => {
    try {
      const response = await convenorCommitteeAPI.getAvailableRoles();
      setAvailableRoles(response.data);
    } catch (error) {
      console.error('Error fetching available roles:', error);
    }
  };

  const initializeDefaultCommittee = async () => {
    try {
      setLoading(true);
      const response = await convenorCommitteeAPI.initializeDefault();
      showSnackbar(response.message);
      fetchMembers();
      fetchAvailableRoles();
    } catch (error) {
      showSnackbar('Error initializing default committee: ' + error.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const showSnackbar = (message, severity = 'success') => {
    setSnackbar({ open: true, message, severity });
  };

  const handleClose = () => {
    setOpen(false);
    setEditingMember(null);
    setFormData({
      name: '',
      designation: '',
      department: '',
      role: 'Member',
      roleCategory: 'COMMITTEE',
      description: '',
      isDefault: false
    });
  };

  const handleEdit = (member) => {
    setEditingMember(member);
    setFormData({
      name: member.name,
      designation: member.designation,
      department: member.department,
      role: member.role,
      roleCategory: member.roleCategory || 'COMMITTEE',
      description: member.description || '',
      isDefault: member.isDefault || false
    });
    setOpen(true);
  };

  const handleAdd = () => {
    setEditingMember(null);
    setFormData({
      name: '',
      designation: '',
      department: '',
      role: 'Member',
      roleCategory: 'COMMITTEE',
      description: '',
      isDefault: false
    });
    setOpen(true);
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);
      if (editingMember) {
        await convenorCommitteeAPI.update(editingMember._id, formData);
        showSnackbar('Organizing committee member updated successfully');
      } else {
        await convenorCommitteeAPI.add(formData);
        showSnackbar('Organizing committee member added successfully');
      }
      fetchMembers();
      fetchAvailableRoles();
      handleClose();
    } catch (error) {
      showSnackbar('Error saving member: ' + error.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this member?')) {
      try {
        setLoading(true);
        await convenorCommitteeAPI.delete(id);
        showSnackbar('Organizing committee member deleted successfully');
        fetchMembers();
        fetchAvailableRoles();
      } catch (error) {
        showSnackbar('Error deleting member: ' + error.message, 'error');
      } finally {
        setLoading(false);
      }
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  const handleRoleChange = (e) => {
    const selectedRole = e.target.value;
    let roleCategory = 'COMMITTEE';
    
    // Auto-determine role category
    if (availableRoles) {
      Object.keys(availableRoles.roleCategories).forEach(category => {
        if (availableRoles.roleCategories[category].roles.includes(selectedRole)) {
          roleCategory = category;
        }
      });
    }
    
    setFormData({
      ...formData,
      role: selectedRole,
      roleCategory: roleCategory
    });
  };

  const getRoleCategoryIcon = (category) => {
    switch (category) {
      case 'PATRON': return <AdminPanelSettings />;
      case 'ADMINISTRATION': return <Business />;
      case 'ACADEMIC': return <School />;
      case 'ORGANIZING': return <Group />;
      case 'COORDINATION': return <LocationOn />;
      default: return <People />;
    }
  };

  const getRoleCategoryColor = (category) => {
    switch (category) {
      case 'PATRON': return '#d32f2f';
      case 'ADMINISTRATION': return '#1976d2';
      case 'ACADEMIC': return '#388e3c';
      case 'ORGANIZING': return '#f57c00';
      case 'COORDINATION': return '#7b1fa2';
      default: return '#616161';
    }
  };

  // Group members by role category for display
  const membersByCategory = members.reduce((groups, member) => {
    const category = member.roleCategory || 'COMMITTEE';
    if (!groups[category]) {
      groups[category] = [];
    }
    groups[category].push(member);
    return groups;
  }, {});

  // Generate brochure organizing committee section
  const generateBrochureCommittee = () => {
    let brochureText = "ORGANIZING COMMITTEE\n\n";
    
    ORGANIZING_COMMITTEE.displayOrder.forEach(role => {
      const membersWithRole = members.filter(member => member.role === role && member.isActive !== false);
      
      if (membersWithRole.length > 0) {
        brochureText += `${role}\n`;
        membersWithRole.forEach(member => {
          brochureText += `${member.name}\n`;
          brochureText += `${member.designation}`;
          if (member.department && member.department !== 'Anna University') {
            brochureText += `, ${member.department}`;
          }
          brochureText += `\n`;
        });
        brochureText += `\n`;
      }
    });
    
    return brochureText;
  };

  const downloadBrochureCommittee = () => {
    const content = generateBrochureCommittee();
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'organizing-committee-brochure.txt';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5">Organizing Committee for Brochures</Typography>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button
            variant="outlined"
            startIcon={<Settings />}
            onClick={initializeDefaultCommittee}
            disabled={loading}
          >
            Initialize Default
          </Button>
          <Button
            variant="outlined"
            startIcon={<Preview />}
            onClick={() => {
              const content = generateBrochureCommittee();
              window.dispatchEvent(new CustomEvent('app:notify', {
                detail: { message: "Brochure Committee Preview:\n\n" + content, options: { variant: 'info' } }
              }));
            }}
          >
            Preview Brochure
          </Button>
          <Button
            variant="outlined"
            startIcon={<Download />}
            onClick={downloadBrochureCommittee}
          >
            Download Committee
          </Button>
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={handleAdd}
            disabled={loading}
          >
            Add Member
          </Button>
        </Box>
      </Box>

      {/* Members by Category */}
      {Object.keys(ORGANIZING_COMMITTEE.roleCategories)
        .sort((a, b) => ORGANIZING_COMMITTEE.roleCategories[a].order - ORGANIZING_COMMITTEE.roleCategories[b].order)
        .map(category => {
          const categoryData = ORGANIZING_COMMITTEE.roleCategories[category];
          const categoryMembers = membersByCategory[category] || [];
          
          return (
            <Accordion key={category} defaultExpanded sx={{ mb: 2 }}>
              <AccordionSummary expandIcon={<ExpandMore />}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  {getRoleCategoryIcon(category)}
                  <Typography variant="h6" sx={{ color: getRoleCategoryColor(category) }}>
                    {categoryData.name}
                  </Typography>
                  <Chip 
                    size="small" 
                    label={`${categoryMembers.length} members`}
                    sx={{ bgcolor: getRoleCategoryColor(category) + '20', color: getRoleCategoryColor(category) }}
                  />
                </Box>
              </AccordionSummary>
              <AccordionDetails>
                {categoryMembers.length > 0 ? (
                  <TableContainer component={Paper} variant="outlined">
                    <Table size="small">
                      <TableHead>
                        <TableRow>
                          <TableCell><strong>Role</strong></TableCell>
                          <TableCell><strong>Name</strong></TableCell>
                          <TableCell><strong>Designation</strong></TableCell>
                          <TableCell><strong>Department</strong></TableCell>
                          <TableCell><strong>Default</strong></TableCell>
                          <TableCell><strong>Actions</strong></TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {categoryMembers.map((member) => (
                          <TableRow key={member._id}>
                            <TableCell>
                              <Chip 
                                size="small" 
                                label={member.role}
                                color={member.isDefault ? "primary" : "default"}
                              />
                            </TableCell>
                            <TableCell>{member.name}</TableCell>
                            <TableCell>{member.designation}</TableCell>
                            <TableCell>{member.department}</TableCell>
                            <TableCell>
                              {member.isDefault && <Chip size="small" label="Default" color="success" />}
                            </TableCell>
                            <TableCell>
                              <IconButton onClick={() => handleEdit(member)} color="primary" size="small">
                                <Edit />
                              </IconButton>
                              <IconButton onClick={() => handleDelete(member._id)} color="error" size="small">
                                <Delete />
                              </IconButton>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                ) : (
                  <Alert severity="info">No members in this category. Add members to populate the organizing committee.</Alert>
                )}
              </AccordionDetails>
            </Accordion>
          );
        })}

      {/* Add/Edit Dialog */}
      <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
        <DialogTitle>
          {editingMember ? 'Edit Organizing Committee Member' : 'Add Organizing Committee Member'}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ pt: 1 }}>
            <Grid item xs={12} md={6}>
              <TextField
                name="name"
                label="Name"
                value={formData.name}
                onChange={handleInputChange}
                fullWidth
                required
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                name="designation"
                label="Designation"
                value={formData.designation}
                onChange={handleInputChange}
                fullWidth
                required
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                name="department"
                label="Department/Institution"
                value={formData.department}
                onChange={handleInputChange}
                fullWidth
                required
                placeholder="e.g., Anna University, Department of CSE, College of Engineering Guindy"
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Role</InputLabel>
                <Select
                  name="role"
                  value={formData.role}
                  onChange={handleRoleChange}
                  label="Role"
                >
                  {availableRoles && Object.keys(availableRoles.roleCategories).map(category => [
                    <MenuItem key={category + '_header'} disabled sx={{ fontWeight: 'bold', bgcolor: 'grey.100' }}>
                      {availableRoles.roleCategories[category].name}
                    </MenuItem>,
                    ...availableRoles.roleCategories[category].roles.map(role => {
                      const isOccupied = availableRoles.occupiedSingleInstanceRoles.includes(role);
                      const isEditingSameRole = editingMember?.role === role;
                      
                      return (
                        <MenuItem 
                          key={role} 
                          value={role}
                          disabled={isOccupied && !isEditingSameRole}
                          sx={{ pl: 4 }}
                        >
                          {role}
                          {isOccupied && !isEditingSameRole && (
                            <Chip size="small" label="Occupied" color="warning" sx={{ ml: 1 }} />
                          )}
                        </MenuItem>
                      );
                    })
                  ]).flat()}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Category</InputLabel>
                <Select
                  name="roleCategory"
                  value={formData.roleCategory}
                  onChange={handleInputChange}
                  label="Category"
                >
                  {Object.keys(ORGANIZING_COMMITTEE.roleCategories).map(category => (
                    <MenuItem key={category} value={category}>
                      {ORGANIZING_COMMITTEE.roleCategories[category].name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <TextField
                name="description"
                label="Description (Optional)"
                value={formData.description}
                onChange={handleInputChange}
                fullWidth
                multiline
                rows={2}
                placeholder="Brief description of role responsibilities"
              />
            </Grid>
            <Grid item xs={12}>
              <FormControl>
                <label>
                  <input
                    type="checkbox"
                    name="isDefault"
                    checked={formData.isDefault}
                    onChange={handleInputChange}
                  />
                  <span style={{ marginLeft: 8 }}>
                    Make this a default role (appears in all events)
                  </span>
                </label>
              </FormControl>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button
            onClick={handleSubmit}
            variant="contained"
            disabled={loading || !formData.name.trim() || !formData.designation.trim()}
          >
            {editingMember ? 'Update' : 'Add'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default OrganizingCommitteeForBrochure;
