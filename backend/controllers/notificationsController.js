const getNotifications = async (req, res) => {
  try {
    const db = req.db;
    const notifications = await db.collection('notifications')
      .find({ userId: req.user.userId })
      .sort({ createdAt: -1 })
      .limit(20)
      .toArray();
    // Ensure every doc has an `id` field the frontend can use
    const mapped = notifications.map(n => ({
      ...n,
      id: n.id || n._id.toString(),
    }));
    res.json(mapped);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const markAllRead = async (req, res) => {
  try {
    const db = req.db;
    await db.collection('notifications').updateMany(
      { userId: req.user.userId, read: false },
      { $set: { read: true } }
    );
    res.json({ message: 'All notifications marked as read' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const markRead = async (req, res) => {
  try {
    const db = req.db;
    await db.collection('notifications').updateOne(
      { id: req.params.id, userId: req.user.userId },
      { $set: { read: true } }
    );
    res.json({ message: 'Notification marked as read' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Helper: push a notification — called internally from other controllers
const pushNotification = async (db, userId, title, message, type = 'info') => {
  try {
    await db.collection('notifications').insertOne({
      id: 'n' + Date.now() + Math.random().toString(36).substr(2, 4),
      userId,
      title,
      message,
      type, // info | success | warning | danger
      read: false,
      createdAt: new Date().toISOString(),
    });
  } catch (e) {
    // Non-critical — don't throw
    console.warn('Failed to push notification:', e.message);
  }
};

module.exports = { getNotifications, markAllRead, markRead, pushNotification };
