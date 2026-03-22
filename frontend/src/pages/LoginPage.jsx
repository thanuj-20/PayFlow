import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { Eye, EyeOff, ArrowRight, Database, Calculator, ShieldCheck, Radar, Sparkles } from 'lucide-react';
import { login } from '../services/api';
import { authStore } from '../store/authStore';
import toast from 'react-hot-toast';

const AGENTS = [
  { icon: Database,     label: 'Data Aggregation',      color: '#6C63FF', desc: 'Collects attendance & leave' },
  { icon: Calculator,   label: 'Salary Calculation',     color: '#00D4AA', desc: 'Computes LOP, overtime, PF' },
  { icon: ShieldCheck,  label: 'Compliance Validation',  color: '#FFB547', desc: 'Checks PF caps & min wage' },
  { icon: Radar,        label: 'Anomaly Detection',      color: '#FF4365', desc: 'Flags salary spikes' },
  { icon: Sparkles,     label: 'AI Explanation',         color: '#9B5DFF', desc: 'GPT-4o natural language summary' },
];

const TAGLINES = [
  'Payroll intelligence, reimagined.',
  '5 AI agents. Zero errors.',
  'Compliance built in, not bolted on.',
  'From data to payslip in seconds.',
];

const Pipeline = () => {
  const [active, setActive] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setActive(p => (p + 1) % AGENTS.length), 1800);
    return () => clearInterval(t);
  }, []);

  return (
    <div className="flex flex-col items-center gap-0 w-full max-w-xs mx-auto">
      {AGENTS.map((agent, i) => {
        const Icon = agent.icon;
        const isDone = i < active;
        const isCurrent = i === active;
        return (
          <div key={agent.label} className="flex flex-col items-center w-full">
            <motion.div
              className="flex items-center gap-3 w-full px-4 py-3 rounded-xl border transition-all duration-300"
              animate={{
                borderColor: isCurrent ? agent.color : isDone ? `${agent.color}55` : '#1E1E2E',
                background: isCurrent ? `${agent.color}18` : isDone ? `${agent.color}08` : 'transparent',
                scale: isCurrent ? 1.03 : 1,
              }}
            >
              <div
                className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0"
                style={{ background: isCurrent || isDone ? `${agent.color}22` : '#1E1E2E' }}
              >
                <Icon size={18} style={{ color: isCurrent ? agent.color : isDone ? `${agent.color}99` : '#44445A' }} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium" style={{ color: isCurrent ? agent.color : isDone ? '#8888AA' : '#44445A' }}>
                  {agent.label}
                </div>
                <div className="text-xs text-[#44445A] truncate">{agent.desc}</div>
              </div>
              {isCurrent && (
                <motion.div
                  className="w-2 h-2 rounded-full flex-shrink-0"
                  style={{ background: agent.color }}
                  animate={{ opacity: [1, 0.2, 1] }}
                  transition={{ duration: 0.8, repeat: Infinity }}
                />
              )}
              {isDone && (
                <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: `${agent.color}66` }} />
              )}
            </motion.div>
            {i < AGENTS.length - 1 && (
              <motion.div
                className="w-px my-0.5"
                style={{ height: 16 }}
                animate={{ background: isDone ? `linear-gradient(to bottom, ${AGENTS[i].color}88, ${AGENTS[i+1].color}88)` : '#1E1E2E' }}
                transition={{ duration: 0.4 }}
              />
            )}
          </div>
        );
      })}
    </div>
  );
};

const Typewriter = () => {
  const [idx, setIdx] = useState(0);
  const [displayed, setDisplayed] = useState('');
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const full = TAGLINES[idx];
    if (!deleting && displayed.length < full.length) {
      const t = setTimeout(() => setDisplayed(full.slice(0, displayed.length + 1)), 45);
      return () => clearTimeout(t);
    }
    if (!deleting && displayed.length === full.length) {
      const t = setTimeout(() => setDeleting(true), 2200);
      return () => clearTimeout(t);
    }
    if (deleting && displayed.length > 0) {
      const t = setTimeout(() => setDisplayed(displayed.slice(0, -1)), 25);
      return () => clearTimeout(t);
    }
    if (deleting && displayed.length === 0) {
      setDeleting(false);
      setIdx(p => (p + 1) % TAGLINES.length);
    }
  }, [displayed, deleting, idx]);

  return (
    <span>
      {displayed}
      <motion.span animate={{ opacity: [1, 0] }} transition={{ duration: 0.5, repeat: Infinity }}>|</motion.span>
    </span>
  );
};

const LoginPage = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [shake, setShake] = useState(false);
  const navigate = useNavigate();
  const { register, handleSubmit } = useForm();

  const onSubmit = async (data) => {
    setIsLoading(true);
    try {
      const response = await login(data.email, data.password);
      const { token, role, employeeId } = response.data;
      authStore.getState().setAuth(token, role, employeeId);
      toast.success('Login successful!');
      navigate(role === 'hr' ? '/dashboard' : '/my-profile');
    } catch (error) {
      setShake(true);
      setTimeout(() => setShake(false), 400);
      toast.error(error.response?.data?.message || 'Login failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-[var(--bg-base)]">

      {/* Left Panel */}
      <div className="hidden md:flex flex-1 flex-col items-center justify-center p-10 relative overflow-hidden">
        {/* Background glows */}
        <div className="absolute top-[-80px] left-[-80px] w-72 h-72 rounded-full pointer-events-none"
          style={{ background: 'radial-gradient(circle, rgba(108,99,255,0.18) 0%, transparent 70%)' }} />
        <div className="absolute bottom-[-60px] right-[-60px] w-56 h-56 rounded-full pointer-events-none"
          style={{ background: 'radial-gradient(circle, rgba(0,212,170,0.14) 0%, transparent 70%)' }} />

        <div className="relative z-10 w-full max-w-sm">
          {/* Logo */}
          <motion.div
            className="mb-8 text-center"
            initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}
          >
            <div className="inline-flex items-center gap-2 mb-3">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center"
                style={{ background: 'linear-gradient(135deg, #6C63FF, #9B5DFF)' }}>
                <Sparkles size={20} color="#fff" />
              </div>
              <span className="text-3xl font-bold text-[var(--text-primary)]">PayFlow</span>
            </div>
            <p className="text-[var(--text-secondary)] text-sm min-h-[1.25rem]">
              <Typewriter />
            </p>
          </motion.div>

          {/* Pipeline */}
          <motion.div
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.2 }}
          >
            <p className="text-xs font-semibold text-[var(--text-tertiary)] uppercase tracking-widest text-center mb-4">
              AI Payroll Pipeline
            </p>
            <Pipeline />
          </motion.div>

          {/* Stats row */}
          <motion.div
            className="mt-8 grid grid-cols-3 gap-3"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.6, delay: 0.5 }}
          >
            {[
              { value: '₹24.8L', label: 'Processed' },
              { value: '98.2%', label: 'Accuracy' },
              { value: '5', label: 'AI Agents' },
            ].map(s => (
              <div key={s.label} className="text-center p-3 rounded-xl border border-[var(--border)] bg-[var(--bg-surface)]/60 backdrop-blur-sm">
                <div className="text-lg font-bold text-[var(--text-primary)]">{s.value}</div>
                <div className="text-xs text-[var(--text-secondary)]">{s.label}</div>
              </div>
            ))}
          </motion.div>
        </div>
      </div>

      {/* Right Panel */}
      <div className="flex-1 flex items-center justify-center p-6 md:p-10">
        {/* Mobile logo */}
        <div className="flex justify-center pt-8 pb-4 md:hidden">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center"
              style={{ background: 'linear-gradient(135deg, #6C63FF, #9B5DFF)' }}>
              <Sparkles size={16} color="#fff" />
            </div>
            <span className="text-xl font-bold text-[var(--text-primary)]">PayFlow</span>
          </div>
        </div>

        <motion.div
          className="w-full max-w-md md:mt-0"
          animate={shake ? { x: [0, -10, 10, -8, 8, 0] } : {}}
          transition={{ duration: 0.4 }}
        >
          {/* Glassmorphism card */}
          <div
            className="rounded-3xl p-8 md:p-10 border backdrop-blur-md"
            style={{
              background: 'var(--bg-surface)',
              borderColor: 'rgba(108,99,255,0.25)',
              boxShadow: '0 0 0 1px rgba(108,99,255,0.1), 0 24px 64px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.05)',
            }}
          >
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-[var(--text-primary)] mb-1">Welcome back</h2>
              <p className="text-[var(--text-secondary)] text-sm">Sign in to your PayFlow account</p>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              <div>
                <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1.5">Email address</label>
                <input
                  {...register('email', { required: true })}
                  type="email"
                  placeholder="you@company.com"
                  className="w-full px-4 py-3 rounded-xl text-[var(--text-primary)] placeholder-[var(--text-tertiary)] text-sm transition-all outline-none"
                  style={{
                    background: 'rgba(10,10,15,0.8)',
                    border: '1px solid var(--border)',
                  }}
                  onFocus={e => e.target.style.borderColor = '#6C63FF'}
                  onBlur={e => e.target.style.borderColor = 'var(--border)'}
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1.5">Password</label>
                <div className="relative">
                  <input
                    {...register('password', { required: true })}
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    className="w-full px-4 py-3 pr-11 rounded-xl text-[var(--text-primary)] placeholder-[var(--text-tertiary)] text-sm transition-all outline-none"
                    style={{
                      background: 'rgba(10,10,15,0.8)',
                      border: '1px solid var(--border)',
                    }}
                    onFocus={e => e.target.style.borderColor = '#6C63FF'}
                    onBlur={e => e.target.style.borderColor = 'var(--border)'}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-tertiary)] hover:text-[var(--text-secondary)] transition-colors"
                  >
                    {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                  </button>
                </div>
              </div>

              <motion.button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 rounded-xl text-white font-medium text-sm flex items-center justify-center gap-2 group relative overflow-hidden mt-2"
                style={{ background: 'linear-gradient(135deg, #6C63FF, #9B5DFF)' }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <span className="relative z-10">{isLoading ? 'Signing in...' : 'Sign In'}</span>
                {!isLoading && (
                  <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform relative z-10" />
                )}
                <div className="absolute inset-0 bg-gradient-to-r from-[#9B5DFF] to-[#6C63FF] opacity-0 group-hover:opacity-100 transition-opacity" />
              </motion.button>
            </form>

            <div className="mt-6 pt-6 border-t border-[var(--border)]">
              <p className="text-xs text-[var(--text-tertiary)] text-center mb-3">Demo credentials</p>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { role: 'HR Admin', email: 'admin@payflow.com', pass: 'Admin@123' },
                  { role: 'Employee', email: 'john@payflow.com', pass: 'Employee@123' },
                ].map(c => (
                  <div key={c.role} className="p-2.5 rounded-lg border border-[var(--border)] bg-[var(--bg-elevated)]/50">
                    <div className="text-xs font-semibold text-[var(--accent-primary)] mb-1">{c.role}</div>
                    <div className="text-xs text-[var(--text-tertiary)] truncate">{c.email}</div>
                    <div className="text-xs text-[var(--text-tertiary)]">{c.pass}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default LoginPage;
