const express = require('express');
const { getLeaves, applyLeave, updateLeaveStatus } = require('../controllers/leaveController');
const { verifyToken, requireHR } = require('../middleware/auth');

const router = express.Router();

router.get('/', verifyToken, getLeaves);
router.post('/', verifyToken, applyLeave);
router.put('/:id', verifyToken, requireHR, updateLeaveStatus);

module.exports = router;
