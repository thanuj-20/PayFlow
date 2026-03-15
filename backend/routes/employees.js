const express = require('express');
const { getAllEmployees, getEmployeeById, createEmployee, updateEmployee, deleteEmployee, deactivateEmployee } = require('../controllers/employeeController');
const { verifyToken, requireHR } = require('../middleware/auth');

const router = express.Router();

router.get('/', verifyToken, requireHR, getAllEmployees);
router.get('/:id', verifyToken, getEmployeeById);
router.post('/', verifyToken, requireHR, createEmployee);
router.put('/:id', verifyToken, requireHR, updateEmployee);
router.patch('/:id/deactivate', verifyToken, requireHR, deactivateEmployee);
router.delete('/:id', verifyToken, requireHR, deleteEmployee);

module.exports = router;
