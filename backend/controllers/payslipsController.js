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

module.exports = { getAllPayslips, getPayslipsByEmployee };
