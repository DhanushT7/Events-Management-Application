import React from 'react';
import {
  Grid,
  Card,
  CardContent,
  CardActions,
  Typography,
  Button,
  Box,
  Chip,
  Paper,
  useTheme,
  alpha,
  Tooltip,
  IconButton
} from '@mui/material';
import {
  Edit,
  Delete,
  CheckCircle,
  PendingActions,
  EventAvailable,
  MonetizationOn,
  Visibility,
  Receipt,
  Add,
  FileCopy,
  LocationOn,
  Schedule,
  Group,
  TrendingUp
} from '@mui/icons-material';

const EventCard = ({ 
  event, 
  onEdit, 
  onDelete, 
  onApplyClaim, 
  onGeneratePDF, 
  onViewBrochure, 
  onViewFinalBudget, 
  onNavigateToEvent 
}) => {
  const theme = useTheme();

  const getStatusChip = (status) => {
    const statusConfig = {
      approved: {
        icon: <CheckCircle />,
        label: "Approved",
        color: "success",
        bgColor: alpha(theme.palette.success.main, 0.1),
        textColor: theme.palette.success.main
      },
      rejected: {
        icon: <CheckCircle />,
        label: "Rejected", 
        color: "error",
        bgColor: alpha(theme.palette.error.main, 0.1),
        textColor: theme.palette.error.main
      },
      default: {
        icon: <PendingActions />,
        label: "Pending",
        color: "warning",
        bgColor: alpha(theme.palette.warning.main, 0.1),
        textColor: theme.palette.warning.main
      }
    };

    const config = statusConfig[status] || statusConfig.default;
    
    return (
      <Chip
        icon={config.icon}
        label={config.label}
        size="small"
        sx={{
          backgroundColor: config.bgColor,
          color: config.textColor,
          fontWeight: 600,
          border: `1px solid ${alpha(config.textColor, 0.3)}`
        }}
      />
    );
  };

  const getStatusBorderColor = (status) => {
    switch (status) {
      case "approved": return theme.palette.success.main;
      case "rejected": return theme.palette.error.main;
      default: return theme.palette.warning.main;
    }
  };

  return (
    <Card
      sx={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
        borderLeft: `4px solid ${getStatusBorderColor(event.status)}`,
        borderRadius: 3,
        boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
        transition: 'all 0.3s ease-in-out',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
        }
      }}
    >
      <CardContent sx={{ flexGrow: 1, p: 3 }}>
        {/* Header with title and status */}
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", mb: 2 }}>
          <Typography
            variant="h6"
            component="h2"
            sx={{ 
              fontWeight: 700,
              color: theme.palette.text.primary,
              lineHeight: 1.3,
              flex: 1,
              mr: 1
            }}
          >
            {event.title}
          </Typography>
          {getStatusChip(event.status)}
        </Box>

        {/* Event details */}
        <Box sx={{ mb: 2 }}>
          <Box sx={{ display: "flex", alignItems: "center", mb: 1, color: "text.secondary" }}>
            <EventAvailable fontSize="small" sx={{ mr: 1 }} />
            <Typography variant="body2">
              {new Date(event.startDate).toLocaleDateString()} - {new Date(event.endDate).toLocaleDateString()}
            </Typography>
          </Box>

          <Box sx={{ display: "flex", alignItems: "center", mb: 1, color: "text.secondary" }}>
            <LocationOn fontSize="small" sx={{ mr: 1 }} />
            <Typography variant="body2" noWrap>
              {event.venue}
            </Typography>
          </Box>

          <Box sx={{ display: "flex", alignItems: "center", mb: 2, color: "text.secondary" }}>
            <Schedule fontSize="small" sx={{ mr: 1 }} />
            <Typography variant="body2">
              {event.mode} • {event.duration}
            </Typography>
          </Box>
        </Box>

        {/* Tags */}
        <Box sx={{ mb: 2 }}>
          <Chip
            label={`₹${event.budget}`}
            size="small"
            color="primary"
            icon={<MonetizationOn fontSize="small" />}
            sx={{ mr: 1, mb: 1 }}
          />
          <Chip
            label={event.type}
            size="small"
            variant="outlined"
            sx={{ mr: 1, mb: 1 }}
          />
        </Box>

        {/* Coordinators */}
        {event.coordinators?.length > 0 && (
          <Box sx={{ mb: 2 }}>
            <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
              <Group fontSize="small" sx={{ mr: 1, color: "text.secondary" }} />
              <Typography variant="body2" fontWeight={600} color="text.secondary">
                Coordinators
              </Typography>
            </Box>
            <Typography variant="body2" color="text.primary">
              {event.coordinators.map((c) => c.name).join(", ")}
            </Typography>
          </Box>
        )}

        {/* HOD Comments */}
        {event.reviewComments && (
          <Paper
            sx={{
              mt: 2,
              p: 2,
              bgcolor: alpha(theme.palette.info.main, 0.05),
              border: `1px solid ${alpha(theme.palette.info.main, 0.2)}`,
              borderRadius: 2
            }}
          >
            <Typography variant="body2" sx={{ fontWeight: 600, mb: 1, color: theme.palette.info.main }}>
              HOD Comments:
            </Typography>
            <Typography variant="body2" sx={{ fontStyle: "italic", color: "text.secondary" }}>
              {event.reviewComments}
            </Typography>
          </Paper>
        )}
      </CardContent>

      <CardActions sx={{ p: 2, pt: 0, flexWrap: 'wrap', gap: 1 }}>
        <Button
          size="small"
          startIcon={<Visibility />}
          onClick={() => onNavigateToEvent(event._id)}
          variant="contained"
          sx={{ 
            borderRadius: 2,
            textTransform: 'none',
            fontWeight: 600
          }}
        >
          View Details
        </Button>

        <Button
          size="small"
          variant="outlined"
          onClick={() => onNavigateToEvent(event._id, 'template')}
          sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 600 }}
        >
          Feedback Template
        </Button>

        <Button
          size="small"
          variant="outlined"
          onClick={() => onNavigateToEvent(event._id, 'analysis')}
          sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 600 }}
        >
          Feedback Analysis
        </Button>
        
        <Tooltip title="Generate PDF">
          <IconButton
            size="small"
            onClick={() => onGeneratePDF(event)}
            sx={{ 
              color: theme.palette.primary.main,
              '&:hover': { backgroundColor: alpha(theme.palette.primary.main, 0.1) }
            }}
          >
            <Receipt />
          </IconButton>
        </Tooltip>

        <Tooltip title="Edit Event">
          <IconButton
            size="small"
            onClick={() => onEdit(event._id)}
            sx={{ 
              color: theme.palette.info.main,
              '&:hover': { backgroundColor: alpha(theme.palette.info.main, 0.1) }
            }}
          >
            <Edit />
          </IconButton>
        </Tooltip>

        <Tooltip title="Delete Event">
          <IconButton
            size="small"
            onClick={() => onDelete(event._id)}
            sx={{ 
              color: theme.palette.error.main,
              '&:hover': { backgroundColor: alpha(theme.palette.error.main, 0.1) }
            }}
          >
            <Delete />
          </IconButton>
        </Tooltip>

        <Tooltip title="Apply Claim Bill">
          <IconButton
            size="small"
            onClick={() => onApplyClaim(event)}
            sx={{ 
              color: theme.palette.success.main,
              '&:hover': { backgroundColor: alpha(theme.palette.success.main, 0.1) }
            }}
          >
            <Add />
          </IconButton>
        </Tooltip>

        {event.claimBill && (
          <Tooltip title="View Claim PDF">
            <IconButton
              size="small"
              onClick={() => onViewFinalBudget(event._id)}
              sx={{ 
                color: theme.palette.warning.main,
                '&:hover': { backgroundColor: alpha(theme.palette.warning.main, 0.1) }
              }}
            >
              <Receipt />
            </IconButton>
          </Tooltip>
        )}

        <Tooltip title="View Brochure">
          <IconButton
            size="small"
            onClick={() => onViewBrochure(event)}
            sx={{ 
              color: theme.palette.secondary.main,
              '&:hover': { backgroundColor: alpha(theme.palette.secondary.main, 0.1) }
            }}
          >
            <FileCopy />
          </IconButton>
        </Tooltip>
      </CardActions>
    </Card>
  );
};

const EventsGrid = ({ 
  events, 
  onEdit, 
  onDelete, 
  onApplyClaim, 
  onGeneratePDF, 
  onViewBrochure, 
  onViewFinalBudget, 
  onNavigateToEvent 
}) => {
  const theme = useTheme();

  if (!events || events.length === 0) {
    return (
      <Paper
        sx={{
          p: 6,
          textAlign: 'center',
          borderRadius: 3,
          backgroundColor: alpha(theme.palette.primary.main, 0.02)
        }}
      >
        <Box sx={{ mb: 3 }}>
          <EventAvailable sx={{ fontSize: 64, color: theme.palette.text.secondary, mb: 2 }} />
          <Typography variant="h5" gutterBottom color="text.secondary">
            No Events Found
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Start by creating your first event to manage participants and track progress.
          </Typography>
        </Box>
      </Paper>
    );
  }

  return (
    <Box>
      {/* Enhanced Stats Summary */}
      <Paper 
        sx={{ 
          p: 4, 
          mb: 4, 
          borderRadius: 3,
          background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.05)} 0%, ${alpha(theme.palette.secondary.main, 0.05)} 100%)`,
          border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`
        }}
      >
        <Typography variant="h5" gutterBottom sx={{ fontWeight: 700, mb: 3, color: theme.palette.primary.main }}>
          📊 Dashboard Analytics
        </Typography>
        
        <Grid container spacing={3}>
          {/* Total Events */}
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ 
              textAlign: 'center', 
              p: 2, 
              borderRadius: 2,
              background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
              color: 'white',
              boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
            }}>
              <EventAvailable sx={{ fontSize: 40, mb: 1, opacity: 0.9 }} />
              <Typography variant="h3" sx={{ fontWeight: 700, mb: 1 }}>
                {events.length}
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.9 }}>
                Total Events
              </Typography>
            </Card>
          </Grid>

          {/* Approved Events */}
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ 
              textAlign: 'center', 
              p: 2, 
              borderRadius: 2,
              background: `linear-gradient(135deg, ${theme.palette.success.main} 0%, ${theme.palette.success.dark} 100%)`,
              color: 'white',
              boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
            }}>
              <CheckCircle sx={{ fontSize: 40, mb: 1, opacity: 0.9 }} />
              <Typography variant="h3" sx={{ fontWeight: 700, mb: 1 }}>
                {events.filter(e => e.status === 'approved').length}
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.9 }}>
                Approved Events
              </Typography>
            </Card>
          </Grid>

          {/* Pending Events */}
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ 
              textAlign: 'center', 
              p: 2, 
              borderRadius: 2,
              background: `linear-gradient(135deg, ${theme.palette.warning.main} 0%, ${theme.palette.warning.dark} 100%)`,
              color: 'white',
              boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
            }}>
              <PendingActions sx={{ fontSize: 40, mb: 1, opacity: 0.9 }} />
              <Typography variant="h3" sx={{ fontWeight: 700, mb: 1 }}>
                {events.filter(e => e.status === 'pending' || !e.status).length}
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.9 }}>
                Pending Approval
              </Typography>
            </Card>
          </Grid>

          {/* Total Budget */}
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ 
              textAlign: 'center', 
              p: 2, 
              borderRadius: 2,
              background: `linear-gradient(135deg, ${theme.palette.info.main} 0%, ${theme.palette.info.dark} 100%)`,
              color: 'white',
              boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
            }}>
              <MonetizationOn sx={{ fontSize: 40, mb: 1, opacity: 0.9 }} />
              <Typography variant="h3" sx={{ fontWeight: 700, mb: 1 }}>
                ₹{events.reduce((sum, e) => sum + (Number(e.budget) || 0), 0).toLocaleString()}
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.9 }}>
                Total Budget
              </Typography>
            </Card>
          </Grid>
        </Grid>

        {/* Additional Insights */}
        <Box sx={{ mt: 4, pt: 3, borderTop: `1px solid ${alpha(theme.palette.divider, 0.1)}` }}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={4}>
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="h6" color="primary" sx={{ fontWeight: 600 }}>
                  {events.filter(e => e.claimBill).length}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Claims Submitted
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={12} md={4}>
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="h6" color="secondary" sx={{ fontWeight: 600 }}>
                  {events.filter(e => new Date(e.endDate) > new Date()).length}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Upcoming Events
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={12} md={4}>
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="h6" color="info.main" sx={{ fontWeight: 600 }}>
                  {Math.round((events.filter(e => e.status === 'approved').length / Math.max(events.length, 1)) * 100)}%
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Approval Rate
                </Typography>
              </Box>
            </Grid>
          </Grid>
        </Box>
      </Paper>

      {/* Events Grid */}
      <Grid container spacing={3}>
        {events.map((event) => (
          <Grid item xs={12} sm={6} lg={4} key={event._id || Math.random()}>
            <EventCard
              event={event}
              onEdit={onEdit}
              onDelete={onDelete}
              onApplyClaim={onApplyClaim}
              onGeneratePDF={onGeneratePDF}
              onViewBrochure={onViewBrochure}
              onViewFinalBudget={onViewFinalBudget}
              onNavigateToEvent={onNavigateToEvent}
            />
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default EventsGrid;