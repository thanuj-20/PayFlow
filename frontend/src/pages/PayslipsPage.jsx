import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FileText, Download, ChevronDown, ChevronUp } from 'lucide-react';
import toast from 'react-hot-toast';
import Sidebar from '../components/Sidebar';
import { getAllPayslips, downloadPayslip } from '../services/api';

const formatCurrency = (n) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(n || 0);

const PayslipsPage = () => {
  const [payslips, setPayslips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(null);
  const [expanded, setExpanded] = useState(null);

  useEffect(() => {
    getAllPayslips()
      .then(r => setPayslips(r.data))
      .catch(() => toast.error('Failed to load payslips'))
      .finally(() => setLoading(false));
  }, []);

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

  // Group payslips by employeeId
  const grouped = payslips.reduce((acc, ps) => {
    if (!acc[ps.employeeId]) acc[ps.employeeId] = { employeeId: ps.employeeId, employeeName: ps.employeeName, department: ps.department, designation: ps.designation, payslips: [] };
    acc[ps.employeeId].payslips.push(ps);
    return acc;
  }, {});
  const employees = Object.values(grouped);

  return (
    <div className="app-layout">
      <Sidebar />
      <main className="main-content">
        <div className="page-header">
          <div>
            <h1 className="page-title">Payslips</h1>
            <p className="page-subtitle">View and download individual employee payslips</p>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-16 text-[var(--text-secondary)]">Loading...</div>
        ) : employees.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-96 gap-3">
            <FileText className="w-16 h-16 text-[var(--text-tertiary)]" />
            <p className="text-lg text-[var(--text-secondary)]">No payslips generated yet</p>
            <p className="text-sm text-[var(--text-tertiary)]">Payslips are generated when payroll is approved</p>
          </div>
        ) : (
          <div className="space-y-3">
            {employees.map((emp, i) => (
              <motion.div key={emp.employeeId} className="card" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                {/* Employee row */}
                <button className="w-full flex items-center justify-between" onClick={() => setExpanded(expanded === emp.employeeId ? null : emp.employeeId)}>
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-lg bg-[var(--glow-violet)] flex items-center justify-center">
                      <FileText className="w-5 h-5 text-[var(--accent-primary)]" />
                    </div>
                    <div className="text-left">
                      <p className="font-semibold">{emp.employeeName}</p>
                      <p className="text-sm text-[var(--text-secondary)]">{emp.designation} · {emp.department}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-sm text-[var(--text-secondary)]">{emp.payslips.length} payslip{emp.payslips.length > 1 ? 's' : ''}</span>
                    {expanded === emp.employeeId ? <ChevronUp size={18} className="text-[var(--text-secondary)]" /> : <ChevronDown size={18} className="text-[var(--text-secondary)]" />}
                  </div>
                </button>

                {/* Payslips list */}
                <AnimatePresence>
                  {expanded === emp.employeeId && (
                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                      <div className="mt-4 border-t border-[var(--border)] pt-4 space-y-3">
                        {emp.payslips.sort((a, b) => b.year - a.year || 0).map(ps => (
                          <div key={ps.id} className="flex items-center justify-between p-3 rounded-xl bg-[var(--bg-base)]">
                            <div className="flex items-center gap-6">
                              <div>
                                <p className="text-sm font-semibold">{ps.month} {ps.year}</p>
                                <p className="text-xs text-[var(--text-secondary)]">Generated {new Date(ps.generatedAt).toLocaleDateString('en-IN')}</p>
                              </div>
                              <div className="hidden md:flex items-center gap-6 text-sm">
                                <div>
                                  <p className="text-xs text-[var(--text-secondary)]">Basic</p>
                                  <p className="font-mono">{formatCurrency(ps.basicSalary)}</p>
                                </div>
                                {ps.lopDays > 0 && (
                                  <div>
                                    <p className="text-xs text-[var(--text-secondary)]">Leave Deduction</p>
                                    <p className="font-mono text-red-400">-{formatCurrency(ps.lopDeduction)}</p>
                                  </div>
                                )}
                                <div>
                                  <p className="text-xs text-[var(--text-secondary)]">PF + Tax</p>
                                  <p className="font-mono text-red-400">-{formatCurrency(ps.totalDeductions)}</p>
                                </div>
                                <div>
                                  <p className="text-xs text-[var(--text-secondary)]">Net Salary</p>
                                  <p className="font-mono font-bold" style={{ color: 'var(--accent-primary)' }}>{formatCurrency(ps.basicSalary - (ps.lopDeduction || 0) - (ps.totalDeductions || 0))}</p>
                                </div>
                              </div>
                            </div>
                            <button onClick={() => handleDownload(ps)} disabled={downloading === ps.id}
                              className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm btn-secondary">
                              {downloading === ps.id ? <div className="w-3 h-3 border-2 border-current border-t-transparent rounded-full animate-spin" /> : <Download size={14} />}
                              PDF
                            </button>
                          </div>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default PayslipsPage;
