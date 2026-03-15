# PayFlow — Payroll Intelligence System

A full-stack payroll management system built with React and Node.js, featuring AI-powered payroll processing, automated compliance validation, anomaly detection, and employee self-service.

---

## Tech Stack

**Frontend**
- React 18 + Vite
- Tailwind CSS
- Framer Motion
- Zustand (state management)
- React Router v6
- Axios
- React Hot Toast
- Lucide React

**Backend**
- Node.js + Express
- MongoDB (Atlas)
- JWT Authentication
- BCryptjs
- PDFKit (payslip generation)
- Brevo (transactional email)
- OpenAI GPT-4o-mini (salary explanations)

---

## Features

### HR Admin
- **Dashboard** — workforce stats, today's attendance donut chart, department headcount
- **Employee Management** — add, edit, deactivate employees with audit log; auto-generates password and sends welcome email
- **Attendance** — view all attendance records, summary stats, manual entry
- **Leave Management** — approve/reject employee leave requests with comments
- **Payroll** — 5-agent AI pipeline: data aggregation → salary calculation → compliance validation → anomaly detection → GPT explanation; approve/hold individual or bulk records
- **Payslips** — view all generated payslips, download PDF
- **Reports** — workforce analytics, department breakdown, salary distribution, CSV export

### Employee Self-Service
- **My Profile** — personal info, salary breakdown, attendance summary, salary history chart, payslip download
- **My Attendance** — check in/out, view history with overtime tracking
- **My Leaves** — apply for leave, track status, view leave balance by type
- **My Payroll** — salary history table
- **My Payslips** — detailed payslip cards with PDF download
- **Change Password** — secure password update

### AI Agents (Payroll Pipeline)
| Agent | Role |
|---|---|
| Data Aggregation | Collects attendance, leave, overtime for the month |
| Payroll Calculation | Computes HRA, LOP, overtime, PF, professional tax |
| Compliance Validation | Checks minimum wage, PF cap, LOP limits |
| Anomaly Detection | Flags salary spikes, LOP spikes vs previous month |
| Explanation | GPT-4o-mini generates natural language salary summary (falls back to rule-based) |

### Other
- Dark / Light mode toggle
- Notification bell with real-time polling (30s)
- JWT auth with auto-expiry redirect
- Payslip PDF generation with styled layout

---

## Project Structure

```
PayFlow/
├── backend/
│   ├── agents/          # 5 AI payroll pipeline agents
│   ├── controllers/     # Route handlers
│   ├── data/            # Seed JSON files
│   ├── middleware/       # JWT auth middleware
│   ├── routes/          # Express routers
│   ├── utils/           # emailHelper, fileHelper
│   ├── seed.js          # Database seeder
│   └── server.js        # Entry point
└── frontend/
    └── src/
        ├── components/  # Sidebar, EmployeeModal, NotificationBell, etc.
        ├── pages/       # All page components
        ├── services/    # api.js (Axios)
        └── store/       # Zustand auth + theme stores
```

---

## Getting Started

### Prerequisites
- Node.js 18+
- MongoDB Atlas account
- Brevo account (for emails)

### 1. Clone the repo
```bash
git clone https://github.com/your-username/PayFlow.git
cd PayFlow
```

### 2. Backend setup
```bash
cd backend
npm install
```

Create a `.env` file based on `.env.example`:
```
MONGO_URI=mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/payflow
PORT=5000
JWT_SECRET=your_jwt_secret_here
OPENAI_API_KEY=your_openai_api_key_here
BREVO_API_KEY=your_brevo_api_key_here
BREVO_SENDER_EMAIL=your_verified_sender@gmail.com
```

Seed the database:
```bash
node seed.js
```

Start the backend:
```bash
npm start
```

### 3. Frontend setup
```bash
cd frontend
npm install
npm run dev
```

### 4. Login
| Role | Email | Password |
|---|---|---|
| HR Admin | admin@payflow.com | Admin@123 |

---

## API Endpoints

### Auth
| Method | Endpoint | Description |
|---|---|---|
| POST | /api/auth/login | Login |
| PUT | /api/auth/change-password | Change password |

### Employees
| Method | Endpoint | Description |
|---|---|---|
| GET | /api/employees | Get all employees (HR) |
| GET | /api/employees/:id | Get employee by ID |
| POST | /api/employees | Create employee + send welcome email |
| PUT | /api/employees/:id | Update employee |
| DELETE | /api/employees/:id | Deactivate employee |

### Attendance
| Method | Endpoint | Description |
|---|---|---|
| GET | /api/attendance | Get attendance records |
| GET | /api/attendance/summary | Today's summary (HR) |
| POST | /api/attendance/checkin | Employee check-in |
| POST | /api/attendance/checkout | Employee check-out |
| POST | /api/attendance | Manual entry (HR) |

### Payroll
| Method | Endpoint | Description |
|---|---|---|
| GET | /api/payroll | Get payroll records (HR) |
| GET | /api/payroll/summary | Payroll summary (HR) |
| POST | /api/payroll/initiate | Run AI payroll pipeline (HR) |
| POST | /api/payroll/approve-all | Approve all pending (HR) |
| PUT | /api/payroll/:id/approve | Approve single record (HR) |
| PUT | /api/payroll/:id/hold | Hold record (HR) |
| GET | /api/payroll/:employeeId | Employee payroll history |

### Leaves
| Method | Endpoint | Description |
|---|---|---|
| GET | /api/leaves | Get leave requests |
| GET | /api/leaves/balance | Employee leave balance |
| POST | /api/leaves | Apply for leave |
| PUT | /api/leaves/:id | Approve/reject leave (HR) |

### Payslips
| Method | Endpoint | Description |
|---|---|---|
| GET | /api/payslips | All payslips (HR) |
| GET | /api/payslips/:employeeId | Employee payslips |
| GET | /api/payslips/download/:id | Download PDF |

### Reports
| Method | Endpoint | Description |
|---|---|---|
| GET | /api/reports/summary | Full analytics summary |
| GET | /api/reports/export-csv | Export CSV |

### Notifications
| Method | Endpoint | Description |
|---|---|---|
| GET | /api/notifications | Get notifications |
| PUT | /api/notifications/read-all | Mark all read |
| PUT | /api/notifications/:id/read | Mark one read |

---

## Payroll Calculation Formula

```
HRA            = 40% of Basic Salary
Overtime Pay   = (Basic / 26 / 8) × 2 × Overtime Hours
LOP Deduction  = (Basic / 26) × LOP Days
PF Deduction   = 12% of Basic (capped at ₹1,800)
Professional Tax = ₹200 flat

Gross Salary   = Basic + HRA + Overtime - LOP
Net Salary     = Gross - PF - Professional Tax
```

---

## Environment Variables

| Variable | Description |
|---|---|
| MONGO_URI | MongoDB Atlas connection string |
| PORT | Backend port (default 5000) |
| JWT_SECRET | Secret key for JWT signing |
| OPENAI_API_KEY | OpenAI API key (optional, falls back to rule-based) |
| BREVO_API_KEY | Brevo transactional email API key |
| BREVO_SENDER_EMAIL | Verified sender email in Brevo |
