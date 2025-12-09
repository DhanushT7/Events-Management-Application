import React, { useState, useMemo } from 'react';

// MUI components (consolidated)
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  Card,
  CardContent,
  Stepper,
  Step,
  StepLabel,
  StepContent,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  IconButton,
  Paper,
  Grid,
  Alert,
  Tooltip,
  InputBase,
  Slide,
  Chip,
  useTheme,
} from '@mui/material';

// `alpha` must be imported from @mui/material/styles
import { alpha } from '@mui/material/styles';

// Icons (add Person so <Person /> exists)
import {
  Person,
  Business,
  People,
  Group,
  Security,
  ExpandMore,
  PlayArrow,
  CheckCircle,
  Lightbulb,
  Close,
  Dashboard,
  Event,
  Assignment,
  AttachMoney,
  Settings,
  Add,
  CardMembership,
  CloudDownload,
  Assessment,
  Feedback,
  Search,
  Notifications,
} from '@mui/icons-material';

// framer-motion (keep as-is)
import { motion } from 'framer-motion';

// Animated header gradient keyframes (MUST exist before using it)
const headerGradientKeyframes = {
  '@keyframes fancyGrad': {
    '0%': { backgroundPosition: '0% 50%' },
    '50%': { backgroundPosition: '100% 50%' },
    '100%': { backgroundPosition: '0% 50%' }
  }
};


const DashboardGuide = ({ open, onClose }) => {
  const [selectedRole, setSelectedRole] = useState(0);
  const theme = useTheme();

  const roles = useMemo(() => [
    {
      name: 'HOD (Head of Department)',
      icon: <Business />,
      color: '#1976d2',
      description: 'Complete guide for department heads to manage events and coordinators'
    },
    {
      name: 'Event Coordinator',
      icon: <People />,
      color: '#4caf50',
      description: 'Step-by-step instructions for creating and managing events'
    },
    {
      name: 'Participant',
      icon: <Group />,
      color: '#ff9800',
      description: 'How to browse, register, and participate in events'
    },
    {
      name: 'System Admin',
      icon: <Security />,
      color: '#9c27b0',
      description: 'Administrative functions and system management'
    }
  ], []);

  const hodGuide = {
    overview: {
      title: "HOD Dashboard Overview",
      description: "Your central hub for managing departmental events, coordinators, and approvals.",
      features: [
        { icon: <Dashboard />, title: "Overview", desc: "Real-time statistics and pending tasks" },
        { icon: <Assignment />, title: "Proposals", desc: "Review and approve event proposals" },
        { icon: <Event />, title: "Approved Events", desc: "Monitor ongoing and completed events" },
        { icon: <AttachMoney />, title: "Finance", desc: "Budget management and financial oversight" },
        { icon: <People />, title: "Committee Management", desc: "Manage convenors and committees" },
        { icon: <Settings />, title: "Signature Management", desc: "Digital signature configuration" }
      ]
    },
    workflows: [
      {
        title: "Event Approval Workflow",
        steps: [
          {
            label: "Review Proposal",
            description: "Navigate to 'Pending Proposals' to see new event submissions",
            actions: ["Click on proposal to view details", "Review event information, budget, and timeline", "Check resource requirements and availability"]
          },
          {
            label: "Approve or Reject",
            description: "Make decision based on departmental policies and resources",
            actions: ["Click 'Approve' to accept the proposal", "Add comments if rejecting", "Set approval conditions if needed"]
          },
          {
            label: "Monitor Progress",
            description: "Track approved events through their lifecycle",
            actions: ["View event status in 'Approved Events'", "Monitor participant registrations", "Review coordinator updates"]
          }
        ]
      },
      {
        title: "Budget Management",
        steps: [
          {
            label: "Review Budget Requests",
            description: "Examine financial requirements for events",
            actions: ["Go to 'Finance' section", "Review proposed budgets", "Check against departmental allocation"]
          },
          {
            label: "Approve Finances",
            description: "Authorize budget allocation for approved events",
            actions: ["Set approved budget amounts", "Add financial conditions", "Monitor expense claims"]
          },
          {
            label: "Track Expenses",
            description: "Monitor actual spending against approved budgets",
            actions: ["Review claim bills", "Approve reimbursements", "Generate financial reports"]
          }
        ]
      }
    ],
    tips: [
      "Use the refresh button to get real-time updates on proposals and events",
      "Set up email notifications for urgent approvals",
      "Regularly review the overview dashboard for pending tasks",
      "Use the calendar view to avoid scheduling conflicts",
      "Maintain clear approval criteria for consistent decisions"
    ]
  };

  const coordinatorGuide = {
    overview: {
      title: "Coordinator Dashboard Overview",
      description: "Your workspace for creating, managing, and executing successful events.",
      features: [
        { icon: <Add />, title: "Create Event", desc: "Design and submit new event proposals" },
        { icon: <Event />, title: "My Events", desc: "Manage your created events" },
        { icon: <People />, title: "Participants", desc: "Handle registrations and attendance" },
        { icon: <CardMembership />, title: "Certificates", desc: "Generate and distribute certificates" },
        { icon: <Assessment />, title: "Reports", desc: "Event analytics and performance metrics" },
        { icon: <AttachMoney />, title: "Claims", desc: "Submit expense claims and reimbursements" }
      ]
    },
    workflows: [
      {
        title: "Creating a New Event",
        steps: [
          {
            label: "Event Details",
            description: "Fill in basic event information",
            actions: ["Enter event title and description", "Set event type and category", "Define target audience", "Add event objectives"]
          },
          {
            label: "Schedule & Venue",
            description: "Configure timing and location details",
            actions: ["Set start and end dates/times", "Choose venue or set as online", "Add session details", "Configure registration deadlines"]
          },
          {
            label: "Resources & Budget",
            description: "Define resource requirements and financial needs",
            actions: ["Add resource persons/speakers", "Set budget requirements", "List required materials", "Define technical needs"]
          },
          {
            label: "Submit for Approval",
            description: "Send proposal to HOD for review",
            actions: ["Review all details", "Submit proposal", "Track approval status", "Respond to HOD feedback"]
          }
        ]
      },
      {
        title: "Managing Event Registrations",
        steps: [
          {
            label: "Monitor Registrations",
            description: "Track participant sign-ups and manage capacity",
            actions: ["View registration dashboard", "Check participant details", "Monitor capacity limits", "Send confirmation emails"]
          },
          {
            label: "Manage Attendance",
            description: "Record participant attendance during events",
            actions: ["Mark attendance for sessions", "Update participant status", "Handle late registrations", "Manage waitlists"]
          },
          {
            label: "Post-Event Activities",
            description: "Complete event closure activities",
            actions: ["Generate attendance reports", "Collect feedback", "Issue certificates", "Submit final reports"]
          }
        ]
      }
    ],
    tips: [
      "Save drafts frequently while creating events",
      "Use templates for recurring event types",
      "Set up automated email reminders for participants",
      "Keep track of participant feedback for future improvements",
      "Maintain detailed records for audit purposes"
    ]
  };

  const participantGuide = {
    overview: {
      title: "Participant Dashboard Overview",
      description: "Your gateway to discovering, registering for, and participating in events.",
      features: [
        { icon: <Dashboard />, title: "Dashboard", desc: "Overview of your activities and statistics" },
        { icon: <Search />, title: "Browse Events", desc: "Discover available events and workshops" },
        { icon: <Assignment />, title: "My Events", desc: "Track your registrations and attendance" },
        { icon: <Feedback />, title: "Feedback", desc: "Provide feedback for attended events" },
        { icon: <CardMembership />, title: "Certificates", desc: "Download your earned certificates" },
        { icon: <Person />, title: "Profile", desc: "Manage your personal information" }
      ]
    },
    workflows: [
      {
        title: "Finding and Registering for Events",
        steps: [
          {
            label: "Browse Events",
            description: "Explore available events that match your interests",
            actions: ["Go to 'Browse Events' section", "Use filters to find relevant events", "Read event descriptions and requirements", "Check schedules and venues"]
          },
          {
            label: "Register for Event",
            description: "Complete the registration process",
            actions: ["Click 'Register' on desired event", "Fill in registration form", "Confirm your details", "Submit registration"]
          },
          {
            label: "Prepare for Event",
            description: "Get ready for your registered events",
            actions: ["Check 'My Events' for updates", "Note event timings and venue", "Prepare required materials", "Set calendar reminders"]
          }
        ]
      },
      {
        title: "Participating and Getting Certificates",
        steps: [
          {
            label: "Attend Event",
            description: "Participate actively in the event",
            actions: ["Arrive on time", "Engage in sessions", "Complete required activities", "Network with other participants"]
          },
          {
            label: "Provide Feedback",
            description: "Share your experience to help improve future events",
            actions: ["Go to 'Feedback Portal'", "Rate the event", "Provide detailed comments", "Submit feedback form"]
          },
          {
            label: "Download Certificate",
            description: "Get your participation certificate",
            actions: ["Check 'My Certificates'", "Verify certificate details", "Download PDF certificate", "Share on social media if desired"]
          }
        ]
      }
    ],
    tips: [
      "Register early as events may have limited capacity",
      "Keep your profile updated for better event recommendations",
      "Set up notifications to stay informed about new events",
      "Provide honest feedback to help improve future events",
      "Download certificates promptly after event completion"
    ]
  };

  const adminGuide = {
    overview: {
      title: "System Admin Dashboard Overview",
      description: "Administrative control panel for system management and user oversight.",
      features: [
        { icon: <People />, title: "User Management", desc: "Manage user accounts and permissions" },
        { icon: <Settings />, title: "System Config", desc: "Configure system settings and parameters" },
        { icon: <Assessment />, title: "Analytics", desc: "System usage and performance metrics" },
        { icon: <Security />, title: "Security", desc: "Access control and security monitoring" },
        { icon: <CloudDownload />, title: "Backups", desc: "Data backup and recovery management" },
        { icon: <Notifications />, title: "Alerts", desc: "System alerts and notifications" }
      ]
    },
    workflows: [
      {
        title: "User Account Management",
        steps: [
          {
            label: "Create User Accounts",
            description: "Set up new user accounts for different roles",
            actions: ["Access user management panel", "Select user role (HOD/Coordinator/Participant)", "Enter user details", "Set initial permissions"]
          },
          {
            label: "Manage Permissions",
            description: "Configure role-based access controls",
            actions: ["Review user roles", "Modify permissions as needed", "Handle role changes", "Audit access logs"]
          },
          {
            label: "Handle Support Requests",
            description: "Resolve user issues and technical problems",
            actions: ["Monitor support tickets", "Investigate reported issues", "Implement solutions", "Follow up with users"]
          }
        ]
      },
      {
        title: "System Maintenance",
        steps: [
          {
            label: "Monitor Performance",
            description: "Track system health and performance metrics",
            actions: ["Check system dashboards", "Monitor resource usage", "Review error logs", "Identify performance bottlenecks"]
          },
          {
            label: "Perform Backups",
            description: "Ensure data safety through regular backups",
            actions: ["Schedule automated backups", "Verify backup integrity", "Test recovery procedures", "Maintain backup retention policies"]
          },
          {
            label: "Apply Updates",
            description: "Keep system updated and secure",
            actions: ["Review available updates", "Test in staging environment", "Schedule maintenance windows", "Deploy updates safely"]
          }
        ]
      }
    ],
    tips: [
      "Regularly monitor system logs for unusual activity",
      "Maintain detailed documentation of system changes",
      "Test backup and recovery procedures periodically",
      "Keep security patches up to date",
      "Provide clear communication during maintenance windows"
    ]
  };

  const guides = useMemo(() => [hodGuide, coordinatorGuide, participantGuide, adminGuide], [/* static */]);
  const currentGuide = guides[selectedRole] || hodGuide;

  const motionVariants = {
    container: { hidden: { opacity: 0, y: 10 }, show: { opacity: 1, y: 0, transition: { staggerChildren: 0.06 } } },
    fadeIn: { hidden: { opacity: 0, y: 8 }, show: { opacity: 1, y: 0, transition: { duration: 0.4 } } },
    cardHover: { hover: { scale: 1.02, boxShadow: '0 8px 24px rgba(0,0,0,0.12)' } }
  };

  const renderWorkflowStep = (step, index) => (
    <motion.div key={index} initial="hidden" animate="show" variants={motionVariants.fadeIn}>
      <Step>
        <StepLabel>
          <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
            {step.label}
          </Typography>
        </StepLabel>
        <StepContent>
          <Typography variant="body2" sx={{ mb: 1 }}>
            {step.description}
          </Typography>
          <List dense>
            {step.actions.map((action, i) => (
              <ListItem key={i} sx={{ pl: 0 }}>
                <ListItemIcon>
                  <PlayArrow color="primary" />
                </ListItemIcon>
                <ListItemText primary={action} />
              </ListItem>
            ))}
          </List>
        </StepContent>
      </Step>
    </motion.div>
  );

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="lg"
      fullWidth
      PaperProps={{
        sx: {
          height: '90vh',
          overflow: 'hidden',
          ...headerGradientKeyframes,
          background: 'linear-gradient(180deg, rgba(250,250,252,1) 0%, rgba(240,246,255,0.9) 100%)'
        }
      }}
      aria-labelledby="dashboard-guide-title"
    >
      <DialogTitle
        id="dashboard-guide-title"
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          p: 2.5,
          mb: 1,
          borderBottom: `1px solid ${alpha(theme.palette.divider, 0.7)}`,
          // Animated header gradient
          backgroundImage: 'linear-gradient(90deg,#667eea 0%,#764ba2 50%, #4f46e5 100%)',
          backgroundSize: '200% 200%',
          animation: 'fancyGrad 6s ease infinite',
          color: 'white'
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Typography variant="h5" sx={{ fontWeight: 800, letterSpacing: 0.3 }}>
            Dashboard User Guide
          </Typography>
          <Chip
            label="NEW"
            size="small"
            sx={{
              bgcolor: alpha('#ffffff', 0.18),
              color: 'white',
              fontWeight: 700,
              ml: 1
            }}
            icon={<Dashboard sx={{ fontSize: 16, color: 'white' }} />}
          />
        </Box>

        <Tooltip title="Close guide">
          <IconButton onClick={onClose} aria-label="close guide" sx={{ color: 'white' }}>
            <Close />
          </IconButton>
        </Tooltip>
      </DialogTitle>

      <DialogContent sx={{ p: 0, height: 'calc(90vh - 120px)' }}>
        <Box sx={{ display: 'flex', height: '100%' }}>
          {/* Sidebar */}
          <Box sx={{
            width: 320,
            borderRight: 1,
            borderColor: 'divider',
            background: 'rgba(255,255,255,0.95)',
            p: 2,
            overflowY: 'auto'
          }}>
            <Typography variant="h6" sx={{ mb: 2, fontWeight: 800, color: '#333' }}>
              Choose your role
            </Typography>

            <motion.div initial="hidden" animate="show" variants={motionVariants.container}>
              {roles.map((role, idx) => (
                <motion.div key={role.name} whileHover="hover" variants={motionVariants.cardHover}>
                  <Card
                    onClick={() => setSelectedRole(idx)}
                    role="button"
                    aria-pressed={selectedRole === idx}
                    sx={{
                      mb: 2,
                      cursor: 'pointer',
                      borderRadius: 2,
                      transition: 'transform 200ms ease, box-shadow 200ms ease',
                      border: selectedRole === idx ? `2px solid ${role.color}` : '1px solid #e6e6e6',
                      background: selectedRole === idx ? alpha(role.color, 0.06) : 'white'
                    }}
                  >
                    <CardContent sx={{ p: 2 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Box sx={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          width: 36,
                          height: 36,
                          borderRadius: 1,
                          bgcolor: alpha(role.color, 0.12),
                          color: role.color
                        }}>
                          {role.icon}
                        </Box>
                        <Box sx={{ flex: 1 }}>
                          <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                            {role.name}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">{role.description}</Typography>
                        </Box>
                      </Box>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </motion.div>

            <Paper sx={{ p: 2, mt: 2, background: alpha('#f5f5f5', 0.9) }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1 }}>
                Quick actions
              </Typography>
              <List dense>
                <ListItem>
                  <ListItemIcon><Add /></ListItemIcon>
                  <ListItemText primary="Create a new event" />
                </ListItem>
                <ListItem>
                  <ListItemIcon><Assignment /></ListItemIcon>
                  <ListItemText primary="View pending proposals" />
                </ListItem>
                <ListItem>
                  <ListItemIcon><Notifications /></ListItemIcon>
                  <ListItemText primary="Subscribe to alerts" />
                </ListItem>
              </List>
            </Paper>
          </Box>

          {/* Main content */}
          <Box sx={{ flex: 1, p: 3, overflowY: 'auto' }}>
            <motion.div initial="hidden" animate="show" variants={motionVariants.container}>
              {/* Overview */}
              <motion.div variants={motionVariants.fadeIn}>
                <Paper sx={{ p: 3, mb: 3, background: 'rgba(255,255,255,0.95)' }}>
                  <Typography variant="h4" sx={{ mb: 1, fontWeight: 900, color: roles[selectedRole].color }}>
                    {currentGuide.overview?.title ?? 'Overview'}
                  </Typography>
                  <Typography variant="body1" sx={{ mb: 2, fontSize: '1rem' }}>
                    {currentGuide.overview?.description ?? ''}
                  </Typography>

                  <Grid container spacing={2}>
                    {(currentGuide.overview?.features || []).map((feature, i) => (
                      <Grid item xs={12} md={6} key={i}>
                        <motion.div whileHover={{ scale: 1.02 }} style={{ height: '100%' }}>
                          <Card sx={{
                            height: '100%',
                            borderRadius: 2,
                            p: 1,
                            background: alpha(roles[selectedRole].color, 0.04),
                            border: `1px solid ${alpha(roles[selectedRole].color, 0.16)}`
                          }}>
                            <CardContent sx={{ p: 2 }}>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <Box sx={{ color: roles[selectedRole].color }}>{feature.icon}</Box>
                                <Box>
                                  <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>{feature.title}</Typography>
                                  <Typography variant="body2" color="text.secondary">{feature.desc}</Typography>
                                </Box>
                              </Box>
                            </CardContent>
                          </Card>
                        </motion.div>
                      </Grid>
                    ))}
                  </Grid>
                </Paper>
              </motion.div>

              {/* Workflows */}
              <motion.div variants={motionVariants.fadeIn}>
                <Paper sx={{ p: 3, mb: 3, background: 'rgba(255,255,255,0.95)' }}>
                  <Typography variant="h5" sx={{ mb: 2, fontWeight: 800, color: roles[selectedRole].color }}>
                    Step-by-Step Workflows
                  </Typography>

                  {(currentGuide.workflows || []).map((workflow, wi) => (
                    <Accordion key={wi} disableGutters sx={{ mb: 2, borderRadius: 1 }}>
                      <AccordionSummary expandIcon={<ExpandMore />}>
                        <Typography variant="h6" sx={{ fontWeight: 800 }}>{workflow.title}</Typography>
                      </AccordionSummary>
                      <AccordionDetails>
                        <Stepper orientation="vertical" nonLinear>
                          {workflow.steps.map((step, si) => renderWorkflowStep(step, si))}
                        </Stepper>
                      </AccordionDetails>
                    </Accordion>
                  ))}
                </Paper>
              </motion.div>

              {/* Tips & Footer */}
              <motion.div variants={motionVariants.fadeIn}>
                <Paper sx={{ p: 3, background: 'rgba(255,255,255,0.95)' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                    <Lightbulb sx={{ color: '#ffa726' }} />
                    <Typography variant="h6" sx={{ fontWeight: 800, color: '#ffa726' }}>Pro Tips</Typography>
                  </Box>

                  <List dense>
                    {(currentGuide.tips || []).map((tip, i) => (
                      <ListItem key={i}>
                        <ListItemIcon>
                          <CheckCircle color="success" />
                        </ListItemIcon>
                        <ListItemText primary={tip} />
                      </ListItem>
                    ))}
                  </List>

                  <Alert severity="info" sx={{ mt: 3 }}>
                    <Typography variant="body2">
                      <strong>Need help?</strong> Contact your system administrator or open a support ticket from the dashboard.
                    </Typography>
                  </Alert>
                </Paper>
              </motion.div>
            </motion.div>
          </Box>
        </Box>
      </DialogContent>

      <DialogActions sx={{ p: 2, borderTop: `1px solid ${alpha(theme.palette.divider, 0.7)}`, background: 'rgba(250,250,252,0.95)' }}>
        <Button
          onClick={onClose}
          variant="contained"
          sx={{
            background: `linear-gradient(45deg, ${roles[selectedRole].color} 30%, ${alpha(roles[selectedRole].color, 0.85)} 90%)`,
            color: '#fff',
            fontWeight: 700
          }}
        >
          Got it
        </Button>
        <Button onClick={() => window.print()} startIcon={<Notifications />} variant="outlined">
          Print / Notify
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default DashboardGuide;