import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Users, Clock, AlertCircle, UserCheck } from 'lucide-react';
import Sidebar from '../components/Sidebar';
import { getAttendance, getAttendanceSummary } from '../services/api';

const ShimmerCard = () => (
  <motion.div
    className="card"
    style={{
      background: 'linear-gradient(90deg, var(--bg-surface), var(--bg-elevated), var(--bg-surface))',
      backgroundSize: '200% 100%',
      animation: 'shimmer 1.5s infinite',
      height: '180px'
    }}
  />
);

const ErrorState = ({ message, onRetry }) => (
  <div className="flex flex-col items-center justify-center h-96 gap-4">
    <AlertCircle className="w-16 h-16 text-red-500" />
    <p className="text-lg text-text-secondary">{message}</p>
    <button onClick={onRetry} className="btn-primary">
      Retry
    </button>
  </div>
);

const AttendancePage = () => {
  const [records, setRecords] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [recordsRes, summaryRes] = await Promise.all([
        getAttendance(),
        getAttendanceSummary()
      ]);
      setRecords(recordsRes.data);
      setSummary(summaryRes.data);
    } catch (err) {
      setError(err.response?.data?.error || 'Could not load attendance data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const getStatusColor = (status) => {
    switch (status) {
      case 'present': return 'accent-primary';
      case 'late': return 'accent-warning';
      case 'absent': return 'accent-danger';
      default: return 'accent-secondary';
    }
  };

  return (
    <div className="app-layout">
      <Sidebar />
      <main className="main-content">
        <div className="page-header">
          <div>
            <h1 className="page-title">Attendance Tracking</h1>
            <p className="page-subtitle">Monitor daily employee attendance</p>
          </div>
        </div>

        {loading ? (
          <>
            <div className="grid grid-cols-3 gap-6 mb-8">
              {[1, 2, 3].map(i => <ShimmerCard key={i} />)}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(i => <ShimmerCard key={i} />)}
            </div>
          </>
        ) : error ? (
          <ErrorState message={error} onRetry={fetchData} />
        ) : (
          <>
            <div className="grid grid-cols-3 gap-6 mb-8">
              <motion.div
                className="card accent-primary"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-text-secondary mb-1">Present</p>
                    <p className="text-3xl font-mono font-bold">{summary?.present || 0}</p>
                  </div>
                  <UserCheck className="w-12 h-12 opacity-20" />
                </div>
              </motion.div>

              <motion.div
                className="card accent-warning"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-text-secondary mb-1">Late</p>
                    <p className="text-3xl font-mono font-bold">{summary?.late || 0}</p>
                  </div>
                  <Clock className="w-12 h-12 opacity-20" />
                </div>
              </motion.div>

              <motion.div
                className="card accent-danger"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-text-secondary mb-1">Absent</p>
                    <p className="text-3xl font-mono font-bold">{summary?.absent || 0}</p>
                  </div>
                  <AlertCircle className="w-12 h-12 opacity-20" />
                </div>
              </motion.div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {records.map((record, index) => (
                <motion.div
                  key={record.id}
                  className={`card ${getStatusColor(record.status)}`}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="font-semibold text-lg">{record.employeeName}</h3>
                      <p className="text-sm text-text-secondary">{record.department}</p>
                    </div>
                    <span className={`badge badge-${record.status === 'present' ? 'success' : record.status === 'late' ? 'warning' : 'danger'}`}>
                      {record.status}
                    </span>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-text-secondary">Check In:</span>
                      <span className="font-mono">{record.checkIn || '—'}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-text-secondary">Check Out:</span>
                      <span className="font-mono">{record.checkOut || '—'}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-text-secondary">Date:</span>
                      <span className="font-mono">{record.date}</span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </>
        )}
      </main>

      <style>{`
        @keyframes shimmer {
          0% { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }
      `}</style>
    </div>
  );
};

export default AttendancePage;
