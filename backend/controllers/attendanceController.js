const getAttendance = async (req, res) => {
  try {
    const db = req.db;
    const { department, status, date, employeeId } = req.query;
    const query = {};
    if (department) query.department = department;
    if (status) query.status = status;
    if (date) query.date = date;
    if (employeeId) query.employeeId = employeeId;
    if (req.user.role === 'employee') query.employeeId = req.user.employeeId;
    const attendance = await db.collection('attendance').find(query).sort({ date: -1 }).toArray();
    res.json(attendance);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getAttendanceSummary = async (req, res) => {
  try {
    const db = req.db;
    const today = new Date().toISOString().split('T')[0];
    const attendance = await db.collection('attendance').find({ date: today }).toArray();
    res.json({
      total: attendance.length,
      present: attendance.filter(a => a.status === 'present').length,
      late: attendance.filter(a => a.status === 'late').length,
      absent: attendance.filter(a => a.status === 'absent').length,
      date: today
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Employee: check in for today
const checkIn = async (req, res) => {
  try {
    const db = req.db;
    const today = new Date().toISOString().split('T')[0];
    const now = new Date();
    const timeStr = now.toTimeString().slice(0, 5); // HH:MM

    const existing = await db.collection('attendance').findOne({
      employeeId: req.user.employeeId, date: today
    });
    if (existing) return res.status(400).json({ error: 'Already checked in today' });

    const employee = await db.collection('employees').findOne({ id: req.user.employeeId });
    // Late if after 09:30
    const [h, m] = timeStr.split(':').map(Number);
    const status = (h > 9 || (h === 9 && m > 30)) ? 'late' : 'present';

    const record = {
      id: 'a' + Date.now(),
      employeeId: req.user.employeeId,
      employeeName: employee ? `${employee.firstName} ${employee.lastName}` : '',
      department: employee?.department || '',
      date: today,
      checkIn: timeStr,
      checkOut: null,
      status,
      overtimeHours: 0,
    };

    await db.collection('attendance').insertOne(record);
    res.status(201).json(record);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Employee: check out for today
const checkOut = async (req, res) => {
  try {
    const db = req.db;
    const today = new Date().toISOString().split('T')[0];
    const timeStr = new Date().toTimeString().slice(0, 5);

    const record = await db.collection('attendance').findOne({
      employeeId: req.user.employeeId, date: today
    });
    if (!record) return res.status(400).json({ error: 'No check-in found for today' });
    if (record.checkOut) return res.status(400).json({ error: 'Already checked out today' });

    // Calculate overtime: hours worked beyond 8h
    const [inH, inM] = record.checkIn.split(':').map(Number);
    const [outH, outM] = timeStr.split(':').map(Number);
    const workedMinutes = (outH * 60 + outM) - (inH * 60 + inM);
    const overtimeHours = Math.max(0, Math.round((workedMinutes - 480) / 60 * 10) / 10);

    await db.collection('attendance').updateOne(
      { id: record.id },
      { $set: { checkOut: timeStr, overtimeHours } }
    );
    res.json({ ...record, checkOut: timeStr, overtimeHours });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// HR: manually add/edit an attendance record
const addAttendance = async (req, res) => {
  try {
    const db = req.db;
    const { employeeId, date, checkIn, checkOut, status, overtimeHours } = req.body;
    if (!employeeId || !date || !status) {
      return res.status(400).json({ error: 'employeeId, date, and status are required' });
    }

    const employee = await db.collection('employees').findOne({ id: employeeId });
    if (!employee) return res.status(404).json({ error: 'Employee not found' });

    // Upsert: replace existing record for same employee+date
    await db.collection('attendance').deleteOne({ employeeId, date });
    const record = {
      id: 'a' + Date.now(),
      employeeId,
      employeeName: `${employee.firstName} ${employee.lastName}`,
      department: employee.department,
      date,
      checkIn: checkIn || null,
      checkOut: checkOut || null,
      status,
      overtimeHours: parseFloat(overtimeHours) || 0,
    };
    await db.collection('attendance').insertOne(record);
    res.status(201).json(record);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = { getAttendance, getAttendanceSummary, checkIn, checkOut, addAttendance };
