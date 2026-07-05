import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';

// --- CONTEXT & SECURITY ---
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';

// --- ROUTES PUBLIQUES ---
import Login from './pages/Login';
import LandingPage from './pages/LandingPage';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import PublicTracking from './pages/PublicTracking';
import TermsOfService from './pages/TermsOfService';
import PrivacyPolicy from './pages/PrivacyPolicy';

// --- ESPACE PARTENAIRE ---
import DashboardLayout from './components/DashboardLayout';
import DashboardHome from './pages/DashboardHome';
import CreateOrder from './pages/CreateOrder';
import Pricing from './pages/Pricing';
import Historique from './pages/history';
import Tracking from './pages/Tracking';
import Balance from './pages/Balance';
import Profile from './pages/Profile'; 
import Settings from './pages/Settings';
import ProductsDashboard from './pages/ProductsDashboard';
// --- ESPACE FLASHMAN ---
import FlashmanLayout from './layouts/FlashmanLayout';
import FlashmanHome from './pages/Flashman/FlashmanHome';
import FlashmanRoutes from './pages/Flashman/FlashmanRoutes';
import FlashmanWallet from './pages/Flashman/FlashmanWallet'; 
import FlashmanSettings from './pages/Flashman/FlashmanSettings';

// --- ESPACE ADMIN (CONTROL TOWER) ---
import AdminLayout from './components/AdminLayout';
import AdminDashboard from './pages/Admin/Dashboard';
import AdminUsers from './pages/Admin/Users';
import AdminFinance from './pages/Admin/Finance';
import AdminCommands from './pages/Admin/Commands';
import AdminCatalogue from './pages/Admin/Catalogue'; 
import AdminSettings from './pages/Admin/Settings'; 
import AdminAnalytics from './pages/Admin/Analytics';
import AdminNotifications from './pages/Admin/Notifications';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4200,
            style: {
              padding: '16px 18px',
              borderRadius: '26px',
              background: 'rgba(255,255,255,0.95)',
              color: '#0f172a',
              boxShadow: '0 26px 70px rgba(15,23,42,0.12)',
              backdropFilter: 'blur(18px)',
              border: '1px solid rgba(148,163,184,0.16)',
              fontFamily: 'Inter, system-ui, sans-serif',
            },
            success: {
              iconTheme: {
                primary: '#0f172a',
                secondary: '#ffffff',
              },
            },
            error: {
              iconTheme: {
                primary: '#db2777',
                secondary: '#ffffff',
              },
            },
          }}
        />
        <Routes>
          
          {/* ROUTES PUBLIQUES */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/track/:code" element={<PublicTracking />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password/:token" element={<ResetPassword />} />
          
          {/* 👇 CORRECTION ICI POUR MATCHER AVEC LE FOOTER */}
          <Route path="/cgu" element={<TermsOfService />} />
          <Route path="/privacy" element={<PrivacyPolicy />} />

          {/* ESPACE PARTENAIRE */}
          <Route path="/dashboard" element={
            <ProtectedRoute allowedRoles={['PARTNER']}>
              <DashboardLayout />
            </ProtectedRoute>
          }>
            <Route index element={<DashboardHome />} />
            <Route path="create" element={<CreateOrder />} />
            <Route path="pricing" element={<Pricing />} />
            <Route path="tracking" element={<Tracking />} />
            <Route path="history" element={<Historique />} />
            <Route path="balance" element={<Balance />} /> 
            <Route path="profile" element={<Profile />} /> 
            <Route path="settings" element={<Settings />} />
            <Route path="products" element={<ProductsDashboard />} />
          </Route>

          {/* ESPACE FLASHMAN (LIVREUR) */}
          <Route path="/flashman" element={
            <ProtectedRoute allowedRoles={['FLASHMAN', 'DRIVER']}>
              <FlashmanLayout />
            </ProtectedRoute>
          }>
            <Route index element={<FlashmanHome />} />
            <Route path="routes" element={<FlashmanRoutes />} /> 
            <Route path="wallet" element={<FlashmanWallet />} /> 
            <Route path="settings" element={<FlashmanSettings />} />
          </Route>

          {/* 👑 ESPACE ADMIN (CONTROL TOWER) */}
          <Route path="/admin" element={
            <ProtectedRoute allowedRoles={['ADMIN']}>
              <AdminLayout />
            </ProtectedRoute>
          }>
            <Route index element={<Navigate to="dashboard" replace />} />
            
            <Route path="dashboard" element={<AdminDashboard />} />
            <Route path="users" element={<AdminUsers />} />
            <Route path="finance" element={<AdminFinance />} />
            <Route path="commands" element={<AdminCommands />} />
            <Route path="catalog" element={<AdminCatalogue />} />
            <Route path="analytics" element={<AdminAnalytics />} />
            <Route path="notifications" element={<AdminNotifications />} />
            <Route path="settings" element={<AdminSettings />} />
          </Route>
          
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;