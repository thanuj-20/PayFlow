const express = require('express');
const {
  getPayroll, getPayrollSummary, initiatePayroll, runPayroll,
  approvePayrollRecord, approveAllPayroll, holdPayrollRecord, getPayrollByEmployee
} = require('../controllers/payrollController');
const { verifyToken, requireHR } = require('../middleware/auth');

const router = express.Router();

router.get('/summary', verifyToken, requireHR, getPayrollSummary);
router.post('/initiate', verifyToken, requireHR, initiatePayroll);
router.post('/run', verifyToken, requireHR, runPayroll);
router.post('/approve-all', verifyToken, requireHR, approveAllPayroll);
router.put('/:id/approve', verifyToken, requireHR, approvePayrollRecord);
router.put('/:id/hold', verifyToken, requireHR, holdPayrollRecord);
router.get('/:employeeId', verifyToken, getPayrollByEmployee);
router.get('/', verifyToken, requireHR, getPayroll);

module.exports = router;
