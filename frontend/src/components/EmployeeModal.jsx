import { motion, AnimatePresence } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { X } from 'lucide-react';

const EmployeeModal = ({ isOpen, onClose, employee, onSubmit, isEdit = false }) => {
  const { register, handleSubmit, formState: { errors }, reset } = useForm({
    defaultValues: employee || {
      firstName: '',
      lastName: '',
      email: '',
      department: '',
      designation: '',
      basicSalary: '',
      joiningDate: '',
      reason: '',
    },
  });

  const onFormSubmit = (data) => {
    onSubmit(data);
    reset();
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className="bg-[var(--bg-elevated)] border border-[var(--border)] rounded-2xl p-8 w-full max-w-md"
            initial={{ opacity: 0, scale: 0.92 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-[var(--text-primary)] font-['Syne']">
                {isEdit ? 'Edit Employee' : 'Add Employee'}
              </h2>
              <motion.button
                onClick={onClose}
                className="p-2 rounded-lg hover:bg-[var(--bg-surface)] transition-colors"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                <X size={20} className="text-[var(--text-secondary)]" />
              </motion.button>
            </div>

            <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">
                    First Name
                  </label>
                  <input
                    {...register('firstName', { required: 'First name is required' })}
                    className="w-full px-4 py-3 bg-[var(--bg-surface)] border border-[var(--border)] rounded-lg text-[var(--text-primary)] placeholder-[var(--text-tertiary)] focus:border-[var(--accent-primary)] focus:shadow-[0_0_0_3px_var(--glow-violet)] transition-all"
                    placeholder="John"
                  />
                  {errors.firstName && (
                    <p className="text-red-400 text-xs mt-1">{errors.firstName.message}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">
                    Last Name
                  </label>
                  <input
                    {...register('lastName', { required: 'Last name is required' })}
                    className="w-full px-4 py-3 bg-[var(--bg-surface)] border border-[var(--border)] rounded-lg text-[var(--text-primary)] placeholder-[var(--text-tertiary)] focus:border-[var(--accent-primary)] focus:shadow-[0_0_0_3px_var(--glow-violet)] transition-all"
                    placeholder="Doe"
                  />
                  {errors.lastName && (
                    <p className="text-red-400 text-xs mt-1">{errors.lastName.message}</p>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">
                  Email
                </label>
                <input
                  {...register('email', {
                    required: 'Email is required',
                    pattern: { value: /^\S+@\S+$/i, message: 'Invalid email address' },
                  })}
                  type="email"
                  className="w-full px-4 py-3 bg-[var(--bg-surface)] border border-[var(--border)] rounded-lg text-[var(--text-primary)] placeholder-[var(--text-tertiary)] focus:border-[var(--accent-primary)] focus:shadow-[0_0_0_3px_var(--glow-violet)] transition-all"
                  placeholder="john@company.com"
                />
                {errors.email && (
                  <p className="text-red-400 text-xs mt-1">{errors.email.message}</p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">
                    Department
                  </label>
                  <select
                    {...register('department', { required: 'Department is required' })}
                    className="w-full px-4 py-3 bg-[var(--bg-surface)] border border-[var(--border)] rounded-lg text-[var(--text-primary)] focus:border-[var(--accent-primary)] focus:shadow-[0_0_0_3px_var(--glow-violet)] transition-all"
                  >
                    <option value="">Select Department</option>
                    <option value="Engineering">Engineering</option>
                    <option value="Marketing">Marketing</option>
                    <option value="Sales">Sales</option>
                    <option value="HR">HR</option>
                    <option value="Finance">Finance</option>
                  </select>
                  {errors.department && (
                    <p className="text-red-400 text-xs mt-1">{errors.department.message}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">
                    Designation
                  </label>
                  <input
                    {...register('designation', { required: 'Designation is required' })}
                    className="w-full px-4 py-3 bg-[var(--bg-surface)] border border-[var(--border)] rounded-lg text-[var(--text-primary)] placeholder-[var(--text-tertiary)] focus:border-[var(--accent-primary)] focus:shadow-[0_0_0_3px_var(--glow-violet)] transition-all"
                    placeholder="Software Engineer"
                  />
                  {errors.designation && (
                    <p className="text-red-400 text-xs mt-1">{errors.designation.message}</p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">
                    Basic Salary
                  </label>
                  <input
                    {...register('basicSalary', {
                      required: 'Salary is required',
                      pattern: { value: /^\d+$/, message: 'Must be a number' },
                    })}
                    type="number"
                    className="w-full px-4 py-3 bg-[var(--bg-surface)] border border-[var(--border)] rounded-lg text-[var(--text-primary)] placeholder-[var(--text-tertiary)] focus:border-[var(--accent-primary)] focus:shadow-[0_0_0_3px_var(--glow-violet)] transition-all"
                    placeholder="50000"
                  />
                  {errors.basicSalary && (
                    <p className="text-red-400 text-xs mt-1">{errors.basicSalary.message}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">
                    Joining Date
                  </label>
                  <input
                    {...register('joiningDate', { required: 'Joining date is required' })}
                    type="date"
                    className="w-full px-4 py-3 bg-[var(--bg-surface)] border border-[var(--border)] rounded-lg text-[var(--text-primary)] focus:border-[var(--accent-primary)] focus:shadow-[0_0_0_3px_var(--glow-violet)] transition-all"
                  />
                  {errors.joiningDate && (
                    <p className="text-red-400 text-xs mt-1">{errors.joiningDate.message}</p>
                  )}
                </div>
              </div>

              {isEdit && (
                <div>
                  <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">
                    Reason for change
                  </label>
                  <textarea
                    {...register('reason', { required: 'Reason is required for edits' })}
                    className="w-full px-4 py-3 bg-[var(--bg-surface)] border border-[var(--border)] rounded-lg text-[var(--text-primary)] placeholder-[var(--text-tertiary)] focus:border-[var(--accent-primary)] focus:shadow-[0_0_0_3px_var(--glow-violet)] transition-all resize-none"
                    rows={3}
                    placeholder="Describe what changed and why..."
                  />
                  {errors.reason && (
                    <p className="text-red-400 text-xs mt-1">{errors.reason.message}</p>
                  )}
                </div>
              )}

              <div className="flex gap-3 pt-4">
                <motion.button
                  type="button"
                  onClick={onClose}
                  className="flex-1 px-6 py-3 border border-[var(--border)] rounded-lg text-[var(--text-secondary)] hover:bg-[var(--bg-surface)] transition-colors"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  Cancel
                </motion.button>
                <motion.button
                  type="submit"
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-[var(--accent-primary)] to-[#9B5DFF] rounded-lg text-white font-medium"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  {isEdit ? 'Update' : 'Add'} Employee
                </motion.button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default EmployeeModal;