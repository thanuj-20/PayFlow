import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle, XCircle, Calendar, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import Sidebar from '../components/Sidebar';
import { getLeaves, updateLeaveStatus } from '../services/api';

const LeavePage = () => {
  const [leaves, setLeaves] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [updating, setUpdating] = useState(null);

  const fetchLeaves = async () => {
    try {
      const res = await getLeaves(filter !== 'all' ? { status: filter } : {});
      setLeaves(res.data);
    } catch {
      toast.error('Failed to load leaves');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchLeaves(); }, [filter]);

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
            <span className="badge badge-warning text-sm px-4 py-2">{pending} pending request{pending > 1 ? 's' : ''}</span>
          )}
        </div>

        <div className="flex gap-2 mb-6">
          {['all', 'pending', 'approved', 'rejected'].map(s => (
            <button key={s} onClick={() => setFilter(s)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors capitalize ${filter === s ? 'bg-[var(--accent-primary)] text-white' : 'bg-[var(--bg-elevated)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]'}`}>
              {s}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="text-center py-12 text-[var(--text-secondary)]">Loading...</div>
        ) : leaves.length === 0 ? (
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
                  {leaves.map(leave => (
                    <tr key={leave.id}>
                      <td className="font-medium">{leave.employeeName}</td>
                      <td>{leave.department}</td>
                      <td>{leave.leaveType}</td>
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
