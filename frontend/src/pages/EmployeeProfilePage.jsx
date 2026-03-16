import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, Calendar, Building, TrendingUp, TrendingDown, FileText, Clock, UserCheck, AlertCircle, Download, Copy, Printer } from 'lucide-react';
import Sidebar from '../components/Sidebar';
import { getEmployee, getMyPayslips, getMyPayroll, getAttendance, downloadPayslip } from '../services/api';
import { authStore } from '../store/authStore';
import toast from 'react-hot-toast';

const fmt = (n) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(n || 0);

// Mini bar chart for salary history
const SalaryChart = ({ payslips }) => {
  if (payslips.length === 0) return <p className="text-sm text-[var(--text-secondary)]">No salary history yet</p>;
  const sorted = [...payslips].sort((a, b) => a.year - b.year || 0);
  const max = Math.max(...sorted.map(p => p.netSalary));
  return (
    <div className="space-y-3">
      {sorted.map((ps, i) => (
        <div key={ps.id}>
          <div className="flex justify-between text-xs mb-1">
            <span className="text-[var(--text-secondary)]">{ps.month.slice(0, 3)} {ps.year}</span>
            <span className="font-mono font-semibold" style={{ color: 'var(--accent-secondary)' }}>{fmt(ps.netSalary)}</span>
          </div>
          <div className="h-6 rounded-lg overflow-hidden" style={{ background: 'var(--bg-elevated)' }}>
            <motion.div
              className="h-full rounded-lg flex items-center justify-end px-2"
              style={{ background: 'linear-gradient(90deg, var(--accent-primary), var(--accent-secondary))' }}
              initial={{ width: 0 }}
              animate={{ width: `${(ps.netSalary / max) * 100}%` }}
              transition={{ duration: 0.6, delay: i * 0.08 }}
            >
              {ps.netSalary / max > 0.3 && (
                <span className="text-xs text-white font-mono">{fmt(ps.netSalary)}</span>
              )}
            </motion.div>
          </div>
        </div>
      ))}
    </div>
  );
};

const EmployeeProfilePage = () => {
  const [employee, setEmployee] = useState(null);
  const [payslips, setPayslips] = useState([]);
  const [payroll, setPayroll] = useState([]);
  const [attendance, setAttendance] = useState([]);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(null);
  const { employeeId } = authStore();

  useEffect(() => {
    if (!employeeId) return;
    const fetchAll = async () => {
      try {
        const empRes = await getEmployee(employeeId);
        setEmployee(empRes.data);
      } catch {
        toast.error('Failed to load profile');
        setLoading(false);
        return;
      }
      const [payslipRes, payrollRes, attendanceRes] = await Promise.allSettled([
        getMyPayslips(employeeId),
        getMyPayroll(employeeId),
        getAttendance({ employeeId }),
      ]);
      if (payslipRes.status === 'fulfilled') setPayslips(payslipRes.value.data);
      if (payrollRes.status === 'fulfilled') setPayroll(payrollRes.value.data);
      if (attendanceRes.status === 'fulfilled') setAttendance(attendanceRes.value.data);
      setLoading(false);
    };
    fetchAll();
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

  if (loading) return (
    <div className="min-h-screen bg-[var(--bg-base)]">
      <Sidebar />
      <div className="md:ml-60 page-content pt-16 md:pt-0 p-8 text-center py-12 text-[var(--text-secondary)]">Loading profile...</div>
    </div>
  );

  if (!employee) return (
    <div className="min-h-screen bg-[var(--bg-base)]">
      <Sidebar />
      <div className="md:ml-60 page-content pt-16 md:pt-0 p-8 text-center py-12 text-[var(--text-secondary)]">Profile not found</div>
    </div>
  );

  const initials = `${employee.firstName[0]}${employee.lastName[0]}`.toUpperCase();
  const presentDays = attendance.filter(a => a.status === 'present').length;
  const lateDays = attendance.filter(a => a.status === 'late').length;
  const absentDays = attendance.filter(a => a.status === 'absent').length;
  const latestPayroll = payroll[payroll.length - 1];

  return (
    <div className="min-h-screen bg-[var(--bg-base)]">
      <Sidebar />
      <div className="md:ml-60 page-content pt-16 md:pt-0">
        <motion.div
          className="p-8"
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
        >
          <div className="max-w-5xl mx-auto space-y-6">

            {/* Hero Card */}
            <motion.div
              className="bg-[var(--bg-surface)] border border-[var(--border)] rounded-2xl p-8"
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            >
              <div className="flex items-center gap-6">
                <div className="w-24 h-24 bg-gradient-to-br from-[var(--accent-primary)] to-[#9B5DFF] rounded-full flex items-center justify-center text-3xl font-bold text-white flex-shrink-0">
                  {initials}
                </div>
                <div className="flex-1">
                  <h1 className="text-3xl font-bold text-[var(--text-primary)] mb-2">
                    {employee.firstName} {employee.lastName}
                  </h1>
                  <div className="flex items-center gap-3 flex-wrap">
                    <span className="px-3 py-1 bg-[var(--bg-elevated)] rounded-full text-sm text-[var(--text-secondary)]">{employee.designation}</span>
                    <span className="px-3 py-1 bg-[var(--bg-elevated)] rounded-full text-sm text-[var(--text-secondary)]">{employee.department}</span>
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${employee.status === 'active' ? 'bg-[var(--glow-teal)] text-[var(--accent-secondary)]' : 'bg-red-500/20 text-red-400'}`}>
                      {employee.status}
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm text-[var(--text-secondary)] mb-1">Employee ID</p>
                  <div className="flex items-center gap-2 justify-end">
                    <p className="font-mono text-[var(--accent-primary)] font-bold">{employee.id}</p>
                    <button
                      onClick={() => { navigator.clipboard.writeText(employee.id); toast.success('Employee ID copied'); }}
                      className="p-1 rounded text-[var(--text-tertiary)] hover:text-[var(--accent-primary)] transition-colors"
                      title="Copy ID"
                    >
                      <Copy size={14} />
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Info Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <motion.div
                className="bg-[var(--bg-surface)] border border-[var(--border)] rounded-xl p-6"
                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
              >
                <h3 className="text-lg font-bold text-[var(--text-primary)] mb-4">Contact Information</h3>
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <Mail size={20} className="text-[var(--accent-primary)]" />
                    <div>
                      <div className="text-xs text-[var(--text-secondary)]">Email</div>
                      <div className="text-[var(--text-primary)]">{employee.email}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Calendar size={20} className="text-[var(--accent-secondary)]" />
                    <div>
                      <div className="text-xs text-[var(--text-secondary)]">Joining Date</div>
                      <div className="text-[var(--text-primary)]">
                        {new Date(employee.joiningDate || employee.createdAt).toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' })}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Building size={20} className="text-[var(--accent-primary)]" />
                    <div>
                      <div className="text-xs text-[var(--text-secondary)]">Department</div>
                      <div className="text-[var(--text-primary)]">{employee.department}</div>
                    </div>
                  </div>
                </div>
              </motion.div>

              <motion.div
                className="bg-[var(--bg-surface)] border border-[var(--border)] rounded-xl p-6"
                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
              >
                <h3 className="text-lg font-bold text-[var(--text-primary)] mb-4">Salary Breakdown</h3>
                {latestPayroll ? (
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-[var(--text-secondary)]">Basic Salary</span>
                      <span className="font-mono font-bold text-[var(--text-primary)]">{fmt(latestPayroll.basicSalary)}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-[var(--text-secondary)]">HRA</span>
                      <span className="font-mono text-green-500">+{fmt(latestPayroll.hra)}</span>
                    </div>
                    {latestPayroll.overtimePay > 0 && (
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-[var(--text-secondary)] flex items-center gap-1"><TrendingUp size={14} className="text-green-500" /> Overtime</span>
                        <span className="font-mono text-green-500">+{fmt(latestPayroll.overtimePay)}</span>
                      </div>
                    )}
                    {latestPayroll.lopDays > 0 && (
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-[var(--text-secondary)]">LOP ({latestPayroll.lopDays} days)</span>
                        <span className="font-mono text-red-400">-{fmt(latestPayroll.lopDeduction)}</span>
                      </div>
                    )}
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-[var(--text-secondary)] flex items-center gap-1"><TrendingDown size={14} className="text-red-400" /> PF + Prof Tax</span>
                      <span className="font-mono text-red-400">-{fmt(latestPayroll.totalDeductions)}</span>
                    </div>
                    <div className="h-px" style={{ background: 'var(--border)' }} />
                    <div className="flex justify-between items-center">
                      <span className="font-semibold text-[var(--text-primary)]">Net Salary</span>
                      <span className="font-mono font-bold text-xl" style={{ color: 'var(--accent-secondary)' }}>{fmt(latestPayroll.netSalary)}</span>
                    </div>
                    <p className="text-xs text-[var(--text-tertiary)]">Last processed: {latestPayroll.month} {latestPayroll.year}</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-[var(--text-secondary)]">Basic Salary</span>
                      <span className="font-mono font-bold text-xl" style={{ color: 'var(--accent-secondary)' }}>{fmt(employee.basicSalary)}</span>
                    </div>
                    <p className="text-xs text-[var(--text-tertiary)]">Payroll not yet processed</p>
                  </div>
                )}
              </motion.div>
            </div>

            {/* Attendance Summary */}
            <motion.div
              className="bg-[var(--bg-surface)] border border-[var(--border)] rounded-xl p-6"
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
            >
              <h3 className="text-lg font-bold text-[var(--text-primary)] mb-4">Attendance Summary</h3>
              {attendance.length === 0 ? (
                <p className="text-[var(--text-secondary)] text-sm">No attendance records found</p>
              ) : (
                <>
                  <div className="grid grid-cols-3 gap-4 mb-4">
                    {[
                      { label: 'Present', value: presentDays, icon: UserCheck, color: 'var(--accent-secondary)' },
                      { label: 'Late', value: lateDays, icon: Clock, color: 'var(--accent-gold)' },
                      { label: 'Absent', value: absentDays, icon: AlertCircle, color: 'var(--accent-danger)' },
                    ].map(({ label, value, icon: Icon, color }) => (
                      <div key={label} className="bg-[var(--bg-elevated)] rounded-xl p-4 text-center">
                        <Icon size={24} className="mx-auto mb-2" style={{ color }} />
                        <p className="text-2xl font-bold text-[var(--text-primary)]">{value}</p>
                        <p className="text-sm text-[var(--text-secondary)]">{label}</p>
                      </div>
                    ))}
                  </div>
                  {/* Attendance rate */}
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-[var(--text-secondary)]">Attendance Rate</span>
                      <span className="font-semibold" style={{ color: 'var(--accent-secondary)' }}>
                        {Math.round(((presentDays + lateDays) / attendance.length) * 100)}%
                      </span>
                    </div>
                    <div className="h-2 rounded-full overflow-hidden" style={{ background: 'var(--bg-elevated)' }}>
                      <motion.div
                        className="h-full rounded-full"
                        style={{ background: 'linear-gradient(90deg, var(--accent-primary), var(--accent-secondary))' }}
                        initial={{ width: 0 }}
                        animate={{ width: `${Math.round(((presentDays + lateDays) / attendance.length) * 100)}%` }}
                        transition={{ duration: 0.8, delay: 0.5 }}
                      />
                    </div>
                  </div>
                </>
              )}
            </motion.div>

            {/* Salary History Chart */}
            <motion.div
              className="bg-[var(--bg-surface)] border border-[var(--border)] rounded-xl p-6"
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
            >
              <h3 className="text-lg font-bold text-[var(--text-primary)] mb-4">Net Salary History</h3>
              <SalaryChart payslips={payslips} />
            </motion.div>

            {/* Payslip History */}
            <motion.div
              className="bg-[var(--bg-surface)] border border-[var(--border)] rounded-xl p-6"
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}
            >
              <h3 className="text-lg font-bold text-[var(--text-primary)] mb-4">Payslip History</h3>
              {payslips.length === 0 ? (
                <p className="text-[var(--text-secondary)] text-sm">No payslips generated yet</p>
              ) : (
                <div className="space-y-3">
                  {payslips.map((ps) => (
                    <div key={ps.id} className="flex items-center justify-between p-4 bg-[var(--bg-elevated)] rounded-xl">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-[var(--glow-violet)] flex items-center justify-center">
                          <FileText size={18} className="text-[var(--accent-primary)]" />
                        </div>
                        <div>
                          <p className="font-medium text-[var(--text-primary)]">{ps.month} {ps.year}</p>
                          <p className="text-xs text-[var(--text-secondary)]">{ps.department}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <p className="font-mono font-bold" style={{ color: 'var(--accent-secondary)' }}>{fmt(ps.netSalary)}</p>
                          <span className="text-xs px-2 py-0.5 rounded-full bg-[var(--glow-teal)] text-[var(--accent-secondary)]">{ps.status}</span>
                        </div>
                        <button
                          onClick={() => handleDownload(ps)}
                          disabled={downloading === ps.id}
                          className="p-2 rounded-lg transition-colors hover:bg-[var(--bg-surface)]"
                          style={{ color: 'var(--text-secondary)' }}
                          title="Download PDF"
                        >
                          {downloading === ps.id
                            ? <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                            : <Download size={16} />}
                        </button>
                        <button
                          onClick={() => window.print()}
                          className="p-2 rounded-lg transition-colors hover:bg-[var(--bg-surface)]"
                          style={{ color: 'var(--text-secondary)' }}
                          title="Print"
                        >
                          <Printer size={16} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </motion.div>

          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default EmployeeProfilePage;
