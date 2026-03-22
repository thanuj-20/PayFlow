import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, Clock, AlertCircle, UserCheck, Plus, X } from 'lucide-react';
import Sidebar from '../components/Sidebar';
import { getAttendance, getAttendanceSummary, addAttendance, getEmployees } from '../services/api';
import toast from 'react-hot-toast';

const AttendancePage = () => {
  const [records, setRecords] = useState([]);
  const [summary, setSummary] = useState(null);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [filterDate, setFilterDate] = useState('');
  const [form, setForm] = useState({
    employeeId: '', date: new Date().toISOString().split('T')[0],
    checkIn: '09:00', checkOut: '18:00', status: 'present', overtimeHours: 0
  });

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const params = {};
      if (filterDate) params.date = filterDate;
      const [recordsRes, summaryRes, empRes] = await Promise.all([
        getAttendance(params),
        getAttendanceSummary(),
        getEmployees({ status: 'active' })
      ]);
      setRecords(recordsRes.data);
      setSummary(summaryRes.data);
      setEmployees(empRes.data);
    } catch {
      toast.error('Could not load attendance data');
    } finally {
      setLoading(false);
    }
  }, [filterDate]);

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 5000);
    return () => clearInterval(interval);
  }, [fetchData]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await addAttendance(form);
      toast.success('Attendance record added');
      setShowModal(false);
      setForm({ employeeId: '', date: new Date().toISOString().split('T')[0], checkIn: '09:00', checkOut: '18:00', status: 'present', overtimeHours: 0 });
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to add record');
    } finally {
      setSubmitting(false);
    }
  };

  const statusBadge = (status) => {
    if (status === 'present') return 'badge-success';
    if (status === 'late') return 'badge-warning';
    return 'badge-danger';
  };

  return (
    <div className="app-layout">
      <Sidebar />
      <main className="main-content">
        <div className="page-header">
          <div>
            <h1 className="page-title">Attendance Tracking</h1>
            <p className="page-subtitle">Monitor and manage employee attendance</p>
          </div>
          <button onClick={() => setShowModal(true)} className="btn-primary flex items-center gap-2">
            <Plus size={16} /> Add Record
          </button>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {[
            { label: 'Present Today', value: summary?.present ?? 0, icon: UserCheck, cls: 'accent-secondary' },
            { label: 'Late Today', value: summary?.late ?? 0, icon: Clock, cls: 'accent-warning' },
            { label: 'Absent Today', value: summary?.absent ?? 0, icon: AlertCircle, cls: 'accent-danger' },
            { label: 'Total Records', value: records.length, icon: Users, cls: 'accent-primary' },
          ].map(({ label, value, icon: Icon, cls }, i) => (
            <motion.div key={label} className={`card ${cls}`} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-text-secondary mb-1">{label}</p>
                  <p className="text-3xl font-mono font-bold">{value}</p>
                </div>
                <Icon className="w-12 h-12 opacity-20" />
              </div>
            </motion.div>
          ))}
        </div>

        {/* Filter */}
        <div className="card mb-6 flex items-center gap-4">
          <label className="text-sm text-[var(--text-secondary)]">Filter by date:</label>
          <input
            type="date"
            value={filterDate}
            onChange={e => setFilterDate(e.target.value)}
            className="px-3 py-2 rounded-lg text-sm"
            style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)', color: 'var(--text-primary)' }}
          />
          {filterDate && (
            <button onClick={() => setFilterDate('')} className="text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)]">
              Clear
            </button>
          )}
        </div>

        {/* Records Table */}
        {loading ? (
          <div className="text-center py-12 text-[var(--text-secondary)]">Loading...</div>
        ) : records.length === 0 ? (
          <div className="card text-center py-12 text-[var(--text-secondary)]">
            No attendance records found{filterDate ? ` for ${filterDate}` : ''}
          </div>
        ) : (
          <motion.div className="card" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <div className="overflow-x-auto">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Employee</th>
                    <th>Department</th>
                    <th>Date</th>
                    <th>Check In</th>
                    <th>Check Out</th>
                    <th>Overtime</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {records.map(r => (
                    <tr key={r.id}>
                      <td className="font-medium">{r.employeeName}</td>
                      <td className="text-[var(--text-secondary)]">{r.department}</td>
                      <td className="font-mono">{r.date}</td>
                      <td className="font-mono">{r.checkIn || '—'}</td>
                      <td className="font-mono">{r.checkOut || '—'}</td>
                      <td className="font-mono">{r.overtimeHours > 0 ? `${r.overtimeHours}h` : '—'}</td>
                      <td><span className={`badge ${statusBadge(r.status)}`}>{r.status}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>
        )}

        {/* Add Attendance Modal */}
        <AnimatePresence>
          {showModal && (
            <motion.div
              className="fixed inset-0 z-50 flex items-center justify-center p-4"
              style={{ background: 'rgba(0,0,0,0.6)' }}
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setShowModal(false)}
            >
              <motion.div
                className="card w-full max-w-md"
                initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
                onClick={e => e.stopPropagation()}
              >
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-semibold">Add Attendance Record</h2>
                  <button onClick={() => setShowModal(false)}><X size={20} /></button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm text-[var(--text-secondary)] mb-1">Employee</label>
                    <select
                      required
                      value={form.employeeId}
                      onChange={e => setForm(f => ({ ...f, employeeId: e.target.value }))}
                      className="w-full px-3 py-2 rounded-lg text-sm"
                      style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)', color: 'var(--text-primary)' }}
                    >
                      <option value="">Select employee...</option>
                      {employees.map(emp => (
                        <option key={emp.id} value={emp.id}>{emp.firstName} {emp.lastName} — {emp.department}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm text-[var(--text-secondary)] mb-1">Date</label>
                    <input
                      type="date" required value={form.date}
                      onChange={e => setForm(f => ({ ...f, date: e.target.value }))}
                      className="w-full px-3 py-2 rounded-lg text-sm"
                      style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)', color: 'var(--text-primary)' }}
                    />
                  </div>

                  <div>
                    <label className="block text-sm text-[var(--text-secondary)] mb-1">Status</label>
                    <select
                      value={form.status}
                      onChange={e => setForm(f => ({ ...f, status: e.target.value }))}
                      className="w-full px-3 py-2 rounded-lg text-sm"
                      style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)', color: 'var(--text-primary)' }}
                    >
                      <option value="present">Present</option>
                      <option value="late">Late</option>
                      <option value="absent">Absent</option>
                    </select>
                  </div>

                  {form.status !== 'absent' && (
                    <>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-sm text-[var(--text-secondary)] mb-1">Check In</label>
                          <input
                            type="time" value={form.checkIn}
                            onChange={e => setForm(f => ({ ...f, checkIn: e.target.value }))}
                            className="w-full px-3 py-2 rounded-lg text-sm"
                            style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)', color: 'var(--text-primary)' }}
                          />
                        </div>
                        <div>
                          <label className="block text-sm text-[var(--text-secondary)] mb-1">Check Out</label>
                          <input
                            type="time" value={form.checkOut}
                            onChange={e => setForm(f => ({ ...f, checkOut: e.target.value }))}
                            className="w-full px-3 py-2 rounded-lg text-sm"
                            style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)', color: 'var(--text-primary)' }}
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm text-[var(--text-secondary)] mb-1">Overtime Hours</label>
                        <input
                          type="number" min="0" max="12" step="0.5" value={form.overtimeHours}
                          onChange={e => setForm(f => ({ ...f, overtimeHours: e.target.value }))}
                          className="w-full px-3 py-2 rounded-lg text-sm"
                          style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)', color: 'var(--text-primary)' }}
                        />
                      </div>
                    </>
                  )}

                  <div className="flex gap-3 pt-2">
                    <button type="button" onClick={() => setShowModal(false)} className="flex-1 px-4 py-2 rounded-lg text-sm" style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)' }}>
                      Cancel
                    </button>
                    <button type="submit" disabled={submitting} className="flex-1 btn-primary">
                      {submitting ? 'Saving...' : 'Save Record'}
                    </button>
                  </div>
                </form>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
};

export default AttendancePage;
