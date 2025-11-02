import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider } from './context/AuthContext';
import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import ResetPasswordPage from './pages/ResetPasswordPage';
import BrowseGigsPage from './pages/BrowseGigsPage';
import GigDetailsPage from './pages/GigDetailsPage';
import CreateGigPage from './pages/CreateGigPage';
import EditGigPage from './pages/EditGigPage';
import BookGigPage from './pages/BookGigPage';
import StudentDashboard from './pages/StudentDashboard';
import ClientDashboard from './pages/ClientDashboard';
import AdminDashboard from './pages/AdminDashboard';
import HowItWorksPage from './pages/HowItWorksPage';
import ProfilePage from './pages/ProfilePage';
import OrderDetailsPage from './pages/OrderDetailsPage';
import PaymentSuccessPage from './pages/PaymentSuccessPage';
import ContactPage from './pages/ContactPage';
import AboutPage from './pages/AboutPage';
import PrivacyPolicyPage from './pages/PrivacyPolicyPage';

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Router>
          <Layout>
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route path="/forgot-password" element={<ForgotPasswordPage />} />
              <Route path="/reset-password" element={<ResetPasswordPage />} />
              <Route path="/gigs" element={<BrowseGigsPage />} />
              <Route path="/gig/:id" element={<GigDetailsPage />} />
              <Route path="/gigs/:id" element={<GigDetailsPage />} />
              <Route path="/how-it-works" element={<HowItWorksPage />} />
              <Route path="/contact" element={<ContactPage />} />
              <Route path="/about" element={<AboutPage />} />
              <Route path="/privacy" element={<PrivacyPolicyPage />} />
              <Route 
                path="/payment-success" 
                element={
                  <ProtectedRoute allowedRoles={['client']}>
                    <PaymentSuccessPage />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/profile" 
                element={
                  <ProtectedRoute allowedRoles={['student', 'client', 'admin']}>
                    <ProfilePage />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/gig/:id/book"
                element={
                  <ProtectedRoute allowedRoles={['client']}>
                    <BookGigPage />
                  </ProtectedRoute>
                }
              />
              <Route 
                path="/gigs/:id/book"
                element={
                  <ProtectedRoute allowedRoles={['client']}>
                    <BookGigPage />
                  </ProtectedRoute>
                }
              />
              <Route 
                path="/gigs/create" 
                element={
                  <ProtectedRoute allowedRoles={['student']}>
                    <CreateGigPage />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/gigs/:id/edit" 
                element={
                  <ProtectedRoute allowedRoles={['student']}>
                    <EditGigPage />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/gig/:id/edit" 
                element={
                  <ProtectedRoute allowedRoles={['student']}>
                    <EditGigPage />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/student-dashboard" 
                element={
                  <ProtectedRoute allowedRoles={['student']}>
                    <StudentDashboard />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/client-dashboard" 
                element={
                  <ProtectedRoute allowedRoles={['client']}>
                    <ClientDashboard />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/admin-dashboard" 
                element={
                  <ProtectedRoute allowedRoles={['admin']}>
                    <AdminDashboard />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/orders/:id" 
                element={
                  <ProtectedRoute allowedRoles={['student', 'client']}>
                    <OrderDetailsPage />
                  </ProtectedRoute>
                } 
              />
              {/* Add more routes as we create pages */}
            </Routes>
          </Layout>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
