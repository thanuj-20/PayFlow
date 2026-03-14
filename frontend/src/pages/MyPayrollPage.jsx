import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { DollarSign, TrendingUp, TrendingDown, AlertCircle } from 'lucide-react';
import Sidebar from '../components/Sidebar';
import { getMyPayroll } from '../services/api';
import { authStore } from '../store/authStore';

const MyPayrollPage = () => {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { employeeId } = authStore();

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await getMyPayroll(employeeId);
        setRecords(res.data);
      } catch {
        setError('Could not load payroll data');
      } finally {
        setLoading(false);
      }
    };
    if (employeeId) fetch();
  }, [employeeId]);

  const formatCurrency = (amount) =>
    new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(amount);

  const latest = records[records.length - 1];

  return (
    <div className="app-layout">
      <Sidebar />
      <main className="main-content">
        <div className="page-header">
          <div>
            <h1 className="page-title">My Payroll</h1>
            <p className="page-subtitle">Your salary and earnings history</p>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-12 text-[var(--text-secondary)]">Loading...</div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center h-64 gap-3">
            <AlertCircle className="w-12 h-12 text-red-500" />
            <p className="text-[var(--text-secondary)]">{error}</p>
          </div>
        ) : records.length === 0 ? (
          <div className="card text-center py-12 text-[var(--text-secondary)]">No payroll records found yet</div>
        ) : (
          <>
            <div className="grid grid-cols-3 gap-6 mb-8">
              {[
                { label: 'Basic Salary', value: formatCurrency(latest.basicSalary), icon: DollarSign, cls: 'accent-primary' },
                { label: 'Bonus', value: formatCurrency(latest.bonus), icon: TrendingUp, cls: 'accent-secondary' },
                { label: 'Deductions', value: formatCurrency(latest.deductions), icon: TrendingDown, cls: 'accent-warning' },
              ].map(({ label, value, icon: Icon, cls }, i) => (
                <motion.div key={label} className={`card ${cls}`} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-text-secondary mb-1">{label}</p>
                      <p className="text-2xl font-mono font-bold">{value}</p>
                    </div>
                    <Icon className="w-12 h-12 opacity-20" />
                  </div>
                </motion.div>
              ))}
            </div>

            <motion.div className="card" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
              <h2 className="text-xl font-semibold mb-4">Payroll History</h2>
              <div className="overflow-x-auto">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Period</th>
                      <th>Basic Salary</th>
                      <th>Bonus</th>
                      <th>Deductions</th>
                      <th>Net Salary</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {records.map(r => (
                      <tr key={r.id}>
                        <td className="font-medium">{r.month} {r.year}</td>
                        <td className="font-mono">{formatCurrency(r.basicSalary)}</td>
                        <td className="font-mono text-green-500">+{formatCurrency(r.bonus)}</td>
                        <td className="font-mono text-red-400">-{formatCurrency(r.deductions)}</td>
                        <td className="font-mono font-bold" style={{ color: 'var(--accent-secondary)' }}>{formatCurrency(r.netSalary)}</td>
                        <td><span className="badge badge-success">{r.status}</span></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </motion.div>
          </>
        )}
      </main>
    </div>
  );
};

export default MyPayrollPage;
