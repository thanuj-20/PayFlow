import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle, XCircle, Calendar } from 'lucide-react';
import toast from 'react-hot-toast';
import Sidebar from '../components/Sidebar';
import LeaveCalendar from '../components/LeaveCalendar';
import { getLeaves, updateLeaveStatus } from '../services/api';

const DEPARTMENTS = ['Engineering', 'Marketing', 'Sales', 'HR', 'Finance', 'Operations'];

const LeavePage = () => {
  const [leaves, setLeaves] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [deptFilter, setDeptFilter] = useState('');
  const [updating, setUpdating] = useState(null);

  const fetchLeaves = async () => {
    try {
      const params = filter !== 'all' ? { status: filter } : {};
      const res = await getLeaves(params);
      setLeaves(res.data);
    } catch {
      toast.error('Failed to load leaves');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeaves();
    const interval = setInterval(fetchLeaves, 5000);
    return () => clearInterval(interval);
  }, [filter]);

  const handleUpdate = async (id, status) => {
    const hrComment = status === 'rejected' ? window.prompt('Reason for rejection:') : '';
    if (status === 'rejected' && !hrComment) return;
    setUpdating(id);
    try {
      await updateLeaveStatus(id, status, hrComment);
      toast.success(`Leave ${status}`);
      fetchLeaves();
    } catch {
      toast.error('Failed to update leave');
    } finally {
      setUpdating(null);
    }
  };

  const statusBadge = (s) => s === 'approved' ? 'badge-success' : s === 'rejected' ? 'badge-danger' : 'badge-warning';
  const pending = leaves.filter(l => l.status === 'pending').length;
  const filtered = deptFilter ? leaves.filter(l => l.department === deptFilter) : leaves;

  return (
    <div className="app-layout">
      <Sidebar />
      <main className="main-content">
        <div className="page-header">
          <div>
            <h1 className="page-title">Leave Management</h1>
            <p className="page-subtitle">Review and approve employee leave requests</p>
          </div>
          {pending > 0 && (
            <span className="badge badge-warning text-sm px-4 py-2">{pending} pending</span>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Calendar */}
          <motion.div className="card" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <h2 className="text-base font-semibold mb-4">Leave Calendar</h2>
            <LeaveCalendar leaves={leaves.filter(l => l.status === 'approved')} />
          </motion.div>

          {/* Stats */}
          <div className="lg:col-span-2 grid grid-cols-2 gap-4 content-start">
            {[
              { label: 'Total Requests', value: leaves.length, color: 'accent-primary' },
              { label: 'Pending', value: pending, color: 'accent-warning' },
              { label: 'Approved', value: leaves.filter(l => l.status === 'approved').length, color: 'accent-secondary' },
              { label: 'Rejected', value: leaves.filter(l => l.status === 'rejected').length, color: 'accent-danger' },
            ].map(({ label, value, color }, i) => (
              <motion.div key={label} className={`card ${color}`} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}>
                <p className="text-sm text-text-secondary mb-1">{label}</p>
                <p className="text-3xl font-mono font-bold">{value}</p>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-3 mb-6">
          <div className="flex gap-2">
            {['all', 'pending', 'approved', 'rejected'].map(s => (
              <button key={s} onClick={() => setFilter(s)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors capitalize ${filter === s ? 'bg-[var(--accent-primary)] text-white' : 'bg-[var(--bg-elevated)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]'}`}>
                {s}
              </button>
            ))}
          </div>
          <select
            value={deptFilter}
            onChange={e => setDeptFilter(e.target.value)}
            className="px-3 py-2 rounded-lg text-sm bg-[var(--bg-elevated)] border border-[var(--border)] text-[var(--text-primary)]"
          >
            <option value="">All Departments</option>
            {DEPARTMENTS.map(d => <option key={d} value={d}>{d}</option>)}
          </select>
        </div>

        {loading ? (
          <div className="text-center py-12 text-[var(--text-secondary)]">Loading...</div>
        ) : filtered.length === 0 ? (
          <div className="card text-center py-12">
            <Calendar className="w-12 h-12 mx-auto mb-3 text-[var(--text-tertiary)]" />
            <p className="text-[var(--text-secondary)]">No leave requests found</p>
          </div>
        ) : (
          <motion.div className="card" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <div className="overflow-x-auto">
              <table className="data-table">
                <thead>
                  <tr><th>Employee</th><th>Department</th><th>Type</th><th>From</th><th>To</th><th>Days</th><th>Reason</th><th>Status</th><th>Actions</th></tr>
                </thead>
                <tbody>
                  {filtered.map(leave => (
                    <tr key={leave.id}>
                      <td className="font-medium">{leave.employeeName}</td>
                      <td>{leave.department}</td>
                      <td className="capitalize">{leave.leaveType === 'unpaid' ? 'Paid' : leave.leaveType}</td>
                      <td className="font-mono">{leave.startDate}</td>
                      <td className="font-mono">{leave.endDate}</td>
                      <td className="font-mono">{leave.days}</td>
                      <td className="max-w-xs truncate">{leave.reason}</td>
                      <td><span className={`badge ${statusBadge(leave.status)}`}>{leave.status}</span></td>
                      <td>
                        {leave.status === 'pending' && (
                          <div className="flex gap-2">
                            <button onClick={() => handleUpdate(leave.id, 'approved')} disabled={updating === leave.id}
                              className="p-1.5 rounded-lg bg-green-500/20 text-green-400 hover:bg-green-500 hover:text-white transition-colors">
                              <CheckCircle size={14} />
                            </button>
                            <button onClick={() => handleUpdate(leave.id, 'rejected')} disabled={updating === leave.id}
                              className="p-1.5 rounded-lg bg-red-500/20 text-red-400 hover:bg-red-500 hover:text-white transition-colors">
                              <XCircle size={14} />
                            </button>
                          </div>
                        )}
                        {leave.hrComment && <p className="text-xs text-[var(--text-tertiary)] mt-1">{leave.hrComment}</p>}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>
        )}
      </main>
    </div>
  );
};

export default LeavePage;
