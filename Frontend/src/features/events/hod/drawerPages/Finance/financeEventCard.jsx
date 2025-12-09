import React from "react";
import { useSnackbar } from 'notistack';
import {
  Card,
  CardContent,
  Typography,
  Button,
  Box,
  Divider,
  Chip,
  Avatar,
  useTheme,
} from "@mui/material";
import { PieChart, Pie, Cell } from "recharts";
import { ArrowUpward, ArrowDownward, AttachMoney } from "@mui/icons-material";
import CurrencyRupeeIcon from "@mui/icons-material/CurrencyRupee";

const FinancialEventCard = ({ event, activePage, setActivePage }) => {
  const { enqueueSnackbar } = useSnackbar();
  const theme = useTheme();

  // Calculate actual expenditure from claim bill expenses
  const calculateActualExpenditure = () => {
    if (event.claimBill?.expenses) {
      return event.claimBill.expenses.reduce((sum, expense) => {
        return sum + (expense.actualAmount || 0);
      }, 0);
    }
    return event.budgetBreakdown?.totalExpenditure || 0;
  };

  // Debug logging to track data updates
  console.log(`💰 Finance Card Debug for "${event.title}":`, {
    totalIncome: event.budgetBreakdown?.totalIncome,
    budgetExpenditure: event.budgetBreakdown?.totalExpenditure,
    actualExpenditure: calculateActualExpenditure(),
    claimBill: event.claimBill,
    hasClaimSubmitted: !!event.claimBill
  });

  // Use actual expenditure if claim is submitted, otherwise use budget breakdown
  const displayExpenditure = event.claimBill ? calculateActualExpenditure() : (event.budgetBreakdown?.totalExpenditure || 0);
  
  // Data for the pie chart - use approved expenditure for display
  const pieData = [
    { name: "Income", value: event.budgetBreakdown?.totalIncome || 0 },
    { name: "Expenses", value: displayExpenditure },
  ];

  const COLORS = [theme.palette.success.main, theme.palette.error.main];

  // Calculate profit based on approved expenditure
  const profit = (event.budgetBreakdown?.totalIncome || 0) - displayExpenditure;
  const profitPercentage = event.budget ? (profit / event.budget) * 100 : 0;

  function handleViewFinalBudget(id) {
    // Force regenerate PDF to ensure latest data and fixes are applied
    const token = localStorage.getItem("token");
    
    fetch(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000/api'}/hod/event/claimPdf/${id}?forceRegenerate=true`, {
      method: "GET",
      headers: {
        'Authorization': `Bearer ${token}`, // Add authentication header
      },
    })
      .then((res) => {
        // Check if response is successful
        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }
        return res.blob();
      })
      .then((blob) => {
        // Use 'blob' instead of 'data'
        const pdfUrl = URL.createObjectURL(blob);
        window.open(pdfUrl);

        // Optional: Clean up the URL after some time to free memory
        setTimeout(() => {
          URL.revokeObjectURL(pdfUrl);
        }, 1000);
      })
      .catch((err) => {
        console.error("Error fetching PDF:", err.message);
        enqueueSnackbar("Failed to load PDF. Please try again.", { variant: 'error' });
      });
  }

  return (
    <Card
      sx={{
        minWidth: 300,
        maxWidth: 350,
        borderRadius: 2,
        boxShadow: 3,
        transition: "transform 0.3s, box-shadow 0.3s",
        "&:hover": {
          transform: "translateY(-5px)",
          boxShadow: 6,
        },
        mb: 4,
        mt: 2,
      }}
    >
      <CardContent
        sx={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-evenly",
        }}
      >
        <Box
          display="flex"
          justifyContent="space-between"
          alignItems="center"
          mb={2}
        >
          <Typography variant="h6" component="div" fontWeight="bold">
            {event.title}
          </Typography>
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 0.5 }}>
            <Chip
              avatar={
                <Avatar>
                  <CurrencyRupeeIcon fontSize="small" />
                </Avatar>
              }
              label={`Estimated Budget: ₹${event.budget.toLocaleString()}`}
              color="primary"
              size="small"
            />
            {/* Show claim status */}
            {event.claimBill && (
              <Chip
                label="Claim Submitted"
                color="success"
                size="small"
                variant="outlined"
              />
            )}
          </Box>
        </Box>

        <Divider sx={{ my: 1 }} />

        <Box display="flex" justifyContent="space-between" mt={2} mb={2}>
          <Box textAlign="center">
            <Typography variant="body2" color="text.secondary">
              Income
            </Typography>
            <Box display="flex" alignItems="center" justifyContent="center">
              <ArrowUpward color="success" fontSize="small" />
              <Typography variant="h6" color="success.main">
                ₹{(event.budgetBreakdown?.totalIncome || 0).toLocaleString()}
              </Typography>
            </Box>
          </Box>

          <Box textAlign="center">
            <Typography variant="body2" color="text.secondary">
              Expenses {event.claimBill ? "(Actual)" : "(Estimated)"}
            </Typography>
            <Box display="flex" alignItems="center" justifyContent="center">
              <ArrowDownward color="error" fontSize="small" />
              <Typography variant="h6" color="error.main">
                ₹{displayExpenditure.toLocaleString()}
              </Typography>
            </Box>
          </Box>
        </Box>

        <Box display="flex" justifyContent="center" my={2}>
          <PieChart width={120} height={120}>
            <Pie
              data={pieData}
              cx="50%"
              cy="50%"
              innerRadius={30}
              outerRadius={50}
              paddingAngle={5}
              dataKey="value"
            >
              {pieData.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={COLORS[index % COLORS.length]}
                />
              ))}
            </Pie>
          </PieChart>
        </Box>

        <Box
          bgcolor={profit >= 0 ? "success.light" : "error.light"}
          p={1}
          borderRadius={1}
          textAlign="center"
          mb={2}
        >
          <Typography variant="subtitle1" fontWeight="bold">
            {profit >= 0 ? "Profit" : "Loss"}: ₹
            {Math.abs(profit).toLocaleString()}
          </Typography>
          <Typography variant="caption">
            ({profitPercentage.toFixed(1)}% of budget)
          </Typography>
        </Box>

        <Button
          fullWidth
          variant="contained"
          color="primary"
          sx={{
            borderRadius: 1,
            py: 1,
            textTransform: "none",
            fontWeight: "bold",
          }}
          onClick={() => handleViewFinalBudget(event._id)}
        >
          View Final Budget
        </Button>
      </CardContent>
    </Card>
  );
};

// Example usage:
// <FinancialEventCard event={{
//   title: "Q3 Marketing Campaign",
//   budget: 40000,
//   income: 42000,
//   expenses: 38000
// }} />

export default FinancialEventCard;
