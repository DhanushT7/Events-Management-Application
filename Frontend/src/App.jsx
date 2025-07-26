import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { SnackbarProvider } from 'notistack';
import Home from "./features/Home/Home";
import EnhancedParticipantDashboard from "./features/participants/Components/EnhancedDashboard";
import RegisterForm from "./features/auth/RegisterForm";
import LoginForm from "./features/auth/LoginForm";
import HodDashboard from "./features/events/hod/dashboard";
import Form from "./features/participants/Components/Form";
import Feedback from "./features/feedback/feedback";
import ForgotPassword from "./features/auth/ForgotPassword";
import ProtectedRoute from "./features/auth/ProtectedRoute";
import CertificatePage from "./features/participants/CertificatePage";
import CoordinatorDashboard from "./features/events/coordinator/CoordinatorDashboard";
import CoordinatorEventDashboard from "./features/events/coordinator/components/CoordinatorEventDashboard";
import HODEventDashboard from "./features/events/hod/EventDashboard";
import CertificateVerification from "./shared/components/CertificateVerification";
import CertificateManagement from "./features/events/CertificateManagement";
import { AdminLogin, AdminDashboard } from "./features/admin";

function App() {
  return (
    <SnackbarProvider 
      maxSnack={3}
      anchorOrigin={{
        vertical: 'bottom',
        horizontal: 'right',
      }}
    >
      <Router>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/register/:role" element={<RegisterForm />} />
          <Route path="/login/:role" element={<LoginForm />} />
          <Route path="/forgot-password/:role" element={<ForgotPassword />} />
          <Route
            path="/participant/dashboard"
            element={
               <ProtectedRoute allowedRole="participant">
              <EnhancedParticipantDashboard />
               </ProtectedRoute>
            }
          />
          <Route path="/participant/register" element={<Form />} />
          <Route path="/coordinator/dashboard" element={
            <ProtectedRoute allowedRole="coordinator">
              <CoordinatorDashboard/>
            </ProtectedRoute>
          } />
          <Route path="/hod/dashboard" element={
            <ProtectedRoute allowedRole="hod">
              <HodDashboard />
            </ProtectedRoute>
          } />
          <Route path="/hod/event/:eventId" element={
            <ProtectedRoute allowedRole="hod">
              <HODEventDashboard />
            </ProtectedRoute>
          } />
          <Route path="/coordinator/event/:eventId" element={
            <ProtectedRoute allowedRole="coordinator">
              <CoordinatorEventDashboard />
            </ProtectedRoute>
          } />
          <Route path="/coordinator/certificates" element={
            <ProtectedRoute allowedRole="coordinator">
              <CertificateManagement />
            </ProtectedRoute>
          } />
          <Route path="/participant/feedback" element={<Feedback />} />
          <Route path="/certificate" element={<CertificatePage/>} />
          <Route path="/verify-certificate" element={<CertificateVerification />} />
          <Route path="/verify-certificate/:certificateId" element={<CertificateVerification />} />
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="/admin/dashboard" element={
            <ProtectedRoute allowedRole="admin">
              <AdminDashboard />
            </ProtectedRoute>
          } />
        </Routes>
      </Router>
    </SnackbarProvider>
  );
}

export default App;