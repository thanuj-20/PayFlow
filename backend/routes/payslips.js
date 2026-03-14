const express = require('express');
const { getAllPayslips, getPayslipsByEmployee } = require('../controllers/payslipsController');
const { verifyToken, requireHR } = require('../middleware/auth');

const router = express.Router();

router.get('/', verifyToken, requireHR, getAllPayslips);
router.get('/:employeeId', verifyToken, getPayslipsByEmployee);

module.exports = router;
