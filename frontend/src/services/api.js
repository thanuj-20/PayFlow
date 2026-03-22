import axios from 'axios';
import { authStore } from '../store/authStore';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000',
});

api.interceptors.request.use((config) => {
  const { token, clearAuth } = authStore.getState();
  if (token) {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      if (payload.exp * 1000 < Date.now()) {
        clearAuth();
        window.location.href = '/login';
        return Promise.reject(new Error('Token expired'));
      }
    } catch {}
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor for 401
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      authStore.getState().clearAuth();
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const login = (email, password) => api.post('/api/auth/login', { email, password });

export const getEmployees = (filters = {}) => {
  const params = new URLSearchParams(filters);
  return api.get(`/api/employees?${params}`);
};

export const getEmployee = (id) => api.get(`/api/employees/${id}`);

export const createEmployee = (data) => api.post('/api/employees', data);

export const updateEmployee = (id, data) => api.put(`/api/employees/${id}`, data);

export const deactivateEmployee = (id) => api.patch(`/api/employees/${id}/deactivate`);
export const hardDeleteEmployee = (id) => api.delete(`/api/employees/${id}`);

// Attendance
export const getAttendance = (filters = {}) => {
  const params = new URLSearchParams(filters);
  return api.get(`/api/attendance?${params}`);
};
export const getAttendanceSummary = () => api.get('/api/attendance/summary');
export const checkIn = () => api.post('/api/attendance/checkin');
export const checkOut = () => api.post('/api/attendance/checkout');
export const addAttendance = (data) => api.post('/api/attendance', data);

// Payroll
export const getPayroll = (filters = {}) => {
  const params = new URLSearchParams(filters);
  return api.get(`/api/payroll?${params}`);
};

export const getPayrollSummary = () => api.get('/api/payroll/summary');

export const initiatePayroll = (month, year) => api.post('/api/payroll/initiate', { month, year });
export const approveAllPayroll = (month, year) => api.post('/api/payroll/approve-all', { month, year });
export const approvePayrollRecord = (id) => api.put(`/api/payroll/${id}/approve`);

// Leaves
export const getLeaves = (filters = {}) => { const params = new URLSearchParams(filters); return api.get(`/api/leaves?${params}`); };
export const applyLeave = (data) => api.post('/api/leaves', data);
export const updateLeaveStatus = (id, status, hrComment) => api.put(`/api/leaves/${id}`, { status, hrComment });

// Payslips
export const getAllPayslips = () => api.get('/api/payslips');

export const getMyPayslips = (employeeId) => api.get(`/api/payslips/${employeeId}`);

// Reports
export const getReportsSummary = () => api.get('/api/reports/summary');
export const exportReportsCSV = () => api.get('/api/reports/export-csv', { responseType: 'blob' });

// Notifications
export const getNotifications = () => api.get('/api/notifications');
export const markAllRead = () => api.put('/api/notifications/read-all');
export const markNotificationRead = (id) => api.put(`/api/notifications/${id}/read`);

// Auth
export const changePassword = (currentPassword, newPassword) => api.put('/api/auth/change-password', { currentPassword, newPassword });

// Payslip PDF
export const downloadPayslip = (id) => api.get(`/api/payslips/download/${id}`, { responseType: 'blob' });

// Leave balance
export const getLeaveBalance = () => api.get('/api/leaves/balance');

// Chatbot
export const sendChatMessage = (messages) => api.post('/api/chat', { messages });