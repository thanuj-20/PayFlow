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

const app = express();

// MongoDB connection
const client = new MongoClient(process.env.MONGO_URI);
let db;

async function connectDB() {
  try {
    await client.connect();
    db = client.db('payflow');
    console.log('Connected to MongoDB');
  } catch (error) {
    console.error('MongoDB connection error:', error);
  }
}

connectDB();

// Make db available to routes
app.use((req, res, next) => {
  req.db = db;
  next();
});

// Development credentials reference:
// HR: admin@payflow.com / Admin@123
// Employee: john@payflow.com / Employee@123

app.use(cors());
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/employees', employeeRoutes);
app.use('/api/attendance', attendanceRoutes);
app.use('/api/payroll', payrollRoutes);
app.use('/api/payslips', payslipsRoutes);
app.use('/api/reports', reportsRoutes);

app.use((err, req, res, next) => {
  res.status(500).json({ error: err.message });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`PayFlow backend running on port ${PORT}`);
});
