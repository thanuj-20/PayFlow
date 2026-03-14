const express = require('express');
const { getAllEmployees, getEmployeeById, createEmployee, updateEmployee, deleteEmployee } = require('../controllers/employeeController');
const { verifyToken, requireHR } = require('../middleware/auth');

const router = express.Router();

router.get('/', verifyToken, requireHR, getAllEmployees);
router.get('/:id', verifyToken, getEmployeeById);
router.post('/', verifyToken, requireHR, createEmployee);
router.put('/:id', verifyToken, requireHR, updateEmployee);
router.delete('/:id', verifyToken, requireHR, deleteEmployee);

module.exports = router;
