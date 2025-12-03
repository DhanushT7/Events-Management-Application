import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  TextField,
  Switch,
  FormControlLabel,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Grid,
  Divider,
  Alert,
  Chip,
  IconButton,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow
} from '@mui/material';
import {
  ExpandMore,
  Save,
  Add,
  Delete,
  Edit,
  Assignment,
  Payment,
  Form,
  Settings,
  Preview
} from '@mui/icons-material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import axios from 'axios';
import { useSnackbar } from 'notistack';

const RegistrationProcedureManager = ({ eventId, event, onUpdate }) => {
  const { enqueueSnackbar } = useSnackbar();
  const [registrationProcedure, setRegistrationProcedure] = useState(
    event?.registrationProcedure || {
      enabled: false,
      instructions: '',
      submissionMethod: 'email',
      deadline: null,
      participantLimit: null,
      selectionCriteria: 'first come first served basis',
      confirmationDate: null,
      confirmationMethod: 'email',
      certificateRequirements: {
        enabled: false,
        attendanceRequired: true,
        evaluation: {
          quiz: { enabled: false, percentage: 0 },
          assignment: { enabled: false, percentage: 0 },
          labWork: { enabled: false, percentage: 0 },
          finalTest: { enabled: false, percentage: 0 }
        }
      },
      additionalNotes: '',
      paymentDetails: {
        enabled: false,
        accountName: 'DIRECTOR, CSRC',
        accountNumber: '37614464781',
        accountType: 'SAVINGS',
        bankBranch: 'State Bank of India, Anna University',
        ifscCode: 'SBIN0006463',
        additionalPaymentInfo: ''
      },
      registrationForm: {
        enabled: false,
        includeInBrochure: true,
        fields: {
          name: true,
          ageAndDob: true,
          qualification: true,
          institution: true,
          category: {
            enabled: true,
            options: [
              'Student from a Non-Government School',
              'Student of / who has just passed Class XII from a Government School*',
              'A programming enthusiast'
            ]
          },
          address: true,
          email: true,
          mobile: true,
          signature: true
        },
        additionalRequirements: '*Proof has to be submitted with the application',
        customFields: []
      }
    }
  );
  const [loading, setLoading] = useState(false);
  const [customFieldDialog, setCustomFieldDialog] = useState(false);
  const [newCustomField, setNewCustomField] = useState({
    fieldName: '',
    fieldType: 'text',
    required: false,
    options: []
  });
  const [previewDialog, setPreviewDialog] = useState(false);

  const submissionMethods = ['email', 'online', 'physical', 'other'];
  const confirmationMethods = ['email', 'phone', 'website', 'other'];
  const fieldTypes = ['text', 'number', 'email', 'date', 'select', 'checkbox'];

  const handleSave = async () => {
    try {
      setLoading(true);
      
      await axios.put(
        `${import.meta.env.VITE_API_BASE_URL || 'http://10.5.12.1:4000/api'}/coordinator/events/${eventId}/registration-procedure`,
        { registrationProcedure },
        {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        }
      );

      enqueueSnackbar('Registration procedure updated successfully', { variant: 'success' });
      if (onUpdate) onUpdate();
    } catch (error) {
      console.error('Error updating registration procedure:', error);
      enqueueSnackbar('Error updating registration procedure', { variant: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleAddCustomField = () => {
    if (!newCustomField.fieldName) return;
    
    const updatedFields = [...registrationProcedure.registrationForm.customFields, newCustomField];
    setRegistrationProcedure({
      ...registrationProcedure,
      registrationForm: {
        ...registrationProcedure.registrationForm,
        customFields: updatedFields
      }
    });
    
    setNewCustomField({
      fieldName: '',
      fieldType: 'text',
      required: false,
      options: []
    });
    setCustomFieldDialog(false);
  };

  const handleRemoveCustomField = (index) => {
    const updatedFields = registrationProcedure.registrationForm.customFields.filter((_, i) => i !== index);
    setRegistrationProcedure({
      ...registrationProcedure,
      registrationForm: {
        ...registrationProcedure.registrationForm,
        customFields: updatedFields
      }
    });
  };

  const handleAddCategoryOption = () => {
    const newOption = prompt('Enter new category option:');
    if (newOption) {
      const updatedOptions = [...registrationProcedure.registrationForm.fields.category.options, newOption];
      setRegistrationProcedure({
        ...registrationProcedure,
        registrationForm: {
          ...registrationProcedure.registrationForm,
          fields: {
            ...registrationProcedure.registrationForm.fields,
            category: {
              ...registrationProcedure.registrationForm.fields.category,
              options: updatedOptions
            }
          }
        }
      });
    }
  };

  const handleRemoveCategoryOption = (index) => {
    const updatedOptions = registrationProcedure.registrationForm.fields.category.options.filter((_, i) => i !== index);
    setRegistrationProcedure({
      ...registrationProcedure,
      registrationForm: {
        ...registrationProcedure.registrationForm,
        fields: {
          ...registrationProcedure.registrationForm.fields,
          category: {
            ...registrationProcedure.registrationForm.fields.category,
            options: updatedOptions
          }
        }
      }
    });
  };

  const generateFormPreview = () => {
    const fields = [];
    
    // Standard fields
    Object.entries(registrationProcedure.registrationForm.fields).forEach(([key, value]) => {
      if (key === 'category' && value.enabled) {
        fields.push({
          name: 'Category',
          type: 'select',
          required: true,
          options: value.options
        });
      } else if (typeof value === 'boolean' && value) {
        fields.push({
          name: key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, ' $1'),
          type: 'text',
          required: true
        });
      }
    });
    
    // Custom fields
    registrationProcedure.registrationForm.customFields.forEach(field => {
      fields.push(field);
    });
    
    return fields;
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Box>
        <Card>
          <CardContent>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
              <Typography variant="h6" display="flex" alignItems="center">
                <Assignment sx={{ mr: 1 }} />
                Registration Procedure Management
              </Typography>
              <Box>
                <Button
                  variant="outlined"
                  startIcon={<Preview />}
                  onClick={() => setPreviewDialog(true)}
                  sx={{ mr: 1 }}
                  disabled={!registrationProcedure.enabled}
                >
                  Preview
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

            {/* Enable Registration */}
            <Box mb={3}>
              <FormControlLabel
                control={
                  <Switch
                    checked={registrationProcedure.enabled}
                    onChange={(e) => setRegistrationProcedure({
                      ...registrationProcedure,
                      enabled: e.target.checked
                    })}
                  />
                }
                label="Enable Registration Procedure"
              />
              {!registrationProcedure.enabled && (
                <Alert severity="info" sx={{ mt: 1 }}>
                  Registration procedure is disabled. Enable it to configure registration details.
                </Alert>
              )}
            </Box>

            {registrationProcedure.enabled && (
              <Grid container spacing={3}>
                {/* Basic Registration Info */}
                <Grid item xs={12}>
                  <Accordion defaultExpanded>
                    <AccordionSummary expandIcon={<ExpandMore />}>
                      <Typography variant="subtitle1">
                        <Settings sx={{ mr: 1, verticalAlign: 'middle' }} />
                        Basic Registration Information
                      </Typography>
                    </AccordionSummary>
                    <AccordionDetails>
                      <Grid container spacing={2}>
                        <Grid item xs={12}>
                          <TextField
                            label="Registration Instructions"
                            value={registrationProcedure.instructions}
                            onChange={(e) => setRegistrationProcedure({
                              ...registrationProcedure,
                              instructions: e.target.value
                            })}
                            multiline
                            rows={3}
                            fullWidth
                            placeholder="Provide detailed instructions for registration..."
                          />
                        </Grid>
                        
                        <Grid item xs={12} md={6}>
                          <FormControl fullWidth>
                            <InputLabel>Submission Method</InputLabel>
                            <Select
                              value={registrationProcedure.submissionMethod}
                              onChange={(e) => setRegistrationProcedure({
                                ...registrationProcedure,
                                submissionMethod: e.target.value
                              })}
                              label="Submission Method"
                            >
                              {submissionMethods.map(method => (
                                <MenuItem key={method} value={method}>
                                  {method.toUpperCase()}
                                </MenuItem>
                              ))}
                            </Select>
                          </FormControl>
                        </Grid>
                        
                        <Grid item xs={12} md={6}>
                          <DatePicker
                            label="Registration Deadline"
                            value={registrationProcedure.deadline ? new Date(registrationProcedure.deadline) : null}
                            onChange={(date) => setRegistrationProcedure({
                              ...registrationProcedure,
                              deadline: date
                            })}
                            renderInput={(params) => <TextField {...params} fullWidth />}
                          />
                        </Grid>
                        
                        <Grid item xs={12} md={6}>
                          <TextField
                            label="Participant Limit"
                            type="number"
                            value={registrationProcedure.participantLimit || ''}
                            onChange={(e) => setRegistrationProcedure({
                              ...registrationProcedure,
                              participantLimit: e.target.value ? parseInt(e.target.value) : null
                            })}
                            fullWidth
                          />
                        </Grid>
                        
                        <Grid item xs={12} md={6}>
                          <TextField
                            label="Selection Criteria"
                            value={registrationProcedure.selectionCriteria}
                            onChange={(e) => setRegistrationProcedure({
                              ...registrationProcedure,
                              selectionCriteria: e.target.value
                            })}
                            fullWidth
                          />
                        </Grid>
                        
                        <Grid item xs={12} md={6}>
                          <DatePicker
                            label="Confirmation Date"
                            value={registrationProcedure.confirmationDate ? new Date(registrationProcedure.confirmationDate) : null}
                            onChange={(date) => setRegistrationProcedure({
                              ...registrationProcedure,
                              confirmationDate: date
                            })}
                            renderInput={(params) => <TextField {...params} fullWidth />}
                          />
                        </Grid>
                        
                        <Grid item xs={12} md={6}>
                          <FormControl fullWidth>
                            <InputLabel>Confirmation Method</InputLabel>
                            <Select
                              value={registrationProcedure.confirmationMethod}
                              onChange={(e) => setRegistrationProcedure({
                                ...registrationProcedure,
                                confirmationMethod: e.target.value
                              })}
                              label="Confirmation Method"
                            >
                              {confirmationMethods.map(method => (
                                <MenuItem key={method} value={method}>
                                  {method.toUpperCase()}
                                </MenuItem>
                              ))}
                            </Select>
                          </FormControl>
                        </Grid>
                        
                        <Grid item xs={12}>
                          <TextField
                            label="Additional Notes"
                            value={registrationProcedure.additionalNotes}
                            onChange={(e) => setRegistrationProcedure({
                              ...registrationProcedure,
                              additionalNotes: e.target.value
                            })}
                            multiline
                            rows={2}
                            fullWidth
                          />
                        </Grid>
                      </Grid>
                    </AccordionDetails>
                  </Accordion>
                </Grid>

                {/* Payment Details */}
                <Grid item xs={12}>
                  <Accordion>
                    <AccordionSummary expandIcon={<ExpandMore />}>
                      <Typography variant="subtitle1">
                        <Payment sx={{ mr: 1, verticalAlign: 'middle' }} />
                        Payment Details
                      </Typography>
                    </AccordionSummary>
                    <AccordionDetails>
                      <Box mb={2}>
                        <FormControlLabel
                          control={
                            <Switch
                              checked={registrationProcedure.paymentDetails.enabled}
                              onChange={(e) => setRegistrationProcedure({
                                ...registrationProcedure,
                                paymentDetails: {
                                  ...registrationProcedure.paymentDetails,
                                  enabled: e.target.checked
                                }
                              })}
                            />
                          }
                          label="Enable Payment Details"
                        />
                      </Box>
                      
                      {registrationProcedure.paymentDetails.enabled && (
                        <Grid container spacing={2}>
                          <Grid item xs={12} md={6}>
                            <TextField
                              label="Account Name"
                              value={registrationProcedure.paymentDetails.accountName}
                              onChange={(e) => setRegistrationProcedure({
                                ...registrationProcedure,
                                paymentDetails: {
                                  ...registrationProcedure.paymentDetails,
                                  accountName: e.target.value
                                }
                              })}
                              fullWidth
                            />
                          </Grid>
                          
                          <Grid item xs={12} md={6}>
                            <TextField
                              label="Account Number"
                              value={registrationProcedure.paymentDetails.accountNumber}
                              onChange={(e) => setRegistrationProcedure({
                                ...registrationProcedure,
                                paymentDetails: {
                                  ...registrationProcedure.paymentDetails,
                                  accountNumber: e.target.value
                                }
                              })}
                              fullWidth
                            />
                          </Grid>
                          
                          <Grid item xs={12} md={6}>
                            <TextField
                              label="Account Type"
                              value={registrationProcedure.paymentDetails.accountType}
                              onChange={(e) => setRegistrationProcedure({
                                ...registrationProcedure,
                                paymentDetails: {
                                  ...registrationProcedure.paymentDetails,
                                  accountType: e.target.value
                                }
                              })}
                              fullWidth
                            />
                          </Grid>
                          
                          <Grid item xs={12} md={6}>
                            <TextField
                              label="IFSC Code"
                              value={registrationProcedure.paymentDetails.ifscCode}
                              onChange={(e) => setRegistrationProcedure({
                                ...registrationProcedure,
                                paymentDetails: {
                                  ...registrationProcedure.paymentDetails,
                                  ifscCode: e.target.value
                                }
                              })}
                              fullWidth
                            />
                          </Grid>
                          
                          <Grid item xs={12}>
                            <TextField
                              label="Bank Branch"
                              value={registrationProcedure.paymentDetails.bankBranch}
                              onChange={(e) => setRegistrationProcedure({
                                ...registrationProcedure,
                                paymentDetails: {
                                  ...registrationProcedure.paymentDetails,
                                  bankBranch: e.target.value
                                }
                              })}
                              fullWidth
                            />
                          </Grid>
                          
                          <Grid item xs={12}>
                            <TextField
                              label="Additional Payment Information"
                              value={registrationProcedure.paymentDetails.additionalPaymentInfo}
                              onChange={(e) => setRegistrationProcedure({
                                ...registrationProcedure,
                                paymentDetails: {
                                  ...registrationProcedure.paymentDetails,
                                  additionalPaymentInfo: e.target.value
                                }
                              })}
                              multiline
                              rows={2}
                              fullWidth
                            />
                          </Grid>
                        </Grid>
                      )}
                    </AccordionDetails>
                  </Accordion>
                </Grid>

                {/* Registration Form */}
                <Grid item xs={12}>
                  <Accordion>
                    <AccordionSummary expandIcon={<ExpandMore />}>
                      <Typography variant="subtitle1">
                        <Form sx={{ mr: 1, verticalAlign: 'middle' }} />
                        Registration Form Configuration
                      </Typography>
                    </AccordionSummary>
                    <AccordionDetails>
                      <Box mb={2}>
                        <FormControlLabel
                          control={
                            <Switch
                              checked={registrationProcedure.registrationForm.enabled}
                              onChange={(e) => setRegistrationProcedure({
                                ...registrationProcedure,
                                registrationForm: {
                                  ...registrationProcedure.registrationForm,
                                  enabled: e.target.checked
                                }
                              })}
                            />
                          }
                          label="Enable Registration Form"
                        />
                        
                        <FormControlLabel
                          control={
                            <Switch
                              checked={registrationProcedure.registrationForm.includeInBrochure}
                              onChange={(e) => setRegistrationProcedure({
                                ...registrationProcedure,
                                registrationForm: {
                                  ...registrationProcedure.registrationForm,
                                  includeInBrochure: e.target.checked
                                }
                              })}
                            />
                          }
                          label="Include Form Details in Brochure"
                          sx={{ ml: 2 }}
                        />
                      </Box>
                      
                      {registrationProcedure.registrationForm.enabled && (
                        <Box>
                          {/* Standard Fields */}
                          <Typography variant="subtitle2" gutterBottom>
                            Standard Fields
                          </Typography>
                          <Grid container spacing={1} sx={{ mb: 2 }}>
                            {Object.entries(registrationProcedure.registrationForm.fields).map(([key, value]) => {
                              if (key === 'category') {
                                return (
                                  <Grid item xs={12} key={key}>
                                    <FormControlLabel
                                      control={
                                        <Switch
                                          checked={value.enabled}
                                          onChange={(e) => setRegistrationProcedure({
                                            ...registrationProcedure,
                                            registrationForm: {
                                              ...registrationProcedure.registrationForm,
                                              fields: {
                                                ...registrationProcedure.registrationForm.fields,
                                                category: {
                                                  ...value,
                                                  enabled: e.target.checked
                                                }
                                              }
                                            }
                                          })}
                                        />
                                      }
                                      label="Category (with options)"
                                    />
                                    {value.enabled && (
                                      <Box ml={4} mt={1}>
                                        <Box display="flex" alignItems="center" mb={1}>
                                          <Typography variant="body2" sx={{ mr: 1 }}>Options:</Typography>
                                          <Button size="small" onClick={handleAddCategoryOption}>
                                            <Add fontSize="small" />
                                          </Button>
                                        </Box>
                                        {value.options.map((option, index) => (
                                          <Chip
                                            key={index}
                                            label={option}
                                            onDelete={() => handleRemoveCategoryOption(index)}
                                            size="small"
                                            sx={{ mr: 1, mb: 1 }}
                                          />
                                        ))}
                                      </Box>
                                    )}
                                  </Grid>
                                );
                              } else {
                                return (
                                  <Grid item xs={6} md={4} key={key}>
                                    <FormControlLabel
                                      control={
                                        <Switch
                                          checked={value}
                                          onChange={(e) => setRegistrationProcedure({
                                            ...registrationProcedure,
                                            registrationForm: {
                                              ...registrationProcedure.registrationForm,
                                              fields: {
                                                ...registrationProcedure.registrationForm.fields,
                                                [key]: e.target.checked
                                              }
                                            }
                                          })}
                                        />
                                      }
                                      label={key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, ' $1')}
                                    />
                                  </Grid>
                                );
                              }
                            })}
                          </Grid>
                          
                          {/* Custom Fields */}
                          <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                            <Typography variant="subtitle2">
                              Custom Fields ({registrationProcedure.registrationForm.customFields.length})
                            </Typography>
                            <Button
                              size="small"
                              startIcon={<Add />}
                              onClick={() => setCustomFieldDialog(true)}
                            >
                              Add Custom Field
                            </Button>
                          </Box>
                          
                          {registrationProcedure.registrationForm.customFields.length > 0 && (
                            <TableContainer component={Paper} sx={{ mb: 2 }}>
                              <Table size="small">
                                <TableHead>
                                  <TableRow>
                                    <TableCell>Field Name</TableCell>
                                    <TableCell>Type</TableCell>
                                    <TableCell>Required</TableCell>
                                    <TableCell>Options</TableCell>
                                    <TableCell>Actions</TableCell>
                                  </TableRow>
                                </TableHead>
                                <TableBody>
                                  {registrationProcedure.registrationForm.customFields.map((field, index) => (
                                    <TableRow key={index}>
                                      <TableCell>{field.fieldName}</TableCell>
                                      <TableCell>{field.fieldType}</TableCell>
                                      <TableCell>{field.required ? 'Yes' : 'No'}</TableCell>
                                      <TableCell>
                                        {field.options?.length > 0 ? field.options.join(', ') : '-'}
                                      </TableCell>
                                      <TableCell>
                                        <IconButton
                                          size="small"
                                          color="error"
                                          onClick={() => handleRemoveCustomField(index)}
                                        >
                                          <Delete />
                                        </IconButton>
                                      </TableCell>
                                    </TableRow>
                                  ))}
                                </TableBody>
                              </Table>
                            </TableContainer>
                          )}
                          
                          <TextField
                            label="Additional Requirements"
                            value={registrationProcedure.registrationForm.additionalRequirements}
                            onChange={(e) => setRegistrationProcedure({
                              ...registrationProcedure,
                              registrationForm: {
                                ...registrationProcedure.registrationForm,
                                additionalRequirements: e.target.value
                              }
                            })}
                            fullWidth
                            multiline
                            rows={2}
                            placeholder="e.g., *Proof has to be submitted with the application"
                          />
                        </Box>
                      )}
                    </AccordionDetails>
                  </Accordion>
                </Grid>
              </Grid>
            )}
          </CardContent>
        </Card>

        {/* Custom Field Dialog */}
        <Dialog open={customFieldDialog} onClose={() => setCustomFieldDialog(false)} maxWidth="sm" fullWidth>
          <DialogTitle>Add Custom Field</DialogTitle>
          <DialogContent>
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={12}>
                <TextField
                  label="Field Name"
                  value={newCustomField.fieldName}
                  onChange={(e) => setNewCustomField({ ...newCustomField, fieldName: e.target.value })}
                  fullWidth
                  required
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <FormControl fullWidth>
                  <InputLabel>Field Type</InputLabel>
                  <Select
                    value={newCustomField.fieldType}
                    onChange={(e) => setNewCustomField({ ...newCustomField, fieldType: e.target.value })}
                    label="Field Type"
                  >
                    {fieldTypes.map(type => (
                      <MenuItem key={type} value={type}>
                        {type.charAt(0).toUpperCase() + type.slice(1)}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={6}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={newCustomField.required}
                      onChange={(e) => setNewCustomField({ ...newCustomField, required: e.target.checked })}
                    />
                  }
                  label="Required Field"
                />
              </Grid>
              {newCustomField.fieldType === 'select' && (
                <Grid item xs={12}>
                  <TextField
                    label="Options (comma-separated)"
                    value={newCustomField.options.join(', ')}
                    onChange={(e) => setNewCustomField({
                      ...newCustomField,
                      options: e.target.value.split(',').map(opt => opt.trim()).filter(opt => opt)
                    })}
                    fullWidth
                    placeholder="Option 1, Option 2, Option 3"
                  />
                </Grid>
              )}
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setCustomFieldDialog(false)}>Cancel</Button>
            <Button 
              onClick={handleAddCustomField} 
              variant="contained"
              disabled={!newCustomField.fieldName}
            >
              Add Field
            </Button>
          </DialogActions>
        </Dialog>

        {/* Preview Dialog */}
        <Dialog open={previewDialog} onClose={() => setPreviewDialog(false)} maxWidth="md" fullWidth>
          <DialogTitle>Registration Form Preview</DialogTitle>
          <DialogContent>
            <Typography variant="h6" gutterBottom>
              Registration Form Fields
            </Typography>
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Field Name</TableCell>
                    <TableCell>Type</TableCell>
                    <TableCell>Required</TableCell>
                    <TableCell>Options/Notes</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {generateFormPreview().map((field, index) => (
                    <TableRow key={index}>
                      <TableCell>{field.name || field.fieldName}</TableCell>
                      <TableCell>{field.type || field.fieldType}</TableCell>
                      <TableCell>{field.required ? 'Yes' : 'No'}</TableCell>
                      <TableCell>
                        {field.options?.length > 0 ? field.options.join(', ') : '-'}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
            
            {registrationProcedure.registrationForm.additionalRequirements && (
              <Box mt={2}>
                <Typography variant="subtitle2" gutterBottom>
                  Additional Requirements:
                </Typography>
                <Typography variant="body2">
                  {registrationProcedure.registrationForm.additionalRequirements}
                </Typography>
              </Box>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setPreviewDialog(false)}>Close</Button>
          </DialogActions>
        </Dialog>
      </Box>
    </LocalizationProvider>
  );
};

export default RegistrationProcedureManager;