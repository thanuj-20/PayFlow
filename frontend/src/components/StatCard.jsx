import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';

const StatCard = ({ icon: Icon, label, value, color = 'primary' }) => {
  const [displayValue, setDisplayValue] = useState(0);

  // Extract numeric part regardless of whether value is number or currency string
  const numericValue = typeof value === 'number'
    ? value
    : parseFloat(String(value).replace(/[^\d.]/g, '')) || 0;

  const isCurrency = typeof value === 'string' && value.includes('₹');

  useEffect(() => {
    let current = 0;
    const steps = 50;
    const increment = numericValue / steps;
    const timer = setInterval(() => {
      current += increment;
      if (current >= numericValue) {
        setDisplayValue(numericValue);
        clearInterval(timer);
      } else {
        setDisplayValue(Math.floor(current));
      }
    }, 20);
    return () => clearInterval(timer);
  }, [numericValue]);

  const formatted = isCurrency
    ? `₹${Math.floor(displayValue).toLocaleString('en-IN')}`
    : Math.floor(displayValue).toLocaleString();

  return (
    <motion.div
      className="bg-[var(--bg-surface)] border border-[var(--border)] rounded-xl p-6 relative overflow-hidden"
      whileHover={{ scale: 1.018, transition: { duration: 0.2 } }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <div className={`absolute left-0 top-0 bottom-0 w-1 ${
        color === 'secondary' ? 'bg-[var(--accent-secondary)]' : 'bg-[var(--accent-primary)]'
      }`} />
      <div className="flex items-center gap-4">
        <div className={`p-3 rounded-lg ${
          color === 'secondary' ? 'bg-[var(--glow-teal)]' : 'bg-[var(--glow-violet)]'
        }`}>
          <Icon size={24} className={color === 'secondary' ? 'text-[var(--accent-secondary)]' : 'text-[var(--accent-primary)]'} />
        </div>
        <div>
          <div className="text-3xl font-bold text-[var(--text-primary)]">{formatted}</div>
          <div className="text-sm text-[var(--text-secondary)]">{label}</div>
        </div>
      </div>
    </motion.div>
  );
};

export default StatCard;
