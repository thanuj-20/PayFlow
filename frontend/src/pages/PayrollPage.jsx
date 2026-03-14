import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { DollarSign, TrendingUp, TrendingDown, Play, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import Sidebar from '../components/Sidebar';
import { getPayroll, getPayrollSummary, runPayroll } from '../services/api';

const ShimmerCard = () => (
  <motion.div
    className="card"
    style={{
      background: 'linear-gradient(90deg, var(--bg-surface), var(--bg-elevated), var(--bg-surface))',
      backgroundSize: '200% 100%',
      animation: 'shimmer 1.5s infinite',
      height: '120px'
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

const PayrollPage = () => {
  const [records, setRecords] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [processing, setProcessing] = useState(false);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [recordsRes, summaryRes] = await Promise.all([
        getPayroll({ month: 'March', year: 2026 }),
        getPayrollSummary()
      ]);
      setRecords(recordsRes.data);
      setSummary(summaryRes.data);
    } catch (err) {
      setError(err.response?.data?.error || 'Could not load payroll data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleRunPayroll = async () => {
    try {
      setProcessing(true);
      const response = await runPayroll();
      toast.success(`Payroll processed for ${response.data.month} ${response.data.year}`);
      await fetchData();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to process payroll');
    } finally {
      setProcessing(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount);
  };

  return (
    <div className="app-layout">
      <Sidebar />
      <main className="main-content">
        <div className="page-header">
          <div>
            <h1 className="page-title">Payroll Management</h1>
            <p className="page-subtitle">Process and manage employee payroll</p>
          </div>
          <button
            onClick={handleRunPayroll}
            disabled={processing}
            className="btn-primary flex items-center gap-2"
          >
            {processing ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Processing...
              </>
            ) : (
              <>
                <Play className="w-4 h-4" />
                Run Payroll
              </>
            )}
          </button>
        </div>

        {loading ? (
          <>
            <div className="grid grid-cols-3 gap-6 mb-8">
              {[1, 2, 3].map(i => <ShimmerCard key={i} />)}
            </div>
            <ShimmerCard style={{ height: '400px' }} />
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
                    <p className="text-sm text-text-secondary mb-1">Gross Payroll</p>
                    <p className="text-2xl font-mono font-bold">{formatCurrency(summary?.totalGross || 0)}</p>
                  </div>
                  <DollarSign className="w-12 h-12 opacity-20" />
                </div>
              </motion.div>

              <motion.div
                className="card accent-secondary"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-text-secondary mb-1">Total Bonuses</p>
                    <p className="text-2xl font-mono font-bold">{formatCurrency(summary?.totalBonus || 0)}</p>
                  </div>
                  <TrendingUp className="w-12 h-12 opacity-20" />
                </div>
              </motion.div>

              <motion.div
                className="card accent-warning"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-text-secondary mb-1">Total Deductions</p>
                    <p className="text-2xl font-mono font-bold">{formatCurrency(summary?.totalDeductions || 0)}</p>
                  </div>
                  <TrendingDown className="w-12 h-12 opacity-20" />
                </div>
              </motion.div>
            </div>

            <motion.div
              className="card"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <h2 className="text-xl font-semibold mb-4">Payroll Records - {summary?.month} {summary?.year}</h2>
              <div className="overflow-x-auto">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Employee</th>
                      <th>Department</th>
                      <th>Designation</th>
                      <th>Basic Salary</th>
                      <th>Bonus</th>
                      <th>Deductions</th>
                      <th>Net Salary</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {records.map((record) => (
                      <tr key={record.id}>
                        <td className="font-medium">{record.employeeName}</td>
                        <td>{record.department}</td>
                        <td>{record.designation}</td>
                        <td className="font-mono">{formatCurrency(record.basicSalary)}</td>
                        <td className="font-mono text-green-500">{formatCurrency(record.bonus)}</td>
                        <td className="font-mono text-red-500">{formatCurrency(record.deductions)}</td>
                        <td className="font-mono font-bold">{formatCurrency(record.netSalary)}</td>
                        <td>
                          <span className="badge badge-success">{record.status}</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </motion.div>
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

export default PayrollPage;
