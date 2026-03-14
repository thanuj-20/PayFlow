import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { Toaster } from 'react-hot-toast';
import { authStore } from './store/authStore';
import LoginPage from './pages/LoginPage';
import HRDashboard from './pages/HRDashboard';
import EmployeesPage from './pages/EmployeesPage';
import EmployeeProfilePage from './pages/EmployeeProfilePage';
import AttendancePage from './pages/AttendancePage';
import PayrollPage from './pages/PayrollPage';
import PayslipsPage from './pages/PayslipsPage';
import ReportsPage from './pages/ReportsPage';

const ProtectedRoute = ({ children, hrOnly = false }) => {
  const { isAuthenticated, role } = authStore();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (hrOnly && role !== 'hr') {
    return <Navigate to="/my-profile" replace />;
  }

  return children;
};

const App = () => {
  const { isAuthenticated, role } = authStore();

  return (
    <Router>
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
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute hrOnly>
                <HRDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/employees"
            element={
              <ProtectedRoute hrOnly>
                <EmployeesPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/my-profile"
            element={
              <ProtectedRoute>
                <EmployeeProfilePage />
              </ProtectedRoute>
            }
          />
          {/* HR Routes */}
          <Route
            path="/attendance"
            element={
              <ProtectedRoute hrOnly>
                <AttendancePage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/payroll"
            element={
              <ProtectedRoute hrOnly>
                <PayrollPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/payslips"
            element={
              <ProtectedRoute hrOnly>
                <PayslipsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/reports"
            element={
              <ProtectedRoute hrOnly>
                <ReportsPage />
              </ProtectedRoute>
            }
          />
          {/* Employee placeholder routes */}
          <Route path="/my-attendance" element={<Navigate to="/my-profile" replace />} />
          <Route path="/my-payroll" element={<Navigate to="/my-profile" replace />} />
          <Route path="/my-payslips" element={<Navigate to="/my-profile" replace />} />
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