// Agent 5: Explanation Agent
// Uses OpenAI GPT to generate natural language salary explanations
// Falls back to rule-based template if API key not set or call fails

const OpenAI = process.env.OPENAI_API_KEY && process.env.OPENAI_API_KEY !== 'your_openai_api_key_here'
  ? new (require('openai'))({ apiKey: process.env.OPENAI_API_KEY })
  : null;

const fmt = (n) => `₹${Math.abs(n || 0).toLocaleString('en-IN')}`;

const buildContext = (calculatedPayroll, employee, previousPayroll) => {
  const diff = previousPayroll ? calculatedPayroll.netSalary - previousPayroll.netSalary : null;
  return {
    employeeName: `${employee.firstName} ${employee.lastName}`,
    designation: employee.designation,
    department: employee.department,
    basicSalary: calculatedPayroll.basicSalary,
    hra: calculatedPayroll.hra,
    overtimePay: calculatedPayroll.overtimePay,
    overtimeHours: calculatedPayroll.overtimeHours,
    lopDays: calculatedPayroll.lopDays,
    lopDeduction: calculatedPayroll.lopDeduction,
    pfDeduction: calculatedPayroll.pfDeduction,
    professionalTax: calculatedPayroll.professionalTax,
    grossSalary: calculatedPayroll.grossSalary,
    totalDeductions: calculatedPayroll.totalDeductions,
    netSalary: calculatedPayroll.netSalary,
    previousNetSalary: previousPayroll?.netSalary || null,
    netChange: diff,
  };
};

const ruleBased = (ctx) => {
  const lines = [];
  lines.push(`Basic salary: ${fmt(ctx.basicSalary)}`);
  lines.push(`HRA (40% of basic): +${fmt(ctx.hra)}`);
  if (ctx.overtimePay > 0) lines.push(`Overtime pay (${ctx.overtimeHours}h at 2x rate): +${fmt(ctx.overtimePay)}`);
  if (ctx.lopDays > 0) lines.push(`Loss of Pay (${ctx.lopDays} day${ctx.lopDays > 1 ? 's' : ''}): -${fmt(ctx.lopDeduction)}`);
  lines.push(`PF deduction (12%, capped ₹1,800): -${fmt(ctx.pfDeduction)}`);
  lines.push(`Professional tax: -${fmt(ctx.professionalTax)}`);
  lines.push(`Gross salary: ${fmt(ctx.grossSalary)}`);
  lines.push(`Net salary: ${fmt(ctx.netSalary)}`);
  if (ctx.netChange !== null && ctx.netChange !== 0) {
    const dir = ctx.netChange > 0 ? 'increased' : 'decreased';
    const reasons = [];
    if (ctx.lopDays > 0) reasons.push(`${ctx.lopDays} LOP day(s)`);
    if (ctx.overtimePay > 0) reasons.push('overtime pay');
    lines.push(`Salary ${dir} by ${fmt(Math.abs(ctx.netChange))} vs last month${reasons.length ? ' due to ' + reasons.join(' and ') : ''}.`);
  }
  return lines.join('\n');
};

const generate = async (calculatedPayroll, employee, previousPayroll) => {
  const ctx = buildContext(calculatedPayroll, employee, previousPayroll);

  if (!OpenAI) return ruleBased(ctx);

  try {
    const prompt = `You are a payroll assistant. Write a clear, friendly 3-4 sentence salary explanation for an employee.

Employee: ${ctx.employeeName} (${ctx.designation}, ${ctx.department})
Basic: ${fmt(ctx.basicSalary)} | HRA: +${fmt(ctx.hra)} | Overtime (${ctx.overtimeHours}h): +${fmt(ctx.overtimePay)}
LOP (${ctx.lopDays} days): -${fmt(ctx.lopDeduction)} | PF: -${fmt(ctx.pfDeduction)} | Prof Tax: -${fmt(ctx.professionalTax)}
Gross: ${fmt(ctx.grossSalary)} | Net: ${fmt(ctx.netSalary)}
${ctx.previousNetSalary ? `Previous month net: ${fmt(ctx.previousNetSalary)} (change: ${ctx.netChange >= 0 ? '+' : ''}${fmt(ctx.netChange)})` : 'First month on record.'}

Write a concise explanation covering the key components and any notable changes. Use Indian Rupee (₹) symbol. Be factual and professional.`;

    const response = await OpenAI.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [{ role: 'user', content: prompt }],
      max_tokens: 200,
      temperature: 0.4,
    });

    return response.choices[0].message.content.trim();
  } catch (err) {
    console.warn('OpenAI explanation failed, using rule-based fallback:', err.message);
    return ruleBased(ctx);
  }
};

module.exports = { generate };
