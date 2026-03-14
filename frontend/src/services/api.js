import axios from 'axios';
import { authStore } from '../store/authStore';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000',
});

// Request interceptor to attach token
api.interceptors.request.use((config) => {
  const { token } = authStore.getState();
  if (token) {
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

export const deactivateEmployee = (id) => api.delete(`/api/employees/${id}`);

// Attendance
export const getAttendance = (filters = {}) => {
  const params = new URLSearchParams(filters);
  return api.get(`/api/attendance?${params}`);
};

export const getAttendanceSummary = () => api.get('/api/attendance/summary');

// Payroll
export const getPayroll = (filters = {}) => {
  const params = new URLSearchParams(filters);
  return api.get(`/api/payroll?${params}`);
};

export const getPayrollSummary = () => api.get('/api/payroll/summary');

export const runPayroll = () => api.post('/api/payroll/run');

export const getMyPayroll = (employeeId) => api.get(`/api/payroll/${employeeId}`);

// Payslips
export const getAllPayslips = () => api.get('/api/payslips');

export const getMyPayslips = (employeeId) => api.get(`/api/payslips/${employeeId}`);

// Reports
export const getReportsSummary = () => api.get('/api/reports/summary');