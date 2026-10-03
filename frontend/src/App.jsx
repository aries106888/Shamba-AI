import React, { Suspense, lazy } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import Layout from './components/Layout';
import LoadingSpinner from './components/ui/LoadingSpinner';

// Lazy-loaded pages
const LandingPage       = lazy(() => import('./pages/LandingPage'));
const LoginPage         = lazy(() => import('./pages/LoginPage'));
const RegisterPage      = lazy(() => import('./pages/RegisterPage'));
const FarmerDashboard   = lazy(() => import('./pages/FarmerDashboard'));
const BuyerDashboard    = lazy(() => import('./pages/BuyerDashboard'));
const AdminDashboard    = lazy(() => import('./pages/AdminDashboard'));
const MarketplacePage   = lazy(() => import('./pages/MarketplacePage'));
const ForecastPage      = lazy(() => import('./pages/ForecastPage'));
const LogisticsPage     = lazy(() => import('./pages/LogisticsPage'));
const YieldRegistryPage = lazy(() => import('./pages/YieldRegistryPage'));
const AlertsPage        = lazy(() => import('./pages/AlertsPage'));
const FarmMapPage       = lazy(() => import('./pages/FarmMapPage'));

function ProtectedRoute({ children, allowedRoles }) {
  const { isAuth, user } = useAuth();
  if (!isAuth) return <Navigate to="/login" replace />;
  if (allowedRoles && !allowedRoles.includes(user?.role)) return <Navigate to="/" replace />;
  return children;
}

export default function App() {
  const { user, isAuth } = useAuth();

  const dashboardRedirect = () => {
    if (!isAuth) return <Navigate to="/login" />;
    if (user?.role === 'farmer') return <Navigate to="/farmer/dashboard" />;
    if (user?.role === 'buyer')  return <Navigate to="/buyer/dashboard" />;
    if (user?.role === 'admin')  return <Navigate to="/admin" />;
    return <Navigate to="/" />;
  };

  return (
    <Suspense fallback={<LoadingSpinner fullPage />}>
      <Routes>
        {/* Public */}
        <Route path="/"        element={<LandingPage />} />
        <Route path="/login"   element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/marketplace" element={<Layout><MarketplacePage /></Layout>} />
        <Route path="/forecasts"   element={<Layout><ForecastPage /></Layout>} />
        <Route path="/farm-map"     element={<Layout><FarmMapPage /></Layout>} />

        {/* Dashboard redirect */}
        <Route path="/dashboard" element={dashboardRedirect()} />

        {/* Farmer routes */}
        <Route path="/farmer/dashboard" element={
          <ProtectedRoute allowedRoles={['farmer','admin']}>
            <Layout><FarmerDashboard /></Layout>
          </ProtectedRoute>
        }/>
        <Route path="/farmer/yields" element={
          <ProtectedRoute allowedRoles={['farmer','admin']}>
            <Layout><YieldRegistryPage /></Layout>
          </ProtectedRoute>
        }/>
        <Route path="/farmer/alerts" element={
          <ProtectedRoute allowedRoles={['farmer','admin']}>
            <Layout><AlertsPage /></Layout>
          </ProtectedRoute>
        }/>

        {/* Buyer routes */}
        <Route path="/buyer/dashboard" element={
          <ProtectedRoute allowedRoles={['buyer','admin']}>
            <Layout><BuyerDashboard /></Layout>
          </ProtectedRoute>
        }/>
        <Route path="/buyer/logistics" element={
          <ProtectedRoute allowedRoles={['buyer','admin']}>
            <Layout><LogisticsPage /></Layout>
          </ProtectedRoute>
        }/>

        {/* Admin routes */}
        <Route path="/admin" element={
          <ProtectedRoute allowedRoles={['admin']}>
            <Layout><AdminDashboard /></Layout>
          </ProtectedRoute>
        }/>

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Suspense>
  );
}
