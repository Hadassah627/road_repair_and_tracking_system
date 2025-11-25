import axios from 'axios';

// Use environment variable for API URL, fallback to relative path for development
const API_URL = import.meta.env.VITE_API_URL || '/api';

// Create axios instance
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  register: (userData) => api.post('/auth/register', userData),
  login: (credentials) => api.post('/auth/login', credentials),
  getMe: () => api.get('/auth/me'),
  getSupportPersons: () => api.get('/auth/support-persons'),
};

// Complaints API
export const complaintsAPI = {
  getAll: (params) => api.get('/complaints', { params }),
  getOne: (id) => api.get(`/complaints/${id}`),
  create: (data) => api.post('/complaints', data),
  update: (id, data) => api.put(`/complaints/${id}`, data),
  delete: (id) => api.delete(`/complaints/${id}`),
  assess: (id, data) => api.put(`/complaints/${id}/assess`, data),
  approveResources: (id, data) => api.put(`/complaints/${id}/approve-resources`, data),
  rejectResources: (id, data) => api.put(`/complaints/${id}/reject-resources`, data),
  schedule: (id, data) => api.put(`/complaints/${id}/schedule`, data),
};

// Resources API
export const resourcesAPI = {
  getAll: (params) => api.get('/resources', { params }),
  getOne: (id) => api.get(`/resources/${id}`),
  create: (data) => api.post('/resources', data),
  update: (id, data) => api.put(`/resources/${id}`, data),
  delete: (id) => api.delete(`/resources/${id}`),
  getSummary: () => api.get('/resources/summary/availability'),
};

// Schedule API
export const scheduleAPI = {
  getAll: (params) => api.get('/schedule', { params }),
  getOne: (id) => api.get(`/schedule/${id}`),
  create: (data) => api.post('/schedule', data),
  update: (id, data) => api.put(`/schedule/${id}`, data),
  delete: (id) => api.delete(`/schedule/${id}`),
  autoSchedule: () => api.post('/schedule/auto'),
};

// Reports API
export const reportsAPI = {
  getStatistics: (params) => api.get('/reports/statistics', { params }),
  getAreaWise: () => api.get('/reports/area-wise'),
  getResourceUtilization: () => api.get('/reports/resource-utilization'),
  getTrends: (params) => api.get('/reports/trends', { params }),
};

// Work Assignments API
export const workAssignmentsAPI = {
  // Support person endpoints
  getMyAssignments: () => api.get('/work-assignments'),
  getOne: (id) => api.get(`/work-assignments/${id}`),
  updateStatus: (id, data) => api.put(`/work-assignments/${id}/status`, data),
  
  // Supervisor endpoints
  getSupervisorAssignments: () => api.get('/work-assignments/supervisor/all'),
  create: (data) => api.post('/work-assignments', data),
  update: (id, data) => api.put(`/work-assignments/${id}`, data),
  delete: (id) => api.delete(`/work-assignments/${id}`),
  confirmCompletion: (complaintId, data) => api.put(`/work-assignments/${complaintId}/confirm`, data),
};

export default api;
