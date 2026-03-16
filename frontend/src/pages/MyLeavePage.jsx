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
  const today = new Date(new Date().getTime() - new Date().getTimezoneOffset() * 60000).toISOString().split('T')[0];
  const [form, setForm] = useState({ leaveType: 'casual', startDate: today, endDate: today, reason: '' });

  const calcDays = (start, end) => {
    if (!start || !end) return 0;
    const diff = new Date(end) - new Date(start);
    return diff < 0 ? 0 : Math.floor(diff / (1000 * 60 * 60 * 24)) + 1;
  };

  const LEAVE_LIMITS = { casual: 2, sick: 3, unpaid: 3 };

  const fetchAll = async () => {
    try {
      const [lRes, bRes] = await Promise.allSettled([getLeaves(), getLeaveBalance()]);
      if (lRes.status === 'fulfilled') setLeaves(lRes.value.data);
      if (bRes.status === 'fulfilled') {
        const filtered = bRes.value.data
          .filter(lb => ['casual', 'sick', 'unpaid'].includes(lb.type))
          .map(lb => {
            const limit = LEAVE_LIMITS[lb.type];
            const used = lb.used || 0;
            return {
              ...lb,
              type: lb.type === 'unpaid' ? 'paid' : lb.type,
              limit,
              remaining: Math.max(0, limit - used),
            };
          });
        setBalance(filtered);
      }
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
      await applyLeave({ ...form, days: calcDays(form.startDate, form.endDate) });
      toast.success('Leave application submitted');
      setShowForm(false);
      setForm({ leaveType: 'casual', startDate: today, endDate: today, reason: '' });
      fetchAll();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to apply for leave');
    } finally {
      setSubmitting(false);
    }
  };

  const statusBadge = (s) => s === 'approved' ? 'badge-success' : s === 'rejected' ? 'badge-danger' : 'badge-warning';
  const inputClass = "w-full px-4 py-3 bg-[var(--bg-base)] border border-[var(--border)] rounded-lg text-[var(--text-primary)] focus:border-[var(--accent-primary)] transition-all outline-none";

  const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  const DAYS = ['Su','Mo','Tu','We','Th','Fr','Sa'];
  const todayObj = new Date(today);
  const [calView, setCalView] = useState(new Date(todayObj.getFullYear(), todayObj.getMonth(), 1));

  const isBefore = (a, b) => new Date(a) < new Date(b);
  const inRange = (d) => {
    if (!form.startDate || !form.endDate) return false;
    return new Date(d) > new Date(form.startDate) && new Date(d) < new Date(form.endDate);
  };
  const toDateStr = (y, m, d) => `${y}-${String(m+1).padStart(2,'0')}-${String(d).padStart(2,'0')}`;

  const handleDayClick = (dateStr) => {
    if (isBefore(dateStr, today)) return;
    if (!form.startDate || (form.startDate && form.endDate)) {
      setForm(p => ({ ...p, startDate: dateStr, endDate: '' }));
    } else {
      if (isBefore(dateStr, form.startDate)) {
        setForm(p => ({ ...p, startDate: dateStr, endDate: '' }));
      } else {
        setForm(p => ({ ...p, endDate: dateStr }));
      }
    }
  };

  return (
    <div className="app-layout">
      <Sidebar />
      <main className="main-content">
        <div className="page-header flex-wrap gap-3">
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
                <p className="text-2xl font-bold font-mono" style={{ color: lb.remaining === 0 ? '#ef4444' : lb.remaining < lb.limit / 2 ? '#f59e0b' : '#22c55e' }}>
                  {lb.remaining}
                </p>
                <p className="text-xs text-[var(--text-tertiary)]">of {lb.limit} days left</p>
                {lb.limit !== 'Unlimited' && (
                  <div className="mt-2 h-1.5 rounded-full bg-[var(--border)] overflow-hidden">
                    <div className="h-full rounded-full transition-all" style={{
                      width: `${Math.max(0, (lb.remaining / lb.limit) * 100)}%`,
                      background: lb.remaining === 0 ? '#ef4444' : lb.remaining < lb.limit / 2 ? '#f59e0b' : '#22c55e'
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
              <motion.div className="bg-[var(--bg-elevated)] border border-[var(--border)] rounded-2xl p-6 w-full max-w-lg"
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
                      <option value="unpaid">Paid Leave</option>
                    </select>
                  </div>

                  {/* Inline Calendar */}
                  <div className="rounded-xl border border-[var(--border)] overflow-hidden">
                    {/* Cal header */}
                    <div className="flex items-center justify-between px-4 py-2 bg-[var(--bg-base)]">
                      <button type="button" onClick={() => setCalView(v => new Date(v.getFullYear(), v.getMonth()-1, 1))}
                        className="p-1 rounded hover:bg-[var(--bg-elevated)] text-[var(--text-secondary)]">&lt;</button>
                      <span className="text-sm font-semibold">{MONTHS[calView.getMonth()]} {calView.getFullYear()}</span>
                      <button type="button" onClick={() => setCalView(v => new Date(v.getFullYear(), v.getMonth()+1, 1))}
                        className="p-1 rounded hover:bg-[var(--bg-elevated)] text-[var(--text-secondary)]">&gt;</button>
                    </div>
                    {/* Day headers */}
                    <div className="grid grid-cols-7 bg-[var(--bg-elevated)]">
                      {DAYS.map(d => <div key={d} className="text-center text-xs text-[var(--text-tertiary)] py-1">{d}</div>)}
                    </div>
                    {/* Days grid */}
                    <div className="grid grid-cols-7 bg-[var(--bg-base)] p-1 gap-0.5">
                      {Array.from({ length: new Date(calView.getFullYear(), calView.getMonth(), 1).getDay() }).map((_, i) => <div key={`e${i}`} />)}
                      {Array.from({ length: new Date(calView.getFullYear(), calView.getMonth()+1, 0).getDate() }, (_, i) => i+1).map(day => {
                        const dateStr = toDateStr(calView.getFullYear(), calView.getMonth(), day);
                        const isPast = isBefore(dateStr, today);
                        const isStart = dateStr === form.startDate;
                        const isEnd = dateStr === form.endDate;
                        const isIn = inRange(dateStr);
                        const isToday = dateStr === today;
                        let bg = 'transparent';
                        let color = 'var(--text-primary)';
                        let fontWeight = 'normal';
                        if (isPast) { color = 'var(--text-tertiary)'; }
                        else if (isStart || isEnd) { bg = 'var(--accent-primary)'; color = 'white'; fontWeight = 'bold'; }
                        else if (isIn) { bg = 'var(--glow-violet)'; color = 'var(--accent-primary)'; }
                        return (
                          <button type="button" key={day}
                            onClick={() => !isPast && handleDayClick(dateStr)}
                            style={{ background: bg, color, fontWeight, outline: isToday && !isStart && !isEnd ? '1px solid var(--accent-primary)' : 'none', opacity: isPast ? 0.35 : 1, cursor: isPast ? 'not-allowed' : 'pointer' }}
                            className="text-xs py-1.5 rounded transition-all w-full">
                            {day}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">Reason</label>
                    <textarea value={form.reason} onChange={e => setForm(p => ({ ...p, reason: e.target.value }))} className={`${inputClass} resize-none`} rows={3} required placeholder="Describe your reason..." />
                  </div>
                  <div className="flex gap-3 pt-2">
                    <button type="button" onClick={() => setShowForm(false)} className="flex-1 btn-secondary">Cancel</button>
                    <button type="submit" disabled={submitting || !form.startDate || !form.endDate} className="flex-1 btn-primary">
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
