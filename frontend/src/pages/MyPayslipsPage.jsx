import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FileText, Download } from 'lucide-react';
import Sidebar from '../components/Sidebar';
import { getMyPayslips, downloadPayslip } from '../services/api';
import { authStore } from '../store/authStore';
import toast from 'react-hot-toast';

const MyPayslipsPage = () => {
  const [payslips, setPayslips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(null);
  const { employeeId } = authStore();

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await getMyPayslips(employeeId);
        setPayslips(res.data);
      } catch {
        toast.error('Could not load payslips');
      } finally {
        setLoading(false);
      }
    };
    if (employeeId) fetch();
  }, [employeeId]);

  const handleDownload = async (ps) => {
    setDownloading(ps.id);
    try {
      const res = await downloadPayslip(ps.id);
      const url = window.URL.createObjectURL(new Blob([res.data], { type: 'application/pdf' }));
      const a = document.createElement('a');
      a.href = url;
      a.download = `payslip-${ps.month}-${ps.year}.pdf`;
      a.click();
      window.URL.revokeObjectURL(url);
      toast.success('Payslip downloaded');
    } catch {
      toast.error('Download failed');
    } finally {
      setDownloading(null);
    }
  };

  const fmt = (n) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(n || 0);

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
                      <p className="text-sm text-[var(--text-secondary)]">{ps.designation}</p>
                    </div>
                  </div>
                  <span className="badge badge-success">{ps.status}</span>
                </div>

                <div className="space-y-2 mb-4 text-sm">
                  <div className="flex justify-between">
                    <span className="text-[var(--text-secondary)]">Basic</span>
                    <span className="font-mono">{fmt(ps.basicSalary)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[var(--text-secondary)]">HRA</span>
                    <span className="font-mono text-green-500">+{fmt(ps.hra)}</span>
                  </div>
                  {ps.overtimePay > 0 && (
                    <div className="flex justify-between">
                      <span className="text-[var(--text-secondary)]">Overtime</span>
                      <span className="font-mono text-green-500">+{fmt(ps.overtimePay)}</span>
                    </div>
                  )}
                  {ps.lopDays > 0 && (
                    <div className="flex justify-between">
                      <span className="text-[var(--text-secondary)]">LOP ({ps.lopDays}d)</span>
                      <span className="font-mono text-red-400">-{fmt(ps.lopDeduction)}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-[var(--text-secondary)]">PF + Prof Tax</span>
                    <span className="font-mono text-red-400">-{fmt(ps.totalDeductions)}</span>
                  </div>
                  <div className="h-px" style={{ background: 'var(--border)' }} />
                  <div className="flex justify-between font-semibold">
                    <span>Net Salary</span>
                    <span className="font-mono text-lg" style={{ color: 'var(--accent-primary)' }}>{fmt(ps.netSalary)}</span>
                  </div>
                </div>

                <button
                  onClick={() => handleDownload(ps)}
                  disabled={downloading === ps.id}
                  className="btn-secondary w-full flex items-center justify-center gap-2"
                >
                  {downloading === ps.id
                    ? <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                    : <Download className="w-4 h-4" />}
                  {downloading === ps.id ? 'Downloading...' : 'Download PDF'}
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
