import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Users, UserCheck, IndianRupee, Building2, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import StatCard from '../components/StatCard';
import EmployeeTable from '../components/EmployeeTable';
import { getEmployees, getAttendanceSummary, deactivateEmployee, getReportsSummary } from '../services/api';
import toast from 'react-hot-toast';

// SVG donut chart for attendance
const DonutChart = ({ present, late, absent }) => {
  const total = present + late + absent || 1;
  const r = 54;
  const circ = 2 * Math.PI * r;
  const presentPct = present / total;
  const latePct = late / total;

  const presentDash = circ * presentPct;
  const lateDash = circ * latePct;
  const absentDash = circ - presentDash - lateDash;

  // offsets: start from top (-90deg = -circ/4)
  const presentOffset = -circ / 4;
  const lateOffset = presentOffset - presentDash;
  const absentOffset = lateOffset - lateDash;

  return (
    <div className="flex items-center gap-6">
      <svg width="130" height="130" viewBox="0 0 130 130">
        <circle cx="65" cy="65" r={r} fill="none" stroke="var(--bg-elevated)" strokeWidth="14" />
        {present > 0 && (
          <motion.circle cx="65" cy="65" r={r} fill="none" stroke="#00D4AA" strokeWidth="14"
            strokeDasharray={`${presentDash} ${circ - presentDash}`}
            strokeDashoffset={presentOffset}
            initial={{ strokeDasharray: `0 ${circ}` }}
            animate={{ strokeDasharray: `${presentDash} ${circ - presentDash}` }}
            transition={{ duration: 0.8 }}
          />
        )}
        {late > 0 && (
          <motion.circle cx="65" cy="65" r={r} fill="none" stroke="#FFB547" strokeWidth="14"
            strokeDasharray={`${lateDash} ${circ - lateDash}`}
            strokeDashoffset={lateOffset}
            initial={{ strokeDasharray: `0 ${circ}` }}
            animate={{ strokeDasharray: `${lateDash} ${circ - lateDash}` }}
            transition={{ duration: 0.8, delay: 0.2 }}
          />
        )}
        {absent > 0 && (
          <motion.circle cx="65" cy="65" r={r} fill="none" stroke="#FF4365" strokeWidth="14"
            strokeDasharray={`${absentDash} ${circ - absentDash}`}
            strokeDashoffset={absentOffset}
            initial={{ strokeDasharray: `0 ${circ}` }}
            animate={{ strokeDasharray: `${absentDash} ${circ - absentDash}` }}
            transition={{ duration: 0.8, delay: 0.4 }}
          />
        )}
        <text x="65" y="60" textAnchor="middle" fill="var(--text-primary)" fontSize="18" fontWeight="bold">{total}</text>
        <text x="65" y="76" textAnchor="middle" fill="var(--text-secondary)" fontSize="9">Today</text>
      </svg>
      <div className="space-y-2 text-sm">
        {[
          { label: 'Present', value: present, color: '#00D4AA' },
          { label: 'Late', value: late, color: '#FFB547' },
          { label: 'Absent', value: absent, color: '#FF4365' },
        ].map(({ label, value, color }) => (
          <div key={label} className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ background: color }} />
            <span className="text-[var(--text-secondary)]">{label}</span>
            <span className="font-mono font-bold ml-auto pl-4">{value}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

// Horizontal bar chart for departments
const DeptChart = ({ departments, total }) => (
  <div className="space-y-3">
    {departments.slice(0, 6).map((dept, i) => (
      <div key={dept.department}>
        <div className="flex justify-between text-xs mb-1">
          <span className="text-[var(--text-secondary)]">{dept.department}</span>
          <span className="font-mono font-semibold">{dept.count} employees</span>
        </div>
        <div className="h-6 rounded-lg overflow-hidden" style={{ background: 'var(--bg-elevated)' }}>
          <motion.div
            className="h-full rounded-lg"
            style={{ background: 'linear-gradient(90deg, var(--accent-primary), #9B5DFF)' }}
            initial={{ width: 0 }}
            animate={{ width: `${(dept.count / total) * 100}%` }}
            transition={{ duration: 0.7, delay: i * 0.1 }}
          />
        </div>
      </div>
    ))}
  </div>
);

const HRDashboard = () => {
  const [employees, setEmployees] = useState([]);
  const [attendanceSummary, setAttendanceSummary] = useState(null);
  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [deactivatingId, setDeactivatingId] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [employeesRes, attendanceRes, reportsRes] = await Promise.allSettled([
          getEmployees(),
          getAttendanceSummary(),
          getReportsSummary(),
        ]);
        if (employeesRes.status === 'fulfilled') setEmployees(employeesRes.value.data);
        if (attendanceRes.status === 'fulfilled') setAttendanceSummary(attendanceRes.value.data);
        if (reportsRes.status === 'fulfilled') setReportData(reportsRes.value.data);
      } catch (error) {
        console.error('Failed to fetch data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const totalEmployees = employees.length;
  const activeEmployees = employees.filter(emp => emp.status === 'active').length;
  const totalPayroll = employees.reduce((sum, emp) => sum + (emp.basicSalary || 0), 0);
  const departments = new Set(employees.map(emp => emp.department)).size;

  const handleDeactivate = async (employee) => {
    if (deactivatingId) return;
    if (window.confirm(`Deactivate ${employee.firstName} ${employee.lastName}? Their account will be disabled but records will be kept.`)) {
      setDeactivatingId(employee.id);
      try {
        await deactivateEmployee(employee.id);
        toast.success('Employee deactivated');
        setEmployees(prev => prev.map(e => e.id === employee.id ? { ...e, status: 'inactive' } : e));
      } catch {
        toast.error('Failed to deactivate employee');
      } finally {
        setDeactivatingId(null);
      }
    }
  };

  const recentEmployees = employees.slice(0, 5);

  return (
    <div className="min-h-screen bg-[var(--bg-base)]">
      <Sidebar />
      <div className="ml-60 page-content">
        <motion.div
          className="p-8"
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
        >
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-[var(--text-primary)] mb-2">HR Dashboard</h1>
            <p className="text-[var(--text-secondary)]">Overview of your payroll system</p>
          </div>

          {/* Stat Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-10">
            <StatCard icon={Users} label="Total Employees" value={totalEmployees} color="primary" />
            <StatCard icon={UserCheck} label="Active Employees" value={activeEmployees} color="secondary" />
            <StatCard icon={IndianRupee} label="Monthly Payroll" value={`₹${totalPayroll.toLocaleString('en-IN')}`} color="secondary" />
            <StatCard icon={Building2} label="Departments" value={departments} color="primary" />
            <StatCard icon={UserCheck} label="Present Today" value={attendanceSummary?.present || 0} color="secondary" />
          </div>

          {/* Charts Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
            {/* Attendance Donut */}
            <motion.div
              className="bg-[var(--bg-surface)] border border-[var(--border)] rounded-xl p-6"
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
            >
              <h2 className="text-base font-bold text-[var(--text-primary)] mb-4">Today's Attendance</h2>
              {attendanceSummary ? (
                <DonutChart
                  present={attendanceSummary.present}
                  late={attendanceSummary.late}
                  absent={attendanceSummary.absent}
                />
              ) : (
                <p className="text-sm text-[var(--text-secondary)]">No attendance data for today</p>
              )}
            </motion.div>

            {/* Department Bar Chart */}
            <motion.div
              className="bg-[var(--bg-surface)] border border-[var(--border)] rounded-xl p-6"
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
            >
              <h2 className="text-base font-bold text-[var(--text-primary)] mb-4">Department Headcount</h2>
              {reportData?.departmentBreakdown?.length > 0 ? (
                <DeptChart departments={reportData.departmentBreakdown} total={activeEmployees || 1} />
              ) : (
                <p className="text-sm text-[var(--text-secondary)]">Loading department data...</p>
              )}
            </motion.div>
          </div>

          {/* Recent Employees */}
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-[var(--text-primary)]">Recent Employees</h2>
              <motion.button
                onClick={() => navigate('/employees')}
                className="flex items-center gap-1 text-sm text-[var(--accent-primary)] hover:underline"
                whileHover={{ x: 3 }}
              >
                View All <ArrowRight size={14} />
              </motion.button>
            </div>

            {loading ? (
              <div className="text-center py-12 text-[var(--text-secondary)]">Loading employees...</div>
            ) : recentEmployees.length > 0 ? (
              <EmployeeTable
                employees={recentEmployees}
                onEdit={() => {}}
                onDeactivate={handleDeactivate}
                deactivatingId={deactivatingId}
              />
            ) : (
              <div className="bg-[var(--bg-surface)] border border-[var(--border)] rounded-xl p-12 text-center">
                <div className="text-[var(--text-secondary)]">No employees found</div>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default HRDashboard;
