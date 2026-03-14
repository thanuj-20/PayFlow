const { readJSON } = require('../utils/fileHelper');

const getAllPayslips = (req, res) => {
  try {
    const payslips = readJSON('payslips');
    res.json(payslips);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getPayslipsByEmployee = (req, res) => {
  try {
    const payslips = readJSON('payslips');
    
    if (req.user.role === 'employee' && req.user.employeeId !== req.params.employeeId) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const employeePayslips = payslips.filter(p => p.employeeId === req.params.employeeId);
    res.json(employeePayslips);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = { getAllPayslips, getPayslipsByEmployee };
