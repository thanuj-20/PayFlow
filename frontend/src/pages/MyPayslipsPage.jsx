import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FileText, Download, AlertCircle } from 'lucide-react';
import Sidebar from '../components/Sidebar';
import { getMyPayslips } from '../services/api';
import { authStore } from '../store/authStore';

const MyPayslipsPage = () => {
  const [payslips, setPayslips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { employeeId } = authStore();

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await getMyPayslips(employeeId);
        setPayslips(res.data);
      } catch {
        setError('Could not load payslips');
      } finally {
        setLoading(false);
      }
    };
    if (employeeId) fetch();
  }, [employeeId]);

  const formatCurrency = (amount) =>
    new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(amount);

  return (
    <div className="app-layout">
      <Sidebar />
      <main className="main-content">
        <div className="page-header">
          <div>
            <h1 className="page-title">My Payslips</h1>
            <p className="page-subtitle">Your monthly payslip history</p>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-12 text-[var(--text-secondary)]">Loading...</div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center h-64 gap-3">
            <AlertCircle className="w-12 h-12 text-red-500" />
            <p className="text-[var(--text-secondary)]">{error}</p>
          </div>
        ) : payslips.length === 0 ? (
          <div className="card text-center py-12">
            <FileText className="w-12 h-12 mx-auto mb-3 text-[var(--text-tertiary)]" />
            <p className="text-[var(--text-secondary)]">No payslips generated yet</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {payslips.map((ps, index) => (
              <motion.div
                key={ps.id}
                className="card accent-primary"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-lg bg-[var(--glow-violet)] flex items-center justify-center">
                      <FileText className="w-6 h-6 text-[var(--accent-primary)]" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg">{ps.month} {ps.year}</h3>
                      <p className="text-sm text-text-secondary">{ps.designation}</p>
                    </div>
                  </div>
                  <span className="badge badge-success">{ps.status}</span>
                </div>

                <div className="space-y-3 mb-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-text-secondary">Basic Salary</span>
                    <span className="font-mono">{formatCurrency(ps.basicSalary)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-text-secondary">Bonus</span>
                    <span className="font-mono text-green-500">+{formatCurrency(ps.bonus)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-text-secondary">Deductions</span>
                    <span className="font-mono text-red-400">-{formatCurrency(ps.deductions)}</span>
                  </div>
                  <div className="h-px" style={{ background: 'var(--border)' }} />
                  <div className="flex justify-between">
                    <span className="font-semibold">Net Salary</span>
                    <span className="font-mono font-bold text-lg" style={{ color: 'var(--accent-primary)' }}>{formatCurrency(ps.netSalary)}</span>
                  </div>
                </div>

                <button className="btn-secondary w-full flex items-center justify-center gap-2">
                  <Download className="w-4 h-4" /> Download PDF
                </button>
              </motion.div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default MyPayslipsPage;
