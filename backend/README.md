# PayFlow Backend

Complete backend for PayFlow payroll system using Node.js + Express with JSON file storage.

## Setup

```bash
cd backend
npm install
npm start
```

Server runs on http://localhost:5000

## Development Credentials

- **HR User**: admin@payflow.com / Admin@123
- **Employee User**: john@payflow.com / Employee@123

## API Endpoints

### Authentication

**POST /api/auth/login**
```json
{
  "email": "admin@payflow.com",
  "password": "Admin@123"
}
```
Returns: `{ token, role, employeeId }`

### Employees

All employee routes require Bearer token in Authorization header.

**GET /api/employees** (HR only)
- Query params: `?department=Engineering&status=active`
- Returns: Array of employees

**GET /api/employees/:id** (HR or own employee)
- Returns: Single employee object

**POST /api/employees** (HR only)
```json
{
  "firstName": "Jane",
  "lastName": "Smith",
  "email": "jane@payflow.com",
  "department": "Engineering",
  "designation": "Developer",
  "basicSalary": 70000,
  "joiningDate": "2024-01-15"
}
```
Returns: `{ employee, generatedPassword }`

**PUT /api/employees/:id** (HR only)
```json
{
  "firstName": "Jane",
  "lastName": "Smith",
  "department": "Engineering",
  "designation": "Senior Developer",
  "basicSalary": 85000,
  "modificationReason": "Promotion to senior role"
}
```
Note: `modificationReason` is REQUIRED

**DELETE /api/employees/:id** (HR only)
- Soft delete (sets status to "inactive")
- Returns: `{ message: "Employee deactivated" }`

## Tech Stack

- Node.js + Express
- JWT authentication
- bcryptjs for password hashing
- JSON file storage (no database)
- CORS enabled

## Data Storage

All data stored in `backend/data/`:
- `users.json` - User accounts
- `employees.json` - Employee records
- `payroll.json` - Payroll data (empty for now)
