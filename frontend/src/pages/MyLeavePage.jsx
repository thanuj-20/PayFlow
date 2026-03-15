import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Calendar, X } from 'lucide-react';
import toast from 'react-hot-toast';
import Sidebar from '../components/Sidebar';
import LeaveCalendar from '../components/LeaveCalendar';
import { getLeaves, applyLeave, getLeaveBalance } from '../services/api';

const MyLeavePage = () => {
  const [leaves, setLeaves] = useState([]);
  const [balance, setBalance] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({ leaveType: 'casual', startDate: '', endDate: '', reason: '' });

  const fetchAll = async () => {
    try {
      const [lRes, bRes] = await Promise.allSettled([getLeaves(), getLeaveBalance()]);
      if (lRes.status === 'fulfilled') setLeaves(lRes.value.data);
      if (bRes.status === 'fulfilled') setBalance(bRes.value.data);
    } catch {
      toast.error('Failed to load leaves');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchAll(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await applyLeave(form);
      toast.success('Leave application submitted');
      setShowForm(false);
      setForm({ leaveType: 'casual', startDate: '', endDate: '', reason: '' });
      fetchAll();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to apply for leave');
    } finally {
      setSubmitting(false);
    }
  };

  const statusBadge = (s) => s === 'approved' ? 'badge-success' : s === 'rejected' ? 'badge-danger' : 'badge-warning';
  const inputClass = "w-full px-4 py-3 bg-[var(--bg-base)] border border-[var(--border)] rounded-lg text-[var(--text-primary)] focus:border-[var(--accent-primary)] transition-all outline-none";

  return (
    <div className="app-layout">
      <Sidebar />
      <main className="main-content">
        <div className="page-header">
          <div>
            <h1 className="page-title">My Leaves</h1>
            <p className="page-subtitle">Apply for leave and track your requests</p>
          </div>
          <button onClick={() => setShowForm(true)} className="btn-primary flex items-center gap-2">
            <Plus size={16} /> Apply for Leave
          </button>
        </div>

        {/* Leave Balance */}
        {balance.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            {balance.map((lb, i) => (
              <motion.div key={lb.type} className="card" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}>
                <p className="text-xs text-[var(--text-secondary)] capitalize mb-1">{lb.type} Leave</p>
                <p className="text-2xl font-bold font-mono" style={{ color: lb.remaining === 0 ? 'var(--accent-danger)' : 'var(--accent-secondary)' }}>
                  {lb.remaining}
                </p>
                <p className="text-xs text-[var(--text-tertiary)]">of {lb.limit} days left</p>
                {lb.limit !== 'Unlimited' && (
                  <div className="mt-2 h-1.5 rounded-full bg-[var(--border)] overflow-hidden">
                    <div className="h-full rounded-full transition-all" style={{
                      width: `${Math.max(0, (lb.remaining / lb.limit) * 100)}%`,
                      background: lb.remaining > 3 ? 'var(--accent-secondary)' : 'var(--accent-danger)'
                    }} />
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Calendar */}
          <motion.div className="card lg:col-span-1" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
            <h2 className="text-base font-semibold mb-4">Leave Calendar</h2>
            <LeaveCalendar leaves={leaves} />
          </motion.div>

          {/* Stats */}
          <div className="lg:col-span-2 space-y-4">
            <div className="grid grid-cols-3 gap-4">
              {[
                { label: 'Total Applied', value: leaves.length, color: 'accent-primary' },
                { label: 'Approved', value: leaves.filter(l => l.status === 'approved').length, color: 'accent-secondary' },
                { label: 'Pending', value: leaves.filter(l => l.status === 'pending').length, color: 'accent-warning' },
              ].map(({ label, value, color }, i) => (
                <motion.div key={label} className={`card ${color}`} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 + i * 0.08 }}>
                  <p className="text-sm text-text-secondary mb-1">{label}</p>
                  <p className="text-3xl font-mono font-bold">{value}</p>
                </motion.div>
              ))}
            </div>

            {/* Recent leaves */}
            {!loading && leaves.length > 0 && (
              <motion.div className="card" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
                <h3 className="text-sm font-semibold mb-3 text-[var(--text-secondary)]">Recent Requests</h3>
                <div className="space-y-2">
                  {leaves.slice(0, 4).map(l => (
                    <div key={l.id} className="flex items-center justify-between py-2 border-b border-[var(--border)] last:border-0">
                      <div>
                        <p className="text-sm font-medium capitalize">{l.leaveType} Leave</p>
                        <p className="text-xs text-[var(--text-secondary)]">{l.startDate} → {l.endDate} ({l.days}d)</p>
                      </div>
                      <span className={`badge ${statusBadge(l.status)}`}>{l.status}</span>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </div>
        </div>

        {/* Full history table */}
        {!loading && leaves.length > 0 && (
          <motion.div className="card" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
            <h2 className="text-base font-semibold mb-4">All Leave Requests</h2>
            <div className="overflow-x-auto">
              <table className="data-table">
                <thead>
                  <tr><th>Type</th><th>From</th><th>To</th><th>Days</th><th>Reason</th><th>Status</th><th>HR Comment</th></tr>
                </thead>
                <tbody>
                  {leaves.map(l => (
                    <tr key={l.id}>
                      <td className="capitalize">{l.leaveType}</td>
                      <td className="font-mono">{l.startDate}</td>
                      <td className="font-mono">{l.endDate}</td>
                      <td className="font-mono">{l.days}</td>
                      <td className="max-w-xs truncate">{l.reason}</td>
                      <td><span className={`badge ${statusBadge(l.status)}`}>{l.status}</span></td>
                      <td className="text-[var(--text-secondary)] text-sm">{l.hrComment || '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>
        )}

        {/* Apply Leave Modal */}
        <AnimatePresence>
          {showForm && (
            <motion.div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <motion.div className="bg-[var(--bg-elevated)] border border-[var(--border)] rounded-2xl p-8 w-full max-w-md"
                initial={{ scale: 0.92, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}>
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold">Apply for Leave</h2>
                  <button onClick={() => setShowForm(false)} className="p-2 rounded-lg hover:bg-[var(--bg-surface)] transition-colors">
                    <X size={20} className="text-[var(--text-secondary)]" />
                  </button>
                </div>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">Leave Type</label>
                    <select value={form.leaveType} onChange={e => setForm(p => ({ ...p, leaveType: e.target.value }))} className={inputClass}>
                      <option value="casual">Casual Leave</option>
                      <option value="sick">Sick Leave</option>
                      <option value="earned">Earned Leave</option>
                      <option value="unpaid">Unpaid Leave</option>
                    </select>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">From</label>
                      <input type="date" value={form.startDate} onChange={e => setForm(p => ({ ...p, startDate: e.target.value }))} className={inputClass} required />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">To</label>
                      <input type="date" value={form.endDate} onChange={e => setForm(p => ({ ...p, endDate: e.target.value }))} className={inputClass} required />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">Reason</label>
                    <textarea value={form.reason} onChange={e => setForm(p => ({ ...p, reason: e.target.value }))} className={`${inputClass} resize-none`} rows={3} required placeholder="Describe your reason..." />
                  </div>
                  <div className="flex gap-3 pt-2">
                    <button type="button" onClick={() => setShowForm(false)} className="flex-1 btn-secondary">Cancel</button>
                    <button type="submit" disabled={submitting} className="flex-1 btn-primary">
                      {submitting ? 'Submitting...' : 'Submit Request'}
                    </button>
                  </div>
                </form>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
};

export default MyLeavePage;
