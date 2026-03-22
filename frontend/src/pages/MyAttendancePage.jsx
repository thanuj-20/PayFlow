import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { UserCheck, Clock, AlertCircle, LogIn, LogOut } from 'lucide-react';
import Sidebar from '../components/Sidebar';
import { getAttendance, checkIn, checkOut } from '../services/api';
import { authStore } from '../store/authStore';
import toast from 'react-hot-toast';

const MyAttendancePage = () => {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState(null);
  const [now, setNow] = useState(new Date());
  const { employeeId } = authStore();

  // Live clock
  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const today = now.toISOString().split('T')[0];
  const todayRecord = records.find(r => r.date === today);

  const fetchRecords = useCallback(async () => {
    try {
      const res = await getAttendance({ employeeId });
      setRecords(res.data);
    } catch {
      setError('Could not load attendance');
    } finally {
      setLoading(false);
    }
  }, [employeeId]);

  useEffect(() => {
    if (employeeId) {
      fetchRecords();
      const interval = setInterval(fetchRecords, 5000);
      return () => clearInterval(interval);
    }
  }, [employeeId, fetchRecords]);

  const handleCheckIn = async () => {
    setActionLoading(true);
    try {
      await checkIn();
      toast.success('Checked in successfully!');
      fetchRecords();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Check-in failed');
    } finally {
      setActionLoading(false);
    }
  };

  const handleCheckOut = async () => {
    setActionLoading(true);
    try {
      await checkOut();
      toast.success('Checked out successfully!');
      fetchRecords();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Check-out failed');
    } finally {
      setActionLoading(false);
    }
  };

  const present = records.filter(r => r.status === 'present').length;
  const late = records.filter(r => r.status === 'late').length;
  const absent = records.filter(r => r.status === 'absent').length;

  const statusColor = (status) => {
    if (status === 'present') return 'badge-success';
    if (status === 'late') return 'badge-warning';
    return 'badge-danger';
  };

  const timeStr = now.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  const dateStr = now.toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

  return (
    <div className="app-layout">
      <Sidebar />
      <main className="main-content">
        <div className="page-header">
          <div>
            <h1 className="page-title">My Attendance</h1>
            <p className="page-subtitle">Your attendance records</p>
          </div>
        </div>

        {/* Today's Check-in Card */}
        <motion.div
          className="card mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          style={{ borderColor: 'var(--accent-primary)', borderWidth: '1px' }}
        >
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <p className="text-sm text-[var(--text-secondary)] mb-1">{dateStr}</p>
              <p className="text-4xl font-mono font-bold" style={{ color: 'var(--accent-primary)' }}>{timeStr}</p>
              {todayRecord ? (
                <div className="flex gap-4 mt-2 text-sm text-[var(--text-secondary)]">
                  <span>In: <span className="font-mono text-[var(--text-primary)]">{todayRecord.checkIn}</span></span>
                  {todayRecord.checkOut && (
                    <span>Out: <span className="font-mono text-[var(--text-primary)]">{todayRecord.checkOut}</span></span>
                  )}
                  <span className={`badge ${statusColor(todayRecord.status)}`}>{todayRecord.status}</span>
                </div>
              ) : (
                <p className="text-sm text-[var(--text-secondary)] mt-2">Not checked in yet today</p>
              )}
            </div>

            <div className="flex gap-3">
              {!todayRecord && (
                <button onClick={handleCheckIn} disabled={actionLoading} className="btn-primary flex items-center gap-2">
                  <LogIn size={16} />
                  {actionLoading ? 'Checking in...' : 'Check In'}
                </button>
              )}
              {todayRecord && !todayRecord.checkOut && (
                <button
                  onClick={handleCheckOut} disabled={actionLoading}
                  className="btn-primary flex items-center gap-2"
                  style={{ background: 'var(--accent-warning)' }}
                >
                  <LogOut size={16} />
                  {actionLoading ? 'Checking out...' : 'Check Out'}
                </button>
              )}
              {todayRecord?.checkOut && (
                <div className="flex items-center gap-2 text-sm" style={{ color: 'var(--accent-secondary)' }}>
                  <UserCheck size={16} /> Completed for today
                </div>
              )}
            </div>
          </div>
        </motion.div>

        {loading ? (
          <div className="text-center py-12 text-[var(--text-secondary)]">Loading...</div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center h-64 gap-3">
            <AlertCircle className="w-12 h-12 text-red-500" />
            <p className="text-[var(--text-secondary)]">{error}</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              {[
                { label: 'Present', value: present, icon: UserCheck, cls: 'accent-secondary' },
                { label: 'Late', value: late, icon: Clock, cls: 'accent-warning' },
                { label: 'Absent', value: absent, icon: AlertCircle, cls: 'accent-danger' },
              ].map(({ label, value, icon: Icon, cls }, i) => (
                <motion.div key={label} className={`card ${cls}`} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-text-secondary mb-1">{label}</p>
                      <p className="text-3xl font-mono font-bold">{value}</p>
                    </div>
                    <Icon className="w-12 h-12 opacity-20" />
                  </div>
                </motion.div>
              ))}
            </div>

            {records.length === 0 ? (
              <div className="card text-center py-12 text-[var(--text-secondary)]">No attendance records found</div>
            ) : (
              <motion.div className="card" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
                <div className="overflow-x-auto">
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>Date</th>
                        <th>Check In</th>
                        <th>Check Out</th>
                        <th>Overtime</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {records.map(r => (
                        <tr key={r.id}>
                          <td className="font-mono">{r.date}</td>
                          <td className="font-mono">{r.checkIn || '—'}</td>
                          <td className="font-mono">{r.checkOut || '—'}</td>
                          <td className="font-mono">{r.overtimeHours > 0 ? `${r.overtimeHours}h` : '—'}</td>
                          <td><span className={`badge ${statusColor(r.status)}`}>{r.status}</span></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </motion.div>
            )}
          </>
        )}
      </main>
    </div>
  );
};

export default MyAttendancePage;
