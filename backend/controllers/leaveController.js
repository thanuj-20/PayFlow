const { pushNotification } = require('./notificationsController');

const getLeaveBalance = async (req, res) => {
  try {
    const db = req.db;
    const employeeId = req.user.role === 'hr' ? req.query.employeeId : req.user.employeeId;
    const year = new Date().getFullYear();
    const LIMITS = { casual: 12, sick: 6, earned: 15, unpaid: 999 };

    const leaves = await db.collection('leaves').find({
      employeeId,
      status: { $in: ['approved', 'pending'] },
    }).toArray();

    const yearLeaves = leaves.filter(l => new Date(l.startDate).getFullYear() === year);

    const balance = Object.entries(LIMITS).map(([type, limit]) => {
      const used = yearLeaves.filter(l => l.leaveType === type).reduce((s, l) => s + (l.days || 0), 0);
      return { type, limit: limit === 999 ? 'Unlimited' : limit, used, remaining: limit === 999 ? 'Unlimited' : Math.max(0, limit - used) };
    });

    res.json(balance);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

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

    // Check leave balance
    const year = start.getFullYear();
    const ANNUAL_LIMITS = { casual: 12, sick: 6, earned: 15, unpaid: 999 };
    const limit = ANNUAL_LIMITS[leaveType] || 12;
    const usedLeaves = await db.collection('leaves').find({
      employeeId: req.user.employeeId,
      leaveType,
      status: { $in: ['approved', 'pending'] },
    }).toArray();
    const usedDays = usedLeaves.filter(l => new Date(l.startDate).getFullYear() === year)
      .reduce((sum, l) => sum + (l.days || 0), 0);

    if (usedDays + days > limit) {
      return res.status(400).json({
        message: `Insufficient ${leaveType} leave balance. Used: ${usedDays}/${limit} days. Requested: ${days} days.`
      });
    }

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

    const leave = await db.collection('leaves').findOne({ id });
    await db.collection('leaves').updateOne(
      { id },
      { $set: { status, hrComment, reviewedAt: new Date().toISOString(), reviewedBy: req.user.userId } }
    );

    // Notify the employee
    if (leave) {
      const empUser = await db.collection('users').findOne({ employeeId: leave.employeeId });
      if (empUser) {
        const icon = status === 'approved' ? 'success' : 'danger';
        await pushNotification(db, empUser.id,
          `Leave ${status.charAt(0).toUpperCase() + status.slice(1)}`,
          `Your ${leave.leaveType} leave (${leave.startDate} to ${leave.endDate}) has been ${status}.${hrComment ? ' Comment: ' + hrComment : ''}`,
          icon
        );
      }
    }
    res.json({ message: `Leave ${status}` });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getLeaves, applyLeave, updateLeaveStatus, getLeaveBalance };
