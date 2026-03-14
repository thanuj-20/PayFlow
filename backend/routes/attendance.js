const express = require('express');
const { getAttendance, getAttendanceSummary } = require('../controllers/attendanceController');
const { verifyToken, requireHR } = require('../middleware/auth');

const router = express.Router();

// Define /summary BEFORE / to ensure proper route matching
router.get('/summary', verifyToken, requireHR, getAttendanceSummary);
router.get('/', verifyToken, requireHR, getAttendance);

module.exports = router;
