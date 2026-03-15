require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { MongoClient } = require('mongodb');
const authRoutes = require('./routes/auth');
const employeeRoutes = require('./routes/employees');
const attendanceRoutes = require('./routes/attendance');
const payrollRoutes = require('./routes/payroll');
const payslipsRoutes = require('./routes/payslips');
const reportsRoutes = require('./routes/reports');
const leavesRoutes = require('./routes/leaves');
const notificationsRoutes = require('./routes/notifications');

const app = express();

app.use(cors({
  origin: [
    'http://localhost:5173',
    'http://localhost:3000',
    process.env.FRONTEND_URL,
  ].filter(Boolean),
  credentials: true,
}));
app.use(express.json());

async function startServer() {
  const client = new MongoClient(process.env.MONGO_URI);
  await client.connect();
  const db = client.db('payflow');
  console.log('Connected to MongoDB');

  app.use((req, res, next) => {
    req.db = db;
    next();
  });

  app.use('/api/auth', authRoutes);
  app.use('/api/employees', employeeRoutes);
  app.use('/api/attendance', attendanceRoutes);
  app.use('/api/payroll', payrollRoutes);
  app.use('/api/payslips', payslipsRoutes);
  app.use('/api/reports', reportsRoutes);
  app.use('/api/leaves', leavesRoutes);
  app.use('/api/notifications', notificationsRoutes);

  app.use((err, req, res, next) => {
    res.status(500).json({ error: err.message });
  });

  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => {
    console.log(`PayFlow backend running on port ${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err.message);
  process.exit(1);
});
