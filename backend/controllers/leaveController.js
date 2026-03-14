const getLeaves = async (req, res) => {
  try {
    const db = req.db;
    const query = {};
    if (req.user.role === 'employee') query.employeeId = req.user.employeeId;
    if (req.query.status) query.status = req.query.status;
    if (req.query.employeeId && req.user.role === 'hr') query.employeeId = req.query.employeeId;
    const leaves = await db.collection('leaves').find(query).sort({ appliedAt: -1 }).toArray();
    res.json(leaves);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const applyLeave = async (req, res) => {
  try {
    const db = req.db;
    const { leaveType, startDate, endDate, reason } = req.body;
    if (!leaveType || !startDate || !endDate || !reason) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    const start = new Date(startDate);
    const end = new Date(endDate);
    const days = Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1;

    const employee = await db.collection('employees').findOne({ id: req.user.employeeId });

    const leave = {
      id: 'l' + Date.now(),
      employeeId: req.user.employeeId,
      employeeName: employee ? `${employee.firstName} ${employee.lastName}` : '',
      department: employee?.department || '',
      leaveType,
      startDate,
      endDate,
      days,
      reason,
      status: 'pending',
      appliedAt: new Date().toISOString(),
    };

    await db.collection('leaves').insertOne(leave);
    res.status(201).json(leave);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updateLeaveStatus = async (req, res) => {
  try {
    const db = req.db;
    const { id } = req.params;
    const { status, hrComment } = req.body;

    if (!['approved', 'rejected'].includes(status)) {
      return res.status(400).json({ message: 'Status must be approved or rejected' });
    }

    await db.collection('leaves').updateOne(
      { id },
      { $set: { status, hrComment, reviewedAt: new Date().toISOString(), reviewedBy: req.user.userId } }
    );
    res.json({ message: `Leave ${status}` });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getLeaves, applyLeave, updateLeaveStatus };
