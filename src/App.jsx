import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';

import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import PublicRestaurantPage from './pages/PublicRestaurantPage';
import TrackOrderPage from './pages/TrackOrderPage';
import SuperAdminPage from './pages/SuperAdminPage';
import CustomerOrdersPage from './pages/CustomerOrdersPage';
import RiderDashboardPage from './pages/RiderDashboardPage';
import RiderLoginPage from './pages/RiderLoginPage';
import RiderRegisterPage from './pages/RiderRegisterPage';

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <CartProvider>
          <Routes>
            {/* Landing & Directory */}
            <Route path="/" element={<LandingPage />} />

            {/* Customer Orders & Order History */}
            <Route path="/my-orders" element={<CustomerOrdersPage />} />
            <Route path="/orders" element={<CustomerOrdersPage />} />

            {/* Delivery Rider Portal */}
            <Route path="/rider" element={<RiderDashboardPage />} />
            <Route path="/rider/dashboard" element={<RiderDashboardPage />} />
            <Route path="/rider/login" element={<RiderLoginPage />} />
            <Route path="/rider/register" element={<RiderRegisterPage />} />

            {/* Owner Authentication */}
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />

            {/* Super Admin Platform Dashboard */}
            <Route path="/admin" element={<SuperAdminPage />} />

            {/* Restaurant Portal Dashboard */}
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/dashboard/*" element={<DashboardPage />} />

            {/* Dynamic Public Restaurant Storefront */}
            <Route path="/restaurant/:slug" element={<PublicRestaurantPage />} />

            {/* Live Customer Order Tracker */}
            <Route path="/order-status/:orderNumber" element={<TrackOrderPage />} />

            {/* Catch-all redirect to landing */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </CartProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
