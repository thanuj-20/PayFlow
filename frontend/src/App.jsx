import { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { Toaster } from 'react-hot-toast';
import { Sun, Moon } from 'lucide-react';
import { authStore } from './store/authStore';
import { themeStore } from './store/themeStore';
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
import NotificationBell from './components/NotificationBell';

const ProtectedRoute = ({ children, hrOnly = false }) => {
  const { isAuthenticated, role } = authStore();
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (hrOnly && role !== 'hr') return <Navigate to="/my-profile" replace />;
  return children;
};

const App = () => {
  const { isAuthenticated, role } = authStore();
  const { isDark, toggleTheme } = themeStore();

  useEffect(() => {
    document.documentElement.className = isDark ? 'dark' : 'light';
  }, [isDark]);

  return (
    <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <button
        onClick={toggleTheme}
        className="fixed top-4 right-16 z-50 p-2 rounded-full bg-[var(--bg-elevated)] border border-[var(--border)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
        title="Toggle theme"
      >
        {isDark ? <Sun size={18} /> : <Moon size={18} />}
      </button>

      {isAuthenticated && (
        <div className="fixed top-4 right-4 z-50">
          <NotificationBell />
        </div>
      )}

      <AnimatePresence mode="wait">
        <Routes>
          <Route
            path="/"
            element={
              isAuthenticated ? (
                <Navigate to={role === 'hr' ? '/dashboard' : '/my-profile'} replace />
              ) : (
                <Navigate to="/login" replace />
              )
            }
          />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/dashboard" element={<ProtectedRoute hrOnly><HRDashboard /></ProtectedRoute>} />
          <Route path="/employees" element={<ProtectedRoute hrOnly><EmployeesPage /></ProtectedRoute>} />
          <Route path="/my-profile" element={<ProtectedRoute><EmployeeProfilePage /></ProtectedRoute>} />
          <Route path="/attendance" element={<ProtectedRoute hrOnly><AttendancePage /></ProtectedRoute>} />
          <Route path="/payroll" element={<ProtectedRoute hrOnly><PayrollPage /></ProtectedRoute>} />
          <Route path="/payslips" element={<ProtectedRoute hrOnly><PayslipsPage /></ProtectedRoute>} />
          <Route path="/reports" element={<ProtectedRoute hrOnly><ReportsPage /></ProtectedRoute>} />
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
