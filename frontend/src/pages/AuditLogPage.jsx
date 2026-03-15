import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Shield, AlertCircle } from 'lucide-react';
import Sidebar from '../components/Sidebar';
import { getAuditLog } from '../services/api';

const AuditLogPage = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    getAuditLog()
      .then(res => setLogs(res.data))
      .catch(() => setError('Failed to load audit log'))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="app-layout">
      <Sidebar />
      <main className="main-content">
        <div className="page-header">
          <div>
            <h1 className="page-title">Audit Log</h1>
            <p className="page-subtitle">Track all employee record changes</p>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-12 text-[var(--text-secondary)]">Loading...</div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center h-64 gap-3">
            <AlertCircle className="w-12 h-12 text-red-500" />
            <p className="text-[var(--text-secondary)]">{error}</p>
          </div>
        ) : logs.length === 0 ? (
          <div className="card text-center py-12">
            <Shield className="w-12 h-12 mx-auto mb-3 text-[var(--text-tertiary)]" />
            <p className="text-[var(--text-secondary)]">No audit entries yet</p>
          </div>
        ) : (
          <motion.div className="card" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <div className="overflow-x-auto">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Employee</th>
                    <th>Department</th>
                    <th>Changed By</th>
                    <th>Reason</th>
                    <th>Date & Time</th>
                  </tr>
                </thead>
                <tbody>
                  {logs.map((log, i) => (
                    <tr key={i}>
                      <td className="font-medium">{log.employeeName}</td>
                      <td className="text-[var(--text-secondary)]">{log.department}</td>
                      <td className="font-mono text-xs">{log.changedBy}</td>
                      <td className="max-w-xs">{log.reason}</td>
                      <td className="font-mono text-xs text-[var(--text-secondary)]">
                        {new Date(log.changedAt).toLocaleString('en-IN')}
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

export default AuditLogPage;
