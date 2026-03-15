import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, LayoutDashboard, Users, CalendarCheck, CreditCard, FileText, BarChart2, Lock, User, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { authStore } from '../store/authStore';

const hrRoutes = [
  { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
  { label: 'Employees', path: '/employees', icon: Users },
  { label: 'Attendance', path: '/attendance', icon: CalendarCheck },
  { label: 'Leave Requests', path: '/leaves', icon: FileText },
  { label: 'Payroll', path: '/payroll', icon: CreditCard },
  { label: 'Payslips', path: '/payslips', icon: FileText },
  { label: 'Reports', path: '/reports', icon: BarChart2 },
  { label: 'Audit Log', path: '/audit-log', icon: BarChart2 },
  { label: 'Change Password', path: '/change-password', icon: Lock },
];

const empRoutes = [
  { label: 'My Profile', path: '/my-profile', icon: User },
  { label: 'My Attendance', path: '/my-attendance', icon: CalendarCheck },
  { label: 'My Leaves', path: '/my-leaves', icon: FileText },
  { label: 'My Payroll', path: '/my-payroll', icon: CreditCard },
  { label: 'My Payslips', path: '/my-payslips', icon: FileText },
  { label: 'Change Password', path: '/change-password', icon: Lock },
];

const QuickSearch = () => {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [selected, setSelected] = useState(0);
  const inputRef = useRef(null);
  const navigate = useNavigate();
  const { role } = authStore();

  const routes = role === 'hr' ? hrRoutes : empRoutes;
  const filtered = query
    ? routes.filter(r => r.label.toLowerCase().includes(query.toLowerCase()))
    : routes;

  useEffect(() => {
    const handler = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setOpen(o => !o);
        setQuery('');
        setSelected(0);
      }
      if (e.key === 'Escape') setOpen(false);
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 50);
  }, [open]);

  useEffect(() => { setSelected(0); }, [query]);

  const handleKeyDown = (e) => {
    if (e.key === 'ArrowDown') { e.preventDefault(); setSelected(s => Math.min(s + 1, filtered.length - 1)); }
    if (e.key === 'ArrowUp') { e.preventDefault(); setSelected(s => Math.max(s - 1, 0)); }
    if (e.key === 'Enter' && filtered[selected]) {
      navigate(filtered[selected].path);
      setOpen(false);
    }
  };

  return (
    <>
      <AnimatePresence>
        {open && (
          <motion.div
            className="fixed inset-0 z-50 flex items-start justify-center pt-24 px-4"
            style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)' }}
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={() => setOpen(false)}
          >
            <motion.div
              className="w-full max-w-lg rounded-2xl overflow-hidden shadow-2xl"
              style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)' }}
              initial={{ scale: 0.95, opacity: 0, y: -20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: -20 }}
              onClick={e => e.stopPropagation()}
            >
              {/* Search input */}
              <div className="flex items-center gap-3 px-4 py-3 border-b border-[var(--border)]">
                <Search size={18} className="text-[var(--text-secondary)] flex-shrink-0" />
                <input
                  ref={inputRef}
                  value={query}
                  onChange={e => setQuery(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Search pages..."
                  className="flex-1 bg-transparent text-[var(--text-primary)] placeholder-[var(--text-tertiary)] outline-none text-sm"
                />
                <button onClick={() => setOpen(false)} className="text-[var(--text-tertiary)] hover:text-[var(--text-secondary)]">
                  <X size={16} />
                </button>
              </div>

              {/* Results */}
              <div className="max-h-72 overflow-y-auto py-2">
                {filtered.length === 0 ? (
                  <p className="text-center text-sm text-[var(--text-tertiary)] py-6">No results found</p>
                ) : (
                  filtered.map((route, i) => (
                    <button
                      key={route.path}
                      onClick={() => { navigate(route.path); setOpen(false); }}
                      className="w-full flex items-center gap-3 px-4 py-2.5 text-left transition-colors"
                      style={{ background: i === selected ? 'var(--glow-violet)' : 'transparent', color: i === selected ? 'var(--accent-primary)' : 'var(--text-primary)' }}
                      onMouseEnter={() => setSelected(i)}
                    >
                      <route.icon size={16} className="flex-shrink-0" />
                      <span className="text-sm">{route.label}</span>
                    </button>
                  ))
                )}
              </div>

              {/* Footer hint */}
              <div className="px-4 py-2 border-t border-[var(--border)] flex items-center gap-4 text-xs text-[var(--text-tertiary)]">
                <span><kbd className="px-1.5 py-0.5 rounded bg-[var(--bg-elevated)] font-mono">↑↓</kbd> navigate</span>
                <span><kbd className="px-1.5 py-0.5 rounded bg-[var(--bg-elevated)] font-mono">↵</kbd> open</span>
                <span><kbd className="px-1.5 py-0.5 rounded bg-[var(--bg-elevated)] font-mono">Esc</kbd> close</span>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default QuickSearch;
