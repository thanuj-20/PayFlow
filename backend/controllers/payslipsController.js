const getAllPayslips = async (req, res) => {
  try {
    const db = req.db;
    const payslips = await db.collection('payslips').find({}).toArray();
    res.json(payslips);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getPayslipsByEmployee = async (req, res) => {
  try {
    const db = req.db;
    if (req.user.role === 'employee' && req.user.employeeId !== req.params.employeeId) {
      return res.status(403).json({ error: 'Access denied' });
    }
    const payslips = await db.collection('payslips').find({ employeeId: req.params.employeeId }).toArray();
    res.json(payslips);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const downloadPayslipPDF = async (req, res) => {
  try {
    const db = req.db;
    const { id } = req.params;
    const ps = await db.collection('payslips').findOne({ id });
    if (!ps) return res.status(404).json({ error: 'Payslip not found' });

    // Employees can only download their own
    if (req.user.role === 'employee' && req.user.employeeId !== ps.employeeId) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const PDFDocument = require('pdfkit');
    const doc = new PDFDocument({ margin: 50, size: 'A4' });

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=payslip-${ps.employeeName?.replace(/ /g, '-')}-${ps.month}-${ps.year}.pdf`);
    doc.pipe(res);

    const fmt = (n) => `Rs. ${Math.abs(n || 0).toLocaleString('en-IN')}`;
    const W = 495; // usable width

    // Header bar
    doc.rect(50, 50, W, 60).fill('#6C63FF');
    doc.fillColor('white').fontSize(22).font('Helvetica-Bold').text('PayFlow', 60, 65);
    doc.fontSize(10).font('Helvetica').text('Payroll Intelligence System', 60, 90);
    doc.fontSize(12).text('PAYSLIP', 450, 72, { align: 'right', width: 95 });

    // Period badge
    doc.rect(50, 120, W, 30).fill('#F0F0FF');
    doc.fillColor('#6C63FF').fontSize(11).font('Helvetica-Bold')
      .text(`Pay Period: ${ps.month} ${ps.year}`, 60, 129);
    doc.fillColor('#444').fontSize(10).font('Helvetica')
      .text(`Generated: ${new Date().toLocaleDateString('en-IN')}`, 400, 129, { align: 'right', width: 145 });

    // Employee info
    doc.fillColor('#111').fontSize(13).font('Helvetica-Bold').text('Employee Details', 50, 165);
    doc.moveTo(50, 182).lineTo(545, 182).strokeColor('#DDDDE8').stroke();

    const infoY = 190;
    doc.fontSize(10).font('Helvetica').fillColor('#555');
    doc.text('Name:', 50, infoY).text('Department:', 300, infoY);
    doc.fillColor('#111').font('Helvetica-Bold');
    doc.text(ps.employeeName || '', 120, infoY).text(ps.department || '', 380, infoY);

    doc.fillColor('#555').font('Helvetica');
    doc.text('Employee ID:', 50, infoY + 20).text('Designation:', 300, infoY + 20);
    doc.fillColor('#111').font('Helvetica-Bold');
    doc.text(ps.employeeId || '', 120, infoY + 20).text(ps.designation || '', 380, infoY + 20);

    // Earnings table
    doc.fillColor('#111').fontSize(13).font('Helvetica-Bold').text('Earnings', 50, 255);
    doc.moveTo(50, 272).lineTo(545, 272).strokeColor('#DDDDE8').stroke();

    const row = (label, value, y, color = '#111', bold = false) => {
      doc.fillColor('#555').fontSize(10).font('Helvetica').text(label, 50, y);
      doc.fillColor(color).font(bold ? 'Helvetica-Bold' : 'Helvetica').text(value, 400, y, { align: 'right', width: 145 });
    };

    let y = 280;
    row('Basic Salary', fmt(ps.basicSalary), y); y += 20;
    row('House Rent Allowance (HRA)', fmt(ps.hra), y); y += 20;
    if (ps.overtimePay > 0) { row(`Overtime Pay (${ps.overtimeHours}h)`, fmt(ps.overtimePay), y, '#00B894'); y += 20; }

    doc.moveTo(50, y + 5).lineTo(545, y + 5).strokeColor('#DDDDE8').stroke(); y += 15;
    row('Gross Salary', fmt(ps.grossSalary), y, '#6C63FF', true); y += 30;

    // Deductions table
    doc.fillColor('#111').fontSize(13).font('Helvetica-Bold').text('Deductions', 50, y); y += 20;
    doc.moveTo(50, y).lineTo(545, y).strokeColor('#DDDDE8').stroke(); y += 10;

    row('Provident Fund (PF)', fmt(ps.pfDeduction), y, '#FF4365'); y += 20;
    row('Professional Tax', fmt(ps.professionalTax), y, '#FF4365'); y += 20;
    if (ps.lopDays > 0) { row(`Loss of Pay (${ps.lopDays} days)`, fmt(ps.lopDeduction), y, '#FF4365'); y += 20; }

    doc.moveTo(50, y + 5).lineTo(545, y + 5).strokeColor('#DDDDE8').stroke(); y += 15;
    row('Total Deductions', fmt(ps.totalDeductions), y, '#FF4365', true); y += 30;

    // Net salary highlight
    doc.rect(50, y, W, 45).fill('#6C63FF');
    doc.fillColor('white').fontSize(13).font('Helvetica-Bold').text('NET SALARY', 60, y + 14);
    doc.fontSize(16).text(fmt(ps.netSalary), 400, y + 11, { align: 'right', width: 145 });
    y += 65;

    // AI Explanation
    if (ps.explanation) {
      doc.fillColor('#111').fontSize(11).font('Helvetica-Bold').text('Salary Explanation', 50, y); y += 18;
      doc.rect(50, y, W, 2).fill('#6C63FF'); y += 10;
      doc.fillColor('#444').fontSize(9).font('Helvetica').text(ps.explanation, 50, y, { width: W, lineGap: 3 });
    }

    // Footer
    doc.fillColor('#AAA').fontSize(8).font('Helvetica')
      .text('This is a system-generated payslip. PayFlow Payroll Intelligence System.', 50, 780, { align: 'center', width: W });

    doc.end();
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = { getAllPayslips, getPayslipsByEmployee, downloadPayslipPDF };
