import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, Search } from 'lucide-react';
import Sidebar from '../components/Sidebar';
import EmployeeTable from '../components/EmployeeTable';
import EmployeeModal from '../components/EmployeeModal';
import { getEmployees, createEmployee, updateEmployee, deactivateEmployee } from '../services/api';
import toast from 'react-hot-toast';

const EmployeesPage = () => {
  const [employees, setEmployees] = useState([]);
  const [filteredEmployees, setFilteredEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState(null);
  const [filters, setFilters] = useState({ department: '', status: '', search: '' });

  useEffect(() => {
    fetchEmployees();
  }, []);

  useEffect(() => {
    let filtered = employees;

    if (filters.department) {
      filtered = filtered.filter(emp => emp.department === filters.department);
    }
    if (filters.status) {
      filtered = filtered.filter(emp => emp.status === filters.status);
    }
    if (filters.search) {
      filtered = filtered.filter(emp =>
        `${emp.firstName} ${emp.lastName}`.toLowerCase().includes(filters.search.toLowerCase()) ||
        emp.email.toLowerCase().includes(filters.search.toLowerCase())
      );
    }

    setFilteredEmployees(filtered);
  }, [employees, filters]);

  const fetchEmployees = async () => {
    try {
      const response = await getEmployees();
      setEmployees(response.data);
    } catch (error) {
      console.error('Failed to fetch employees:', error);
      toast.error('Failed to load employees');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateEmployee = async (data) => {
    try {
      await createEmployee(data);
      toast.success('Employee created successfully');
      fetchEmployees();
    } catch (error) {
      toast.error('Failed to create employee');
    }
  };

  const handleUpdateEmployee = async (data) => {
    try {
      await updateEmployee(editingEmployee.id, data);
      toast.success('Employee updated successfully');
      fetchEmployees();
      setEditingEmployee(null);
    } catch (error) {
      toast.error('Failed to update employee');
    }
  };

  const handleDeactivateEmployee = async (employee) => {
    if (window.confirm(`Are you sure you want to deactivate ${employee.firstName} ${employee.lastName}?`)) {
      try {
        await deactivateEmployee(employee.id);
        toast.success('Employee deactivated successfully');
        fetchEmployees();
      } catch (error) {
        toast.error('Failed to deactivate employee');
      }
    }
  };

  const openAddModal = () => {
    setEditingEmployee(null);
    setModalOpen(true);
  };

  const openEditModal = (employee) => {
    setEditingEmployee(employee);
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditingEmployee(null);
  };

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
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-[var(--text-primary)] font-['Syne'] mb-2">
                Employees
              </h1>
              <p className="text-[var(--text-secondary)]">
                Manage your employee database
              </p>
            </div>
            <motion.button
              onClick={openAddModal}
              className="px-6 py-3 bg-gradient-to-r from-[var(--accent-primary)] to-[#9B5DFF] rounded-lg text-white font-medium flex items-center gap-2"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Plus size={20} />
              Add Employee
            </motion.button>
          </div>

          {/* Filters */}
          <div className="bg-[var(--bg-surface)] border border-[var(--border)] rounded-xl p-6 mb-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">
                  Department
                </label>
                <select
                  value={filters.department}
                  onChange={(e) => setFilters(prev => ({ ...prev, department: e.target.value }))}
                  className="w-full px-4 py-3 bg-[var(--bg-base)] border border-[var(--border)] rounded-lg text-[var(--text-primary)] focus:border-[var(--accent-primary)] focus:shadow-[0_0_0_3px_var(--glow-violet)] transition-all"
                >
                  <option value="">All Departments</option>
                  <option value="Engineering">Engineering</option>
                  <option value="Marketing">Marketing</option>
                  <option value="Sales">Sales</option>
                  <option value="HR">HR</option>
                  <option value="Finance">Finance</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">
                  Status
                </label>
                <select
                  value={filters.status}
                  onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
                  className="w-full px-4 py-3 bg-[var(--bg-base)] border border-[var(--border)] rounded-lg text-[var(--text-primary)] focus:border-[var(--accent-primary)] focus:shadow-[0_0_0_3px_var(--glow-violet)] transition-all"
                >
                  <option value="">All Status</option>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">
                  Search
                </label>
                <div className="relative">
                  <Search size={20} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-tertiary)]" />
                  <input
                    type="text"
                    placeholder="Search employees..."
                    value={filters.search}
                    onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                    className="w-full pl-10 pr-4 py-3 bg-[var(--bg-base)] border border-[var(--border)] rounded-lg text-[var(--text-primary)] placeholder-[var(--text-tertiary)] focus:border-[var(--accent-primary)] focus:shadow-[0_0_0_3px_var(--glow-violet)] transition-all"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Employee Table */}
          {loading ? (
            <div className="text-center py-12">
              <div className="text-[var(--text-secondary)]">Loading employees...</div>
            </div>
          ) : filteredEmployees.length > 0 ? (
            <EmployeeTable
              employees={filteredEmployees}
              onEdit={openEditModal}
              onDeactivate={handleDeactivateEmployee}
            />
          ) : (
            <div className="bg-[var(--bg-surface)] border border-[var(--border)] rounded-xl p-12 text-center">
              <div className="text-[var(--text-secondary)]">No employees found</div>
            </div>
          )}
        </motion.div>
      </div>

      <EmployeeModal
        isOpen={modalOpen}
        onClose={closeModal}
        employee={editingEmployee}
        onSubmit={editingEmployee ? handleUpdateEmployee : handleCreateEmployee}
        isEdit={!!editingEmployee}
      />
    </div>
  );
};

export default EmployeesPage;