const { readJSON } = require('../utils/fileHelper');

const getAttendance = (req, res) => {
  try {
    let attendance = readJSON('attendance');
    const { department, status, date } = req.query;

    if (department) {
      attendance = attendance.filter(a => a.department === department);
    }
    if (status) {
      attendance = attendance.filter(a => a.status === status);
    }
    if (date) {
      attendance = attendance.filter(a => a.date === date);
    }

    res.json(attendance);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getAttendanceSummary = (req, res) => {
  try {
    const attendance = readJSON('attendance');
    
    const summary = {
      total: attendance.length,
      present: attendance.filter(a => a.status === 'present').length,
      late: attendance.filter(a => a.status === 'late').length,
      absent: attendance.filter(a => a.status === 'absent').length,
      date: new Date().toISOString()
    };

    res.json(summary);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = { getAttendance, getAttendanceSummary };
