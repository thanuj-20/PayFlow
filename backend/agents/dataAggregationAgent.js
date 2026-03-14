// Agent 1: Data Aggregation Agent
// Collects attendance, leave, overtime data and aggregates into payroll input

const WORKING_DAYS_PER_MONTH = 26;

const aggregate = async (db, employeeId, month, year) => {
  const monthNames = ['January','February','March','April','May','June','July','August','September','October','November','December'];
  const monthIndex = monthNames.indexOf(month);

  // Get attendance records for this month
  const attendance = await db.collection('attendance').find({ employeeId }).toArray();
  const monthAttendance = attendance.filter(a => {
    const d = new Date(a.date);
    return d.getMonth() === monthIndex && d.getFullYear() === year;
  });

  // Get approved leaves for this month
  const leaves = await db.collection('leaves').find({
    employeeId,
    status: 'approved',
  }).toArray();
  const monthLeaves = leaves.filter(l => {
    const d = new Date(l.startDate);
    return d.getMonth() === monthIndex && d.getFullYear() === year;
  });

  const presentDays = monthAttendance.filter(a => a.status === 'present' || a.status === 'late').length;
  const absentDays = monthAttendance.filter(a => a.status === 'absent').length;
  const approvedLeaveDays = monthLeaves.reduce((sum, l) => sum + (l.days || 0), 0);
  const lopDays = Math.max(0, absentDays - approvedLeaveDays);
  const overtimeHours = monthAttendance.reduce((sum, a) => sum + (a.overtimeHours || 0), 0);

  return { presentDays, absentDays, approvedLeaveDays, lopDays, overtimeHours, workingDays: WORKING_DAYS_PER_MONTH };
};

module.exports = { aggregate };
