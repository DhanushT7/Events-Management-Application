# 🎓 Events Management Application
----------------------------------------------
## ADMIN LOGIN                            
- [User ID] : admin@university.edu        
- [PASSWORD] : admin123
----------------------------------------------
<div align="center">

![Events Management](https://img.shields.io/badge/Events-Management-blue?style=for-the-badge)
![MERN Stack](https://img.shields.io/badge/MERN-Stack-green?style=for-the-badge)
![Anna University](https://img.shields.io/badge/Anna-University-red?style=for-the-badge)

**A comprehensive web application for managing educational events, training programs, workshops, and certificate courses at Anna University**

[![License: ISC](https://img.shields.io/badge/License-ISC-yellow.svg)](https://opensource.org/licenses/ISC)
[![Node.js](https://img.shields.io/badge/Node.js-v16+-green.svg)](https://nodejs.org/)
[![React](https://img.shields.io/badge/React-v19.1.0-blue.svg)](https://reactjs.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-v4.4+-green.svg)](https://www.mongodb.com/)

[🚀 Quick Start](#-quick-start) • [📖 Documentation](#-api-documentation) • [🤝 Contributing](#-contributing) • [📞 Support](#-support)

</div>

---

## 📋 Table of Contents

- [🌟 Features](#-features)
- [🏗️ System Architecture](#️-system-architecture)
- [🛠️ Technology Stack](#️-technology-stack)
- [🚀 Quick Start](#-quick-start)
- [📁 Project Structure](#-project-structure)
- [📖 API Documentation](#-api-documentation)
- [🎨 Module 4: Events Management](#-module-4-events-management)
- [🔧 Development Guide](#-development-guide)
- [🧪 Testing](#-testing)
- [🚀 Deployment](#-deployment)
- [👥 Development Team](#-development-team)
- [🤝 Contributing](#-contributing)
- [📄 License](#-license)

---

## 🌟 Features

### 🏢 **Multi-Role System with Advanced Permissions**
- **👨‍💼 HOD (Head of Department)**: 
  - Approve or Reject events
  - Manage organizing committees
  - View department-wide analytics
  - Download claim PDFs and reports
  - Add approval comments
- **👨‍🏫 Coordinator**: 
  - Create assigned events
  - Generate professional brochures with AI-enhanced content
  - Handle participant registrations
  - Process claims and budgets
  - Generate certificates with QR verification
  - Manage feedback statistics
- **👨‍🎓 Participant**: 
  - Register for events
  - View certificates
  - Provide feedback
  - Track completed events
- **🔧 Admin**: 
  - Manage feedback questions
  - System-wide configuration
  - User role management

### 📋 **Comprehensive Event Management**
- **🎯 Dynamic Event Creation**: 
  - Customizable event types (workshops, training programs, seminars, courses)
  - Comprehensive event schema with 50+ fields
  - Multi-department organizing support with associations
  - Advanced registration procedures with payment integration
- **👥 Organizing Committee Management**: 
  - Add committee members with roles and designations
  - Department-wise committee assignment
  - HOD approval workflow
  - Dynamic committee display in brochures
- **📝 Registration System**: 
  - Flexible registration forms
  - Payment integration support
  - Evaluation criteria configuration
  - Participant limit management
- **📊 Real-time Dashboard**: 
  - Live statistics and analytics
  - Participant management
  - Event status tracking

### 📄 **Advanced Document Generation**
- **🎨 Professional Brochures**: 
  - AI-enhanced content generation based on event data
  - Anna University and CEG dual branding
  - Dynamic three-column layout system
  - Intelligent course descriptions
  - Multi-format export (PDF, PNG)
  - Concise content optimization
  - Professional typography and spacing
- **🏆 Certificate System**: 
  - Automated certificate generation
  - Bulk processing capabilities
  - QR code verification
  - Template customization
  - Download tracking
- **💰 Claim Processing**: 
  - Template-based claim generation
  - Expense categorization
  - Approval workflow
  - PDF generation with signatures
- **📋 Form Generation**: 
  - Dynamic registration forms
  - Custom field support
  - Validation rules
  - Integration with brochures

### 💰 **Financial Management**
- **📊 Budget Tracking**: 
  - Income and expense categorization
  - Real-time budget monitoring
  - University overhead calculation (30%)
  - GST handling
- **🧾 Claim Processing**: 
  - Item-wise claim management
  - Approval workflow
  - Receipt generation
  - Status tracking

### 📊 **Analytics & Reporting**
- **📈 Event Statistics**: 
  - Participant analytics
  - Completion rates
  - Feedback scores
  - Financial summaries
- **📋 Dashboard Analytics**: 
  - Visual charts and graphs
  - Real-time data updates
  - Export capabilities
- **📄 Report Generation**: 
  - Participant lists
  - Certificate reports
  - Financial reports
  - Feedback analysis

### 🔐 **Security & Authentication**
- **🔑 JWT-based Authentication**: 
  - Secure login system
  - Token refresh mechanism
  - Session management
- **🛡️ Role-based Authorization**: 
  - Granular permissions
  - Route protection
  - API endpoint security
- **🔒 Data Protection**: 
  - Password encryption (Bcrypt)
  - Input validation
  - SQL injection prevention
  - XSS protection

### 🎨 **Enhanced User Interface**
- **🏠 Professional Home Page**: 
  - Anna University and CEG logos
  - Campus background images
  - Smooth animations and transitions
  - Responsive design for all devices
- **📱 Mobile-First Design**: 
  - Touch-friendly navigation
  - Optimized layouts for mobile
  - Progressive Web App features
- **🎯 Interactive Elements**: 
  - Hover effects and animations
  - Smooth scrolling navigation
  - Professional color schemes
  - Material-UI components

---

## 🏗️ System Architecture

```mermaid
graph TB
    subgraph "Frontend Layer"
        A[React App] --> B[Material-UI Components]
        A --> C[React Router]
        A --> D[Axios HTTP Client]
    end
    
    subgraph "Backend Layer"
        E[Express.js Server] --> F[JWT Authentication]
        E --> G[Role-based Middleware]
        E --> H[API Routes]
    end
    
    subgraph "Database Layer"
        I[MongoDB] --> J[Event Collection]
        I --> K[User Collection]
        I --> L[Certificate Collection]
        I --> M[Claim Collection]
    end
    
    subgraph "Services Layer"
        N[PDF Generation] --> O[Certificate Service]
        N --> P[Brochure Service]
        Q[Email Service] --> R[Notifications]
        S[File Upload] --> T[Document Management]
    end
    
    A --> E
    E --> I
    E --> N
    E --> Q
    E --> S
```

---

## 🛠️ Technology Stack

<div align="center">

### **Frontend Technologies**
| Technology | Version | Purpose |
|------------|---------|---------|
| ![React](https://img.shields.io/badge/React-19.1.0-61DAFB?style=flat&logo=react) | 19.1.0 | UI Framework |
| ![Material-UI](https://img.shields.io/badge/Material--UI-7.1.1-0081CB?style=flat&logo=mui) | 7.1.1 | Component Library |
| ![Vite](https://img.shields.io/badge/Vite-Latest-646CFF?style=flat&logo=vite) | Latest | Build Tool |
| ![React Router](https://img.shields.io/badge/React_Router-7.6.2-CA4245?style=flat&logo=react-router) | 7.6.2 | Routing |
| ![Axios](https://img.shields.io/badge/Axios-1.10.0-5A29E4?style=flat&logo=axios) | 1.10.0 | HTTP Client |

### **Backend Technologies**
| Technology | Version | Purpose |
|------------|---------|---------|
| ![Node.js](https://img.shields.io/badge/Node.js-16+-339933?style=flat&logo=node.js) | 16+ | Runtime |
| ![Express](https://img.shields.io/badge/Express.js-5.1.0-000000?style=flat&logo=express) | 5.1.0 | Web Framework |
| ![MongoDB](https://img.shields.io/badge/MongoDB-4.4+-47A248?style=flat&logo=mongodb) | 4.4+ | Database |
| ![Mongoose](https://img.shields.io/badge/Mongoose-8.16.1-880000?style=flat&logo=mongoose) | 8.16.1 | ODM |
| ![JWT](https://img.shields.io/badge/JWT-Latest-000000?style=flat&logo=jsonwebtokens) | Latest | Authentication |

### **Additional Libraries**
| Library | Purpose |
|---------|---------|
| 📄 **jsPDF 3.0.1** | Client-side PDF generation |
| 📧 **Nodemailer 7.0.4** | Email notifications |
| 🔒 **Bcrypt 6.0.0** | Password hashing |
| 📁 **Multer 2.0.1** | File upload handling |
| 📊 **Recharts 2.15.3** | Data visualization |
| 🔔 **Notistack 3.0.2** | Toast notifications |
| 🎨 **Canvas API** | Image processing for logos |

</div>

## 🚀 Quick Start

### Prerequisites
- **Node.js** (v16 or higher)
- **MongoDB** (v4.4 or higher)
- **Git**

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-username/Events-Management-Application.git
   cd Events-Management-Application
   ```

2. **Install root dependencies**
   ```bash
   npm install
   ```

3. **Install Frontend dependencies**
   ```bash
   cd Frontend
   npm install
   cd ..
   ```

4. **Install Backend dependencies**
   ```bash
   cd Backend
   npm install
   cd ..
   ```

### Configuration

1. **Backend Environment Setup**
   Create a `.env` file in the `Backend` directory:
   ```env
   PORT=4000
   MONGO_URI=mongodb+srv://event:event123@recruiterprofile.lyuu6mz.mongodb.net/
   JWT_SECRET=your-super-secret-jwt-key
   EMAIL_USER=your-email@gmail.com
   EMAIL_PASS=your-app-password
   NODE_ENV=development
   ```

2. **Frontend Configuration**
   Update API base URL in `Frontend/src/services/api.js` if needed:
   ```javascript
   const API_BASE_URL = 'http://localhost:4000/api';
   ```

### Database Setup

1. **Start MongoDB**
   ```bash
   # For Windows (if MongoDB is installed as service)
   net start MongoDB
   
   # For macOS/Linux
   sudo systemctl start mongod
   # OR
   mongod
   ```

### Running the Application

#### Option 1: Run Servers Separately

**Terminal 1 - Backend Server**
```bash
npm run backend
# OR
cd Backend && npm run dev
```

**Terminal 2 - Frontend Development Server**
```bash
npm run frontend
# OR
cd Frontend && npm run dev
```

## 📱 Application Access

- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:4000
- **MongoDB**: mongodb://localhost:27017

## 👥 Default User Accounts

After setting up the application, you can create accounts or use sample data:

### HOD Account
- **Email**: hod@annauniv.edu
- **Password**: hod123
- **Role**: Head of Department

### Coordinator Account
- **Email**: coordinator@annauniv.edu
- **Password**: coord123
- **Role**: Coordinator

### Participant Account
- **Email**: participant@annauniv.edu
- **Password**: part123
- **Role**: Participant

---

## 📁 Project Structure

The project follows a **feature-based architecture** for better organization and maintainability:

```
Events-Management-Application/
├── Backend/                          # Backend server
│   ├── src/                         # Source code
│   │   ├── features/                # Feature-based modules
│   │   │   ├── auth/                # Authentication & Authorization
│   │   │   ├── events/              # Event Management
│   │   │   ├── claims/              # Claims & Budget Management
│   │   │   ├── certificates/        # Certificate Management
│   │   │   ├── participants/        # Participant Management
│   │   │   ├── documents/           # Document Generation
│   │   │   ├── feedback/            # Feedback Management
│   │   │   └── admin/               # Admin & System Management
│   │   ├── shared/                  # Shared resources
│   │   │   ├── config/              # Configuration files
│   │   ��   ├── middleware/          # Shared middleware
│   │   │   ├── models/              # Database models
│   │   │   ├── utils/               # Shared utilities
│   │   │   └── services/            # Shared services
│   │   └── server.js                # Main server file
│   ├── generated-certificates/      # Generated certificate files
│   ├── .env                         # Environment variables
│   └── package.json                 # Dependencies and scripts
├── Frontend/                        # React frontend
│   ├── src/                         # Source code
│   │   ├── features/                # Feature-based modules
│   │   │   ├── auth/                # Authentication pages
│   │   │   ├── events/              # Event Management pages
│   │   │   ├── Home/                # Enhanced home page
│   │   │   ├── claims/              # Claims Management
│   │   │   ├── certificates/        # Certificate Management
│   │   │   ├── participants/        # Participant pages
│   │   │   └── admin/               # Admin pages
│   │   ├─�� shared/                  # Shared resources
│   │   │   ├── components/          # Reusable components
│   │   │   ├── services/            # API services
│   │   │   │   └── advancedBrochureGenerator.js  # Enhanced brochure generator
│   │   │   ├── utils/               # Shared utilities
│   │   │   ├── constants/           # Application constants
│   │   │   ├── context/             # React contexts
│   │   │   └── hooks/               # Custom React hooks
│   │   ├── App.jsx                  # Main App component
│   │   └── main.jsx                 # Entry point
│   ├── public/                      # Static assets
│   │   ├── anna-university-logo.jpg # Anna University logo
│   │   ├── CEG_logo.png            # CEG logo
│   │   ├── Anna_University.jpg      # Campus background
│   │   └── AnnaUniversityAIIMG.jpg  # Additional campus image
│   ├── package.json                 # Dependencies and scripts
│   └── vite.config.js               # Vite configuration
├── PROJECT_STRUCTURE.md             # Detailed structure documentation
├── INTEGRATION_MANUAL.md            # Integration guide
├── BROCHURE_GENERATOR_GUIDE.md      # Brochure generation guide
├── CERTIFICATE_REGENERATION_GUIDE.md # Certificate regeneration guide
├── DEPLOYMENT_GUIDE.md              # Deployment instructions
├── package.json                     # Root package.json
└── README.md                        # This file
```

---

## 📖 API Documentation

### **Authentication Endpoints**
```http
POST /api/auth/register          # User registration
POST /api/auth/login             # User login
POST /api/auth/forgot-password   # Password reset
GET  /api/auth/verify-token      # Token verification
```

### **HOD (Head of Department) Endpoints**
```http
GET  /api/hod/events                    # Get all events
GET  /api/hod/events/pending            # Get pending approvals
POST /api/hod/events/:id/approve        # Approve event
POST /api/hod/events/:id/reject         # Reject event
POST /api/hod/events/:id/comment        # Add approval comment
GET  /api/hod/participants/:eventId     # Get event participants
GET  /api/hod/download-claim/:eventId   # Download claim PDF
PUT  /api/hod/events/:id/status         # Update event status
```

### **Coordinator Endpoints**
```http
GET  /api/coordinator/dashboard                    # Dashboard data
GET  /api/coordinator/programmes                   # Get coordinator events
GET  /api/coordinator/programmes/:id               # Get specific event
POST /api/coordinator/programmes                   # Create new event
PUT  /api/coordinator/programmes/:id               # Update event
DELETE /api/coordinator/programmes/:id             # Delete event
GET  /api/coordinator/programmes/:id/pdf           # Download event PDF
POST /api/coordinator/claims/:eventId              # Submit claim
GET  /api/coordinator/claims/:eventId/pdf          # Download claim PDF
POST /api/coordinator/brochures/:eventId/save      # Save brochure
```

### **Participant Endpoints**
```http
GET  /api/participant/dashboard              # Participant dashboard
GET  /api/participant/events                 # Available events
POST /api/participant/register/:eventId      # Register for event
GET  /api/participant/events/completed       # Completed events
POST /api/participant/feedback               # Submit feedback
GET  /api/participant/certificates           # Get certificates
```

### **Certificate Endpoints**
```http
POST /api/certificates/generate              # Generate single certificate
POST /api/certificates/bulk-generate         # Bulk generate certificates
GET  /api/certificates/:id                   # Get certificate details
GET  /api/certificates/download/:id          # Download certificate
GET  /api/certificates/verify/:id            # Verify certificate (public)
```

---

## 🎨 Module 4: Events Management

### **Current Implementation Features**

<div align="center">

| Feature Category | Implementation Status | Description |
|------------------|----------------------|-------------|
| 🎯 **Event Creation** | ✅ Complete | Full event lifecycle management |
| 👥 **User Management** | ✅ Complete | Multi-role authentication system |
| 📄 **Document Generation** | ✅ Complete | Enhanced brochures, certificates, claims |
| 💰 **Financial Tracking** | ✅ Complete | Budget management and claims |
| 📊 **Analytics** | ✅ Complete | Real-time dashboards and reports |
| 🔐 **Security** | ✅ Complete | JWT auth with role-based access |
| 📱 **Responsive UI** | ✅ Complete | Material-UI based interface |
| 🏆 **Certificate System** | ✅ Complete | Automated generation with QR codes |
| 🎨 **Professional Brochures** | ✅ Complete | AI-enhanced brochure generation |
| 🏠 **Enhanced Home Page** | ✅ Complete | Professional landing page with branding |

</div>

### **Enhanced Features**

#### **🏠 Professional Home Page**
- **University Branding**: Official Anna University and CEG logos
- **Campus Imagery**: Beautiful campus background with gradient overlays
- **Smooth Animations**: Fade-in effects, hover animations, and transitions
- **Responsive Design**: Optimized for desktop, tablet, and mobile devices
- **Navigation**: Smooth scrolling navigation with sections for:
  - About College of Engineering Guindy
  - About Department of Computer Science and Engineering
  - Development Team Information
  - Technology Stack Display

#### **🎨 Professional Brochure Generation**
- **AI-Enhanced Content**: Intelligent course descriptions based on event data
- **Dual Branding**: Anna University and CEG logos positioned symmetrically
- **Dynamic Layout**: Professional three-column design for better space utilization
- **Comprehensive Sections**:
  - Event information and objectives
  - Organizing committee (from database)
  - Registration procedures and payment details
  - Contact information and venue details
- **Content Optimization**: Concise, readable content without clutter
- **Export Options**: High-quality PDF generation with proper typography

#### **🎯 Recent Brochure Improvements**
- **✅ Fixed Text Visibility**: Resolved black background text visibility issues
- **✅ Removed Footer from First Page**: Clean first page without footer distractions
- **✅ Reduced Content Length**: Optimized "About the Program" and university sections
- **✅ Removed Title Background**: Clean event title without colored background
- **✅ Added CEG Logo**: Dual institutional branding with proper positioning
- **✅ Three-Column Layout**: Better space utilization and professional appearance

#### **💰 Advanced Financial Management**
- **Budget Breakdown**: Detailed income and expense tracking
- **Claim Processing**: Item-wise claim management with approval workflow
- **University Overhead**: Automatic 30% overhead calculation
- **GST Handling**: Built-in GST calculations and reporting
- **PDF Generation**: Professional claim documents with signatures

---

## 👥 Development Team

<div align="center">

### **Batch 2023-27 | Department of Computer Science and Engineering**
### **College of Engineering Guindy, Anna University**

</div>

| Team Member | Roll Number | Contribution |
|-------------|-------------|--------------|
| **Siva Sankar S** | 2023103082 | Full Stack Development, System Architecture |
| **Dhanush T** | 2023103507 | Backend Development, API Design |
| **Viswa S** | 2023103564 | Frontend Development, UI/UX Design |
| **Kathir Kalidass B** | 2023103546 | System Integration, Database Design, Brochure Enhancement |
| **Magesh Gumar M** | 2023103612 | Testing, Documentation, Quality Assurance |

### **Academic Information**
- **Program**: B.E. Computer Science and Engineering
- **Institution**: College of Engineering Guindy, Anna University
- **Academic Year**: 2023-2024
- **Project Type**: Academic Project
- **Batch**: 2023-27

### **Project Supervision**
- **Department**: Computer Science and Engineering (DCSE)
- **Institution**: College of Engineering Guindy
- **University**: Anna University, Chennai

---

## 🔧 Development Guide

### **Setting Up Development Environment**

1. **Install Required Tools**
   ```bash
   # Install Node.js (v16+)
   # Install MongoDB (v4.4+)
   # Install Git
   # Install VS Code (recommended)
   ```

2. **Clone and Setup**
   ```bash
   git clone https://github.com/your-username/Events-Management-Application.git
   cd Events-Management-Application
   npm install  # Install root dependencies
   ```

3. **Environment Configuration**
   ```bash
   # Backend/.env
   PORT=4000
   MONGO_URI=mongodb://localhost:27017/events_management
   JWT_SECRET=your-super-secret-key
   NODE_ENV=development
   
   # Frontend/.env (optional)
   VITE_API_BASE_URL=http://localhost:4000/api
   VITE_APP_NAME=Events Management System
   ```

### **Development Scripts**

```bash
# Root level commands
npm run backend        # Start backend only
npm run frontend       # Start frontend only
npm run dev           # Start both frontend and backend (if configured)

# Backend specific
cd Backend
npm run dev           # Development with nodemon
npm run start         # Production start

# Frontend specific
cd Frontend
npm run dev           # Development server (Vite)
npm run build         # Production build
npm run preview       # Preview production build
```

### **Adding New Features**

1. **Backend Feature Development**
   ```bash
   # 1. Create controller
   touch Backend/controllers/newFeatureController.js
   
   # 2. Create routes
   touch Backend/routes/newFeatureRoutes.js
   
   # 3. Create model (if needed)
   touch Backend/models/newFeatureModel.js
   
   # 4. Add to main server
   # Edit Backend/server.js to include new routes
   ```

2. **Frontend Feature Development**
   ```bash
   # 1. Create component
   touch Frontend/src/features/NewFeature/NewFeature.jsx
   
   # 2. Add service functions
   # Edit Frontend/src/shared/services/api.js
   
   # 3. Add routing
   # Edit Frontend/src/App.jsx
   ```

---

## 🧪 Testing

### Backend Testing
```bash
cd Backend
npm test
```

### Frontend Testing
```bash
cd Frontend
npm test
```

### Manual Testing
1. **Authentication Flow**: Test login/logout for all user roles
2. **Event Management**: Create, edit, and delete events
3. **Document Generation**: Test brochure and certificate generation
4. **Claim Processing**: Submit and approve claims
5. **Responsive Design**: Test on different screen sizes

---

## 🚀 Deployment

### Frontend Deployment (Vercel/Netlify)
1. Build the frontend: `cd Frontend && npm run build`
2. Deploy the `dist` folder
3. Update API base URL in environment variables

### Backend Deployment (Railway/Heroku)
1. Set environment variables in deployment platform
2. Deploy the Backend folder
3. Configure MongoDB connection string (MongoDB Atlas recommended)

### Environment Variables for Production
```env
# Backend Production Environment
PORT=4000
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/events_management
JWT_SECRET=your-production-jwt-secret
NODE_ENV=production
EMAIL_USER=your-production-email@gmail.com
EMAIL_PASS=your-production-app-password
```

---

## 🤝 Contributing

We welcome contributions to improve the Events Management Application!

### How to Contribute

1. **Fork the repository**
2. **Create a feature branch**: `git checkout -b feature/new-feature`
3. **Make your changes**: Follow the coding standards and guidelines
4. **Test your changes**: Ensure all tests pass
5. **Commit your changes**: `git commit -am 'Add new feature'`
6. **Push to branch**: `git push origin feature/new-feature`
7. **Submit a Pull Request**: Describe your changes and their benefits

### Coding Standards

- **ES6+ JavaScript**: Use modern JavaScript features
- **Functional Components**: React functional components with hooks
- **Async/Await**: Prefer async/await over promises
- **Error Handling**: Proper error handling with try-catch blocks
- **Comments**: Document complex logic and functions
- **Consistent Formatting**: Use Prettier for code formatting

### Areas for Contribution

- 🐛 **Bug Fixes**: Report and fix bugs
- ✨ **New Features**: Add new functionality
- 📚 **Documentation**: Improve documentation and guides
- 🎨 **UI/UX**: Enhance user interface and experience
- 🔧 **Performance**: Optimize application performance
- 🧪 **Testing**: Add and improve test coverage

---

## 📄 License

This project is licensed under the ISC License - see the LICENSE file for details.

## 🙏 Acknowledgments

- **Anna University** for institutional support and resources
- **College of Engineering Guindy** for providing the academic environment
- **Department of Computer Science and Engineering** for guidance and mentorship
- **Material-UI Team** for excellent React components
- **MongoDB Team** for reliable database solutions
- **React and Node.js Communities** for robust frameworks and extensive documentation

## 📞 Support

For support and queries:

- **Email**: kathirkalidass.b2023cse@smail.ssn.edu.in
- **GitHub Issues**: Create an issue in the repository
- **Academic Supervisor**: Contact through department channels

## 🔮 Future Enhancements

### Planned Features
- [ ] **Mobile Application**: React Native mobile app
- [ ] **Advanced Analytics**: Enhanced reporting and data visualization
- [ ] **Email Notifications**: Automated email system for events
- [ ] **Calendar Integration**: Google Calendar and Outlook integration
- [ ] **Payment Gateway**: Online payment processing
- [ ] **Multi-language Support**: Tamil and English language options
- [ ] **Advanced PDF Customization**: Template-based document generation
- [ ] **Real-time Notifications**: WebSocket-based live updates
- [ ] **API Documentation**: Swagger/OpenAPI documentation
- [ ] **Performance Monitoring**: Application performance tracking

### Integration with Other Modules
- **Module 1**: Student OD requests for event participation
- **Module 2**: Workshop-based internship programs
- **Module 3**: Faculty event conducting and OD management
- **Module 5**: Venue booking integration
- **Module 10**: Financial claims and purchase committee integration

---

## 📊 Project Statistics

- **Total Lines of Code**: 18,000+
- **Components**: 60+ React components
- **API Endpoints**: 45+ REST endpoints
- **Database Collections**: 8 MongoDB collections
- **Features Implemented**: 30+ major features
- **Development Time**: 8 months (Academic Year 2023-24)
- **Recent Updates**: Enhanced brochure generation with AI content and dual branding

---

## 🆕 Recent Updates (Latest)

### **Brochure Generation Enhancements**
- **✅ AI-Enhanced Content Generation**: Intelligent course descriptions based on event data
- **✅ Dual Institutional Branding**: Anna University and CEG logos positioned symmetrically
- **✅ Three-Column Layout**: Optimized space utilization for better readability
- **✅ Content Optimization**: Reduced verbose content for cleaner presentation
- **✅ Text Visibility Fixes**: Resolved dark text on dark background issues
- **✅ Clean First Page**: Removed footer from first page for professional appearance
- **✅ Typography Improvements**: Better font sizing and spacing throughout

### **Technical Improvements**
- **Enhanced PDF Generation**: Using jsPDF with advanced features
- **Logo Integration**: Proper loading and positioning of institutional logos
- **Error Handling**: Graceful fallbacks for missing assets
- **Responsive Design**: Better mobile and tablet compatibility
- **Performance Optimization**: Faster PDF generation and rendering

---

<div align="center">

**🎓 Developed with ❤️ by Batch 2023-27 DCSE Students**

**College of Engineering Guindy, Anna University, Chennai**

---

*This application is designed specifically for Anna University's event management needs but can be adapted for other educational institutions with minimal modifications.*

</div>
