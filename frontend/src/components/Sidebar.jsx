import { useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard, Users, CalendarCheck, CreditCard,
  FileText, BarChart2, User, LogOut, Lock, Shield, X,
} from 'lucide-react';
import { authStore } from '../store/authStore';

const Sidebar = ({ open, onClose }) => {
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
    { icon: Shield, label: 'Audit Log', path: '/audit-log' },
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

  const handleNav = (path) => {
    navigate(path);
    onClose?.();
  };

  const sidebarContent = (
    <div className="h-full flex flex-col">
      {/* Logo */}
      <div className="p-6 flex-shrink-0 flex items-start justify-between">
        <div>
          <div className="logo text-2xl font-bold">
            <span className="text-[var(--text-primary)]">Pay</span>
            <span className="text-[var(--accent-primary)]">Flow</span>
          </div>
          <div className="mt-4 px-3 py-1 bg-[var(--bg-elevated)] rounded-full text-xs text-[var(--text-secondary)] text-center">
            {role === 'hr' ? 'HR Admin' : 'Employee'}
          </div>
        </div>
        {/* Close button — mobile only */}
        <button
          onClick={onClose}
          className="md:hidden p-1 rounded-lg text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-elevated)] transition-colors"
        >
          <X size={20} />
        </button>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-4 overflow-y-auto min-h-0">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <motion.button
              key={item.path}
              onClick={() => handleNav(item.path)}
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

      {/* Ctrl+K hint */}
      <div className="px-4 pb-2 flex-shrink-0">
        <div
          className="flex items-center gap-2 px-3 py-2 rounded-lg bg-[var(--bg-elevated)] text-xs text-[var(--text-tertiary)] cursor-pointer hover:text-[var(--text-secondary)] transition-colors"
          onClick={() => window.dispatchEvent(new KeyboardEvent('keydown', { key: 'k', ctrlKey: true, bubbles: true }))}
        >
          <span className="flex-1">Quick search</span>
          <kbd className="px-1.5 py-0.5 rounded bg-[var(--bg-surface)] font-mono text-xs">Ctrl K</kbd>
        </div>
      </div>

      {/* Logout */}
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

  return (
    <>
      {/* Desktop sidebar — always visible */}
      <div className="hidden md:flex fixed left-0 top-0 h-screen w-60 bg-[var(--bg-surface)] border-r border-[var(--border)] flex-col z-40">
        {sidebarContent}
      </div>

      {/* Mobile sidebar — drawer */}
      <AnimatePresence>
        {open && (
          <>
            {/* Backdrop */}
            <motion.div
              className="fixed inset-0 bg-black/50 z-40 md:hidden"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={onClose}
            />
            {/* Drawer */}
            <motion.div
              className="fixed left-0 top-0 h-screen w-60 bg-[var(--bg-surface)] border-r border-[var(--border)] flex flex-col z-50 md:hidden"
              initial={{ x: -240 }}
              animate={{ x: 0 }}
              exit={{ x: -240 }}
              transition={{ type: 'tween', duration: 0.25 }}
            >
              {sidebarContent}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};

export default Sidebar;
