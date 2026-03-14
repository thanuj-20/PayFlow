const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const login = async (req, res) => {
  try {
    const db = req.db;
    const { email, password } = req.body;
    const user = await db.collection('users').findOne({ email });

    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const isValid = bcrypt.compareSync(password, user.password);
    if (!isValid) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { userId: user.id, role: user.role, employeeId: user.employeeId },
      process.env.JWT_SECRET,
      { expiresIn: '8h' }
    );

    res.json({ token, role: user.role, employeeId: user.employeeId });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = { login };
