import { useState } from 'react';
import { motion } from 'framer-motion';
import { Lock, Eye, EyeOff, CheckCircle } from 'lucide-react';
import Sidebar from '../components/Sidebar';
import { changePassword } from '../services/api';
import toast from 'react-hot-toast';

const ChangePasswordPage = () => {
  const [form, setForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [show, setShow] = useState({ current: false, new: false, confirm: false });
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  const inputClass = "w-full px-4 py-3 rounded-lg text-sm pr-10"
    + " bg-[var(--bg-elevated)] border border-[var(--border)] text-[var(--text-primary)]"
    + " focus:border-[var(--accent-primary)] focus:outline-none transition-colors";

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.newPassword !== form.confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }
    if (form.newPassword.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }
    setLoading(true);
    try {
      await changePassword(form.currentPassword, form.newPassword);
      toast.success('Password changed successfully');
      setDone(true);
      setForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to change password');
    } finally {
      setLoading(false);
    }
  };

  const PasswordInput = ({ field, label, showKey }) => (
    <div>
      <label className="block text-sm text-[var(--text-secondary)] mb-1">{label}</label>
      <div className="relative">
        <input
          type={show[showKey] ? 'text' : 'password'}
          value={form[field]}
          onChange={e => setForm(f => ({ ...f, [field]: e.target.value }))}
          className={inputClass}
          required
        />
        <button
          type="button"
          onClick={() => setShow(s => ({ ...s, [showKey]: !s[showKey] }))}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-secondary)]"
        >
          {show[showKey] ? <EyeOff size={16} /> : <Eye size={16} />}
        </button>
      </div>
    </div>
  );

  return (
    <div className="app-layout">
      <Sidebar />
      <main className="main-content">
        <div className="page-header">
          <div>
            <h1 className="page-title">Change Password</h1>
            <p className="page-subtitle">Update your account password</p>
          </div>
        </div>

        <div className="max-w-md">
          <motion.div className="card" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            {done && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex items-center gap-3 p-3 rounded-lg mb-4"
                style={{ background: 'var(--glow-teal)', border: '1px solid var(--accent-secondary)' }}
              >
                <CheckCircle size={18} className="text-[var(--accent-secondary)]" />
                <span className="text-sm text-[var(--accent-secondary)]">Password updated successfully!</span>
              </motion.div>
            )}

            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-xl bg-[var(--glow-violet)] flex items-center justify-center">
                <Lock size={22} className="text-[var(--accent-primary)]" />
              </div>
              <div>
                <p className="font-semibold">Security Settings</p>
                <p className="text-xs text-[var(--text-secondary)]">Choose a strong password</p>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <PasswordInput field="currentPassword" label="Current Password" showKey="current" />
              <PasswordInput field="newPassword" label="New Password" showKey="new" />
              <PasswordInput field="confirmPassword" label="Confirm New Password" showKey="confirm" />

              {/* Strength hints */}
              {form.newPassword && (
                <div className="space-y-1">
                  {[
                    { label: 'At least 6 characters', ok: form.newPassword.length >= 6 },
                    { label: 'Contains a number', ok: /\d/.test(form.newPassword) },
                    { label: 'Contains uppercase', ok: /[A-Z]/.test(form.newPassword) },
                  ].map(({ label, ok }) => (
                    <div key={label} className="flex items-center gap-2 text-xs">
                      <div className={`w-1.5 h-1.5 rounded-full ${ok ? 'bg-green-400' : 'bg-[var(--text-tertiary)]'}`} />
                      <span className={ok ? 'text-green-400' : 'text-[var(--text-tertiary)]'}>{label}</span>
                    </div>
                  ))}
                </div>
              )}

              <button type="submit" disabled={loading} className="btn-primary w-full justify-center mt-2">
                {loading ? 'Updating...' : 'Update Password'}
              </button>
            </form>
          </motion.div>
        </div>
      </main>
    </div>
  );
};

export default ChangePasswordPage;
