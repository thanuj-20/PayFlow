const express = require('express');
const { getNotifications, markAllRead, markRead } = require('../controllers/notificationsController');
const { verifyToken } = require('../middleware/auth');

const router = express.Router();

router.get('/', verifyToken, getNotifications);
router.put('/read-all', verifyToken, markAllRead);
router.put('/:id/read', verifyToken, markRead);

module.exports = router;
