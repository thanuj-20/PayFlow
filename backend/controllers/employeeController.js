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

    const updateData = {};
    if (firstName) updateData.firstName = firstName;
    if (lastName) updateData.lastName = lastName;
    if (department) updateData.department = department;
    if (designation) updateData.designation = designation;
    if (basicSalary) updateData.basicSalary = parseInt(basicSalary);

    const modificationEntry = {
      changedAt: new Date(),
      changedBy: req.user.userId,
      reason: modificationReason
    };

    updateData.$push = { modificationLog: modificationEntry };

    await db.collection('employees').updateOne(
      { id: req.params.id },
      updateData
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

    const modificationEntry = {
      changedAt: new Date(),
      changedBy: req.user.userId,
      reason: 'Employee deactivated'
    };

    await db.collection('employees').updateOne(
      { id: req.params.id },
      {
        $set: { status: 'inactive' },
        $push: { modificationLog: modificationEntry }
      }
    );

    res.json({ message: 'Employee deactivated' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = { getAllEmployees, getEmployeeById, createEmployee, updateEmployee, deleteEmployee };
