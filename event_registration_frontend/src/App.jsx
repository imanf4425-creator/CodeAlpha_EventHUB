import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import OrganizerRoute from './components/OrganizerRoute';
import AdminRoute from './components/AdminRoute';

import SelectRole from './pages/SelectRole';
import Landing from './pages/Landing';
import Home from './pages/Home';
import EventDetail from './pages/EventDetail';
import GlobalEvents from './pages/GlobalEvents';
import LiveSports from './pages/LiveSports';
import SportsCalendar from './pages/SportsCalendar';
import Login from './pages/Login';
import Register from './pages/Register';
import Profile from './pages/user/Profile';
import UserDashboard from './pages/user/UserDashboard';
import MyRegistrations from './pages/user/MyRegistrations';
import OrganizerDashboard from './pages/organizer/OrganizerDashboard';
import MyEvents from './pages/organizer/MyEvents';
import OrganizerAnalytics from './pages/organizer/OrganizerAnalytics';
import OrganizerProfile from './pages/organizer/OrganizerProfile';
import PendingVerifications from './pages/organizer/PendingVerifications';
import EventForm from './pages/organizer/EventForm';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminUsers from './pages/admin/AdminUsers';
import AdminEvents from './pages/admin/AdminEvents';
import AdminRegistrations from './pages/admin/AdminRegistrations';
import PendingEvents from './pages/admin/PendingEvents';
import NotFound from './pages/NotFound';

// Guest: redirect logged-in users to their role dashboard
function GuestRoute({ children }) {
  const { user, loading, logout } = useAuth();
  if (loading) return <div style={{ padding: '2rem', textAlign: 'center', color: '#94a3b8' }}>Loading...</div>;
  if (user) {
    // Already logged in — send to correct dashboard
    if (user.is_staff) {
      return <Navigate to="/admin" replace />;
    } else if (user.is_organizer) {
      return <Navigate to="/organizer" replace />;
    } else {
      return <Navigate to="/dashboard" replace />;
    }
  }
  return children;
}

// User-only: block admins, block unauthenticated
function UserOnlyRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <div style={{ padding: '2rem', textAlign: 'center', color: '#94a3b8' }}>Loading...</div>;
  if (!user) return <Navigate to="/login" replace />;
  if (user.is_staff) return <Navigate to="/admin" replace />;
  return children;
}

// Any authenticated user
function AuthRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <div style={{ padding: '2rem', textAlign: 'center', color: '#94a3b8' }}>Loading...</div>;
  if (!user) return <Navigate to="/login" replace />;
  return children;
}

export default function App() {
  const location = useLocation();
  const isLanding = location.pathname === '/' || location.pathname === '/select-role';

  return (
    <>
      {!isLanding && <Navbar />}
      <Routes>

        {/* ── Landing ─────────────────────────────────────── */}
        <Route path="/" element={<Landing />} />
        <Route path="/select-role" element={<SelectRole />} />

        {/* ── Public browsing ─────────────────────────────── */}
        <Route path="/home" element={<AuthRoute><Home /></AuthRoute>} />
        <Route path="/events/:id" element={<EventDetail />} />
        <Route path="/global-events" element={<AuthRoute><GlobalEvents /></AuthRoute>} />
        <Route path="/live-sports" element={<AuthRoute><LiveSports /></AuthRoute>} />
        <Route path="/sports-calendar" element={<AuthRoute><SportsCalendar /></AuthRoute>} />

        {/* ── Auth pages ──────────────────────────────────── */}
        <Route path="/login" element={<GuestRoute><Login /></GuestRoute>} />
        <Route path="/register" element={<GuestRoute><Register /></GuestRoute>} />

        {/* ── Regular user pages ───────────────────────────── */}
        <Route path="/dashboard" element={<UserOnlyRoute><UserDashboard /></UserOnlyRoute>} />
        <Route path="/profile" element={<AuthRoute><Profile /></AuthRoute>} />
        <Route path="/my-registrations" element={<UserOnlyRoute><MyRegistrations /></UserOnlyRoute>} />

        {/* ── Organizer pages ─────────────────────────────── */}
        <Route path="/organizer" element={<OrganizerRoute><OrganizerDashboard /></OrganizerRoute>} />
        <Route path="/organizer/events" element={<OrganizerRoute><MyEvents /></OrganizerRoute>} />
        <Route path="/organizer/analytics" element={<OrganizerRoute><OrganizerAnalytics /></OrganizerRoute>} />
        <Route path="/organizer/verifications" element={<OrganizerRoute><PendingVerifications /></OrganizerRoute>} />
        <Route path="/organizer/profile" element={<OrganizerRoute><OrganizerProfile /></OrganizerRoute>} />
        <Route path="/organizer/events/new" element={<OrganizerRoute><EventForm /></OrganizerRoute>} />
        <Route path="/organizer/events/:id/edit" element={<OrganizerRoute><EventForm /></OrganizerRoute>} />

        {/* ── Admin pages ──────────────────────────────────── */}
        <Route path="/admin" element={<AdminRoute><AdminDashboard /></AdminRoute>} />
        <Route path="/admin/pending-events" element={<AdminRoute><PendingEvents /></AdminRoute>} />
        <Route path="/admin/users" element={<AdminRoute><AdminUsers /></AdminRoute>} />
        <Route path="/admin/events" element={<AdminRoute><AdminEvents /></AdminRoute>} />
        <Route path="/admin/registrations" element={<AdminRoute><AdminRegistrations /></AdminRoute>} />
        <Route path="/admin/profile" element={<AdminRoute><Profile /></AdminRoute>} />

        <Route path="*" element={<NotFound />} />
      </Routes>
    </>
  );
}
