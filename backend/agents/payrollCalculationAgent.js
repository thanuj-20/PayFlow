// Agent 2: Payroll Calculation Agent
// Rule-based salary engine: LOP, overtime, PF, professional tax

const OVERTIME_RATE_MULTIPLIER = 2;    // 2x hourly rate
const PF_PERCENT = 0.12;               // 12% of basic (employee contribution)
const PF_CAP = 1800;                   // PF capped at ₹1800/month
const PROFESSIONAL_TAX = 200;          // flat ₹200/month
const WORKING_DAYS = 26;
const WORKING_HOURS_PER_DAY = 8;

const calculate = (employee, aggregatedData) => {
  const { basicSalary } = employee;
  const { lopDays, overtimeHours, workingDays } = aggregatedData;

  // Per-day and per-hour salary
  const perDaySalary = basicSalary / workingDays;
  const perHourSalary = perDaySalary / WORKING_HOURS_PER_DAY;

  // LOP deduction (paid leave deduction)
  const lopDeduction = Math.round(perDaySalary * lopDays);

  // Overtime pay
  const overtimePay = Math.round(perHourSalary * OVERTIME_RATE_MULTIPLIER * overtimeHours);

  // PF deduction (capped)
  const pfDeduction = Math.min(Math.round(basicSalary * PF_PERCENT), PF_CAP);

  // Gross = basic + overtime - LOP
  const grossSalary = basicSalary + overtimePay - lopDeduction;

  // Total deductions
  const totalDeductions = pfDeduction + PROFESSIONAL_TAX;

  // Net salary
  const netSalary = Math.max(0, grossSalary - totalDeductions);

  return {
    basicSalary,
    overtimePay,
    lopDeduction,
    lopDays,
    overtimeHours,
    pfDeduction,
    professionalTax: PROFESSIONAL_TAX,
    grossSalary,
    totalDeductions,
    netSalary,
  };
};

module.exports = { calculate };
