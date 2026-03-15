const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const login = async (req, res) => {
  try {
    const db = req.db;
    const { email, password } = req.body;
    const user = await db.collection('users').findOne({ email });
    if (!user) return res.status(401).json({ message: 'Invalid credentials' });
    const isValid = bcrypt.compareSync(password, user.password);
    if (!isValid) return res.status(401).json({ message: 'Invalid credentials' });
    const token = jwt.sign(
      { userId: user.id, role: user.role, employeeId: user.employeeId },
      process.env.JWT_SECRET,
      { expiresIn: '8h' }
    );
    res.json({ token, role: user.role, employeeId: user.employeeId });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const changePassword = async (req, res) => {
  try {
    const db = req.db;
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: 'Both current and new password are required' });
    }
    if (newPassword.length < 6) {
      return res.status(400).json({ message: 'New password must be at least 6 characters' });
    }
    const user = await db.collection('users').findOne({ id: req.user.userId });
    if (!user) return res.status(404).json({ message: 'User not found' });
    const isValid = bcrypt.compareSync(currentPassword, user.password);
    if (!isValid) return res.status(400).json({ message: 'Current password is incorrect' });
    const hashed = bcrypt.hashSync(newPassword, 10);
    await db.collection('users').updateOne({ id: req.user.userId }, { $set: { password: hashed } });
    res.json({ message: 'Password changed successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { login, changePassword };
