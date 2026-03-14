// Agent 5: Explanation Agent
// Generates plain English salary explanations

const generate = (calculatedPayroll, employee, previousPayroll) => {
  const lines = [];
  const fmt = (n) => `₹${Math.abs(n).toLocaleString('en-IN')}`;

  lines.push(`Basic salary: ${fmt(calculatedPayroll.basicSalary)}`);
  lines.push(`HRA (40% of basic): +${fmt(calculatedPayroll.hra)}`);

  if (calculatedPayroll.overtimePay > 0) {
    lines.push(`Overtime pay (${calculatedPayroll.overtimeHours}h at 2x rate): +${fmt(calculatedPayroll.overtimePay)}`);
  }

  if (calculatedPayroll.lopDays > 0) {
    lines.push(`Loss of Pay (${calculatedPayroll.lopDays} absent day${calculatedPayroll.lopDays > 1 ? 's' : ''}): -${fmt(calculatedPayroll.lopDeduction)}`);
  }

  lines.push(`PF deduction (12%, capped at ₹1,800): -${fmt(calculatedPayroll.pfDeduction)}`);
  lines.push(`Professional tax: -${fmt(calculatedPayroll.professionalTax)}`);
  lines.push(`Gross salary: ${fmt(calculatedPayroll.grossSalary)}`);
  lines.push(`Net salary: ${fmt(calculatedPayroll.netSalary)}`);

  // Month-over-month comparison
  if (previousPayroll) {
    const diff = calculatedPayroll.netSalary - previousPayroll.netSalary;
    if (diff !== 0) {
      const direction = diff > 0 ? 'increased' : 'decreased';
      const reasons = [];
      if (calculatedPayroll.lopDays > (previousPayroll.lopDays || 0)) {
        reasons.push(`${calculatedPayroll.lopDays - (previousPayroll.lopDays || 0)} additional LOP day(s)`);
      }
      if (calculatedPayroll.overtimePay > (previousPayroll.overtimePay || 0)) {
        reasons.push(`overtime pay added`);
      }
      const reasonText = reasons.length > 0 ? ` due to ${reasons.join(' and ')}` : '';
      lines.push(`Salary ${direction} by ${fmt(Math.abs(diff))} compared to last month${reasonText}.`);
    } else {
      lines.push('Salary unchanged from last month.');
    }
  }

  return lines.join('\n');
};

module.exports = { generate };
