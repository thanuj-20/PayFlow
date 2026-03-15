const exportCSV = async (req, res) => {
  try {
    const db = req.db;
    const [employees, payroll] = await Promise.all([
      db.collection('employees').find({}).toArray(),
      db.collection('payroll').find({ status: 'approved' }).toArray(),
    ]);

    const rows = employees.map(emp => {
      const p = payroll.find(r => r.employeeId === emp.id) || {};
      return [
        emp.id, emp.firstName, emp.lastName, emp.email,
        emp.department, emp.designation, emp.basicSalary,
        p.hra || '', p.overtimePay || 0, p.lopDeduction || 0,
        p.pfDeduction || '', p.professionalTax || '',
        p.grossSalary || '', p.totalDeductions || '',
        p.netSalary || '', p.month || '', p.year || '',
        emp.status, emp.joiningDate
      ].join(',');
    });

    const header = 'ID,First Name,Last Name,Email,Department,Designation,Basic Salary,HRA,Overtime Pay,LOP Deduction,PF,Prof Tax,Gross Salary,Total Deductions,Net Salary,Month,Year,Status,Joining Date';
    const csv = [header, ...rows].join('\n');

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename=payflow-report-${new Date().toISOString().split('T')[0]}.csv`);
    res.send(csv);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getReportsSummary = async (req, res) => {
  try {
    const db = req.db;
    const [employees, payroll, attendance] = await Promise.all([
      db.collection('employees').find({}).toArray(),
      db.collection('payroll').find({}).toArray(),
      db.collection('attendance').find({}).toArray(),
    ]);

    const activeEmployees = employees.filter(e => e.status === 'active');

    const workforce = {
      total: employees.length,
      active: activeEmployees.length,
      inactive: employees.filter(e => e.status === 'inactive').length,
      departments: [...new Set(employees.map(e => e.department))].length,
      avgSalary: activeEmployees.length
        ? Math.floor(activeEmployees.reduce((sum, e) => sum + e.basicSalary, 0) / activeEmployees.length)
        : 0
    };

    const deptMap = {};
    activeEmployees.forEach(emp => {
      if (!deptMap[emp.department]) {
        deptMap[emp.department] = { department: emp.department, count: 0, totalSalary: 0 };
      }
      deptMap[emp.department].count++;
      deptMap[emp.department].totalSalary += emp.basicSalary;
    });

    const departmentBreakdown = Object.values(deptMap)
      .map(d => ({ department: d.department, count: d.count, avgSalary: Math.floor(d.totalSalary / d.count) }))
      .sort((a, b) => b.count - a.count);

    const salaryBrackets = [
      { range: '0-40K', count: activeEmployees.filter(e => e.basicSalary < 40000).length },
      { range: '40K-60K', count: activeEmployees.filter(e => e.basicSalary >= 40000 && e.basicSalary < 60000).length },
      { range: '60K-80K', count: activeEmployees.filter(e => e.basicSalary >= 60000 && e.basicSalary < 80000).length },
      { range: '80K-1L', count: activeEmployees.filter(e => e.basicSalary >= 80000 && e.basicSalary < 100000).length },
      { range: '1L+', count: activeEmployees.filter(e => e.basicSalary >= 100000).length }
    ];

    const now = new Date();
    const payrollSummary = {
      month: now.toLocaleString('default', { month: 'long' }),
      year: now.getFullYear(),
      totalGross: payroll.reduce((sum, p) => sum + (p.basicSalary || 0), 0),
      totalBonus: payroll.reduce((sum, p) => sum + (p.bonus || 0), 0),
      totalDeductions: payroll.reduce((sum, p) => sum + (p.deductions || 0), 0),
      totalNet: payroll.reduce((sum, p) => sum + (p.netSalary || 0), 0)
    };

    const attendanceSummary = {
      date: now.toISOString().split('T')[0],
      present: attendance.filter(a => a.status === 'present').length,
      late: attendance.filter(a => a.status === 'late').length,
      absent: attendance.filter(a => a.status === 'absent').length,
      total: attendance.length
    };

    const allEmployeeRecords = employees.map(emp => {
      const payrollData = payroll.find(p => p.employeeId === emp.id);
      return {
        id: emp.id,
        firstName: emp.firstName,
        lastName: emp.lastName,
        department: emp.department,
        designation: emp.designation,
        basicSalary: emp.basicSalary,
        bonus: payrollData?.bonus || 0,
        deductions: payrollData?.deductions || 0,
        netSalary: payrollData?.netSalary || 0,
        status: emp.status,
        joiningDate: emp.joiningDate
      };
    });

    res.json({ workforce, departmentBreakdown, salaryBrackets, payrollSummary, attendanceSummary, allEmployeeRecords });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = { getReportsSummary, exportCSV };
