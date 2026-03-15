require('dotenv').config();

process.on('uncaughtException', (err) => {
  console.error('UNCAUGHT EXCEPTION:', err.message, err.stack);
  process.exit(1);
});
process.on('unhandledRejection', (reason) => {
  console.error('UNHANDLED REJECTION:', reason);
  process.exit(1);
});

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

app.get('/health', (req, res) => res.json({ status: 'ok' }));

async function startServer() {
  if (!process.env.MONGO_URI) {
    console.error('ERROR: MONGO_URI is not set');
    process.exit(1);
  }

  console.log('Connecting to MongoDB...');
  console.log('MONGO_URI set:', !!process.env.MONGO_URI);

  const client = new MongoClient(process.env.MONGO_URI, {
    serverSelectionTimeoutMS: 15000,
  });

  await client.connect();
  console.log('MongoDB client connected');
  const db = client.db('payflow');
  console.log('Connected to MongoDB — db:', db.databaseName);

  app.use((req, res, next) => { req.db = db; next(); });

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
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`PayFlow backend running on port ${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err.message);
  process.exit(1);
});
