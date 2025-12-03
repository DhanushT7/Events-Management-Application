import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Chip,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Switch,
  FormControlLabel,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Grid,
  Divider,
  Alert,
  Autocomplete,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tooltip
} from '@mui/material';
import {
  Add,
  Edit,
  Delete,
  ExpandMore,
  DragIndicator,
  Save,
  Cancel,
  Group,
  Person,
  Settings
} from '@mui/icons-material';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import axios from 'axios';
import { useSnackbar } from 'notistack';

const OrganizingCommitteeManager = ({ eventId, event, onUpdate }) => {
  const { enqueueSnackbar } = useSnackbar();
  const [availableMembers, setAvailableMembers] = useState([]);
  const [groupedMembers, setGroupedMembers] = useState({});
  const [selectedMembers, setSelectedMembers] = useState(event?.organizingCommittee || []);
  const [displaySettings, setDisplaySettings] = useState(event?.committeeDisplaySettings || {
    showInBrochure: true,
    groupByCategory: true,
    showDepartments: true,
    customTitle: 'ORGANIZING COMMITTEE'
  });
  const [addMemberDialog, setAddMemberDialog] = useState(false);
  const [newMember, setNewMember] = useState({
    name: '',
    designation: '',
    department: '',
    role: '',
    roleCategory: 'COMMITTEE'
  });
  const [loading, setLoading] = useState(false);

  const roleCategories = [
    'PATRON',
    'ADMINISTRATION', 
    'ACADEMIC',
    'ORGANIZING',
    'COORDINATION',
    'COMMITTEE',
    'EXTERNAL'
  ];

  const commonRoles = {
    PATRON: ['Chief Patron', 'Patron', 'Co-Patron'],
    ADMINISTRATION: ['Vice-Chancellor', 'Pro-Vice-Chancellor', 'Registrar', 'Controller of Examinations', 'Finance Officer'],
    ACADEMIC: ['Dean', 'Associate Dean', 'Head of Department', 'Associate Head of Department'],
    ORGANIZING: ['Chairman', 'Vice-Chairman', 'Secretary', 'Joint Secretary', 'Treasurer', 'Convener', 'Co-Convener'],
    COORDINATION: ['Coordinator', 'Co-Coordinator', 'Technical Coordinator', 'Program Coordinator', 'Registration Coordinator'],
    COMMITTEE: ['Member', 'Student Member', 'External Member', 'Industry Representative', 'Guest Member', 'Honorary Member', 'Advisory Member'],
    EXTERNAL: ['Industry Expert', 'Government Official', 'Research Scholar', 'International Delegate', 'Distinguished Guest', 'Resource Person', 'Subject Matter Expert']
  };

  useEffect(() => {
    fetchAvailableMembers();
  }, []);

  const fetchAvailableMembers = async () => {
    try {
      const response = await axios.get(`${import.meta.env.VITE_API_BASE_URL || 'http://10.5.12.1:4000/api'}/coordinator/committee-members`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setAvailableMembers(response.data.members || []);
      setGroupedMembers(response.data.groupedMembers || {});
    } catch (error) {
      console.error('Error fetching committee members:', error);
      enqueueSnackbar('Error fetching committee members', { variant: 'error' });
    }
  };

  const handleAddMember = async () => {
    try {
      setLoading(true);
      const response = await axios.post(`${import.meta.env.VITE_API_BASE_URL || 'http://10.5.12.1:4000/api'}/coordinator/committee-members`, newMember, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      
      enqueueSnackbar('Committee member added successfully', { variant: 'success' });
      setAddMemberDialog(false);
      setNewMember({
        name: '',
        designation: '',
        department: '',
        role: '',
        roleCategory: 'COMMITTEE'
      });
      fetchAvailableMembers();
    } catch (error) {
      console.error('Error adding committee member:', error);
      enqueueSnackbar('Error adding committee member', { variant: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleSelectMember = (member) => {
    const isAlreadySelected = selectedMembers.some(
      selected => selected.member?._id === member._id || selected.member === member._id
    );
    
    if (!isAlreadySelected) {
      const newSelection = {
        member: member._id,
        customName: '',
        customDesignation: '',
        customDepartment: '',
        order: selectedMembers.length
      };
      setSelectedMembers([...selectedMembers, newSelection]);
    }
  };

  const handleRemoveMember = (index) => {
    const updated = selectedMembers.filter((_, i) => i !== index);
    setSelectedMembers(updated);
  };

  const handleUpdateMemberCustomization = (index, field, value) => {
    const updated = [...selectedMembers];
    updated[index] = { ...updated[index], [field]: value };
    setSelectedMembers(updated);
  };

  const handleDragEnd = (result) => {
    if (!result.destination) return;

    const items = Array.from(selectedMembers);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    // Update order values
    const updatedItems = items.map((item, index) => ({
      ...item,
      order: index
    }));

    setSelectedMembers(updatedItems);
  };

  const handleSave = async () => {
    try {
      setLoading(true);
      
      const payload = {
        organizingCommittee: selectedMembers,
        committeeDisplaySettings: displaySettings
      };

      await axios.put(`${import.meta.env.VITE_API_BASE_URL || 'http://10.5.12.1:4000/api'}/coordinator/events/${eventId}/organizing-committee`, payload, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });

      enqueueSnackbar('Organizing committee updated successfully', { variant: 'success' });
      if (onUpdate) onUpdate();
    } catch (error) {
      console.error('Error updating organizing committee:', error);
      enqueueSnackbar('Error updating organizing committee', { variant: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const getMemberDetails = (memberRef) => {
    if (typeof memberRef === 'object' && memberRef._id) {
      return memberRef;
    }
    return availableMembers.find(m => m._id === memberRef) || {};
  };

  return (
    <Box>
      <Card>
        <CardContent>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
            <Typography variant="h6" display="flex" alignItems="center">
              <Group sx={{ mr: 1 }} />
              Organizing Committee Management
            </Typography>
            <Box>
              <Button
                variant="outlined"
                startIcon={<Add />}
                onClick={() => setAddMemberDialog(true)}
                sx={{ mr: 1 }}
              >
                Add New Member
              </Button>
              <Button
                variant="contained"
                startIcon={<Save />}
                onClick={handleSave}
                disabled={loading}
              >
                Save Changes
              </Button>
            </Box>
          </Box>

          <Grid container spacing={3}>
            {/* Display Settings */}
            <Grid item xs={12} md={4}>
              <Accordion defaultExpanded>
                <AccordionSummary expandIcon={<ExpandMore />}>
                  <Typography variant="subtitle1">
                    <Settings sx={{ mr: 1, verticalAlign: 'middle' }} />
                    Display Settings
                  </Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <Box display="flex" flexDirection="column" gap={2}>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={displaySettings.showInBrochure}
                          onChange={(e) => setDisplaySettings({
                            ...displaySettings,
                            showInBrochure: e.target.checked
                          })}
                        />
                      }
                      label="Show in Brochure"
                    />
                    
                    <FormControlLabel
                      control={
                        <Switch
                          checked={displaySettings.groupByCategory}
                          onChange={(e) => setDisplaySettings({
                            ...displaySettings,
                            groupByCategory: e.target.checked
                          })}
                        />
                      }
                      label="Group by Category"
                    />
                    
                    <FormControlLabel
                      control={
                        <Switch
                          checked={displaySettings.showDepartments}
                          onChange={(e) => setDisplaySettings({
                            ...displaySettings,
                            showDepartments: e.target.checked
                          })}
                        />
                      }
                      label="Show Departments"
                    />
                    
                    <TextField
                      label="Custom Title"
                      value={displaySettings.customTitle}
                      onChange={(e) => setDisplaySettings({
                        ...displaySettings,
                        customTitle: e.target.value
                      })}
                      size="small"
                    />
                  </Box>
                </AccordionDetails>
              </Accordion>

              {/* Available Members */}
              <Accordion>
                <AccordionSummary expandIcon={<ExpandMore />}>
                  <Typography variant="subtitle1">
                    Available Members ({availableMembers.length})
                  </Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <Box maxHeight={300} overflow="auto">
                    {roleCategories.map(category => (
                      groupedMembers[category]?.length > 0 && (
                        <Box key={category} mb={2}>
                          <Typography variant="subtitle2" color="primary" gutterBottom>
                            {category}
                          </Typography>
                          {groupedMembers[category].map(member => (
                            <Chip
                              key={member._id}
                              label={`${member.role}: ${member.name}`}
                              onClick={() => handleSelectMember(member)}
                              size="small"
                              sx={{ mr: 1, mb: 1 }}
                              variant="outlined"
                            />
                          ))}
                        </Box>
                      )
                    ))}
                  </Box>
                </AccordionDetails>
              </Accordion>
            </Grid>

            {/* Selected Members */}
            <Grid item xs={12} md={8}>
              <Typography variant="subtitle1" gutterBottom>
                Selected Committee Members ({selectedMembers.length})
              </Typography>
              
              {selectedMembers.length === 0 ? (
                <Alert severity="info">
                  No committee members selected. Choose from available members or add new ones.
                </Alert>
              ) : (
                <DragDropContext onDragEnd={handleDragEnd}>
                  <Droppable droppableId="selected-members">
                    {(provided) => (
                      <TableContainer component={Paper} {...provided.droppableProps} ref={provided.innerRef}>
                        <Table size="small">
                          <TableHead>
                            <TableRow>
                              <TableCell width={50}>Order</TableCell>
                              <TableCell>Role & Name</TableCell>
                              <TableCell>Custom Name</TableCell>
                              <TableCell>Custom Designation</TableCell>
                              <TableCell>Custom Department</TableCell>
                              <TableCell width={100}>Actions</TableCell>
                            </TableRow>
                          </TableHead>
                          <TableBody>
                            {selectedMembers.map((item, index) => {
                              const member = getMemberDetails(item.member);
                              return (
                                <Draggable key={`${item.member}-${index}`} draggableId={`${item.member}-${index}`} index={index}>
                                  {(provided, snapshot) => (
                                    <TableRow
                                      ref={provided.innerRef}
                                      {...provided.draggableProps}
                                      sx={{
                                        backgroundColor: snapshot.isDragging ? 'action.hover' : 'inherit'
                                      }}
                                    >
                                      <TableCell {...provided.dragHandleProps}>
                                        <DragIndicator />
                                      </TableCell>
                                      <TableCell>
                                        <Box>
                                          <Typography variant="body2" fontWeight="bold">
                                            {member.role}
                                          </Typography>
                                          <Typography variant="body2" color="text.secondary">
                                            {member.name}
                                          </Typography>
                                          <Chip 
                                            label={member.roleCategory} 
                                            size="small" 
                                            variant="outlined"
                                          />
                                        </Box>
                                      </TableCell>
                                      <TableCell>
                                        <TextField
                                          size="small"
                                          placeholder={member.name}
                                          value={item.customName || ''}
                                          onChange={(e) => handleUpdateMemberCustomization(index, 'customName', e.target.value)}
                                        />
                                      </TableCell>
                                      <TableCell>
                                        <TextField
                                          size="small"
                                          placeholder={member.designation}
                                          value={item.customDesignation || ''}
                                          onChange={(e) => handleUpdateMemberCustomization(index, 'customDesignation', e.target.value)}
                                        />
                                      </TableCell>
                                      <TableCell>
                                        <TextField
                                          size="small"
                                          placeholder={member.department}
                                          value={item.customDepartment || ''}
                                          onChange={(e) => handleUpdateMemberCustomization(index, 'customDepartment', e.target.value)}
                                        />
                                      </TableCell>
                                      <TableCell>
                                        <Tooltip title="Remove">
                                          <IconButton
                                            size="small"
                                            color="error"
                                            onClick={() => handleRemoveMember(index)}
                                          >
                                            <Delete />
                                          </IconButton>
                                        </Tooltip>
                                      </TableCell>
                                    </TableRow>
                                  )}
                                </Draggable>
                              );
                            })}
                            {provided.placeholder}
                          </TableBody>
                        </Table>
                      </TableContainer>
                    )}
                  </Droppable>
                </DragDropContext>
              )}
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Add Member Dialog */}
      <Dialog open={addMemberDialog} onClose={() => setAddMemberDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>Add New Committee Member</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} md={6}>
              <TextField
                label="Name"
                value={newMember.name}
                onChange={(e) => setNewMember({ ...newMember, name: e.target.value })}
                fullWidth
                required
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                label="Designation"
                value={newMember.designation}
                onChange={(e) => setNewMember({ ...newMember, designation: e.target.value })}
                fullWidth
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                label="Department"
                value={newMember.department}
                onChange={(e) => setNewMember({ ...newMember, department: e.target.value })}
                fullWidth
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Role Category</InputLabel>
                <Select
                  value={newMember.roleCategory}
                  onChange={(e) => setNewMember({ ...newMember, roleCategory: e.target.value, role: '' })}
                  label="Role Category"
                >
                  {roleCategories.map(category => (
                    <MenuItem key={category} value={category}>
                      {category}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <Autocomplete
                options={commonRoles[newMember.roleCategory] || []}
                value={newMember.role}
                onChange={(event, newValue) => setNewMember({ ...newMember, role: newValue || '' })}
                freeSolo
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Role"
                    required
                    helperText="Select from common roles or type a custom role"
                  />
                )}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAddMemberDialog(false)}>Cancel</Button>
          <Button 
            onClick={handleAddMember} 
            variant="contained"
            disabled={!newMember.name || !newMember.role || loading}
          >
            Add Member
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default OrganizingCommitteeManager;