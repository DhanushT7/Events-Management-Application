import React from "react";
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
  const theme = useTheme();

  // Debug logging to track data updates
  console.log(`💰 Finance Card Debug for "${event.title}":`, {
    totalIncome: event.budgetBreakdown?.totalIncome,
    totalExpenditure: event.budgetBreakdown?.totalExpenditure,
    expenses: event.budgetBreakdown?.expenses,
    claimBill: event.claimBill,
    hasClaimSubmitted: !!event.claimBill
  });

  // Use claimed expenditure if available, otherwise use budget breakdown
  const actualExpenditure = event.claimBill?.totalExpenditure || event.budgetBreakdown?.totalExpenditure || 0;
  
  // Data for the pie chart
  const pieData = [
    { name: "Income", value: event.budgetBreakdown?.totalIncome || 0 },
    { name: "Expenses", value: actualExpenditure },
  ];

  const COLORS = [theme.palette.success.main, theme.palette.error.main];

  const profit = (event.budgetBreakdown?.totalIncome || 0) - actualExpenditure;
  const profitPercentage = event.budget ? (profit / event.budget) * 100 : 0;

  function handleViewFinalBudget(id) {
    fetch(`http://localhost:5050/api/hod/event/claimPdf/${id}`, {
      method: "GET",
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
        alert("Failed to load PDF. Please try again.");
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
              Expenses {event.claimBill ? "(Claimed)" : "(Estimated)"}
            </Typography>
            <Box display="flex" alignItems="center" justifyContent="center">
              <ArrowDownward color="error" fontSize="small" />
              <Typography variant="h6" color="error.main">
                ₹{actualExpenditure.toLocaleString()}
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
//   budget: 50000,
//   income: 42000,
//   expenses: 38000
// }} />

export default FinancialEventCard;
