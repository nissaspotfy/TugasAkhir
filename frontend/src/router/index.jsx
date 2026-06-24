import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import LandingPage from '../pages/LandingPage';
import AuthPage from '../pages/auth/AuthPage';
import ResetPassword from '../pages/auth/ResetPassword';
import Dashboard from '../pages/Dashboard';
import AdminDashboard from '../pages/admin/AdminDashboard';
import Checkout from '../pages/Checkout';
import Menu from '../pages/Menu';
import PaymentSuccess from '../pages/PaymentSuccess';
import PrivateRoute from '../components/PrivateRoute'; 

const AppRouter = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/menu" element={<Menu />} />
        <Route path="/login" element={<AuthPage />} />
        <Route path="/register" element={<AuthPage />} />
        <Route path="/forgot-password" element={<ResetPassword />} />
        
        <Route 
          path="/payment-success" 
          element={
            <PrivateRoute allowedRoles={['User']}>
              <PaymentSuccess />
            </PrivateRoute>
          } 
        />
        <Route 
          path="/dashboard" 
          element={
            <PrivateRoute allowedRoles={['User']}>
              <Dashboard />
            </PrivateRoute>
          } 
        />
        <Route 
          path="/admin/dashboard" 
          element={
            <PrivateRoute allowedRoles={['Admin']}>
              <AdminDashboard />
            </PrivateRoute>
          } 
        />
        <Route 
          path="/checkout" 
          element={
            <PrivateRoute allowedRoles={['User']}>
              <Checkout />
            </PrivateRoute>
          } 
        />
        {/* Redirect any unmatched routes to home or login based on auth status */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
};

export default AppRouter;