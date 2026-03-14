import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { Eye, EyeOff, ArrowRight, Key, User } from 'lucide-react';
import { login } from '../services/api';
import { authStore } from '../store/authStore';
import toast from 'react-hot-toast';

const LoginPage = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [shake, setShake] = useState(false);
  const navigate = useNavigate();
  const { register, handleSubmit, setValue } = useForm();

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

  const fillCredentials = (email, password) => {
    setValue('email', email);
    setValue('password', password);
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Panel */}
      <div className="flex-1 flex items-center justify-center p-8 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[var(--accent-primary)]/20 to-[var(--accent-secondary)]/20 rounded-3xl" />
        <div className="relative z-10 text-center">
          <motion.h1
            className="text-6xl font-bold text-[var(--text-primary)] font-['Syne'] mb-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            PayFlow
          </motion.h1>
          <motion.p
            className="text-xl text-[var(--text-secondary)] mb-12"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            Payroll intelligence, reimagined
          </motion.p>

          <div className="grid grid-cols-1 gap-6 max-w-sm mx-auto">
            {[
              { label: '₹24.8L processed', icon: '💰' },
              { label: '98.2% accuracy', icon: '🎯' },
              { label: '10 employees', icon: '👥' },
            ].map((stat, index) => (
              <motion.div
                key={stat.label}
                className={`bg-[var(--bg-surface)]/80 backdrop-blur-sm border border-[var(--border)] rounded-xl p-6 text-center float-${index}`}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: 0.4 + index * 0.1 }}
              >
                <div className="text-2xl mb-2">{stat.icon}</div>
                <div className="text-[var(--text-primary)] font-medium">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Right Panel */}
      <div className="flex-1 flex items-center justify-center p-8">
        <motion.div
          className="w-full max-w-md"
          animate={shake ? { x: [0, -10, 10, -8, 8, 0] } : {}}
          transition={{ duration: 0.4 }}
        >
          <div className="bg-[var(--bg-surface)] border border-[var(--border)] rounded-3xl p-12">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-[var(--text-primary)] font-['Syne'] mb-2">
                Welcome back
              </h2>
              <p className="text-[var(--text-secondary)]">Sign in to your account</p>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <div>
                <input
                  {...register('email', { required: true })}
                  type="email"
                  placeholder="Email address"
                  className="w-full px-4 py-4 bg-[var(--bg-base)] border border-[var(--border)] rounded-xl text-[var(--text-primary)] placeholder-[var(--text-tertiary)] focus:border-[var(--accent-primary)] focus:shadow-[0_0_0_3px_var(--glow-violet)] transition-all text-lg"
                />
              </div>

              <div className="relative">
                <input
                  {...register('password', { required: true })}
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Password"
                  className="w-full px-4 py-4 pr-12 bg-[var(--bg-base)] border border-[var(--border)] rounded-xl text-[var(--text-primary)] placeholder-[var(--text-tertiary)] focus:border-[var(--accent-primary)] focus:shadow-[0_0_0_3px_var(--glow-violet)] transition-all text-lg"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>

              <motion.button
                type="submit"
                disabled={isLoading}
                className="w-full py-4 bg-gradient-to-r from-[var(--accent-primary)] to-[#9B5DFF] rounded-xl text-white font-medium text-lg flex items-center justify-center gap-2 group relative overflow-hidden"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <span className="relative z-10">
                  {isLoading ? 'Signing in...' : 'Sign In'}
                </span>
                {!isLoading && <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />}
                <div className="absolute inset-0 bg-gradient-to-r from-[#9B5DFF] to-[var(--accent-primary)] opacity-0 group-hover:opacity-100 transition-opacity" />
              </motion.button>
            </form>

            <div className="mt-8">
              <p className="text-xs text-[var(--text-tertiary)] text-center mb-4">Demo access</p>
              <div className="flex gap-3">
                <motion.button
                  onClick={() => fillCredentials('admin@payflow.com', 'Admin@123')}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-3 border border-[var(--accent-gold)] rounded-lg text-[var(--accent-gold)] hover:bg-[var(--accent-gold)] hover:text-[var(--bg-base)] transition-colors"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  title="Quick fill for demo"
                >
                  <Key size={16} />
                  HR
                </motion.button>
                <motion.button
                  onClick={() => fillCredentials('john@payflow.com', 'Employee@123')}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-3 border border-[var(--accent-secondary)] rounded-lg text-[var(--accent-secondary)] hover:bg-[var(--accent-secondary)] hover:text-[var(--bg-base)] transition-colors"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  title="Quick fill for demo"
                >
                  <User size={16} />
                  Employee
                </motion.button>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default LoginPage;