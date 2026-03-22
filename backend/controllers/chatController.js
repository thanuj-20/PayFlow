const { AzureOpenAI } = require('openai');

const getClient = () => {
  const endpoint = process.env.AZURE_OPENAI_ENDPOINT;
  const apiKey = process.env.AZURE_OPENAI_API_KEY;
  const deployment = process.env.AZURE_OPENAI_DEPLOYMENT || 'gpt-4o';
  if (!endpoint || !apiKey) return null;
  return { client: new AzureOpenAI({ endpoint, apiKey, apiVersion: '2024-08-01-preview', deployment }), deployment };
};

const fmt = (n) => `₹${Math.abs(n || 0).toLocaleString('en-IN')}`;

const buildUserContext = async (db, user) => {
  const lines = [];

  if (user.role === 'hr') {
    // HR: company-wide summary
    const employees = await db.collection('employees').find({ status: 'active' }).toArray();
    const payrolls = await db.collection('payroll').find({}).sort({ year: -1, month: -1 }).limit(50).toArray();
    const leaves = await db.collection('leaves').find({ status: 'pending' }).toArray();

    lines.push(`USER ROLE: HR Admin`);
    lines.push(`Active employees: ${employees.length}`);
    lines.push(`Pending leave requests: ${leaves.length}`);
    lines.push(`Recent payroll records (last ${payrolls.length}):`);
    payrolls.slice(0, 10).forEach(p => {
      lines.push(`  - ${p.employeeName} | ${p.month} ${p.year} | Basic: ${fmt(p.basicSalary)} | Net: ${fmt(p.netSalary)} | Status: ${p.status}`);
    });
    lines.push(`Employee list: ${employees.map(e => `${e.firstName} ${e.lastName} (${e.department}, ${fmt(e.basicSalary)})`).join(', ')}`);
  } else {
    // Employee: their own data
    const empId = user.employeeId;
    const employee = await db.collection('employees').findOne({ id: empId });
    if (employee) {
      lines.push(`USER ROLE: Employee`);
      lines.push(`Name: ${employee.firstName} ${employee.lastName}`);
      lines.push(`Department: ${employee.department} | Designation: ${employee.designation}`);
      lines.push(`Basic Salary: ${fmt(employee.basicSalary)}`);
    }

    // Latest payslips
    const payslips = await db.collection('payslips').find({ employeeId: empId }).sort({ year: -1 }).toArray();
    if (payslips.length > 0) {
      lines.push(`\nPayslip history (${payslips.length} records):`);
      payslips.forEach(ps => {
        lines.push(`  ${ps.month} ${ps.year}:`);
        lines.push(`    Basic: ${fmt(ps.basicSalary)}`);
        if (ps.overtimePay > 0) lines.push(`    Overtime (${ps.overtimeHours}h): +${fmt(ps.overtimePay)}`);
        if (ps.lopDays > 0) lines.push(`    Paid Leave Deduction (${ps.lopDays} days): -${fmt(ps.lopDeduction)}`);
        lines.push(`    Gross: ${fmt(ps.grossSalary)}`);
        lines.push(`    PF: -${fmt(ps.pfDeduction)} | Prof Tax: -${fmt(ps.professionalTax)}`);
        lines.push(`    Net Salary: ${fmt(ps.netSalary)}`);
      });
    }

    // Leave balance
    const leaves = await db.collection('leaves').find({ employeeId: empId }).toArray();
    const year = new Date().getFullYear();
    const yearLeaves = leaves.filter(l => new Date(l.startDate).getFullYear() === year);
    const casualUsed = yearLeaves.filter(l => l.leaveType === 'casual' && l.status !== 'rejected').reduce((s, l) => s + (l.days || 0), 0);
    const sickUsed = yearLeaves.filter(l => l.leaveType === 'sick' && l.status !== 'rejected').reduce((s, l) => s + (l.days || 0), 0);
    const paidUsed = yearLeaves.filter(l => l.leaveType === 'unpaid' && l.status !== 'rejected').reduce((s, l) => s + (l.days || 0), 0);
    lines.push(`\nLeave balance (${year}): Casual ${casualUsed}/2 used | Sick ${sickUsed}/3 used | Paid ${paidUsed}/3 used`);

    // Recent attendance
    const attendance = await db.collection('attendance').find({ employeeId: empId }).sort({ date: -1 }).limit(10).toArray();
    if (attendance.length > 0) {
      const present = attendance.filter(a => a.status === 'present' || a.status === 'late').length;
      const absent = attendance.filter(a => a.status === 'absent').length;
      lines.push(`Recent attendance (last 10 days): ${present} present/late, ${absent} absent`);
    }
  }

  return lines.join('\n');
};

const chat = async (req, res) => {
  try {
    const { messages } = req.body;
    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ error: 'messages array required' });
    }

    const azure = getClient();
    if (!azure) {
      return res.json({ reply: 'Chatbot is not configured. Please set AZURE_OPENAI_ENDPOINT and AZURE_OPENAI_API_KEY.' });
    }

    const userContext = await buildUserContext(req.db, req.user);

    const systemPrompt = `You are PayFlow Assistant, an AI helper embedded inside the PayFlow Payroll Intelligence System.

You ONLY answer questions related to PayFlow. If asked anything unrelated, politely decline.

CURRENT USER DATA:
${userContext}

PayFlow rules:
- Payroll formula: Gross = Basic + Overtime - Paid Leave Deduction. Net = Gross - PF (12% capped ₹1,800) - Professional Tax (₹200)
- Leave limits per year: Casual 2, Sick 3, Paid 3
- Overtime at 2x hourly rate. Per day = Basic/26. Per hour = Per day/8.
- Payslips generated when HR approves payroll

Use the user's actual data above to answer questions specifically. Be concise, friendly, and use ₹ for currency.`;

    const response = await azure.client.chat.completions.create({
      model: azure.deployment,
      messages: [
        { role: 'system', content: systemPrompt },
        ...messages.slice(-10),
      ],
      max_tokens: 400,
      temperature: 0.5,
    });

    res.json({ reply: response.choices[0].message.content.trim() });
  } catch (err) {
    console.error('Chat error:', err.message);
    res.status(500).json({ error: 'Chat failed', reply: 'Sorry, I encountered an error. Please try again.' });
  }
};

module.exports = { chat };
