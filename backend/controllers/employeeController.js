const bcrypt = require('bcryptjs');
const { sendWelcomeEmail } = require('../utils/emailHelper');

const getAllEmployees = async (req, res) => {
  try {
    const db = req.db;
    let query = {};
    const { department, status } = req.query;

    if (department) {
      query.department = department;
    }
    if (status) {
      query.status = status;
    }

    const employees = await db.collection('employees').find(query).toArray();
    res.json(employees);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getEmployeeById = async (req, res) => {
  try {
    const db = req.db;
    const employee = await db.collection('employees').findOne({ id: req.params.id });

    if (!employee) {
      return res.status(404).json({ error: 'Employee not found' });
    }

    if (req.user.role === 'employee' && req.user.employeeId !== req.params.id) {
      return res.status(403).json({ error: 'Access denied' });
    }

    res.json(employee);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const createEmployee = async (req, res) => {
  try {
    const db = req.db;
    const { firstName, lastName, email, department, designation, basicSalary, joiningDate } = req.body;

    if (!firstName || !lastName || !email || !department || !designation || !basicSalary || !joiningDate) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    // Check if email already exists
    const existingEmployee = await db.collection('employees').findOne({ email });
    if (existingEmployee) {
      return res.status(400).json({ error: 'Email already exists' });
    }

    const newEmployee = {
      id: 'e' + Date.now(),
      firstName,
      lastName,
      email,
      department,
      designation,
      basicSalary: parseInt(basicSalary),
      joiningDate,
      status: 'active',
      modificationLog: []
    };

    await db.collection('employees').insertOne(newEmployee);

    const plainPassword = 'Pass@' + firstName;
    const hashedPassword = bcrypt.hashSync(plainPassword, 10);

    const newUser = {
      id: 'u' + Date.now(),
      email,
      password: hashedPassword,
      role: 'employee',
      employeeId: newEmployee.id
    };

    await db.collection('users').insertOne(newUser);

    // Send welcome email (non-blocking — don't fail if email fails)
    sendWelcomeEmail(newEmployee, plainPassword).catch((err) =>
      console.error('Welcome email failed:', err.message)
    );

    res.status(201).json({ employee: newEmployee, generatedPassword: plainPassword });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const updateEmployee = async (req, res) => {
  try {
    const db = req.db;
    const { firstName, lastName, department, designation, basicSalary, modificationReason } = req.body;

    if (!modificationReason) {
      return res.status(400).json({ error: 'modificationReason is required' });
    }

    const employee = await db.collection('employees').findOne({ id: req.params.id });
    if (!employee) {
      return res.status(404).json({ error: 'Employee not found' });
    }

    const setFields = {};
    if (firstName) setFields.firstName = firstName;
    if (lastName) setFields.lastName = lastName;
    if (department) setFields.department = department;
    if (designation) setFields.designation = designation;
    if (basicSalary) setFields.basicSalary = parseInt(basicSalary);

    await db.collection('employees').updateOne(
      { id: req.params.id },
      {
        $set: setFields,
        $push: { modificationLog: { changedAt: new Date(), changedBy: req.user.userId, reason: modificationReason } }
      }
    );

    const updatedEmployee = await db.collection('employees').findOne({ id: req.params.id });
    res.json(updatedEmployee);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const deleteEmployee = async (req, res) => {
  try {
    const db = req.db;

    const employee = await db.collection('employees').findOne({ id: req.params.id });
    if (!employee) {
      return res.status(404).json({ error: 'Employee not found' });
    }

    if (employee.status === 'active') {
      return res.status(400).json({ error: 'Cannot delete an active employee. Deactivate them first.' });
    }

    // Hard delete employee + all related records
    await Promise.all([
      db.collection('employees').deleteOne({ id: req.params.id }),
      db.collection('users').deleteOne({ employeeId: req.params.id }),
      db.collection('attendance').deleteMany({ employeeId: req.params.id }),
      db.collection('payroll').deleteMany({ employeeId: req.params.id }),
      db.collection('payslips').deleteMany({ employeeId: req.params.id }),
      db.collection('leaves').deleteMany({ employeeId: req.params.id }),
    ]);

    res.json({ message: 'Employee permanently deleted' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const deactivateEmployee = async (req, res) => {
  try {
    const db = req.db;
    const employee = await db.collection('employees').findOne({ id: req.params.id });
    if (!employee) return res.status(404).json({ error: 'Employee not found' });
    if (employee.status === 'inactive') return res.status(400).json({ error: 'Employee already inactive' });

    await db.collection('employees').updateOne(
      { id: req.params.id },
      {
        $set: { status: 'inactive' },
        $push: { modificationLog: { changedAt: new Date(), changedBy: req.user.userId, reason: 'Employee deactivated' } }
      }
    );
    res.json({ message: 'Employee deactivated' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = { getAllEmployees, getEmployeeById, createEmployee, updateEmployee, deleteEmployee, deactivateEmployee };
