import React from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { HelmetProvider } from 'react-helmet-async'
import { AuthProvider } from './context/AuthContext'
import { CartProvider } from './context/CartContext'
import { OrderProvider } from './context/OrderContext'
import { NotificationProvider } from './context/NotificationContext'
import { SoundProvider } from './context/SoundContext'
import { ThemeProvider } from './context/ThemeContext'
import ProtectedRoute from './components/common/ProtectedRoute'
import LoadingScreen from './components/customer/LoadingScreen'

// Customer Pages
import Home from './pages/customer/Home'
import Menu from './pages/customer/Menu'
import Cart from './pages/customer/Cart'
import Checkout from './pages/customer/Checkout'
import OrderTracking from './pages/customer/OrderTracking'
import Orders from './pages/customer/Orders'
import Profile from './pages/customer/Profile'
import Notifications from './pages/customer/Notifications'

// Auth Pages
import Login from './pages/auth/Login'
import Register from './pages/auth/Register'
import OTPVerification from './pages/auth/OTPVerification'
import ForgotPassword from './pages/auth/ForgotPassword'
import ResetPassword from './pages/auth/ResetPassword'

// Admin Pages
import AdminLogin from './pages/admin/AdminLogin'
import AdminDashboard from './pages/admin/AdminDashboard'
import AdminProducts from './pages/admin/AdminProducts'
import AdminOrders from './pages/admin/AdminOrders'
import AdminCustomers from './pages/admin/AdminCustomers'
import AdminCoupons from './pages/admin/AdminCoupons'
import AdminReports from './pages/admin/AdminReports'
import AdminSettings from './pages/admin/AdminSettings'
import AdminProfilePage from './pages/admin/AdminProfilePage'

function App() {
  return (
    <HelmetProvider>
      <Router>
        <ThemeProvider>
          <SoundProvider>
            <AuthProvider>
              <CartProvider>
                <OrderProvider>
                  <NotificationProvider>
                  <div className="min-h-screen">
                  <Toaster 
                    position="top-right"
                    toastOptions={{
                      duration: 4000,
                      style: {
                        background: '#fdf6ed',
                        color: '#3d352c',
                        borderRadius: '12px',
                        padding: '16px',
                        boxShadow: '0 10px 40px rgba(0,0,0,0.1)',
                      },
                      success: {
                        icon: '✨',
                        style: {
                          borderLeft: '4px solid #eaa93a',
                        },
                      },
                      error: {
                        icon: '❌',
                        style: {
                          borderLeft: '4px solid #e74c3c',
                        },
                      },
                    }}
                  />
                  
                  <Routes>
                    {/* Auth Routes */}
                    <Route path="/login" element={<Login />} />
                    <Route path="/register" element={<Register />} />
                    <Route path="/verify-otp" element={<OTPVerification />} />
                    <Route path="/forgot-password" element={<ForgotPassword />} />
                    <Route path="/reset-password" element={<ResetPassword />} />
                    
                    {/* Admin Routes */}
                    <Route path="/admin/login" element={<AdminLogin />} />
                    <Route path="/admin" element={
                      <ProtectedRoute adminOnly>
                        <AdminDashboard />
                      </ProtectedRoute>
                    } />
                    <Route path="/admin/products" element={
                      <ProtectedRoute adminOnly>
                        <AdminProducts />
                      </ProtectedRoute>
                    } />
                    <Route path="/admin/orders" element={
                      <ProtectedRoute adminOnly>
                        <AdminOrders />
                      </ProtectedRoute>
                    } />
                    <Route path="/admin/customers" element={
                      <ProtectedRoute adminOnly>
                        <AdminCustomers />
                      </ProtectedRoute>
                    } />
                    <Route path="/admin/coupons" element={
                      <ProtectedRoute adminOnly>
                        <AdminCoupons />
                      </ProtectedRoute>
                    } />
                    <Route path="/admin/reports" element={
                      <ProtectedRoute adminOnly>
                        <AdminReports />
                      </ProtectedRoute>
                    } />
                    <Route path="/admin/profile" element={
                      <ProtectedRoute adminOnly>
                        <AdminProfilePage />
                      </ProtectedRoute>
                    } />
                    <Route path="/admin/settings" element={
                      <ProtectedRoute adminOnly>
                        <AdminSettings />
                      </ProtectedRoute>
                    } />
                    
                    {/* Customer Routes */}
                    <Route path="/" element={<Home />} />
                    <Route path="/dashboard" element={<Home />} />
                    <Route path="/menu" element={<Menu />} />
                    <Route path="/cart" element={<Cart />} />
                    <Route path="/checkout" element={
                      <ProtectedRoute>
                        <Checkout />
                      </ProtectedRoute>
                    } />
                    <Route path="/tracking/:orderId" element={
                      <ProtectedRoute>
                        <OrderTracking />
                      </ProtectedRoute>
                    } />
                    <Route path="/orders" element={
                      <ProtectedRoute>
                        <Orders />
                      </ProtectedRoute>
                    } />
                    <Route path="/profile" element={
                      <ProtectedRoute>
                        <Profile />
                      </ProtectedRoute>
                    } />
                    <Route path="/notifications" element={
                      <ProtectedRoute>
                        <Notifications />
                      </ProtectedRoute>
                    } />
                    
                    <Route path="*" element={<Navigate to="/" />} />
                  </Routes>
                </div>
              </NotificationProvider>
            </OrderProvider>
          </CartProvider>
        </AuthProvider>
      </SoundProvider>
    </ThemeProvider>
  </Router>
</HelmetProvider>
  )
}

export default App