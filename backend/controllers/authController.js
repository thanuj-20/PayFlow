const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const login = async (req, res) => {
  try {
    const db = req.db;
    const { email, password } = req.body;
    const user = await db.collection('users').findOne({ email });
    console.log(`Login attempt for email: ${email}`);
    console.log(`User found: ${user ? 'Yes' : 'No'}`);

    if (!user) {
      console.log('User not found in database');
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const isValid = bcrypt.compareSync(password, user.password);
    console.log(`Password is valid: ${isValid}`);
    
    if (!isValid) {
      console.log('Invalid password provided');
      return res.status(401).json({ message: 'Invalid credentials' });
    }

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

module.exports = { login };
