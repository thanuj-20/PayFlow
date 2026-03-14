import { motion } from 'framer-motion';
import { Edit, Trash2 } from 'lucide-react';

const EmployeeTable = ({ employees, onEdit, onDeactivate, deactivatingId }) => {
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.07,
      },
    },
  };

  const item = {
    hidden: { opacity: 0, y: 16 },
    show: { opacity: 1, y: 0 },
  };

  return (
    <motion.div
      className="bg-[var(--bg-surface)] border border-[var(--border)] rounded-xl overflow-hidden"
      variants={container}
      initial="hidden"
      animate="show"
    >
      <table className="w-full">
        <thead className="bg-[var(--bg-elevated)]">
          <tr>
            <th className="px-6 py-4 text-left text-sm font-medium text-[var(--text-secondary)]">Name</th>
            <th className="px-6 py-4 text-left text-sm font-medium text-[var(--text-secondary)]">Department</th>
            <th className="px-6 py-4 text-left text-sm font-medium text-[var(--text-secondary)]">Designation</th>
            <th className="px-6 py-4 text-left text-sm font-medium text-[var(--text-secondary)]">Salary</th>
            <th className="px-6 py-4 text-left text-sm font-medium text-[var(--text-secondary)]">Status</th>
            <th className="px-6 py-4 text-left text-sm font-medium text-[var(--text-secondary)]">Actions</th>
          </tr>
        </thead>
        <tbody>
          {employees.map((employee, index) => (
            <motion.tr
              key={employee.id}
              className={`border-t border-[var(--border)] ${
                index % 2 === 0 ? 'bg-[var(--bg-surface)]' : 'bg-[var(--bg-elevated)]'
              }`}
              variants={item}
              whileHover={{ scale: 1.01, transition: { duration: 0.2 } }}
            >
              <td className="px-6 py-4 text-sm text-[var(--text-primary)]">
                {employee.firstName} {employee.lastName}
              </td>
              <td className="px-6 py-4 text-sm text-[var(--text-secondary)]">{employee.department}</td>
              <td className="px-6 py-4 text-sm text-[var(--text-secondary)]">{employee.designation}</td>
              <td className="px-6 py-4 text-sm text-[var(--accent-secondary)] font-medium">
                ₹{employee.basicSalary.toLocaleString('en-IN')}
              </td>
              <td className="px-6 py-4">
                <span
                  className={`px-2 py-1 rounded-full text-xs font-medium ${
                    employee.status === 'active'
                      ? 'bg-[var(--glow-teal)] text-[var(--accent-secondary)]'
                      : 'bg-red-500/20 text-red-400'
                  }`}
                >
                  {employee.status}
                </span>
              </td>
              <td className="px-6 py-4">
                <div className="flex gap-2">
                  <motion.button
                    onClick={() => onEdit(employee)}
                    className="p-2 rounded-lg bg-[var(--glow-violet)] text-[var(--accent-primary)] hover:bg-[var(--accent-primary)] hover:text-white transition-colors"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    <Edit size={16} />
                  </motion.button>
                  <motion.button
                    onClick={() => onDeactivate(employee)}
                    className="p-2 rounded-lg bg-red-500/20 text-red-400 hover:bg-red-500 hover:text-white transition-colors"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    {deactivatingId === employee.id
                      ? <div className="w-4 h-4 border-2 border-red-400 border-t-transparent rounded-full animate-spin" />
                      : <Trash2 size={16} />}
                  </motion.button>
                </div>
              </td>
            </motion.tr>
          ))}
        </tbody>
      </table>
    </motion.div>
  );
};

export default EmployeeTable;