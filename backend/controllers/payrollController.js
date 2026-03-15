const dataAggregationAgent = require('../agents/dataAggregationAgent');
const payrollCalculationAgent = require('../agents/payrollCalculationAgent');
const complianceValidationAgent = require('../agents/complianceValidationAgent');
const anomalyDetectionAgent = require('../agents/anomalyDetectionAgent');
const explanationAgent = require('../agents/explanationAgent');
const { pushNotification } = require('./notificationsController');
const { sendPayrollEmail } = require('../utils/emailHelper');

const getPayroll = async (req, res) => {
  try {
    const db = req.db;
    const { month, year, department, status } = req.query;
    const query = {};
    if (month) query.month = month;
    if (year) query.year = parseInt(year);
    if (department) query.department = department;
    if (status) query.status = status;
    const payroll = await db.collection('payroll').find(query).toArray();
    res.json(payroll);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getPayrollSummary = async (req, res) => {
  try {
    const db = req.db;
    const payroll = await db.collection('payroll').find({}).toArray();
    const now = new Date();
    const summary = {
      totalGross: payroll.reduce((sum, p) => sum + (p.grossSalary || p.basicSalary || 0), 0),
      totalBonus: payroll.reduce((sum, p) => sum + (p.overtimePay || 0), 0),
      totalDeductions: payroll.reduce((sum, p) => sum + (p.totalDeductions || 0), 0),
      totalNet: payroll.reduce((sum, p) => sum + (p.netSalary || 0), 0),
      month: now.toLocaleString('default', { month: 'long' }),
      year: now.getFullYear(),
      employeeCount: payroll.length,
      pendingApproval: payroll.filter(p => p.status === 'pending_approval').length,
      approved: payroll.filter(p => p.status === 'approved').length,
      held: payroll.filter(p => p.status === 'held').length,
    };
    res.json(summary);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const initiatePayroll = async (req, res) => {
  try {
    const db = req.db;
    const now = new Date();
    // HR can pass month/year, defaults to current
    const month = req.body.month || now.toLocaleString('default', { month: 'long' });
    const year = parseInt(req.body.year) || now.getFullYear();

    // Lock check: prevent re-initiating an already approved month
    const approvedCount = await db.collection('payroll').countDocuments({ month, year, status: 'approved' });
    if (approvedCount > 0) {
      return res.status(400).json({
        message: `Payroll for ${month} ${year} is already approved (${approvedCount} records). Cannot re-initiate a locked month.`
      });
    }

    const employees = await db.collection('employees').find({ status: 'active' }).toArray();
    const results = [];

    for (const emp of employees) {
      const aggregated = await dataAggregationAgent.aggregate(db, emp.id, month, year);
      const calculated = payrollCalculationAgent.calculate(emp, aggregated);
      const compliance = complianceValidationAgent.validate(calculated, emp);
      const prevMonthPayroll = await db.collection('payroll').findOne(
        { employeeId: emp.id, status: { $in: ['approved', 'processed'] } },
        { sort: { year: -1 } }
      );
      const anomalies = anomalyDetectionAgent.detect(calculated, prevMonthPayroll);
      const explanation = await explanationAgent.generate(calculated, emp, prevMonthPayroll);

      const record = {
        id: 'p' + Date.now() + Math.random().toString(36).substr(2, 5),
        employeeId: emp.id,
        employeeName: `${emp.firstName} ${emp.lastName}`,
        department: emp.department,
        designation: emp.designation,
        month, year,
        basicSalary: calculated.basicSalary,
        hra: calculated.hra,
        overtimePay: calculated.overtimePay,
        lopDeduction: calculated.lopDeduction,
        lopDays: calculated.lopDays,
        overtimeHours: calculated.overtimeHours,
        pfDeduction: calculated.pfDeduction,
        professionalTax: calculated.professionalTax,
        grossSalary: calculated.grossSalary,
        totalDeductions: calculated.totalDeductions,
        netSalary: calculated.netSalary,
        explanation,
        compliance,
        anomalies,
        status: 'pending_approval',
        initiatedAt: now.toISOString(),
        initiatedBy: req.user.userId,
      };

      results.push(record);
    }

    await db.collection('payroll').deleteMany({ month, year, status: 'pending_approval' });
    if (results.length > 0) await db.collection('payroll').insertMany(results);

    const flagged = results.filter(r => !r.compliance.isCompliant || r.anomalies.hasAnomalies).length;

    res.json({
      message: 'Payroll initiated successfully',
      month, year,
      processed: results.length,
      flagged,
      requiresReview: flagged > 0,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const notifyAndEmail = async (db, record) => {
  try {
    const empUser = await db.collection('users').findOne({ employeeId: record.employeeId });
    if (empUser) {
      await pushNotification(db, empUser.id, 'Payslip Ready',
        `Your payslip for ${record.month} ${record.year} has been approved. Net salary: Rs.${record.netSalary?.toLocaleString('en-IN')}.`,
        'success'
      );
    }
    const emp = await db.collection('employees').findOne({ id: record.employeeId });
    if (emp) {
      sendPayrollEmail(emp, record).catch(e => console.warn('Payroll email failed:', e.message));
    }
  } catch (e) {
    console.warn('notifyAndEmail failed:', e.message);
  }
};

const approvePayrollRecord = async (req, res) => {
  try {
    const db = req.db;
    const { id } = req.params;
    await db.collection('payroll').updateOne(
      { id },
      { $set: { status: 'approved', approvedAt: new Date().toISOString(), approvedBy: req.user.userId } }
    );
    const record = await db.collection('payroll').findOne({ id });
    if (record) {
      await db.collection('payslips').deleteOne({ employeeId: record.employeeId, month: record.month, year: record.year });
      await db.collection('payslips').insertOne({ ...record, id: 'ps' + Date.now(), status: 'generated', generatedAt: new Date().toISOString() });
      await notifyAndEmail(db, record);
    }
    res.json({ message: 'Payroll record approved' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const approveAllPayroll = async (req, res) => {
  try {
    const db = req.db;
    const { month, year } = req.body;
    const now = new Date().toISOString();
    const records = await db.collection('payroll').find({ month, year: parseInt(year), status: 'pending_approval' }).toArray();

    for (const record of records) {
      await db.collection('payroll').updateOne(
        { id: record.id },
        { $set: { status: 'approved', approvedAt: now, approvedBy: req.user.userId } }
      );
      await db.collection('payslips').deleteOne({ employeeId: record.employeeId, month, year: parseInt(year) });
      await db.collection('payslips').insertOne({ ...record, id: 'ps' + Date.now() + record.employeeId, status: 'generated', generatedAt: now });
      await notifyAndEmail(db, record);
    }

    res.json({ message: `${records.length} payroll records approved`, month, year });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const holdPayrollRecord = async (req, res) => {
  try {
    const db = req.db;
    const { id } = req.params;
    const { reason } = req.body;
    await db.collection('payroll').updateOne(
      { id },
      { $set: { status: 'held', heldAt: new Date().toISOString(), heldBy: req.user.userId, holdReason: reason } }
    );
    res.json({ message: 'Payroll record held for review' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getPayrollByEmployee = async (req, res) => {
  try {
    const db = req.db;
    if (req.user.role === 'employee' && req.user.employeeId !== req.params.employeeId) {
      return res.status(403).json({ message: 'Access denied' });
    }
    const payroll = await db.collection('payroll').find({ employeeId: req.params.employeeId }).toArray();
    res.json(payroll);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const runPayroll = initiatePayroll;

module.exports = { getPayroll, getPayrollSummary, initiatePayroll, runPayroll, approvePayrollRecord, approveAllPayroll, holdPayrollRecord, getPayrollByEmployee };
