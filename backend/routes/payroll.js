const express = require('express');
const {
  getPayroll, getPayrollSummary, initiatePayroll,
  approvePayrollRecord, approveAllPayroll, getPayrollByEmployee
} = require('../controllers/payrollController');
const { verifyToken, requireHR } = require('../middleware/auth');

const router = express.Router();

router.get('/summary', verifyToken, requireHR, getPayrollSummary);
router.post('/initiate', verifyToken, requireHR, initiatePayroll);
router.post('/approve-all', verifyToken, requireHR, approveAllPayroll);
router.put('/:id/approve', verifyToken, requireHR, approvePayrollRecord);
router.get('/', verifyToken, requireHR, getPayroll);

module.exports = router;
