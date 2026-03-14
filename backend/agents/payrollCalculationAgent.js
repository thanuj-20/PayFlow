// Agent 2: Payroll Calculation Agent
// Rule-based salary engine: LOP, overtime, HRA, PF, professional tax

const OVERTIME_RATE_MULTIPLIER = 2;    // 2x hourly rate
const HRA_PERCENT = 0.40;              // 40% of basic
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

  // LOP deduction
  const lopDeduction = Math.round(perDaySalary * lopDays);

  // Overtime pay
  const overtimePay = Math.round(perHourSalary * OVERTIME_RATE_MULTIPLIER * overtimeHours);

  // HRA
  const hra = Math.round(basicSalary * HRA_PERCENT);

  // PF deduction (capped)
  const pfDeduction = Math.min(Math.round(basicSalary * PF_PERCENT), PF_CAP);

  // Gross = basic + HRA + overtime - LOP
  const grossSalary = basicSalary + hra + overtimePay - lopDeduction;

  // Total deductions
  const totalDeductions = pfDeduction + PROFESSIONAL_TAX;

  // Net salary
  const netSalary = Math.max(0, grossSalary - totalDeductions);

  return {
    basicSalary,
    hra,
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
