import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { DollarSign, TrendingUp, TrendingDown, Play, CheckCircle, XCircle, AlertTriangle, ChevronDown, ChevronUp, Shield, Zap } from 'lucide-react';
import toast from 'react-hot-toast';
import Sidebar from '../components/Sidebar';
import { getPayroll, getPayrollSummary, initiatePayroll, approvePayrollRecord, approveAllPayroll, holdPayrollRecord } from '../services/api';

const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];

const formatCurrency = (n) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(n || 0);

const statusBadge = (status) => {
  const map = { approved: 'badge-success', pending_approval: 'badge-warning', held: 'badge-danger', processed: 'badge-success' };
  return map[status] || 'badge-warning';
};

const SeverityIcon = ({ severity }) => {
  if (severity === 'critical' || severity === 'high') return <XCircle size={14} className="text-red-400" />;
  if (severity === 'medium') return <AlertTriangle size={14} className="text-yellow-400" />;
  return <AlertTriangle size={14} className="text-blue-400" />;
};

const PayrollRow = ({ record, onApprove, onHold, approving, holding }) => {
  const [expanded, setExpanded] = useState(false);
  const hasIssues = !record.compliance?.isCompliant || record.anomalies?.hasAnomalies;

  return (
    <>
      <tr className={hasIssues ? 'bg-yellow-500/5' : ''}>
        <td className="font-medium">{record.employeeName}</td>
        <td>{record.department}</td>
        <td className="font-mono">{formatCurrency(record.basicSalary)}</td>
        <td className="font-mono text-green-500">{formatCurrency(record.overtimePay)}</td>
        <td className="font-mono text-red-400">-{formatCurrency(record.lopDeduction)}</td>
        <td className="font-mono text-red-400">-{formatCurrency(record.totalDeductions)}</td>
        <td className="font-mono font-bold">{formatCurrency(record.netSalary)}</td>
        <td>
          <div className="flex items-center gap-1">
            <span className={`badge ${statusBadge(record.status)}`}>{record.status?.replace('_', ' ')}</span>
            {hasIssues && <AlertTriangle size={14} className="text-yellow-400" />}
          </div>
        </td>
        <td>
          <div className="flex items-center gap-2">
            {record.status === 'pending_approval' && (
              <>
                <button onClick={() => onApprove(record.id)} disabled={approving === record.id}
                  className="p-1.5 rounded-lg bg-green-500/20 text-green-400 hover:bg-green-500 hover:text-white transition-colors disabled:opacity-50">
                  {approving === record.id ? <div className="w-3 h-3 border border-green-400 border-t-transparent rounded-full animate-spin" /> : <CheckCircle size={14} />}
                </button>
                <button onClick={() => onHold(record.id)} disabled={holding === record.id}
                  className="p-1.5 rounded-lg bg-red-500/20 text-red-400 hover:bg-red-500 hover:text-white transition-colors disabled:opacity-50">
                  {holding === record.id ? <div className="w-3 h-3 border border-red-400 border-t-transparent rounded-full animate-spin" /> : <XCircle size={14} />}
                </button>
              </>
            )}
            <button onClick={() => setExpanded(!expanded)} className="p-1.5 rounded-lg bg-[var(--bg-elevated)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors">
              {expanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
            </button>
          </div>
        </td>
      </tr>
      <AnimatePresence>
        {expanded && (
          <tr>
            <td colSpan={9} className="p-0">
              <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                <div className="p-4 bg-[var(--bg-elevated)] grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Salary Explanation */}
                  <div className="bg-[var(--bg-surface)] rounded-xl p-4">
                    <div className="flex items-center gap-2 mb-3 text-[var(--accent-primary)]">
                      <Zap size={16} /><span className="font-semibold text-sm">Salary Explanation</span>
                    </div>
                    <pre className="text-xs text-[var(--text-secondary)] whitespace-pre-wrap leading-relaxed">{record.explanation}</pre>
                  </div>

                  {/* Compliance */}
                  <div className="bg-[var(--bg-surface)] rounded-xl p-4">
                    <div className="flex items-center gap-2 mb-3 text-[var(--accent-secondary)]">
                      <Shield size={16} /><span className="font-semibold text-sm">Compliance Check</span>
                      <span className={`ml-auto badge ${record.compliance?.isCompliant ? 'badge-success' : 'badge-danger'}`}>
                        {record.compliance?.isCompliant ? 'Compliant' : 'Violations'}
                      </span>
                    </div>
                    {record.compliance?.violations?.map((v, i) => (
                      <div key={i} className="flex items-start gap-2 mb-2">
                        <SeverityIcon severity={v.severity} />
                        <p className="text-xs text-red-400">{v.message}</p>
                      </div>
                    ))}
                    {record.compliance?.warnings?.map((w, i) => (
                      <div key={i} className="flex items-start gap-2 mb-2">
                        <SeverityIcon severity={w.severity} />
                        <p className="text-xs text-yellow-400">{w.message}</p>
                      </div>
                    ))}
                    {record.compliance?.isCompliant && record.compliance?.warnings?.length === 0 && (
                      <p className="text-xs text-green-400">All compliance rules passed ✓</p>
                    )}
                  </div>

                  {/* Anomalies */}
                  <div className="bg-[var(--bg-surface)] rounded-xl p-4">
                    <div className="flex items-center gap-2 mb-3 text-[var(--accent-gold)]">
                      <AlertTriangle size={16} /><span className="font-semibold text-sm">Anomaly Detection</span>
                      <span className={`ml-auto badge ${record.anomalies?.hasAnomalies ? 'badge-warning' : 'badge-success'}`}>
                        {record.anomalies?.hasAnomalies ? 'Flagged' : 'Normal'}
                      </span>
                    </div>
                    {record.anomalies?.anomalies?.map((a, i) => (
                      <div key={i} className="flex items-start gap-2 mb-2">
                        <SeverityIcon severity={a.severity} />
                        <p className="text-xs text-yellow-400">{a.message}</p>
                      </div>
                    ))}
                    {!record.anomalies?.hasAnomalies && (
                      <p className="text-xs text-green-400">No anomalies detected ✓</p>
                    )}
                  </div>
                </div>
              </motion.div>
            </td>
          </tr>
        )}
      </AnimatePresence>
    </>
  );
};

const PayrollPage = () => {
  const now = new Date();
  const [selectedMonth, setSelectedMonth] = useState(now.toLocaleString('default', { month: 'long' }));
  const [selectedYear, setSelectedYear] = useState(now.getFullYear());
  const [records, setRecords] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [initiating, setInitiating] = useState(false);
  const [approvingAll, setApprovingAll] = useState(false);
  const [approving, setApproving] = useState(null);
  const [holding, setHolding] = useState(null);

  const years = Array.from({ length: 4 }, (_, i) => now.getFullYear() - i);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [recordsRes, summaryRes] = await Promise.all([
        getPayroll({ month: selectedMonth, year: selectedYear }),
        getPayrollSummary()
      ]);
      setRecords(recordsRes.data);
      setSummary(summaryRes.data);
    } catch {
      toast.error('Failed to load payroll data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, [selectedMonth, selectedYear]);

  const handleInitiate = async () => {
    setInitiating(true);
    try {
      const res = await initiatePayroll();
      toast.success(`Payroll initiated — ${res.data.processed} records, ${res.data.flagged} flagged`);
      setSelectedMonth(res.data.month);
      setSelectedYear(res.data.year);
      await fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to initiate payroll');
    } finally {
      setInitiating(false);
    }
  };

  const handleApproveAll = async () => {
    setApprovingAll(true);
    try {
      const res = await approveAllPayroll(selectedMonth, selectedYear);
      toast.success(res.data.message);
      await fetchData();
    } catch {
      toast.error('Failed to approve payroll');
    } finally {
      setApprovingAll(false);
    }
  };

  const handleApprove = async (id) => {
    setApproving(id);
    try {
      await approvePayrollRecord(id);
      toast.success('Record approved');
      await fetchData();
    } catch {
      toast.error('Failed to approve');
    } finally {
      setApproving(null);
    }
  };

  const handleHold = async (id) => {
    const reason = window.prompt('Reason for holding this record:');
    if (!reason) return;
    setHolding(id);
    try {
      await holdPayrollRecord(id, reason);
      toast.success('Record held for review');
      await fetchData();
    } catch {
      toast.error('Failed to hold record');
    } finally {
      setHolding(null);
    }
  };

  const pending = records.filter(r => r.status === 'pending_approval');
  const flagged = records.filter(r => !r.compliance?.isCompliant || r.anomalies?.hasAnomalies);
  const selectClass = "px-3 py-2 bg-[var(--bg-elevated)] border border-[var(--border)] rounded-lg text-[var(--text-primary)] text-sm";

  return (
    <div className="app-layout">
      <Sidebar />
      <main className="main-content">
        <div className="page-header">
          <div>
            <h1 className="page-title">Payroll Management</h1>
            <p className="page-subtitle">Initiate, validate and approve employee payroll</p>
          </div>
          <div className="flex items-center gap-3">
            <select value={selectedMonth} onChange={e => setSelectedMonth(e.target.value)} className={selectClass}>
              {MONTHS.map(m => <option key={m} value={m}>{m}</option>)}
            </select>
            <select value={selectedYear} onChange={e => setSelectedYear(Number(e.target.value))} className={selectClass}>
              {years.map(y => <option key={y} value={y}>{y}</option>)}
            </select>
            {pending.length > 0 && (
              <button onClick={handleApproveAll} disabled={approvingAll} className="btn-primary flex items-center gap-2 bg-green-600 hover:bg-green-700">
                {approvingAll ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <CheckCircle size={16} />}
                Approve All ({pending.length})
              </button>
            )}
            <button onClick={handleInitiate} disabled={initiating} className="btn-primary flex items-center gap-2">
              {initiating ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <Play size={16} />}
              {initiating ? 'Processing...' : 'Initiate Payroll'}
            </button>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
          {[
            { label: 'Gross Payroll', value: formatCurrency(summary?.totalGross), icon: DollarSign, cls: 'accent-primary' },
            { label: 'Net Payroll', value: formatCurrency(summary?.totalNet), icon: TrendingUp, cls: 'accent-secondary' },
            { label: 'Pending Approval', value: pending.length, icon: AlertTriangle, cls: 'accent-warning' },
            { label: 'Flagged Records', value: flagged.length, icon: XCircle, cls: flagged.length > 0 ? 'accent-danger' : 'accent-secondary' },
          ].map(({ label, value, icon: Icon, cls }, i) => (
            <motion.div key={label} className={`card ${cls}`} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-text-secondary mb-1">{label}</p>
                  <p className="text-2xl font-mono font-bold">{value}</p>
                </div>
                <Icon className="w-10 h-10 opacity-20" />
              </div>
            </motion.div>
          ))}
        </div>

        {/* Workflow Status */}
        {records.length > 0 && (
          <motion.div className="card mb-6" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <div className="flex items-center gap-8">
              {[
                { label: 'Initiated', count: records.length, color: 'text-[var(--accent-primary)]' },
                { label: 'Pending Review', count: pending.length, color: 'text-yellow-400' },
                { label: 'Flagged', count: flagged.length, color: 'text-red-400' },
                { label: 'Approved', count: records.filter(r => r.status === 'approved').length, color: 'text-green-400' },
                { label: 'Held', count: records.filter(r => r.status === 'held').length, color: 'text-orange-400' },
              ].map(({ label, count, color }, i, arr) => (
                <div key={label} className="flex items-center gap-4">
                  <div className="text-center">
                    <p className={`text-2xl font-bold font-mono ${color}`}>{count}</p>
                    <p className="text-xs text-[var(--text-secondary)]">{label}</p>
                  </div>
                  {i < arr.length - 1 && <div className="w-8 h-px bg-[var(--border)]" />}
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Records Table */}
        <motion.div className="card" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <h2 className="text-xl font-semibold mb-4">Payroll Records — {selectedMonth} {selectedYear}</h2>
          {loading ? (
            <div className="text-center py-12 text-[var(--text-secondary)]">Loading...</div>
          ) : records.length === 0 ? (
            <div className="text-center py-16">
              <p className="text-[var(--text-secondary)] mb-4">No payroll records for {selectedMonth} {selectedYear}</p>
              <button onClick={handleInitiate} disabled={initiating} className="btn-primary">
                <Play size={16} /> Initiate Payroll Now
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Employee</th><th>Department</th><th>Basic</th>
                    <th>Overtime</th><th>LOP</th><th>Deductions</th>
                    <th>Net Salary</th><th>Status</th><th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {records.map(record => (
                    <PayrollRow key={record.id} record={record} onApprove={handleApprove} onHold={handleHold} approving={approving} holding={holding} />
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </motion.div>
      </main>
    </div>
  );
};

export default PayrollPage;
