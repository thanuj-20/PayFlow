const express = require('express');
const { getAttendance, getAttendanceSummary, checkIn, checkOut, addAttendance } = require('../controllers/attendanceController');
const { verifyToken, requireHR } = require('../middleware/auth');

const router = express.Router();

router.get('/summary', verifyToken, requireHR, getAttendanceSummary);
router.get('/', verifyToken, getAttendance);
router.post('/checkin', verifyToken, checkIn);
router.post('/checkout', verifyToken, checkOut);
router.post('/', verifyToken, requireHR, addAttendance);

module.exports = router;
