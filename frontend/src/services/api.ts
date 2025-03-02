import axios from 'axios';
import { login as authLogin, setToken } from './authService';
import { CareRecipient, Medication, Schedule, Dose } from '../types';
import { LoginCredentials } from '../types/auth';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add a request interceptor to include the token in all requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Add a response interceptor to handle token expiration
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Token expired or invalid
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Real API implementation that matches the mock API interface
export const realApi = {
  // Auth
  login: async (email: string, password: string) => {
    const response = await authLogin({ email, password });
    setToken(response.data.token);
    return { token: response.data.token };
  },
  
  // Recipients
  getRecipients: async () => {
    const response = await api.get('/recipients');
    return response.data;
  },
  
  getRecipient: async (id: string) => {
    const response = await api.get(`/recipients/${id}`);
    return response.data;
  },
  
  createRecipient: async (data: { name: string }) => {
    const response = await api.post('/recipients', data);
    return response.data;
  },
  
  updateRecipient: async (id: string, data: { name: string }) => {
    const response = await api.put(`/recipients/${id}`, data);
    return response.data;
  },
  
  deleteRecipient: async (id: string) => {
    const response = await api.delete(`/recipients/${id}`);
    return response.data;
  },
  
  // Medications
  getMedications: async (recipientId?: string) => {
    const url = recipientId ? `/medications?recipientId=${recipientId}` : '/medications';
    const response = await api.get(url);
    return response.data;
  },
  
  getMedication: async (id: string) => {
    const response = await api.get(`/medications/${id}`);
    return response.data;
  },
  
  createMedication: async (data: Omit<Medication, 'id' | 'createdAt' | 'updatedAt'>) => {
    const response = await api.post('/medications', data);
    return response.data;
  },
  
  updateMedication: async (id: string, data: Partial<Omit<Medication, 'id' | 'createdAt' | 'updatedAt'>>) => {
    const response = await api.put(`/medications/${id}`, data);
    return response.data;
  },
  
  deleteMedication: async (id: string) => {
    const response = await api.delete(`/medications/${id}`);
    return response.data;
  },
  
  // Schedules
  getSchedules: async (medicationId?: string) => {
    const url = medicationId ? `/schedules?medicationId=${medicationId}` : '/schedules';
    const response = await api.get(url);
    return response.data;
  },
  
  getSchedule: async (id: string) => {
    const response = await api.get(`/schedules/${id}`);
    return response.data;
  },
  
  createSchedule: async (data: Omit<Schedule, 'id' | 'createdAt' | 'updatedAt'>) => {
    const response = await api.post('/schedules', data);
    return response.data;
  },
  
  updateSchedule: async (id: string, data: Partial<Omit<Schedule, 'id' | 'createdAt' | 'updatedAt'>>) => {
    const response = await api.put(`/schedules/${id}`, data);
    return response.data;
  },
  
  deleteSchedule: async (id: string) => {
    const response = await api.delete(`/schedules/${id}`);
    return response.data;
  },
  
  // Doses
  getDoses: async (params?: { 
    recipientId?: string; 
    status?: 'scheduled' | 'taken' | 'missed';
    startDate?: string;
    endDate?: string;
  }) => {
    const queryParams = new URLSearchParams();
    if (params) {
      if (params.recipientId) queryParams.append('recipientId', params.recipientId);
      if (params.status) queryParams.append('status', params.status);
      if (params.startDate) queryParams.append('startDate', params.startDate);
      if (params.endDate) queryParams.append('endDate', params.endDate);
    }
    
    const url = queryParams.toString() ? `/doses?${queryParams.toString()}` : '/doses';
    const response = await api.get(url);
    return response.data;
  },
  
  getDose: async (id: string) => {
    const response = await api.get(`/doses/${id}`);
    return response.data;
  },
  
  updateDoseStatus: async (id: string, status: 'taken' | 'missed') => {
    const response = await api.patch(`/doses/${id}/status`, { status });
    return response.data;
  },
  
  // Dashboard
  getDashboardStats: async () => {
    const response = await api.get('/dashboard/stats');
    return response.data;
  },
  
  getUpcomingDoses: async (limit = 5) => {
    const response = await api.get(`/dashboard/upcoming-doses?limit=${limit}`);
    return response.data;
  }
};

export default api;