import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FileText, Download, AlertCircle, Play } from 'lucide-react';
import toast from 'react-hot-toast';
import Sidebar from '../components/Sidebar';
import { getAllPayslips, runPayroll, downloadPayslip } from '../services/api';

const ShimmerCard = () => (
  <motion.div className="card" style={{ background: 'linear-gradient(90deg, var(--bg-surface), var(--bg-elevated), var(--bg-surface))', backgroundSize: '200% 100%', animation: 'shimmer 1.5s infinite', height: '280px' }} />
);

const ErrorState = ({ message, onRetry }) => (
  <div className="flex flex-col items-center justify-center h-96 gap-4">
    <AlertCircle className="w-16 h-16 text-red-500" />
    <p className="text-lg text-text-secondary">{message}</p>
    <button onClick={onRetry} className="btn-primary">Retry</button>
  </div>
);

const PayslipsPage = () => {
  const [payslips, setPayslips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [processing, setProcessing] = useState(false);
  const [downloading, setDownloading] = useState(null);

  const handleDownload = async (ps) => {
    setDownloading(ps.id);
    try {
      const res = await downloadPayslip(ps.id);
      const url = window.URL.createObjectURL(new Blob([res.data], { type: 'application/pdf' }));
      const a = document.createElement('a');
      a.href = url;
      a.download = `payslip-${ps.employeeName?.replace(/ /g, '-')}-${ps.month}-${ps.year}.pdf`;
      a.click();
      window.URL.revokeObjectURL(url);
      toast.success('Payslip downloaded');
    } catch {
      toast.error('Download failed');
    } finally {
      setDownloading(null);
    }
  };

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await getAllPayslips();
      setPayslips(response.data);
    } catch (err) {
      setError(err.response?.data?.error || 'Could not load payslips');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const handleRunPayroll = async () => {
    try {
      setProcessing(true);
      await runPayroll();
      toast.success('Payroll processed — payslips generated');
      await fetchData();
    } catch {
      toast.error('Failed to process payroll');
    } finally {
      setProcessing(false);
    }
  };

  const formatCurrency = (amount) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(amount);

  return (
    <div className="app-layout">
      <Sidebar />
      <main className="main-content">
        <div className="page-header">
          <div>
            <h1 className="page-title">Payslips</h1>
            <p className="page-subtitle">View and download employee payslips</p>
          </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1,2,3,4,5,6].map(i => <ShimmerCard key={i} />)}
          </div>
        ) : error ? (
          <ErrorState message={error} onRetry={fetchData} />
        ) : payslips.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-96 gap-4">
            <FileText className="w-16 h-16 text-[var(--text-tertiary)]" />
            <p className="text-lg text-[var(--text-secondary)]">No payslips generated yet</p>
            <p className="text-sm text-[var(--text-tertiary)]">Run payroll to generate payslips for all active employees</p>
            <button onClick={handleRunPayroll} disabled={processing} className="btn-primary flex items-center gap-2">
              {processing ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <Play className="w-4 h-4" />}
              {processing ? 'Processing...' : 'Run Payroll Now'}
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {payslips.map((payslip, index) => (
              <motion.div
                key={payslip.id}
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
                      <h3 className="font-semibold text-lg">{payslip.employeeName}</h3>
                      <p className="text-sm text-text-secondary">{payslip.designation}</p>
                    </div>
                  </div>
                  <span className="badge badge-success">{payslip.status}</span>
                </div>

                <div className="space-y-3 mb-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-text-secondary">Department:</span>
                    <span className="font-medium">{payslip.department}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-text-secondary">Period:</span>
                    <span className="font-mono">{payslip.month} {payslip.year}</span>
                  </div>
                  <div className="h-px" style={{ background: 'var(--border)' }} />
                  <div className="flex justify-between text-sm">
                    <span className="text-text-secondary">Basic Salary:</span>
                    <span className="font-mono">{formatCurrency(payslip.basicSalary)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-text-secondary">Bonus:</span>
                    <span className="font-mono text-green-500">+{formatCurrency(payslip.bonus)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-text-secondary">Deductions:</span>
                    <span className="font-mono text-red-500">-{formatCurrency(payslip.deductions)}</span>
                  </div>
                  <div className="h-px" style={{ background: 'var(--border)' }} />
                  <div className="flex justify-between">
                    <span className="font-semibold">Net Salary:</span>
                    <span className="font-mono font-bold text-lg" style={{ color: 'var(--accent-primary)' }}>{formatCurrency(payslip.netSalary)}</span>
                  </div>
                </div>

                <button onClick={() => handleDownload(payslip)} disabled={downloading === payslip.id} className="btn-secondary w-full flex items-center justify-center gap-2">
                  {downloading === payslip.id
                    ? <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                    : <Download className="w-4 h-4" />}
                  {downloading === payslip.id ? 'Downloading...' : 'Download PDF'}
                </button>
              </motion.div>
            ))}
          </div>
        )}
      </main>
      <style>{`@keyframes shimmer { 0% { background-position: 200% 0; } 100% { background-position: -200% 0; } }`}</style>
    </div>
  );
};

export default PayslipsPage;
