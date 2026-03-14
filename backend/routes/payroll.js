const express = require('express');
const { getPayroll, getPayrollSummary, runPayroll, getPayrollByEmployee } = require('../controllers/payrollController');
const { verifyToken, requireHR } = require('../middleware/auth');

const router = express.Router();

// IMPORTANT: Define /summary BEFORE /:employeeId to avoid route matching issues
router.get('/summary', verifyToken, requireHR, getPayrollSummary);
router.post('/run', verifyToken, requireHR, runPayroll);
router.get('/:employeeId', verifyToken, getPayrollByEmployee);
router.get('/', verifyToken, requireHR, getPayroll);

module.exports = router;
