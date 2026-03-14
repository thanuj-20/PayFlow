import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Users, UserCheck, IndianRupee, Building2 } from 'lucide-react';
import Sidebar from '../components/Sidebar';
import StatCard from '../components/StatCard';
import EmployeeTable from '../components/EmployeeTable';
import { getEmployees, getAttendanceSummary } from '../services/api';

const HRDashboard = () => {
  const [employees, setEmployees] = useState([]);
  const [attendanceSummary, setAttendanceSummary] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [employeesRes, attendanceRes] = await Promise.all([
          getEmployees(),
          getAttendanceSummary()
        ]);
        setEmployees(employeesRes.data);
        setAttendanceSummary(attendanceRes.data);
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

  const recentEmployees = employees.slice(0, 5);

  return (
    <div className="min-h-screen bg-[var(--bg-base)]">
      <Sidebar />
      <div className="ml-60 page-content">
        <motion.div
          className="p-8"
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -24 }}
          transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
        >
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-[var(--text-primary)] font-['Syne'] mb-2">
              HR Dashboard
            </h1>
            <p className="text-[var(--text-secondary)]">
              Overview of your payroll system
            </p>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-12">
            <StatCard
              icon={Users}
              label="Total Employees"
              value={totalEmployees}
              color="primary"
            />
            <StatCard
              icon={UserCheck}
              label="Active Employees"
              value={activeEmployees}
              color="secondary"
            />
            <StatCard
              icon={IndianRupee}
              label="Monthly Payroll"
              value={`₹${totalPayroll.toLocaleString('en-IN')}`}
              color="secondary"
            />
            <StatCard
              icon={Building2}
              label="Departments"
              value={departments}
              color="primary"
            />
            <StatCard
              icon={UserCheck}
              label="Present Today"
              value={attendanceSummary?.present || 0}
              color="secondary"
            />
          </div>

          {/* Recent Employees */}
          <div>
            <h2 className="text-xl font-bold text-[var(--text-primary)] font-['Syne'] mb-6">
              Recent Employees
            </h2>
            {loading ? (
              <div className="text-center py-12">
                <div className="text-[var(--text-secondary)]">Loading employees...</div>
              </div>
            ) : recentEmployees.length > 0 ? (
              <EmployeeTable
                employees={recentEmployees}
                onEdit={() => {}}
                onDeactivate={() => {}}
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