import { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { Toaster } from 'react-hot-toast';
import { Sun, Moon, Menu } from 'lucide-react';
import toast from 'react-hot-toast';
import { authStore } from './store/authStore';
import { themeStore } from './store/themeStore';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import HRDashboard from './pages/HRDashboard';
import EmployeesPage from './pages/EmployeesPage';
import EmployeeProfilePage from './pages/EmployeeProfilePage';
import AttendancePage from './pages/AttendancePage';
import PayrollPage from './pages/PayrollPage';
import PayslipsPage from './pages/PayslipsPage';
import ReportsPage from './pages/ReportsPage';
import MyAttendancePage from './pages/MyAttendancePage';
import MyPayrollPage from './pages/MyPayrollPage';
import MyPayslipsPage from './pages/MyPayslipsPage';
import LeavePage from './pages/LeavePage';
import MyLeavePage from './pages/MyLeavePage';
import ChangePasswordPage from './pages/ChangePasswordPage';
import AuditLogPage from './pages/AuditLogPage';
import NotificationBell from './components/NotificationBell';
import QuickSearch from './components/QuickSearch';

const ProtectedRoute = ({ children, hrOnly = false }) => {
  const { isAuthenticated, role } = authStore();
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (hrOnly && role !== 'hr') return <Navigate to="/my-profile" replace />;
  return children;
};

const App = () => {
  const { isAuthenticated, role, token, clearAuth } = authStore();
  const { isDark, toggleTheme } = themeStore();
  const [warnedExpiry, setWarnedExpiry] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    document.documentElement.className = isDark ? 'dark' : 'light';
  }, [isDark]);

  // Session timeout warning — 5 min before expiry
  useEffect(() => {
    if (!token || !isAuthenticated) return;
    const interval = setInterval(() => {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        const msLeft = payload.exp * 1000 - Date.now();
        if (msLeft < 5 * 60 * 1000 && msLeft > 0 && !warnedExpiry) {
          setWarnedExpiry(true);
          toast('Your session expires in 5 minutes. Please save your work.', {
            icon: '⏰',
            duration: 8000,
          });
        }
        if (msLeft <= 0) {
          clearAuth();
          window.location.href = '/login';
        }
      } catch {}
    }, 30000);
    return () => clearInterval(interval);
  }, [token, isAuthenticated, warnedExpiry, clearAuth]);

  return (
    <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      {/* Hamburger — mobile only */}
      {isAuthenticated && (
        <button
          onClick={() => setSidebarOpen(true)}
          className="fixed top-4 left-4 z-50 md:hidden p-2 rounded-lg bg-[var(--bg-elevated)] border border-[var(--border)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
        >
          <Menu size={20} />
        </button>
      )}

      {/* Theme toggle — only show when not on login/landing */}
      {isAuthenticated && (
        <button
          onClick={toggleTheme}
          className="fixed top-4 right-16 z-50 p-2 rounded-full bg-[var(--bg-elevated)] border border-[var(--border)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
          title="Toggle theme"
        >
          {isDark ? <Sun size={18} /> : <Moon size={18} />}
        </button>
      )}

      {/* Notification bell */}
      {isAuthenticated && (
        <div className="fixed top-4 right-4 z-50">
          <NotificationBell />
        </div>
      )}

      {/* Ctrl+K quick search */}
      {isAuthenticated && <QuickSearch />}

      <AnimatePresence mode="wait">
        <Routes>
          <Route path="/" element={isAuthenticated ? <Navigate to={role === 'hr' ? '/dashboard' : '/my-profile'} replace /> : <LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/dashboard" element={<ProtectedRoute hrOnly><HRDashboard /></ProtectedRoute>} />
          <Route path="/employees" element={<ProtectedRoute hrOnly><EmployeesPage /></ProtectedRoute>} />
          <Route path="/my-profile" element={<ProtectedRoute><EmployeeProfilePage /></ProtectedRoute>} />
          <Route path="/attendance" element={<ProtectedRoute hrOnly><AttendancePage /></ProtectedRoute>} />
          <Route path="/payroll" element={<ProtectedRoute hrOnly><PayrollPage /></ProtectedRoute>} />
          <Route path="/payslips" element={<ProtectedRoute hrOnly><PayslipsPage /></ProtectedRoute>} />
          <Route path="/reports" element={<ProtectedRoute hrOnly><ReportsPage /></ProtectedRoute>} />
          <Route path="/audit-log" element={<ProtectedRoute hrOnly><AuditLogPage /></ProtectedRoute>} />
          <Route path="/my-attendance" element={<ProtectedRoute><MyAttendancePage /></ProtectedRoute>} />
          <Route path="/my-payroll" element={<ProtectedRoute><MyPayrollPage /></ProtectedRoute>} />
          <Route path="/my-payslips" element={<ProtectedRoute><MyPayslipsPage /></ProtectedRoute>} />
          <Route path="/leaves" element={<ProtectedRoute hrOnly><LeavePage /></ProtectedRoute>} />
          <Route path="/my-leaves" element={<ProtectedRoute><MyLeavePage /></ProtectedRoute>} />
          <Route path="/change-password" element={<ProtectedRoute><ChangePasswordPage /></ProtectedRoute>} />
        </Routes>
      </AnimatePresence>

      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: 'var(--bg-surface)',
            color: 'var(--text-primary)',
            border: '1px solid var(--border)',
          },
        }}
      />
    </Router>
  );
};

export default App;
