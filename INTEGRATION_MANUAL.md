# Events Management Application - Integration Manual

## Overview

This manual provides comprehensive instructions for integrating Module 4 (Events Conducted by Department) with the other 9 modules in the Events Management Application. Module 4 is already developed and serves as the foundation for the complete system.

## Current Module 4 Implementation

### Backend Structure
```
Backend/
├── models/
│   ├── eventModel.js              # Main event schema with comprehensive fields
│   ├── participantModel.js        # Participant registration and management
│   ├── ParticipantEventModel.js   # Junction table for participant-event relationships
│   ├── certificateModel.js        # Certificate generation and tracking
│   ├── claimModel.js              # Financial claims and expense tracking
│   ├── feedbackModel.js           # Event feedback system
│   ├── feedbackQuestionModel.js   # Feedback question bank
│   ├── convenorCommitteeModel.js  # Event organizing committee
│   ├── TrainingProgramme.js       # Training program specifics
│   └── userModel.js               # User authentication and roles
├── controllers/
│   ├── admin/
│   │   └── feedbackQuestionController.js    # Feedback question management
│   ├── coordinator/
│   │   ├── brochureController.js            # Brochure generation
│   │   ├── budgetSyncController.js          # Budget synchronization
│   │   ├── claimBillController.js           # Claim bill processing
│   │   ├── claimController.js               # Main claim management
│   │   ├── claimItemController.js           # Individual claim items
│   │   ├── claimPdfController.js            # Claim PDF generation
│   │   ├── dashboard.js                     # Coordinator dashboard
│   │   ├── downloadClaimPDF.js              # Claim PDF download
│   │   ├── feedbackStats.js                 # Feedback statistics
│   │   ├── fixAmountController.js           # Amount fixing logic
│   │   ├── generateClaim.js                 # Claim generation
│   │   ├── organizingCommitteeController.js # Committee management
│   │   ├── participantManagement.js         # Participant operations
│   │   ├── pdfController.js                 # PDF operations
│   │   ├── programmeController.js           # Program management
│   │   ├── updateController.js              # Update operations
│   │   └── userController.js                # User management
│   ├── hod/
│   │   ├── addComment.js                    # Add approval comments
│   │   ├── allEvents.js                     # View all events
│   │   ├── convenorCommitteeController.js   # Committee oversight
│   │   ├── downloadClaimPDF.js              # Download claim PDFs
│   │   ├── eventStatusController.js         # Event status management
│   │   ├── participantController.js         # Participant oversight
│   │   └── updatedStatus.js                 # Status updates
│   ├── participant/
│   │   ├── dashboard.js                     # Participant dashboard
│   │   └── getCompletedEventsController.js  # Completed events view
│   ├── auth/                                # Authentication controllers
│   └── certificateController.js             # Certificate generation logic
├── routes/
│   ├── adminRoutes.js             # Admin API endpoints
│   ├── coordinatorRoutes.js       # Coordinator API endpoints
│   ├── hodRoutes.js               # HOD API endpoints
│   ├── participantRoutes.js       # Participant API endpoints
│   ├── certificateRoutes.js       # Certificate API endpoints
│   ├── claimItemRoutes.js         # Claim processing endpoints
│   ├── budgetSyncRoutes.js        # Budget synchronization
│   ├── authRoutes.js              # Authentication endpoints
│   └── debugRoutes.js             # Debug and testing endpoints
├── services/                      # Business logic services
├── templates/                     # PDF and document templates
├── utils/                         # Utility functions
└── middleware/                    # Authentication and validation middleware
```

### Frontend Structure
```
Frontend/src/
├── components/
│   ├── CertificateGenerator.jsx        # Certificate generation interface
│   ├── CertificateVerification.jsx    # Certificate verification system
│   ├── ParticipantCertificates.jsx    # Participant certificate management
│   ├── AddParticipantModal.jsx        # Participant registration modal
│   ├── EnhancedParticipantDashboard.jsx # Participant dashboard
│   ├── ClaimItemManagement.jsx        # Individual claim item management
│   ├── ClaimManagement.jsx            # Overall claim management
│   └── FeedbackStatsCard.jsx          # Feedback statistics display
├── pages/
│   ├── coordinator/
│   │   ├── coordinatorDashboard.jsx   # Main coordinator interface
│   │   ├── CertificateManagement.jsx  # Certificate management page
│   │   ├── EventDashboard.jsx         # Event overview dashboard
│   │   └── ErrorBoundary.jsx          # Error handling component
│   ├── HOD/                           # Head of Department pages
│   ├── Participants/                  # Participant-specific pages
│   ├── Feedback/                      # Feedback system pages
│   ├── Auth/                          # Authentication pages
│   └── Home/                          # Landing and home pages
└── services/
    ├── certificateService.js          # Certificate API service
    ├── brochureGenerator.js           # Brochure generation service
    └── api.js                         # Base API configuration
```

## Integration Architecture

### Module Dependencies and Integration Points

```
┌─────────────────────────────────────────────────────────────────┐
│                    Events Management System                      │
├─────────────────────────────────��───────────────────────────────┤
│  Module 1: Student OD    │  Module 2: Student Internship        │
│  ├─ OD Request Forms     │  ├─ Internship Applications          │
│  ├─ Approval Workflow    │  ├─ Vacation/Class Internships       │
│  └─ Faculty Notification │  └─ Overseas Programs                │
├─────────────────────────────────────────────────────────────────┤
│  Module 3: Faculty OD    │  Module 4: Events (IMPLEMENTED)      │
│  ├─ Faculty OD Requests  │  ├─ Event Management ✓               │
│  ├─ Conference/Training  │  ├─ Participant Registration ✓       │
│  └─ Publication Tracking │  ├─ Certificate Generation ✓         │
│                          │  ├─ Feedback Collection ✓            │
│                          │  ├─ Claim Processing ✓               │
│                          │  └─ Brochure Generation ✓            │
├──────────────────��──────────────────────────────────────────────┤
│  Module 5: Facility      │  Module 6: Timetable & Workload      │
│  ├─ Room Booking         │  ├─ Class Scheduling                 │
│  ├─ Equipment Allocation │  ├─ Faculty Workload                 │
│  └─ Capacity Management  │  └─ Conflict Resolution              │
├─────────────────────────────────────────────────────────────────┤
│  Module 7: Feedback      │  Module 8: Project Review            │
│  ├─ Course Feedback      │  ├─ Team Formation                   │
│  ├─ Grievance System     │  ├─ Review Panels                    │
│  └─ Analytics Dashboard  │  └─ Viva Management                  │
├─────────────────────────────────────────────────────────────────┤
│  Module 9: PG CS Exams   │  Module 10: Purchase Committee       │
│  ├─ Question Papers      │  ├─ Bill Processing                  │
│  ├─ Evaluation System    │  ├─ TDS Calculation                  │
│  └─ Invigilation Duty    │  └─ Bank Reconciliation              │
└─────────────────────────────────────────────────────────────────┘
```

## Step-by-Step Integration Guide

### Phase 1: Database Schema Integration

#### 1.1 Extend User Model for All Modules
```javascript
// Backend/models/userModel.js - Add fields for all modules
const userSchema = {
  // Existing fields...
  
  // Module 1: Student OD
  studentODPermissions: {
    canRequestOD: { type: Boolean, default: false },
    canApproveOD: { type: Boolean, default: false },
    isClassAdvisor: { type: Boolean, default: false },
    isHOD: { type: Boolean, default: false }
  },
  
  // Module 2: Student Internship
  internshipRole: {
    type: String,
    enum: ['student', 'coordinator', 'approver'],
    default: 'student'
  },
  
  // Module 3: Faculty OD
  facultyODPermissions: {
    canRequestFacultyOD: { type: Boolean, default: false },
    canApproveFacultyOD: { type: Boolean, default: false },
    department: String,
    designation: String
  },
  
  // Module 5: Facility Booking
  facilityPermissions: {
    canBookFacilities: { type: Boolean, default: false },
    canApproveFacilityBooking: { type: Boolean, default: false },
    managedFacilities: [String]
  },
  
  // Module 6: Timetable
  timetableRole: {
    type: String,
    enum: ['faculty', 'admin', 'hod'],
    default: 'faculty'
  },
  
  // Module 8: Project Review
  projectReviewRole: {
    canSupervise: { type: Boolean, default: false },
    canReview: { type: Boolean, default: false },
    isExternal: { type: Boolean, default: false }
  },
  
  // Module 9: PG CS
  pgcsRole: {
    canSetQuestions: { type: Boolean, default: false },
    canEvaluate: { type: Boolean, default: false },
    canInvigilate: { type: Boolean, default: false }
  },
  
  // Module 10: Purchase
  purchaseRole: {
    canProcessBills: { type: Boolean, default: false },
    canApprovePurchases: { type: Boolean, default: false },
    bankPreference: { type: String, enum: ['SBI', 'Canara'], default: 'SBI' }
  }
};
```

#### 1.2 Create Integration Models
```javascript
// Backend/models/integrationModels.js
const mongoose = require('mongoose');

// Cross-module reference model
const CrossModuleReference = mongoose.Schema({
  sourceModule: { type: String, required: true },
  targetModule: { type: String, required: true },
  sourceId: { type: mongoose.Schema.Types.ObjectId, required: true },
  targetId: { type: mongoose.Schema.Types.ObjectId, required: true },
  relationType: { type: String, required: true }, // 'triggers', 'requires', 'updates'
  metadata: { type: Object, default: {} }
});

// Notification system for cross-module communication
const CrossModuleNotification = mongoose.Schema({
  fromModule: String,
  toModule: String,
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  message: String,
  data: Object,
  status: { type: String, enum: ['pending', 'read', 'processed'], default: 'pending' },
  createdAt: { type: Date, default: Date.now }
});
```

### Phase 2: API Integration Layer

#### 2.1 Create Module Integration Service
```javascript
// Backend/services/moduleIntegrationService.js
class ModuleIntegrationService {
  
  // Module 1 Integration: Student OD triggered by event participation
  async triggerStudentOD(eventId, participantId) {
    const event = await Event.findById(eventId);
    const participant = await Participant.findById(participantId);
    
    // Create OD request automatically
    const odRequest = {
      studentId: participant.userId,
      eventId: eventId,
      eventTitle: event.title,
      startDate: event.startDate,
      endDate: event.endDate,
      venue: event.venue,
      type: 'event_participation',
      status: 'pending'
    };
    
    // Call Module 1 API
    return await this.callModuleAPI('module1', 'POST', '/od-requests', odRequest);
  }
  
  // Module 2 Integration: Workshop events as internship opportunities
  async createInternshipOpportunity(eventId) {
    const event = await Event.findById(eventId);
    
    if (event.type === 'workshop' || event.type === 'training') {
      const internshipData = {
        title: event.title,
        description: event.objectives,
        duration: event.duration,
        type: 'workshop_internship',
        eventId: eventId,
        startDate: event.startDate,
        endDate: event.endDate
      };
      
      return await this.callModuleAPI('module2', 'POST', '/internship-opportunities', internshipData);
    }
  }
  
  // Module 5 Integration: Facility booking for events
  async bookFacilityForEvent(eventId, facilityRequirements) {
    const event = await Event.findById(eventId);
    
    const bookingRequest = {
      eventId: eventId,
      eventTitle: event.title,
      startDate: event.startDate,
      endDate: event.endDate,
      facilities: facilityRequirements,
      requestedBy: event.createdBy,
      priority: 'high'
    };
    
    return await this.callModuleAPI('module5', 'POST', '/facility-bookings', bookingRequest);
  }
  
  // Module 10 Integration: Process event claims
  async processEventClaim(claimId) {
    const claim = await Claim.findById(claimId).populate('eventId');
    
    const purchaseData = {
      claimId: claimId,
      eventId: claim.eventId._id,
      eventTitle: claim.eventId.title,
      totalAmount: claim.totalAmount,
      expenses: claim.expenses,
      submittedBy: claim.submittedBy,
      department: 'DCSE'
    };
    
    return await this.callModuleAPI('module10', 'POST', '/process-claim', purchaseData);
  }
  
  // Generic API caller for module communication
  async callModuleAPI(module, method, endpoint, data) {
    const moduleBaseUrls = {
      'module1': process.env.MODULE1_API_URL || 'http://localhost:5001/api',
      'module2': process.env.MODULE2_API_URL || 'http://localhost:5002/api',
      'module3': process.env.MODULE3_API_URL || 'http://localhost:5003/api',
      'module5': process.env.MODULE5_API_URL || 'http://localhost:5005/api',
      'module6': process.env.MODULE6_API_URL || 'http://localhost:5006/api',
      'module7': process.env.MODULE7_API_URL || 'http://localhost:5007/api',
      'module8': process.env.MODULE8_API_URL || 'http://localhost:5008/api',
      'module9': process.env.MODULE9_API_URL || 'http://localhost:5009/api',
      'module10': process.env.MODULE10_API_URL || 'http://localhost:5010/api'
    };
    
    const baseUrl = moduleBaseUrls[module];
    if (!baseUrl) {
      throw new Error(`Module ${module} not configured`);
    }
    
    try {
      const response = await axios({
        method,
        url: `${baseUrl}${endpoint}`,
        data,
        headers: {
          'Content-Type': 'application/json',
          'X-Module-Source': 'module4-events'
        }
      });
      
      return response.data;
    } catch (error) {
      console.error(`Error calling ${module} API:`, error);
      throw error;
    }
  }
}

module.exports = new ModuleIntegrationService();
```

### Phase 3: Frontend Integration

#### 3.1 Create Module Router
```javascript
// Frontend/src/modules/ModuleRouter.jsx
import React from 'react';
import { Routes, Route } from 'react-router-dom';

// Module 4 (Current) - Events
import { 
  CoordinatorDashboard,
  CertificateManagement,
  EventDashboard 
} from './module4-events/pages';

// Import other modules as they are developed
// import Module1Routes from './module1-student-od/routes';
// import Module2Routes from './module2-student-internship/routes';
// ... etc

const ModuleRouter = () => {
  return (
    <Routes>
      {/* Module 4 - Events (Current Implementation) */}
      <Route path="/events/*" element={<EventDashboard />} />
      <Route path="/coordinator/*" element={<CoordinatorDashboard />} />
      <Route path="/certificates/*" element={<CertificateManagement />} />
      
      {/* Placeholder routes for other modules */}
      <Route path="/student-od/*" element={<div>Module 1 - Student OD (To be implemented)</div>} />
      <Route path="/internships/*" element={<div>Module 2 - Student Internship (To be implemented)</div>} />
      <Route path="/faculty-od/*" element={<div>Module 3 - Faculty OD (To be implemented)</div>} />
      <Route path="/facilities/*" element={<div>Module 5 - Facility Booking (To be implemented)</div>} />
      <Route path="/timetable/*" element={<div>Module 6 - Timetable (To be implemented)</div>} />
      <Route path="/feedback/*" element={<div>Module 7 - Feedback (To be implemented)</div>} />
      <Route path="/projects/*" element={<div>Module 8 - Project Review (To be implemented)</div>} />
      <Route path="/pgcs/*" element={<div>Module 9 - PG CS (To be implemented)</div>} />
      <Route path="/purchase/*" element={<div>Module 10 - Purchase (To be implemented)</div>} />
    </Routes>
  );
};

export default ModuleRouter;
```

#### 3.2 Create Shared Navigation Component
```javascript
// Frontend/src/modules/shared/components/ModuleNavigation.jsx
import React from 'react';
import { 
  Drawer, 
  List, 
  ListItem, 
  ListItemIcon, 
  ListItemText,
  Collapse,
  Typography,
  Divider
} from '@mui/material';
import {
  Event as EventIcon,
  School as StudentIcon,
  Work as InternshipIcon,
  Person as FacultyIcon,
  Room as FacilityIcon,
  Schedule as TimetableIcon,
  Feedback as FeedbackIcon,
  Assignment as ProjectIcon,
  Quiz as ExamIcon,
  Payment as PurchaseIcon,
  ExpandLess,
  ExpandMore
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

const ModuleNavigation = ({ open, onClose, userRole }) => {
  const navigate = useNavigate();
  const [expandedModules, setExpandedModules] = React.useState({});

  const modules = [
    {
      id: 'module1',
      title: 'Student OD',
      icon: <StudentIcon />,
      path: '/student-od',
      implemented: false,
      roles: ['student', 'class_advisor', 'hod', 'admin'],
      subItems: [
        { title: 'Request OD', path: '/student-od/request' },
        { title: 'My Requests', path: '/student-od/my-requests' },
        { title: 'Approvals', path: '/student-od/approvals' }
      ]
    },
    {
      id: 'module2',
      title: 'Student Internship',
      icon: <InternshipIcon />,
      path: '/internships',
      implemented: false,
      roles: ['student', 'coordinator', 'admin'],
      subItems: [
        { title: 'Apply Internship', path: '/internships/apply' },
        { title: 'My Applications', path: '/internships/my-applications' },
        { title: 'Achievements', path: '/internships/achievements' }
      ]
    },
    {
      id: 'module3',
      title: 'Faculty OD',
      icon: <FacultyIcon />,
      path: '/faculty-od',
      implemented: false,
      roles: ['faculty', 'hod', 'admin'],
      subItems: [
        { title: 'Request OD', path: '/faculty-od/request' },
        { title: 'My Requests', path: '/faculty-od/my-requests' },
        { title: 'Publications', path: '/faculty-od/publications' }
      ]
    },
    {
      id: 'module4',
      title: 'Events Management',
      icon: <EventIcon />,
      path: '/events',
      implemented: true, // ✓ Current implementation
      roles: ['coordinator', 'hod', 'admin', 'participant'],
      subItems: [
        { title: 'Event Dashboard', path: '/events/dashboard' },
        { title: 'Create Event', path: '/events/create' },
        { title: 'Participants', path: '/events/participants' },
        { title: 'Certificates', path: '/certificates' },
        { title: 'Claims', path: '/events/claims' },
        { title: 'Feedback', path: '/events/feedback' }
      ]
    },
    {
      id: 'module5',
      title: 'Facility Booking',
      icon: <FacilityIcon />,
      path: '/facilities',
      implemented: false,
      roles: ['faculty', 'coordinator', 'admin'],
      subItems: [
        { title: 'Book Facility', path: '/facilities/book' },
        { title: 'My Bookings', path: '/facilities/my-bookings' },
        { title: 'Availability', path: '/facilities/availability' }
      ]
    },
    {
      id: 'module6',
      title: 'Timetable & Workload',
      icon: <TimetableIcon />,
      path: '/timetable',
      implemented: false,
      roles: ['faculty', 'hod', 'admin'],
      subItems: [
        { title: 'View Timetable', path: '/timetable/view' },
        { title: 'Workload', path: '/timetable/workload' },
        { title: 'Manage Schedule', path: '/timetable/manage' }
      ]
    },
    {
      id: 'module7',
      title: 'Course Feedback',
      icon: <FeedbackIcon />,
      path: '/feedback',
      implemented: false,
      roles: ['student', 'faculty', 'hod', 'admin'],
      subItems: [
        { title: 'Give Feedback', path: '/feedback/give' },
        { title: 'View Feedback', path: '/feedback/view' },
        { title: 'Grievances', path: '/feedback/grievances' }
      ]
    },
    {
      id: 'module8',
      title: 'Project Review',
      icon: <ProjectIcon />,
      path: '/projects',
      implemented: false,
      roles: ['student', 'faculty', 'external', 'admin'],
      subItems: [
        { title: 'Team Formation', path: '/projects/teams' },
        { title: 'Reviews', path: '/projects/reviews' },
        { title: 'Viva Schedule', path: '/projects/viva' }
      ]
    },
    {
      id: 'module9',
      title: 'PG CS Exams',
      icon: <ExamIcon />,
      path: '/pgcs',
      implemented: false,
      roles: ['faculty', 'hod', 'admin'],
      subItems: [
        { title: 'Question Papers', path: '/pgcs/question-papers' },
        { title: 'Evaluation', path: '/pgcs/evaluation' },
        { title: 'Invigilation', path: '/pgcs/invigilation' }
      ]
    },
    {
      id: 'module10',
      title: 'Purchase & Claims',
      icon: <PurchaseIcon />,
      path: '/purchase',
      implemented: false,
      roles: ['faculty', 'finance', 'admin'],
      subItems: [
        { title: 'Submit Bills', path: '/purchase/bills' },
        { title: 'Process Claims', path: '/purchase/claims' },
        { title: 'TDS Reports', path: '/purchase/tds' }
      ]
    }
  ];

  const handleModuleClick = (module) => {
    if (module.implemented) {
      navigate(module.path);
    } else {
      // Toggle expansion for non-implemented modules to show what will be available
      setExpandedModules(prev => ({
        ...prev,
        [module.id]: !prev[module.id]
      }));
    }
  };

  const filteredModules = modules.filter(module => 
    module.roles.includes(userRole) || userRole === 'admin'
  );

  return (
    <Drawer anchor="left" open={open} onClose={onClose}>
      <div style={{ width: 280, padding: '16px' }}>
        <Typography variant="h6" gutterBottom>
          Events Management System
        </Typography>
        <Divider />
        
        <List>
          {filteredModules.map((module) => (
            <React.Fragment key={module.id}>
              <ListItem 
                button 
                onClick={() => handleModuleClick(module)}
                style={{ 
                  backgroundColor: module.implemented ? 'inherit' : '#f5f5f5',
                  opacity: module.implemented ? 1 : 0.7
                }}
              >
                <ListItemIcon>{module.icon}</ListItemIcon>
                <ListItemText 
                  primary={module.title}
                  secondary={module.implemented ? 'Available' : 'Coming Soon'}
                />
                {!module.implemented && (
                  expandedModules[module.id] ? <ExpandLess /> : <ExpandMore />
                )}
              </ListItem>
              
              {module.implemented && (
                <Collapse in={true} timeout="auto" unmountOnExit>
                  <List component="div" disablePadding>
                    {module.subItems.map((subItem) => (
                      <ListItem 
                        key={subItem.path}
                        button 
                        style={{ paddingLeft: 32 }}
                        onClick={() => navigate(subItem.path)}
                      >
                        <ListItemText primary={subItem.title} />
                      </ListItem>
                    ))}
                  </List>
                </Collapse>
              )}
              
              {!module.implemented && (
                <Collapse in={expandedModules[module.id]} timeout="auto" unmountOnExit>
                  <List component="div" disablePadding>
                    {module.subItems.map((subItem) => (
                      <ListItem 
                        key={subItem.path}
                        style={{ paddingLeft: 32, opacity: 0.6 }}
                      >
                        <ListItemText 
                          primary={subItem.title}
                          secondary="Coming Soon"
                        />
                      </ListItem>
                    ))}
                  </List>
                </Collapse>
              )}
            </React.Fragment>
          ))}
        </List>
      </div>
    </Drawer>
  );
};

export default ModuleNavigation;
```

### Phase 4: Implementation Roadmap

#### 4.1 Module Development Priority
```
Priority 1 (Core Dependencies):
├── Module 5: Facility Booking (Required for events)
├── Module 6: Timetable (Conflict resolution)
└── Module 10: Purchase Committee (Financial processing)

Priority 2 (User Workflows):
├── Module 1: Student OD (Event participation)
├── Module 3: Faculty OD (Event conducting)
└── Module 7: Feedback System (Quality assurance)

Priority 3 (Academic Integration):
├── Module 2: Student Internship (Career development)
├── Module 8: Project Review (Academic assessment)
└── Module 9: PG CS Exams (Examination system)
```

#### 4.2 Development Timeline
```
Phase 1 (Months 1-2): Infrastructure Setup
- Database schema integration
- API gateway setup
- Authentication system enhancement
- Module communication framework

Phase 2 (Months 3-4): Priority 1 Modules
- Module 5: Facility Booking
- Module 10: Purchase Committee
- Integration with Module 4

Phase 3 (Months 5-6): Priority 2 Modules
- Module 1: Student OD
- Module 3: Faculty OD
- Module 7: Feedback System

Phase 4 (Months 7-8): Priority 3 Modules
- Module 2: Student Internship
- Module 8: Project Review
- Module 9: PG CS Exams

Phase 5 (Month 9): Testing & Deployment
- Integration testing
- User acceptance testing
- Production deployment
- Training and documentation
```

### Phase 5: Configuration and Environment Setup

#### 5.1 Environment Variables
```bash
# .env file for complete system
# Database
MONGO_URI=mongodb://localhost:27017/events_management

# Module 4 (Current)
MODULE4_PORT=4000
<<<<<<< HEAD
MODULE4_API_URL=http://localhost:4000/api
=======
MODULE4_API_URL=http://localhost:4000/api
>>>>>>> cac80b5d3abfd08f51962d91d59ee946ea7e4545

# Other Modules (to be implemented)
MODULE1_PORT=5001
MODULE1_API_URL=http://localhost:5001/api
MODULE2_PORT=5002
MODULE2_API_URL=http://localhost:5002/api
MODULE3_PORT=5003
MODULE3_API_URL=http://localhost:5003/api
MODULE5_PORT=5005
MODULE5_API_URL=http://localhost:5005/api
MODULE6_PORT=5006
MODULE6_API_URL=http://localhost:5006/api
MODULE7_PORT=5007
MODULE7_API_URL=http://localhost:5007/api
MODULE8_PORT=5008
MODULE8_API_URL=http://localhost:5008/api
MODULE9_PORT=5009
MODULE9_API_URL=http://localhost:5009/api
MODULE10_PORT=5010
MODULE10_API_URL=http://localhost:5010/api

# Frontend
<<<<<<< HEAD
VITE_API_BASE_URL=http://localhost:4000/api
VITE_MODULE_GATEWAY_URL=http://localhost:3001/api
=======
VITE_API_BASE_URL=http://localhost:4000/api
VITE_MODULE_GATEWAY_URL=http://localhost:3001/api
>>>>>>> cac80b5d3abfd08f51962d91d59ee946ea7e4545

# Email Configuration
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password

# File Storage
UPLOAD_PATH=./uploads
CERTIFICATE_PATH=./generated-certificates
TEMPLATE_PATH=./templates

# Security
JWT_SECRET=your-jwt-secret-key
ENCRYPTION_KEY=your-encryption-key

# External APIs
UNIVERSITY_API_URL=https://api.annauniv.edu
PAYMENT_GATEWAY_URL=https://payment.gateway.url
```

#### 5.2 Docker Configuration
```yaml
# docker-compose.yml
version: '3.8'
services:
  # Database
  mongodb:
    image: mongo:latest
    ports:
      - "27017:27017"
    volumes:
      - mongodb_data:/data/db
    environment:
      MONGO_INITDB_DATABASE: events_management

  # Module 4 - Events (Current Implementation)
  module4-events:
    build: ./Backend
    ports:
      - "4000:4000"
    environment:
      - NODE_ENV=production
      - MONGO_URI=mongodb://localhost:27017/events_management
    depends_on:
      - mongodb
    volumes:
      - ./Backend/uploads:/app/uploads
      - ./Backend/generated-certificates:/app/generated-certificates

  # Frontend
  frontend:
    build: ./Frontend
    ports:
      - "3000:3000"
    environment:
      - VITE_API_BASE_URL=http://localhost:4000/api
    depends_on:
      - module4-events

  # API Gateway (for module communication)
  api-gateway:
    build: ./api-gateway
    ports:
      - "3001:3001"
    environment:
      - MODULE4_URL=http://module4-events:4000
    depends_on:
      - module4-events

  # Placeholder services for other modules
  # These will be uncommented as modules are implemented
  
  # module1-student-od:
  #   build: ./modules/module1-student-od
  #   ports:
  #     - "5001:5001"
  
  # module2-student-internship:
  #   build: ./modules/module2-student-internship
  #   ports:
  #     - "5002:5002"

volumes:
  mongodb_data:
```

### Phase 6: Testing Strategy

#### 6.1 Integration Testing Framework
```javascript
// tests/integration/moduleIntegration.test.js
describe('Module Integration Tests', () => {
  
  test('Event creation triggers facility booking', async () => {
    // Create event in Module 4
    const event = await createEvent({
      title: 'AI Workshop',
      venue: 'Conference Hall',
      startDate: '2025-06-15',
      endDate: '2025-06-17'
    });
    
    // Verify facility booking was created in Module 5
    const booking = await getFacilityBooking(event.id);
    expect(booking).toBeDefined();
    expect(booking.eventId).toBe(event.id);
  });
  
  test('Event participation triggers OD request', async () => {
    // Register participant for event
    const registration = await registerParticipant(eventId, participantId);
    
    // Verify OD request was created in Module 1
    const odRequest = await getODRequest(participantId, eventId);
    expect(odRequest).toBeDefined();
    expect(odRequest.status).toBe('pending');
  });
  
  test('Event claim processing integrates with purchase module', async () => {
    // Submit claim in Module 4
    const claim = await submitClaim(eventId, claimData);
    
    // Verify claim was processed in Module 10
    const purchaseRecord = await getPurchaseRecord(claim.id);
    expect(purchaseRecord).toBeDefined();
    expect(purchaseRecord.status).toBe('processed');
  });
});
```

### Phase 7: Deployment Instructions

#### 7.1 Production Deployment
```bash
# 1. Clone the repository
git clone https://github.com/your-repo/Events-Management-Application.git
cd Events-Management-Application

# 2. Install dependencies
npm run install-all

# 3. Set up environment variables
cp .env.example .env
# Edit .env with production values

# 4. Build the application
npm run build

# 5. Start with Docker
docker-compose up -d

# 6. Run database migrations
npm run migrate

# 7. Seed initial data
npm run seed

# 8. Verify deployment
curl http://localhost:4000/api/health
curl http://localhost:3000
```

#### 7.2 Monitoring and Maintenance
```javascript
// Backend/middleware/monitoring.js
const monitoringMiddleware = (req, res, next) => {
  const startTime = Date.now();
  
  res.on('finish', () => {
    const duration = Date.now() - startTime;
    
    // Log API performance
    console.log({
      method: req.method,
      url: req.url,
      statusCode: res.statusCode,
      duration: `${duration}ms`,
      module: req.headers['x-module-source'] || 'module4',
      timestamp: new Date().toISOString()
    });
    
    // Send metrics to monitoring service
    if (process.env.MONITORING_ENABLED === 'true') {
      sendMetrics({
        endpoint: req.url,
        method: req.method,
        statusCode: res.statusCode,
        responseTime: duration,
        module: req.headers['x-module-source'] || 'module4'
      });
    }
  });
  
  next();
};
```

## Conclusion

This integration manual provides a comprehensive roadmap for integrating Module 4 (Events Conducted by Department) with the remaining 9 modules. The modular architecture ensures that:

1. **Module 4 remains functional** during the development of other modules
2. **Integration points are clearly defined** for seamless communication
3. **Database schema supports all modules** with proper relationships
4. **API architecture allows for scalable module communication**
5. **Frontend provides a unified user experience** across all modules
6. **Testing ensures reliability** of inter-module operations
7. **Deployment is streamlined** with Docker and environment management

The system is designed to be **incrementally deployable**, allowing you to add modules one by one while maintaining full functionality of the existing Module 4 implementation.

## Next Steps

1. **Review and approve** this integration architecture
2. **Set up the development environment** using the provided configurations
3. **Begin Phase 1 implementation** (Infrastructure Setup)
4. **Develop Priority 1 modules** (Facility Booking, Purchase Committee)
5. **Test integration points** as each module is completed
6. **Deploy incrementally** to production environment

For any questions or clarifications regarding this integration manual, please refer to the module-specific documentation or contact the development team.