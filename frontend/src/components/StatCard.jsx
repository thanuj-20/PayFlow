import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';

const StatCard = ({ icon: Icon, label, value, color = 'primary' }) => {
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    const numericValue = typeof value === 'string' ? parseFloat(value.replace(/[^\d.]/g, '')) || 0 : value;
    const duration = 1000;
    const steps = 60;
    const increment = numericValue / steps;
    let current = 0;
    const timer = setInterval(() => {
      current += increment;
      if (current >= numericValue) {
        setDisplayValue(numericValue);
        clearInterval(timer);
      } else {
        setDisplayValue(Math.floor(current));
      }
    }, duration / steps);
    return () => clearInterval(timer);
  }, [value]);

  const formatValue = (val) => {
    if (typeof value === 'string' && value.includes('₹')) {
      return `₹${val.toLocaleString('en-IN')}`;
    }
    return val.toLocaleString();
  };

  return (
    <motion.div
      className="bg-[var(--bg-surface)] border border-[var(--border)] rounded-xl p-6 relative overflow-hidden"
      whileHover={{ scale: 1.018, transition: { duration: 0.2 } }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <div
        className={`absolute left-0 top-0 bottom-0 w-1 ${
          color === 'secondary' ? 'bg-[var(--accent-secondary)]' : 'bg-[var(--accent-primary)]'
        }`}
      />
      <div className="flex items-center gap-4">
        <div className={`p-3 rounded-lg ${
          color === 'secondary' ? 'bg-[var(--glow-teal)]' : 'bg-[var(--glow-violet)]'
        }`}>
          <Icon size={24} className={color === 'secondary' ? 'text-[var(--accent-secondary)]' : 'text-[var(--accent-primary)]'} />
        </div>
        <div>
          <div className="text-3xl font-bold text-[var(--text-primary)] font-['Syne']">
            {formatValue(displayValue)}
          </div>
          <div className="text-sm text-[var(--text-secondary)]">{label}</div>
        </div>
      </div>
    </motion.div>
  );
};

export default StatCard;