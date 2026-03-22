// Agent 5: Explanation Agent
// Uses Azure OpenAI to generate natural language salary explanations
// Falls back to rule-based template if API key not set or call fails

const { AzureOpenAI } = require('openai');

const getClient = () => {
  const endpoint = process.env.AZURE_OPENAI_ENDPOINT;
  const apiKey = process.env.AZURE_OPENAI_API_KEY;
  const deployment = process.env.AZURE_OPENAI_DEPLOYMENT || 'gpt-4o';
  if (!endpoint || !apiKey) return null;
  return { client: new AzureOpenAI({ endpoint, apiKey, apiVersion: '2024-08-01-preview', deployment }), deployment };
};

const fmt = (n) => `₹${Math.abs(n || 0).toLocaleString('en-IN')}`;

const buildContext = (calculatedPayroll, employee, previousPayroll) => {
  const diff = previousPayroll ? calculatedPayroll.netSalary - previousPayroll.netSalary : null;
  return {
    employeeName: `${employee.firstName} ${employee.lastName}`,
    designation: employee.designation,
    department: employee.department,
    basicSalary: calculatedPayroll.basicSalary,
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
  if (ctx.overtimePay > 0) lines.push(`Overtime pay (${ctx.overtimeHours}h at 2x rate): +${fmt(ctx.overtimePay)}`);
  if (ctx.lopDays > 0) lines.push(`Paid leave deduction (${ctx.lopDays} day${ctx.lopDays > 1 ? 's' : ''}): -${fmt(ctx.lopDeduction)}`);
  lines.push(`Gross salary: ${fmt(ctx.grossSalary)}`);
  lines.push(`PF deduction (12%, capped ₹1,800): -${fmt(ctx.pfDeduction)}`);
  lines.push(`Professional tax: -${fmt(ctx.professionalTax)}`);
  lines.push(`Net salary: ${fmt(ctx.netSalary)}`);
  if (ctx.netChange !== null && ctx.netChange !== 0) {
    const dir = ctx.netChange > 0 ? 'increased' : 'decreased';
    const reasons = [];
    if (ctx.lopDays > 0) reasons.push(`${ctx.lopDays} paid leave day(s)`);
    if (ctx.overtimePay > 0) reasons.push('overtime pay');
    lines.push(`Salary ${dir} by ${fmt(Math.abs(ctx.netChange))} vs last month${reasons.length ? ' due to ' + reasons.join(' and ') : ''}.`);
  }
  return lines.join('\n');
};

const generate = async (calculatedPayroll, employee, previousPayroll) => {
  const ctx = buildContext(calculatedPayroll, employee, previousPayroll);
  const azure = getClient();
  if (!azure) return ruleBased(ctx);

  try {
    const prompt = `You are a payroll assistant. Write a clear, friendly 3-4 sentence salary explanation for an employee.

Employee: ${ctx.employeeName} (${ctx.designation}, ${ctx.department})
Basic: ${fmt(ctx.basicSalary)} | Overtime (${ctx.overtimeHours}h): +${fmt(ctx.overtimePay)}
Paid Leave Deduction (${ctx.lopDays} days): -${fmt(ctx.lopDeduction)} | PF: -${fmt(ctx.pfDeduction)} | Prof Tax: -${fmt(ctx.professionalTax)}
Gross: ${fmt(ctx.grossSalary)} | Net: ${fmt(ctx.netSalary)}
${ctx.previousNetSalary ? `Previous month net: ${fmt(ctx.previousNetSalary)} (change: ${ctx.netChange >= 0 ? '+' : ''}${fmt(ctx.netChange)})` : 'First month on record.'}

Write a concise explanation covering the key components and any notable changes. Use Indian Rupee (₹) symbol. Be factual and professional.`;

    const response = await azure.client.chat.completions.create({
      model: azure.deployment,
      messages: [{ role: 'user', content: prompt }],
      max_tokens: 200,
      temperature: 0.4,
    });

    return response.choices[0].message.content.trim();
  } catch (err) {
    console.warn('Azure OpenAI explanation failed, using rule-based fallback:', err.message);
    return ruleBased(ctx);
  }
};

module.exports = { generate };
