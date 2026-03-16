import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, Search, ChevronLeft, ChevronRight } from 'lucide-react';
import Sidebar from '../components/Sidebar';
import EmployeeTable from '../components/EmployeeTable';
import EmployeeModal from '../components/EmployeeModal';
import { getEmployees, createEmployee, updateEmployee, deactivateEmployee, hardDeleteEmployee } from '../services/api';
import toast from 'react-hot-toast';

const PAGE_SIZE = 8;

const EmployeesPage = () => {
  const [employees, setEmployees] = useState([]);
  const [filteredEmployees, setFilteredEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState(null);
  const [filters, setFilters] = useState({ department: '', status: '', search: '' });
  const [currentPage, setCurrentPage] = useState(1);
  const [deactivatingId, setDeactivatingId] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  useEffect(() => { fetchEmployees(); }, []);

  useEffect(() => {
    let filtered = employees;
    if (filters.department) filtered = filtered.filter(e => e.department === filters.department);
    if (filters.status) filtered = filtered.filter(e => e.status === filters.status);
    if (filters.search) {
      const q = filters.search.toLowerCase();
      filtered = filtered.filter(e =>
        `${e.firstName} ${e.lastName}`.toLowerCase().includes(q) ||
        e.email.toLowerCase().includes(q)
      );
    }
    setFilteredEmployees(filtered);
    setCurrentPage(1);
  }, [employees, filters]);

  const fetchEmployees = async () => {
    try {
      const response = await getEmployees();
      setEmployees(response.data);
    } catch {
      toast.error('Failed to load employees');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateEmployee = async (data) => {
    try {
      await createEmployee(data);
      toast.success('Employee created — welcome email sent!');
      setModalOpen(false);
      fetchEmployees();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to create employee');
    }
  };

  const handleUpdateEmployee = async (data) => {
    try {
      await updateEmployee(editingEmployee.id, data);
      toast.success('Employee updated successfully');
      setModalOpen(false);
      setEditingEmployee(null);
      fetchEmployees();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to update employee');
    }
  };

  const handleDeactivateEmployee = async (employee) => {
    if (deactivatingId) return;
    if (window.confirm(`Deactivate ${employee.firstName} ${employee.lastName}? Their account will be disabled but records will be kept.`)) {
      setDeactivatingId(employee.id);
      try {
        await deactivateEmployee(employee.id);
        toast.success('Employee deactivated');
        fetchEmployees();
      } catch {
        toast.error('Failed to deactivate employee');
      } finally {
        setDeactivatingId(null);
      }
    }
  };

  const handleDeleteEmployee = async (employee) => {
    if (deletingId) return;
    if (window.confirm(`Permanently delete ${employee.firstName} ${employee.lastName}? This will remove ALL their records and cannot be undone.`)) {
      setDeletingId(employee.id);
      try {
        await hardDeleteEmployee(employee.id);
        toast.success('Employee permanently deleted');
        fetchEmployees();
      } catch (err) {
        toast.error(err.response?.data?.error || 'Failed to delete employee');
      } finally {
        setDeletingId(null);
      }
    }
  };

  const totalPages = Math.ceil(filteredEmployees.length / PAGE_SIZE);
  const paginated = filteredEmployees.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  const inputClass = "w-full px-4 py-3 bg-[var(--bg-base)] border border-[var(--border)] rounded-lg text-[var(--text-primary)] focus:border-[var(--accent-primary)] focus:shadow-[0_0_0_3px_var(--glow-violet)] transition-all";

  return (
    <div className="min-h-screen bg-[var(--bg-base)]">
      <Sidebar />
      <div className="md:ml-60 page-content pt-16 md:pt-0">
        <motion.div
          className="p-8"
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -24 }}
          transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
        >
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-[var(--text-primary)] mb-2">Employees</h1>
              <p className="text-[var(--text-secondary)]">Manage your employee database</p>
            </div>
            <motion.button
              onClick={() => { setEditingEmployee(null); setModalOpen(true); }}
              className="px-6 py-3 bg-gradient-to-r from-[var(--accent-primary)] to-[#9B5DFF] rounded-lg text-white font-medium flex items-center gap-2"
              whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
            >
              <Plus size={20} /> Add Employee
            </motion.button>
          </div>

          <div className="bg-[var(--bg-surface)] border border-[var(--border)] rounded-xl p-6 mb-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">Department</label>
                <select value={filters.department} onChange={e => setFilters(p => ({ ...p, department: e.target.value }))} className={inputClass}>
                  <option value="">All Departments</option>
                  <option value="Engineering">Engineering</option>
                  <option value="Marketing">Marketing</option>
                  <option value="Sales">Sales</option>
                  <option value="HR">HR</option>
                  <option value="Finance">Finance</option>
                  <option value="Operations">Operations</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">Status</label>
                <select value={filters.status} onChange={e => setFilters(p => ({ ...p, status: e.target.value }))} className={inputClass}>
                  <option value="">All Status</option>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">Search</label>
                <div className="relative">
                  <Search size={20} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-tertiary)]" />
                  <input
                    type="text" placeholder="Search employees..."
                    value={filters.search}
                    onChange={e => setFilters(p => ({ ...p, search: e.target.value }))}
                    className={`${inputClass} pl-10`}
                  />
                </div>
              </div>
            </div>
          </div>

          {loading ? (
            <div className="text-center py-12 text-[var(--text-secondary)]">Loading employees...</div>
          ) : paginated.length > 0 ? (
            <>
              <EmployeeTable
                employees={paginated}
                onEdit={(emp) => { setEditingEmployee(emp); setModalOpen(true); }}
                onDeactivate={handleDeactivateEmployee}
                onDelete={handleDeleteEmployee}
                deactivatingId={deactivatingId}
                deletingId={deletingId}
              />
              {totalPages > 1 && (
                <div className="flex items-center justify-between mt-6">
                  <p className="text-sm text-[var(--text-secondary)]">
                    Showing {(currentPage - 1) * PAGE_SIZE + 1}–{Math.min(currentPage * PAGE_SIZE, filteredEmployees.length)} of {filteredEmployees.length}
                  </p>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                      disabled={currentPage === 1}
                      className="p-2 rounded-lg bg-[var(--bg-elevated)] border border-[var(--border)] text-[var(--text-secondary)] disabled:opacity-40 hover:text-[var(--text-primary)] transition-colors"
                    >
                      <ChevronLeft size={16} />
                    </button>
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                      <button
                        key={page}
                        onClick={() => setCurrentPage(page)}
                        className={`w-8 h-8 rounded-lg text-sm font-medium transition-colors ${
                          page === currentPage
                            ? 'bg-[var(--accent-primary)] text-white'
                            : 'bg-[var(--bg-elevated)] border border-[var(--border)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                        }`}
                      >
                        {page}
                      </button>
                    ))}
                    <button
                      onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                      disabled={currentPage === totalPages}
                      className="p-2 rounded-lg bg-[var(--bg-elevated)] border border-[var(--border)] text-[var(--text-secondary)] disabled:opacity-40 hover:text-[var(--text-primary)] transition-colors"
                    >
                      <ChevronRight size={16} />
                    </button>
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="bg-[var(--bg-surface)] border border-[var(--border)] rounded-xl p-12 text-center">
              <div className="text-[var(--text-secondary)]">No employees found</div>
            </div>
          )}
        </motion.div>
      </div>

      <EmployeeModal
        isOpen={modalOpen}
        onClose={() => { setModalOpen(false); setEditingEmployee(null); }}
        employee={editingEmployee}
        onSubmit={editingEmployee ? handleUpdateEmployee : handleCreateEmployee}
        isEdit={!!editingEmployee}
      />
    </div>
  );
};

export default EmployeesPage;
