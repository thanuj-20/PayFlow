// Agent 3: Compliance Validation Agent
// Validates payroll records against statutory compliance rules

const MINIMUM_WAGE = 15000;
const MAX_LOP_DAYS = 5;
const MAX_OVERTIME_HOURS = 48;
const PF_CAP = 1800;

const validate = (calculatedPayroll, employee) => {
  const violations = [];
  const warnings = [];

  // Rule 1: Net salary must be above minimum wage
  if (calculatedPayroll.netSalary < MINIMUM_WAGE) {
    violations.push({
      rule: 'MINIMUM_WAGE',
      severity: 'critical',
      message: `Net salary ₹${calculatedPayroll.netSalary.toLocaleString('en-IN')} is below minimum wage of ₹${MINIMUM_WAGE.toLocaleString('en-IN')}`,
    });
  }

  // Rule 2: PF deduction must not exceed cap
  if (calculatedPayroll.pfDeduction > PF_CAP) {
    violations.push({
      rule: 'PF_CAP_EXCEEDED',
      severity: 'high',
      message: `PF deduction ₹${calculatedPayroll.pfDeduction} exceeds statutory cap of ₹${PF_CAP}`,
    });
  }

  // Rule 3: LOP days warning
  if (calculatedPayroll.lopDays > MAX_LOP_DAYS) {
    warnings.push({
      rule: 'HIGH_LOP',
      severity: 'medium',
      message: `Employee has ${calculatedPayroll.lopDays} LOP days — exceeds normal threshold of ${MAX_LOP_DAYS} days`,
    });
  }

  // Rule 4: Overtime hours limit
  if (calculatedPayroll.overtimeHours > MAX_OVERTIME_HOURS) {
    warnings.push({
      rule: 'OVERTIME_LIMIT',
      severity: 'medium',
      message: `Overtime hours (${calculatedPayroll.overtimeHours}h) exceed monthly limit of ${MAX_OVERTIME_HOURS}h`,
    });
  }

  // Rule 5: Gross salary sanity check
  if (calculatedPayroll.grossSalary <= 0) {
    violations.push({
      rule: 'ZERO_GROSS',
      severity: 'critical',
      message: 'Gross salary is zero or negative — payroll cannot be processed',
    });
  }

  const isCompliant = violations.length === 0;
  return { isCompliant, violations, warnings };
};

module.exports = { validate };
