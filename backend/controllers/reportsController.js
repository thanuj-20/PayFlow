const { readJSON } = require('../utils/fileHelper');

const getReportsSummary = (req, res) => {
  try {
    const employees = readJSON('employees');
    const payroll = readJSON('payroll');
    const attendance = readJSON('attendance');

    const activeEmployees = employees.filter(e => e.status === 'active');
    
    // Workforce summary
    const workforce = {
      total: employees.length,
      active: activeEmployees.length,
      inactive: employees.filter(e => e.status === 'inactive').length,
      departments: [...new Set(employees.map(e => e.department))].length,
      avgSalary: Math.floor(activeEmployees.reduce((sum, e) => sum + e.basicSalary, 0) / activeEmployees.length)
    };

    // Department breakdown
    const deptMap = {};
    activeEmployees.forEach(emp => {
      if (!deptMap[emp.department]) {
        deptMap[emp.department] = { department: emp.department, count: 0, totalSalary: 0 };
      }
      deptMap[emp.department].count++;
      deptMap[emp.department].totalSalary += emp.basicSalary;
    });

    const departmentBreakdown = Object.values(deptMap)
      .map(d => ({
        department: d.department,
        count: d.count,
        avgSalary: Math.floor(d.totalSalary / d.count)
      }))
      .sort((a, b) => b.count - a.count);

    // Salary brackets
    const salaryBrackets = [
      { range: '0-40K', count: activeEmployees.filter(e => e.basicSalary < 40000).length },
      { range: '40K-60K', count: activeEmployees.filter(e => e.basicSalary >= 40000 && e.basicSalary < 60000).length },
      { range: '60K-80K', count: activeEmployees.filter(e => e.basicSalary >= 60000 && e.basicSalary < 80000).length },
      { range: '80K-1L', count: activeEmployees.filter(e => e.basicSalary >= 80000 && e.basicSalary < 100000).length },
      { range: '1L+', count: activeEmployees.filter(e => e.basicSalary >= 100000).length }
    ];

    // Payroll summary
    const payrollSummary = {
      month: 'March',
      year: 2026,
      totalGross: payroll.reduce((sum, p) => sum + p.basicSalary, 0),
      totalBonus: payroll.reduce((sum, p) => sum + p.bonus, 0),
      totalDeductions: payroll.reduce((sum, p) => sum + p.deductions, 0),
      totalNet: payroll.reduce((sum, p) => sum + p.netSalary, 0)
    };

    // Attendance summary
    const attendanceSummary = {
      date: '2026-03-13',
      present: attendance.filter(a => a.status === 'present').length,
      late: attendance.filter(a => a.status === 'late').length,
      absent: attendance.filter(a => a.status === 'absent').length,
      total: attendance.length
    };

    // All employee records with payroll data
    const allEmployeeRecords = employees.map(emp => {
      const payrollData = payroll.find(p => p.employeeId === emp.id);
      return {
        id: emp.id,
        firstName: emp.firstName,
        lastName: emp.lastName,
        department: emp.department,
        designation: emp.designation,
        basicSalary: emp.basicSalary,
        bonus: payrollData ? payrollData.bonus : 0,
        deductions: payrollData ? payrollData.deductions : 0,
        netSalary: payrollData ? payrollData.netSalary : 0,
        status: emp.status,
        joiningDate: emp.joiningDate
      };
    });

    res.json({
      workforce,
      departmentBreakdown,
      salaryBrackets,
      payrollSummary,
      attendanceSummary,
      allEmployeeRecords
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = { getReportsSummary };
