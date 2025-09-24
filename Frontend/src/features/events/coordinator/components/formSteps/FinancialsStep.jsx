import React, { useEffect } from 'react';
import {
  Grid,
  TextField,
  Button,
  IconButton,
  Typography,
  Box,
  Paper,
  Divider,
  useTheme,
  alpha
} from '@mui/material';
import {
  Add,
  Delete,
  MonetizationOn,
  TrendingUp,
  TrendingDown,
  AccountBalance
} from '@mui/icons-material';

const FinancialsStep = ({ formData, setFormData }) => {
  const theme = useTheme();

  // Update income calculations when form data changes
  useEffect(() => {
    if (formData.budgetBreakdown?.income) {
      const updatedIncome = formData.budgetBreakdown.income.map(item => ({
        ...item,
        income: Number(item.expectedParticipants || 0) * 
                Number(item.perParticipantAmount || 0) * 
                (1 - Number(item.gstPercentage || 0) / 100)
      }));

      setFormData(prev => ({
        ...prev,
        budgetBreakdown: {
          ...prev.budgetBreakdown,
          income: updatedIncome,
          totalIncome: updatedIncome.reduce((sum, item) => sum + item.income, 0),
          universityOverhead: updatedIncome.reduce((sum, item) => sum + item.income, 0) * 0.3
        }
      }));
    }
  }, [formData.budgetBreakdown?.income?.map(item => 
    `${item.expectedParticipants}-${item.perParticipantAmount}-${item.gstPercentage}`
  ).join('|')]);

  const handleNestedChange = (section, field, value, index = null) => {
    setFormData((prev) => {
      const updated = { ...prev };
      
      if (section.includes(".")) {
        const [parent, child] = section.split(".");
        
        if (!updated[parent]) updated[parent] = {};
        if (!updated[parent][child]) {
          updated[parent][child] = Array.isArray(prev[parent]?.[child]) ? [] : {};
        }
        
        if (Array.isArray(updated[parent][child]) && index !== null) {
          updated[parent][child][index] = {
            ...updated[parent][child][index],
            [field]: value,
          };
        } else {
          updated[parent][child] = {
            ...updated[parent][child],
            [field]: value,
          };
        }
      }
      
      return updated;
    });
  };

  const handleAddIncomeCategory = () => {
    setFormData((prev) => ({
      ...prev,
      budgetBreakdown: {
        ...prev.budgetBreakdown,
        income: [
          ...prev.budgetBreakdown.income,
          {
            category: "",
            expectedParticipants: "",
            perParticipantAmount: "",
            gstPercentage: "",
            income: 0,
          },
        ],
      },
    }));
  };

  const handleRemoveIncome = (index) => {
    setFormData((prev) => ({
      ...prev,
      budgetBreakdown: {
        ...prev.budgetBreakdown,
        income: prev.budgetBreakdown.income.filter((_, i) => i !== index),
      },
    }));
  };

  const handleAddExpense = () => {
    setFormData((prev) => ({
      ...prev,
      budgetBreakdown: {
        ...prev.budgetBreakdown,
        expenses: [
          ...prev.budgetBreakdown.expenses,
          { category: "", amount: "" },
        ],
      },
    }));
  };

  const handleRemoveExpense = (index) => {
    setFormData((prev) => ({
      ...prev,
      budgetBreakdown: {
        ...prev.budgetBreakdown,
        expenses: prev.budgetBreakdown.expenses.filter((_, i) => i !== index),
      },
    }));
  };

  const calculateTotals = () => {
    const totalIncome = formData.budgetBreakdown?.income?.reduce((sum, item) => {
      const participants = Number(item.expectedParticipants || 0);
      const amount = Number(item.perParticipantAmount || 0);
      const gst = Number(item.gstPercentage || 0);
      return sum + (participants * amount * (1 - gst / 100));
    }, 0) || 0;

    const totalExpenses = formData.budgetBreakdown?.expenses?.reduce((sum, item) => {
      return sum + Number(item.amount || 0);
    }, 0) || 0;

    const universityOverhead = totalIncome * 0.3;

    return { totalIncome, totalExpenses, universityOverhead };
  };

  const { totalIncome, totalExpenses, universityOverhead } = calculateTotals();

  return (
    <Box>
      <Paper
        sx={{
          p: 3,
          mb: 3,
          background: `linear-gradient(135deg, ${alpha(theme.palette.success.main, 0.05)} 0%, ${alpha(theme.palette.success.main, 0.02)} 100%)`,
          border: `1px solid ${alpha(theme.palette.success.main, 0.1)}`,
          borderRadius: 3
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
          <AccountBalance color="success" />
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            Financial Planning
          </Typography>
        </Box>
        <Typography variant="body2" color="text.secondary">
          Plan your event budget with income sources and expense categories
        </Typography>
      </Paper>

      <Grid container spacing={4}>
        {/* Income Section */}
        <Grid item xs={12} md={6}>
          <Paper
            sx={{
              p: 3,
              border: `1px solid ${theme.palette.divider}`,
              borderRadius: 3,
              height: 'fit-content'
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
              <TrendingUp color="success" />
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                Income Sources
              </Typography>
            </Box>

            {formData.budgetBreakdown?.income?.map((income, index) => (
              <Paper
                key={index}
                sx={{
                  p: 2,
                  mb: 2,
                  backgroundColor: alpha(theme.palette.success.main, 0.02),
                  border: `1px solid ${alpha(theme.palette.success.main, 0.1)}`,
                  borderRadius: 2
                }}
              >
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                    Income Source {index + 1}
                  </Typography>
                  <IconButton
                    size="small"
                    color="error"
                    onClick={() => handleRemoveIncome(index)}
                    disabled={formData.budgetBreakdown.income.length === 1}
                  >
                    <Delete />
                  </IconButton>
                </Box>

                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      size="small"
                      label="Category"
                      value={income.category}
                      onChange={(e) =>
                        handleNestedChange(
                          "budgetBreakdown.income",
                          "category",
                          e.target.value,
                          index
                        )
                      }
                      placeholder="e.g., Registration Fee"
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          borderRadius: 2
                        }
                      }}
                    />
                  </Grid>
                  <Grid item xs={6}>
                    <TextField
                      fullWidth
                      size="small"
                      label="Expected Participants"
                      type="number"
                      value={income.expectedParticipants}
                      onChange={(e) =>
                        handleNestedChange(
                          "budgetBreakdown.income",
                          "expectedParticipants",
                          e.target.value,
                          index
                        )
                      }
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          borderRadius: 2
                        }
                      }}
                    />
                  </Grid>
                  <Grid item xs={6}>
                    <TextField
                      fullWidth
                      size="small"
                      label="Per Participant (₹)"
                      type="number"
                      value={income.perParticipantAmount}
                      onChange={(e) =>
                        handleNestedChange(
                          "budgetBreakdown.income",
                          "perParticipantAmount",
                          e.target.value,
                          index
                        )
                      }
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          borderRadius: 2
                        }
                      }}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      size="small"
                      label="GST Percentage (%)"
                      type="number"
                      value={income.gstPercentage}
                      onChange={(e) =>
                        handleNestedChange(
                          "budgetBreakdown.income",
                          "gstPercentage",
                          e.target.value,
                          index
                        )
                      }
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          borderRadius: 2
                        }
                      }}
                    />
                  </Grid>
                </Grid>

                {/* Calculated Income Display */}
                <Box sx={{ mt: 2, p: 1, backgroundColor: alpha(theme.palette.success.main, 0.1), borderRadius: 1 }}>
                  <Typography variant="body2" color="success.main" sx={{ fontWeight: 600 }}>
                    Calculated Income: ₹{(
                      Number(income.expectedParticipants || 0) * 
                      Number(income.perParticipantAmount || 0) * 
                      (1 - Number(income.gstPercentage || 0) / 100)
                    ).toFixed(2)}
                  </Typography>
                </Box>
              </Paper>
            ))}

            <Button
              variant="outlined"
              startIcon={<Add />}
              onClick={handleAddIncomeCategory}
              fullWidth
              sx={{
                borderRadius: 2,
                textTransform: 'none',
                borderStyle: 'dashed',
                py: 1.5,
                '&:hover': {
                  borderStyle: 'solid'
                }
              }}
            >
              Add Income Source
            </Button>
          </Paper>
        </Grid>

        {/* Expenses Section */}
        <Grid item xs={12} md={6}>
          <Paper
            sx={{
              p: 3,
              border: `1px solid ${theme.palette.divider}`,
              borderRadius: 3,
              height: 'fit-content'
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
              <TrendingDown color="error" />
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                Expense Categories
              </Typography>
            </Box>

            {formData.budgetBreakdown?.expenses?.map((expense, index) => (
              <Paper
                key={index}
                sx={{
                  p: 2,
                  mb: 2,
                  backgroundColor: alpha(theme.palette.error.main, 0.02),
                  border: `1px solid ${alpha(theme.palette.error.main, 0.1)}`,
                  borderRadius: 2
                }}
              >
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                    Expense {index + 1}
                  </Typography>
                  <IconButton
                    size="small"
                    color="error"
                    onClick={() => handleRemoveExpense(index)}
                    disabled={formData.budgetBreakdown.expenses.length === 1}
                  >
                    <Delete />
                  </IconButton>
                </Box>

                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      size="small"
                      label="Expense Category"
                      value={expense.category}
                      onChange={(e) =>
                        handleNestedChange(
                          "budgetBreakdown.expenses",
                          "category",
                          e.target.value,
                          index
                        )
                      }
                      placeholder="e.g., Refreshments, Materials"
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          borderRadius: 2
                        }
                      }}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      size="small"
                      label="Amount (₹)"
                      type="number"
                      value={expense.amount}
                      onChange={(e) =>
                        handleNestedChange(
                          "budgetBreakdown.expenses",
                          "amount",
                          e.target.value,
                          index
                        )
                      }
                      InputProps={{
                        startAdornment: <MonetizationOn sx={{ mr: 1, color: 'text.secondary' }} />
                      }}
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          borderRadius: 2
                        }
                      }}
                    />
                  </Grid>
                </Grid>
              </Paper>
            ))}

            <Button
              variant="outlined"
              startIcon={<Add />}
              onClick={handleAddExpense}
              fullWidth
              sx={{
                borderRadius: 2,
                textTransform: 'none',
                borderStyle: 'dashed',
                py: 1.5,
                '&:hover': {
                  borderStyle: 'solid'
                }
              }}
            >
              Add Expense Category
            </Button>
          </Paper>
        </Grid>

        {/* Financial Summary */}
        <Grid item xs={12}>
          <Paper
            sx={{
              p: 3,
              background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.1)} 0%, ${alpha(theme.palette.primary.main, 0.05)} 100%)`,
              border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`,
              borderRadius: 3
            }}
          >
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 3 }}>
              Financial Summary
            </Typography>
            
            <Grid container spacing={3}>
              <Grid item xs={12} sm={6} md={3}>
                <Box sx={{ textAlign: 'center' }}>
                  <Typography variant="h4" color="success.main" sx={{ fontWeight: 700 }}>
                    ₹{totalIncome.toFixed(2)}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Total Income
                  </Typography>
                </Box>
              </Grid>
              
              <Grid item xs={12} sm={6} md={3}>
                <Box sx={{ textAlign: 'center' }}>
                  <Typography variant="h4" color="error.main" sx={{ fontWeight: 700 }}>
                    ₹{totalExpenses.toFixed(2)}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Total Expenses
                  </Typography>
                </Box>
              </Grid>
              
              <Grid item xs={12} sm={6} md={3}>
                <Box sx={{ textAlign: 'center' }}>
                  <Typography variant="h4" color="warning.main" sx={{ fontWeight: 700 }}>
                    ₹{universityOverhead.toFixed(2)}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    University Overhead (30%)
                  </Typography>
                </Box>
              </Grid>
              
              <Grid item xs={12} sm={6} md={3}>
                <Box sx={{ textAlign: 'center' }}>
                  <Typography 
                    variant="h4" 
                    color={totalIncome - totalExpenses - universityOverhead >= 0 ? 'success.main' : 'error.main'}
                    sx={{ fontWeight: 700 }}
                  >
                    ₹{(totalIncome - totalExpenses - universityOverhead).toFixed(2)}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Net Balance
                  </Typography>
                </Box>
              </Grid>
            </Grid>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default FinancialsStep;