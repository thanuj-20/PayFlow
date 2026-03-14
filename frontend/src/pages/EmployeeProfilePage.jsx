import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, Calendar, MapPin, Building } from 'lucide-react';
import Sidebar from '../components/Sidebar';
import { getEmployee } from '../services/api';
import { authStore } from '../store/authStore';
import toast from 'react-hot-toast';

const EmployeeProfilePage = () => {
  const [employee, setEmployee] = useState(null);
  const [loading, setLoading] = useState(true);
  const { employeeId } = authStore();

  useEffect(() => {
    const fetchEmployee = async () => {
      try {
        const response = await getEmployee(employeeId);
        setEmployee(response.data);
      } catch (error) {
        console.error('Failed to fetch employee:', error);
        toast.error('Failed to load profile');
      } finally {
        setLoading(false);
      }
    };
    if (employeeId) {
      fetchEmployee();
    }
  }, [employeeId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[var(--bg-base)]">
        <Sidebar />
        <div className="ml-60 page-content p-8">
          <div className="text-center py-12">
            <div className="text-[var(--text-secondary)]">Loading profile...</div>
          </div>
        </div>
      </div>
    );
  }

  if (!employee) {
    return (
      <div className="min-h-screen bg-[var(--bg-base)]">
        <Sidebar />
        <div className="ml-60 page-content p-8">
          <div className="text-center py-12">
            <div className="text-[var(--text-secondary)]">Profile not found</div>
          </div>
        </div>
      </div>
    );
  }

  const initials = `${employee.firstName[0]}${employee.lastName[0]}`.toUpperCase();

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
          <div className="max-w-4xl mx-auto">
            {/* Hero Card */}
            <motion.div
              className="bg-[var(--bg-surface)] border border-[var(--border)] rounded-2xl p-8 mb-8"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <div className="flex items-center gap-6">
                <div className="w-20 h-20 bg-gradient-to-br from-[var(--accent-primary)] to-[#9B5DFF] rounded-full flex items-center justify-center text-2xl font-bold text-white">
                  {initials}
                </div>
                <div className="flex-1">
                  <h1 className="text-3xl font-bold text-[var(--text-primary)] font-['Syne'] mb-2">
                    {employee.firstName} {employee.lastName}
                  </h1>
                  <div className="flex items-center gap-4 text-[var(--text-secondary)]">
                    <span className="px-3 py-1 bg-[var(--bg-elevated)] rounded-full text-sm">
                      {employee.designation}
                    </span>
                    <span className="px-3 py-1 bg-[var(--bg-elevated)] rounded-full text-sm">
                      {employee.department}
                    </span>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Info Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <motion.div
                className="bg-[var(--bg-surface)] border border-[var(--border)] rounded-xl p-6"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
              >
                <h3 className="text-lg font-bold text-[var(--text-primary)] font-['Syne'] mb-4">
                  Contact Information
                </h3>
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <Mail size={20} className="text-[var(--accent-primary)]" />
                    <div>
                      <div className="text-sm text-[var(--text-secondary)]">Email</div>
                      <div className="text-[var(--text-primary)]">{employee.email}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Calendar size={20} className="text-[var(--accent-secondary)]" />
                    <div>
                      <div className="text-sm text-[var(--text-secondary)]">Joining Date</div>
                      <div className="text-[var(--text-primary)]">
                        {new Date(employee.joiningDate).toLocaleDateString('en-IN', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                        })}
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>

              <motion.div
                className="bg-[var(--bg-surface)] border border-[var(--border)] rounded-xl p-6"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
              >
                <h3 className="text-lg font-bold text-[var(--text-primary)] font-['Syne'] mb-4">
                  Employment Details
                </h3>
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <Building size={20} className="text-[var(--accent-primary)]" />
                    <div>
                      <div className="text-sm text-[var(--text-secondary)]">Department</div>
                      <div className="text-[var(--text-primary)]">{employee.department}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-5 h-5 bg-[var(--accent-secondary)] rounded-full flex items-center justify-center">
                      <span className="text-white text-xs font-bold">₹</span>
                    </div>
                    <div>
                      <div className="text-sm text-[var(--text-secondary)]">Basic Salary</div>
                      <div
                        className="text-[var(--text-primary)] font-bold text-xl"
                        style={{ textShadow: '0 0 20px var(--glow-teal)' }}
                      >
                        ₹{employee.basicSalary.toLocaleString('en-IN')}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className={`w-3 h-3 rounded-full ${
                      employee.status === 'active' ? 'bg-[var(--accent-secondary)]' : 'bg-red-400'
                    }`} />
                    <div>
                      <div className="text-sm text-[var(--text-secondary)]">Status</div>
                      <div className={`text-sm font-medium ${
                        employee.status === 'active' ? 'text-[var(--accent-secondary)]' : 'text-red-400'
                      }`}>
                        {employee.status}
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default EmployeeProfilePage;