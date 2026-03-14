// Agent 4: Anomaly Detection Agent
// Compares current payroll with previous month to detect anomalies

const SALARY_CHANGE_THRESHOLD = 0.20;  // 20% change triggers anomaly
const LOP_SPIKE_THRESHOLD = 3;         // sudden 3+ LOP days vs 0 previous

const detect = (currentPayroll, previousPayroll) => {
  const anomalies = [];

  if (!previousPayroll) {
    return { hasAnomalies: false, anomalies };
  }

  // Check net salary change
  const salaryChange = Math.abs(currentPayroll.netSalary - previousPayroll.netSalary) / previousPayroll.netSalary;
  if (salaryChange > SALARY_CHANGE_THRESHOLD) {
    const direction = currentPayroll.netSalary > previousPayroll.netSalary ? 'increased' : 'decreased';
    anomalies.push({
      type: 'SALARY_SPIKE',
      severity: 'high',
      message: `Net salary ${direction} by ${(salaryChange * 100).toFixed(1)}% compared to last month (₹${previousPayroll.netSalary.toLocaleString('en-IN')} → ₹${currentPayroll.netSalary.toLocaleString('en-IN')})`,
    });
  }

  // Check LOP spike
  const prevLop = previousPayroll.lopDays || 0;
  const currLop = currentPayroll.lopDays || 0;
  if (currLop - prevLop >= LOP_SPIKE_THRESHOLD) {
    anomalies.push({
      type: 'LOP_SPIKE',
      severity: 'medium',
      message: `LOP days jumped from ${prevLop} to ${currLop} days — unusual absence pattern detected`,
    });
  }

  // Check overtime spike
  const prevOT = previousPayroll.overtimeHours || 0;
  const currOT = currentPayroll.overtimeHours || 0;
  if (currOT > 0 && prevOT === 0) {
    anomalies.push({
      type: 'OVERTIME_NEW',
      severity: 'low',
      message: `Overtime pay of ₹${currentPayroll.overtimePay?.toLocaleString('en-IN')} added — not present in previous month`,
    });
  }

  return { hasAnomalies: anomalies.length > 0, anomalies };
};

module.exports = { detect };
