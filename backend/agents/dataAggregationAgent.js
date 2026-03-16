// Agent 1: Data Aggregation Agent
// Collects attendance, leave, overtime data and aggregates into payroll input

const WORKING_DAYS_PER_MONTH = 26;

const aggregate = async (db, employeeId, month, year) => {
  const monthNames = ['January','February','March','April','May','June','July','August','September','October','November','December'];
  const monthIndex = monthNames.indexOf(month);

  // Build date range for the month
  const monthStart = new Date(year, monthIndex, 1).toISOString().split('T')[0];
  const monthEnd = new Date(year, monthIndex + 1, 0).toISOString().split('T')[0];

  // Get attendance records for this specific month only
  const monthAttendance = await db.collection('attendance').find({
    employeeId,
    date: { $gte: monthStart, $lte: monthEnd },
  }).toArray();

  // Get approved leaves that overlap with this month
  // A leave overlaps if startDate <= monthEnd AND endDate >= monthStart
  const monthLeaves = await db.collection('leaves').find({
    employeeId,
    status: 'approved',
    startDate: { $lte: monthEnd },
    endDate: { $gte: monthStart },
  }).toArray();

  const presentDays = monthAttendance.filter(a => a.status === 'present' || a.status === 'late').length;
  const absentDays = monthAttendance.filter(a => a.status === 'absent').length;

  // Count only the leave days that fall within this month
  let approvedLeaveDays = 0;
  monthLeaves.forEach(l => {
    const start = new Date(Math.max(new Date(l.startDate), new Date(monthStart)));
    const end = new Date(Math.min(new Date(l.endDate), new Date(monthEnd)));
    const days = Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1;
    approvedLeaveDays += Math.max(0, days);
  });

  const lopDays = Math.max(0, absentDays - approvedLeaveDays);
  const overtimeHours = monthAttendance.reduce((sum, a) => sum + (a.overtimeHours || 0), 0);

  return { presentDays, absentDays, approvedLeaveDays, lopDays, overtimeHours, workingDays: WORKING_DAYS_PER_MONTH };
};

module.exports = { aggregate };
