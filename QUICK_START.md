# PayFlow Quick Start Guide

## 🚀 Start the Application

### 1. Start Backend
```bash
cd backend
npm start
```
Server will run on http://localhost:5000

### 2. Start Frontend
```bash
cd frontend
npm run dev
```
Frontend will run on http://localhost:5173

## 🔐 Login Credentials

### HR Account
- Email: `admin@payflow.com`
- Password: `Admin@123`

### Employee Account
- Email: `john@payflow.com`
- Password: `Employee@123`

## 📋 Test the New Features

### As HR User:

1. **Dashboard** (`/dashboard`)
   - View 5 stat cards including "Present Today"
   - See recent employees table

2. **Attendance** (`/attendance`)
   - View attendance summary (Present: 7, Late: 2, Absent: 1)
   - See all 10 employee attendance cards
   - Filter by department/status (optional)

3. **Payroll** (`/payroll`)
   - View payroll summary stats
   - See complete payroll table
   - Click "Run Payroll" to reprocess
   - Watch for success toast notification

4. **Payslips** (`/payslips`)
   - View all 10 employee payslips
   - See detailed salary breakdown
   - Download PDF buttons (UI ready)

5. **Reports** (`/reports`)
   - View workforce summary (4 stat cards)
   - Department breakdown chart
   - Salary distribution chart
   - Complete payroll records table
   - Animated attendance summary bar

6. **Employees** (`/employees`)
   - Existing functionality (unchanged)

## 🎨 Features to Notice

### Loading States
- Shimmer skeleton cards appear while fetching
- Smooth gradient animation
- Consistent across all pages

### Error Handling
- If API fails, error message appears
- "Retry" button to refetch data
- Toast notifications for actions

### Animations
- Framer Motion page transitions
- Staggered card animations
- Progress bar animations
- Smooth hover effects

### Data Formatting
- Currency in INR format (₹)
- JetBrains Mono font for numbers
- Color-coded status badges
- Responsive tables

## 🔧 API Testing (Optional)

Use Postman or curl to test endpoints:

### Get Attendance
```bash
curl -H "Authorization: Bearer YOUR_TOKEN" \
  http://localhost:5000/api/attendance
```

### Get Payroll Summary
```bash
curl -H "Authorization: Bearer YOUR_TOKEN" \
  http://localhost:5000/api/payroll/summary
```

### Run Payroll
```bash
curl -X POST -H "Authorization: Bearer YOUR_TOKEN" \
  http://localhost:5000/api/payroll/run
```

### Get Reports
```bash
curl -H "Authorization: Bearer YOUR_TOKEN" \
  http://localhost:5000/api/reports/summary
```

## 📊 Sample Data

- **10 Employees** across 5 departments
- **10 Attendance Records** (7 present, 2 late, 1 absent)
- **10 Payroll Records** with calculated bonuses/deductions
- **10 Payslips** matching payroll data

## 🎯 Key Calculations

### Payroll Formula
- Bonus = 10% of basic salary
- Deductions = 12% of basic salary
- Net Salary = Basic + Bonus - Deductions

### Example (John Doe)
- Basic: ₹75,000
- Bonus: ₹7,500 (10%)
- Deductions: ₹9,000 (12%)
- Net: ₹73,500

## 🐛 Troubleshooting

### Backend won't start
- Check if port 5000 is available
- Run `npm install` in backend folder
- Verify .env file exists

### Frontend won't start
- Check if port 5173 is available
- Run `npm install` in frontend folder
- Clear browser cache

### API returns 401
- Token expired, login again
- Check Authorization header format

### Data not loading
- Check browser console for errors
- Verify backend is running
- Check network tab in DevTools

## ✅ Verification Checklist

- [ ] Backend starts without errors
- [ ] Frontend starts without errors
- [ ] Can login as HR user
- [ ] Dashboard shows 5 stat cards
- [ ] Attendance page loads 10 records
- [ ] Payroll page shows summary stats
- [ ] Run Payroll button works
- [ ] Payslips page displays cards
- [ ] Reports page shows all sections
- [ ] Loading states appear briefly
- [ ] No console errors
- [ ] Animations are smooth

## 🎉 Success!

If all pages load with real data and no errors, the update is complete!
