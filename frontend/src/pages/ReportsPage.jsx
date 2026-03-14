import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Users, Building2, DollarSign, TrendingUp, AlertCircle } from 'lucide-react';
import Sidebar from '../components/Sidebar';
import { getReportsSummary } from '../services/api';

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

const ReportsPage = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await getReportsSummary();
      setData(response.data);
    } catch (err) {
      setError(err.response?.data?.error || 'Could not load reports');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount);
  };

  if (loading) {
    return (
      <div className="app-layout">
        <Sidebar />
        <main className="main-content">
          <div className="page-header">
            <div>
              <h1 className="page-title">Reports & Analytics</h1>
              <p className="page-subtitle">Comprehensive workforce insights</p>
            </div>
          </div>
          <div className="grid grid-cols-4 gap-6 mb-8">
            {[1, 2, 3, 4].map(i => <ShimmerCard key={i} />)}
          </div>
          <ShimmerCard style={{ height: '400px' }} />
        </main>
      </div>
    );
  }

  if (error) {
    return (
      <div className="app-layout">
        <Sidebar />
        <main className="main-content">
          <ErrorState message={error} onRetry={fetchData} />
        </main>
      </div>
    );
  }

  const maxSalary = Math.max(...data.allEmployeeRecords.map(r => r.basicSalary));

  return (
    <div className="app-layout">
      <Sidebar />
      <main className="main-content">
        <div className="page-header">
          <div>
            <h1 className="page-title">Reports & Analytics</h1>
            <p className="page-subtitle">Comprehensive workforce insights</p>
          </div>
        </div>

        {/* Workforce Summary */}
        <div className="grid grid-cols-4 gap-6 mb-8">
          <motion.div
            className="card accent-primary"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-text-secondary mb-1">Total Headcount</p>
                <p className="text-3xl font-mono font-bold">{data.workforce.total}</p>
              </div>
              <Users className="w-12 h-12 opacity-20" />
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
                <p className="text-sm text-text-secondary mb-1">Active Employees</p>
                <p className="text-3xl font-mono font-bold">{data.workforce.active}</p>
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
                <p className="text-sm text-text-secondary mb-1">Avg Salary</p>
                <p className="text-2xl font-mono font-bold">{formatCurrency(data.workforce.avgSalary)}</p>
              </div>
              <DollarSign className="w-12 h-12 opacity-20" />
            </div>
          </motion.div>

          <motion.div
            className="card accent-primary"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-text-secondary mb-1">Departments</p>
                <p className="text-3xl font-mono font-bold">{data.workforce.departments}</p>
              </div>
              <Building2 className="w-12 h-12 opacity-20" />
            </div>
          </motion.div>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-2 gap-6 mb-8">
          <motion.div
            className="card"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <h2 className="text-xl font-semibold mb-6">Department Breakdown</h2>
            <div className="space-y-4">
              {data.departmentBreakdown.map((dept, index) => (
                <div key={dept.department}>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="font-medium">{dept.department}</span>
                    <span className="font-mono">{dept.count} employees</span>
                  </div>
                  <div className="h-8 bg-bg-elevated rounded-lg overflow-hidden">
                    <motion.div
                      className="h-full bg-primary flex items-center justify-end px-3"
                      initial={{ width: 0 }}
                      animate={{ width: `${(dept.count / data.workforce.active) * 100}%` }}
                      transition={{ duration: 0.8, delay: 0.5 + index * 0.1 }}
                    >
                      <span className="text-xs font-mono text-white">{formatCurrency(dept.avgSalary)}</span>
                    </motion.div>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          <motion.div
            className="card"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <h2 className="text-xl font-semibold mb-6">Salary Distribution</h2>
            <div className="space-y-4">
              {data.salaryBrackets.map((bracket, index) => (
                <div key={bracket.range}>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="font-medium">{bracket.range}</span>
                    <span className="font-mono">{bracket.count} employees</span>
                  </div>
                  <div className="h-8 bg-bg-elevated rounded-lg overflow-hidden">
                    <motion.div
                      className="h-full bg-secondary"
                      initial={{ width: 0 }}
                      animate={{ width: `${(bracket.count / data.workforce.active) * 100}%` }}
                      transition={{ duration: 0.8, delay: 0.6 + index * 0.1 }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Employee Records Table */}
        <motion.div
          className="card mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <h2 className="text-xl font-semibold mb-4">Complete Payroll Records</h2>
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
                {data.allEmployeeRecords.map((record) => (
                  <tr key={record.id}>
                    <td className="font-medium">{record.firstName} {record.lastName}</td>
                    <td>{record.department}</td>
                    <td>{record.designation}</td>
                    <td>
                      <div>
                        <div className="font-mono mb-1">{formatCurrency(record.basicSalary)}</div>
                        <div className="h-1 bg-bg-elevated rounded-full overflow-hidden">
                          <div
                            className="h-full bg-primary"
                            style={{ width: `${(record.basicSalary / maxSalary) * 80}px` }}
                          />
                        </div>
                      </div>
                    </td>
                    <td className="font-mono text-green-500">{formatCurrency(record.bonus)}</td>
                    <td className="font-mono text-red-500">{formatCurrency(record.deductions)}</td>
                    <td className="font-mono font-bold">{formatCurrency(record.netSalary)}</td>
                    <td>
                      <span className={`badge ${record.status === 'active' ? 'badge-success' : 'badge-danger'}`}>
                        {record.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>

        {/* Attendance Summary */}
        <motion.div
          className="card"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
        >
          <h2 className="text-xl font-semibold mb-4">Today's Attendance - {data.attendanceSummary.date}</h2>
          <div className="flex gap-4 mb-4">
            <div className="flex-1">
              <div className="flex justify-between text-sm mb-2">
                <span>Present: {data.attendanceSummary.present}</span>
                <span>Late: {data.attendanceSummary.late}</span>
                <span>Absent: {data.attendanceSummary.absent}</span>
              </div>
              <div className="h-8 bg-bg-elevated rounded-lg overflow-hidden flex">
                <motion.div
                  className="bg-green-500"
                  initial={{ width: 0 }}
                  animate={{ width: `${(data.attendanceSummary.present / data.attendanceSummary.total) * 100}%` }}
                  transition={{ duration: 0.8, ease: 'easeOut', delay: 0.2 }}
                />
                <motion.div
                  className="bg-yellow-500"
                  initial={{ width: 0 }}
                  animate={{ width: `${(data.attendanceSummary.late / data.attendanceSummary.total) * 100}%` }}
                  transition={{ duration: 0.8, ease: 'easeOut', delay: 0.2 }}
                />
                <motion.div
                  className="bg-red-500"
                  initial={{ width: 0 }}
                  animate={{ width: `${(data.attendanceSummary.absent / data.attendanceSummary.total) * 100}%` }}
                  transition={{ duration: 0.8, ease: 'easeOut', delay: 0.2 }}
                />
              </div>
            </div>
          </div>
        </motion.div>
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

export default ReportsPage;
