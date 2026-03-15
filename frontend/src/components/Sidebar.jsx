import { useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  LayoutDashboard, Users, CalendarCheck, CreditCard,
  FileText, BarChart2, User, LogOut, Lock,
} from 'lucide-react';
import { authStore } from '../store/authStore';

const Sidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { role, clearAuth } = authStore();

  const hrNavItems = [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard' },
    { icon: Users, label: 'Employees', path: '/employees' },
    { icon: CalendarCheck, label: 'Attendance', path: '/attendance' },
    { icon: FileText, label: 'Leave Requests', path: '/leaves' },
    { icon: CreditCard, label: 'Payroll', path: '/payroll' },
    { icon: FileText, label: 'Payslips', path: '/payslips' },
    { icon: BarChart2, label: 'Reports', path: '/reports' },
    { icon: Lock, label: 'Change Password', path: '/change-password' },
  ];

  const employeeNavItems = [
    { icon: User, label: 'My Profile', path: '/my-profile' },
    { icon: CalendarCheck, label: 'My Attendance', path: '/my-attendance' },
    { icon: FileText, label: 'My Leaves', path: '/my-leaves' },
    { icon: CreditCard, label: 'My Payroll', path: '/my-payroll' },
    { icon: FileText, label: 'My Payslips', path: '/my-payslips' },
    { icon: Lock, label: 'Change Password', path: '/change-password' },
  ];

  const navItems = role === 'hr' ? hrNavItems : employeeNavItems;

  const handleLogout = () => {
    clearAuth();
    navigate('/login');
  };

  return (
    <div className="fixed left-0 top-0 h-full w-60 bg-[var(--bg-surface)] border-r border-[var(--border)] flex flex-col z-40">
      {/* Logo */}
      <div className="p-6 flex-shrink-0">
        <div className="logo text-2xl font-bold">
          <span className="text-[var(--text-primary)]">Pay</span>
          <span className="text-[var(--accent-primary)]">Flow</span>
        </div>
        <div className="mt-4 px-3 py-1 bg-[var(--bg-elevated)] rounded-full text-xs text-[var(--text-secondary)] text-center">
          {role === 'hr' ? 'HR Admin' : 'Employee'}
        </div>
      </div>

      {/* Nav — scrollable if needed */}
      <nav className="flex-1 px-4 overflow-y-auto min-h-0">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <motion.button
              key={item.path}
              onClick={() => navigate(item.path)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-colors mb-1 ${
                isActive
                  ? 'bg-[var(--glow-violet)] border-l-4 border-[var(--accent-primary)] text-[var(--accent-primary)]'
                  : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-elevated)]'
              }`}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <item.icon size={20} className={isActive ? 'text-[var(--accent-primary)]' : ''} />
              <span className="text-sm">{item.label}</span>
            </motion.button>
          );
        })}
      </nav>

      {/* Logout — always visible at bottom */}
      <div className="p-4 flex-shrink-0 border-t border-[var(--border)]">
        <motion.button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-[var(--text-secondary)] hover:text-red-400 hover:bg-red-500/10 transition-colors"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <LogOut size={20} />
          <span className="text-sm">Logout</span>
        </motion.button>
      </div>
    </div>
  );
};

export default Sidebar;
