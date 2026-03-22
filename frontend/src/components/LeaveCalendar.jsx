import { useState } from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];

const typeColor = (type) => {
  if (!type) return '#6C63FF';
  const t = type.toLowerCase();
  if (t.includes('sick')) return '#FF4365';
  if (t.includes('casual')) return '#FFB547';
  return '#00D4AA'; // paid / unpaid
};

const LeaveCalendar = ({ leaves = [] }) => {
  const today = new Date();
  const [viewDate, setViewDate] = useState(new Date(today.getFullYear(), today.getMonth(), 1));

  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  // Build a map of date -> leave info (approved takes priority over pending)
  const leaveMap = {};
  const sorted = [...leaves].sort(a => a.status === 'approved' ? 1 : -1); // approved last = overwrites pending
  sorted.forEach(l => {
    if (l.status === 'rejected') return;
    const start = new Date(l.startDate);
    const end = new Date(l.endDate);
    const cur = new Date(start);
    while (cur <= end) {
      if (cur.getMonth() === month && cur.getFullYear() === year) {
        leaveMap[cur.getDate()] = { type: l.leaveType === 'unpaid' ? 'paid' : l.leaveType, status: l.status };
      }
      cur.setDate(cur.getDate() + 1);
    }
  });

  const prev = () => setViewDate(new Date(year, month - 1, 1));
  const next = () => setViewDate(new Date(year, month + 1, 1));

  const cells = [];
  for (let i = 0; i < firstDay; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);

  const isToday = (d) => d === today.getDate() && month === today.getMonth() && year === today.getFullYear();

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <button onClick={prev} className="p-1.5 rounded-lg hover:bg-[var(--bg-elevated)] transition-colors">
          <ChevronLeft size={18} className="text-[var(--text-secondary)]" />
        </button>
        <span className="font-semibold text-[var(--text-primary)]">{MONTHS[month]} {year}</span>
        <button onClick={next} className="p-1.5 rounded-lg hover:bg-[var(--bg-elevated)] transition-colors">
          <ChevronRight size={18} className="text-[var(--text-secondary)]" />
        </button>
      </div>

      {/* Day headers */}
      <div className="grid grid-cols-7 mb-2">
        {DAYS.map(d => (
          <div key={d} className="text-center text-xs font-medium text-[var(--text-tertiary)] py-1">{d}</div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7 gap-1">
        {cells.map((day, i) => {
          if (!day) return <div key={`empty-${i}`} />;
          const leave = leaveMap[day];
          const color = leave ? typeColor(leave.type) : null;
          const opacity = leave?.status === 'pending' ? '60' : 'FF';
          return (
            <motion.div
              key={day}
              className="relative aspect-square flex items-center justify-center rounded-lg text-sm cursor-default"
              style={{
                background: color ? `${color}${opacity === 'FF' ? '25' : '15'}` : 'transparent',
                border: isToday(day) ? '2px solid var(--accent-primary)' : '1px solid transparent',
                color: color ? color : isToday(day) ? 'var(--accent-primary)' : 'var(--text-primary)',
                fontWeight: isToday(day) || color ? '600' : '400',
              }}
              whileHover={{ scale: 1.1 }}
              title={leave ? `${leave.type} (${leave.status})` : ''}
            >
              {day}
              {leave && (
                <div className="absolute bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full" style={{ background: color }} />
              )}
            </motion.div>
          );
        })}
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-3 mt-4 pt-3 border-t border-[var(--border)]">
        {[
          { label: 'Sick', color: '#FF4365' },
          { label: 'Casual', color: '#FFB547' },
          { label: 'Paid', color: '#00D4AA' },
        ].map(({ label, color }) => (
          <div key={label} className="flex items-center gap-1.5 text-xs text-[var(--text-secondary)]">
            <div className="w-2.5 h-2.5 rounded-full" style={{ background: color }} />
            {label}
          </div>
        ))}
        <div className="flex items-center gap-1.5 text-xs text-[var(--text-secondary)]">
          <div className="w-2.5 h-2.5 rounded border-2" style={{ borderColor: 'var(--accent-primary)' }} />
          Today
        </div>
      </div>
    </div>
  );
};

export default LeaveCalendar;
