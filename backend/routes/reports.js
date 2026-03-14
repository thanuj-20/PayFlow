const express = require('express');
const { getReportsSummary } = require('../controllers/reportsController');
const { verifyToken, requireHR } = require('../middleware/auth');

const router = express.Router();

router.get('/summary', verifyToken, requireHR, getReportsSummary);

module.exports = router;
