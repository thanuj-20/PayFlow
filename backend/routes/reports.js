const express = require('express');
const { getReportsSummary, exportCSV } = require('../controllers/reportsController');
const { verifyToken, requireHR } = require('../middleware/auth');

const router = express.Router();

router.get('/summary', verifyToken, requireHR, getReportsSummary);
router.get('/export-csv', verifyToken, requireHR, exportCSV);

module.exports = router;
