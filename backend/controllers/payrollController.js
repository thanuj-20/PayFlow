const { readJSON, writeJSON } = require('../utils/fileHelper');

const getPayroll = (req, res) => {
  try {
    let payroll = readJSON('payroll');
    const { month, year, department } = req.query;

    if (month) {
      payroll = payroll.filter(p => p.month === month);
    }
    if (year) {
      payroll = payroll.filter(p => p.year === parseInt(year));
    }
    if (department) {
      payroll = payroll.filter(p => p.department === department);
    }

    res.json(payroll);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getPayrollSummary = (req, res) => {
  try {
    const payroll = readJSON('payroll');
    
    const summary = {
      totalGross: payroll.reduce((sum, p) => sum + p.basicSalary, 0),
      totalBonus: payroll.reduce((sum, p) => sum + p.bonus, 0),
      totalDeductions: payroll.reduce((sum, p) => sum + p.deductions, 0),
      totalNet: payroll.reduce((sum, p) => sum + p.netSalary, 0),
      month: 'March',
      year: 2026,
      employeeCount: payroll.length
    };

    res.json(summary);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const runPayroll = (req, res) => {
  try {
    const employees = readJSON('employees');
    const activeEmployees = employees.filter(e => e.status === 'active');

    const payrollRecords = activeEmployees.map((emp, index) => {
      const bonus = Math.floor(emp.basicSalary * 0.10);
      const deductions = Math.floor(emp.basicSalary * 0.12);
      const netSalary = emp.basicSalary + bonus - deductions;

      return {
        id: 'p' + (index + 1),
        employeeId: emp.id,
        employeeName: `${emp.firstName} ${emp.lastName}`,
        department: emp.department,
        designation: emp.designation,
        month: 'March',
        year: 2026,
        basicSalary: emp.basicSalary,
        bonus,
        deductions,
        netSalary,
        status: 'processed',
        processedAt: new Date().toISOString()
      };
    });

    const payslipRecords = activeEmployees.map((emp, index) => {
      const bonus = Math.floor(emp.basicSalary * 0.10);
      const deductions = Math.floor(emp.basicSalary * 0.12);
      const netSalary = emp.basicSalary + bonus - deductions;

      return {
        id: 'ps' + (index + 1),
        employeeId: emp.id,
        employeeName: `${emp.firstName} ${emp.lastName}`,
        designation: emp.designation,
        department: emp.department,
        month: 'March',
        year: 2026,
        basicSalary: emp.basicSalary,
        bonus,
        deductions,
        netSalary,
        generatedAt: new Date().toISOString(),
        status: 'generated'
      };
    });

    writeJSON('payroll', payrollRecords);
    writeJSON('payslips', payslipRecords);

    res.json({
      message: 'Payroll processed successfully',
      month: 'March',
      year: 2026,
      processed: activeEmployees.length
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getPayrollByEmployee = (req, res) => {
  try {
    const payroll = readJSON('payroll');
    
    if (req.user.role === 'employee' && req.user.employeeId !== req.params.employeeId) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const employeePayroll = payroll.filter(p => p.employeeId === req.params.employeeId);
    res.json(employeePayroll);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = { getPayroll, getPayrollSummary, runPayroll, getPayrollByEmployee };
