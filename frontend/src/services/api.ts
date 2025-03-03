import axios from 'axios';
import { login as authLogin, setToken } from './authService';
import { 
  CareRecipient, 
  Medication, 
  Schedule, 
  DoseResponse, 
  DashboardStats 
} from '../types';
import { AxiosResponse } from 'axios';

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

// Add these helper functions
async function get<T>(url: string) {
  const response = await api.get<T, AxiosResponse<T>>(url);
  return response.data;
}

async function post<T>(url: string, data: any) {
  const response = await api.post<T, AxiosResponse<T>>(url, data);
  return response.data;
}

async function put<T>(url: string, data: any) {
  const response = await api.put<T, AxiosResponse<T>>(url, data);
  return response.data;
}

async function patch<T>(url: string, data: any) {
  const response = await api.patch<T, AxiosResponse<T>>(url, data);
  return response.data;
}

async function del<T>(url: string) {
  const response = await api.delete<T, AxiosResponse<T>>(url);
  return response.data;
}

// Real API implementation that matches the mock API interface
export const realApi = {
  // Auth
  login: async (email: string, password: string) => {
    const { token, user } = await authLogin({ email, password });
    // Access token from the response structure
    if (token) {
      setToken(token);
    }
    return { token, user };
  },
  
  // Recipients
  getRecipients: async () => {
    return await get<CareRecipient[]>('/care-recipients');
  },
  
  getRecipient: async (id: string) => {
    return await get<CareRecipient>(`/care-recipients/${id}`);
  },
  
  createRecipient: async (data: { name: string }) => {
    return await post<CareRecipient>('/care-recipients', data);
  },
  
  updateRecipient: async (id: string, data: { name: string }) => {
    return await put<CareRecipient>(`/care-recipients/${id}`, data);
  },
  
  deleteRecipient: async (id: string) => {
    return await del<void>(`/care-recipients/${id}`);
  },
  
  // Medications
  getMedications: async (recipientId?: string) => {
    const url = recipientId ? `/medications?recipientId=${recipientId}` : '/medications';
    return await get<Medication[]>(url);
  },
  
  getMedication: async (id: string) => {
    return await get<Medication>(`/medications/${id}`);
  },
  
  createMedication: async (data: Omit<Medication, 'id' | 'createdAt' | 'updatedAt'>) => {
    return await post<Medication>('/medications', data);
  },
  
  updateMedication: async (id: string, data: Partial<Omit<Medication, 'id' | 'createdAt' | 'updatedAt'>>) => {
    return await put<Medication>(`/medications/${id}`, data);
  },
  
  deleteMedication: async (id: string) => {
    return await del<void>(`/medications/${id}`);
  },
  
  // Schedules
  getSchedules: async (medicationId?: string) => {
    const url = medicationId ? `/schedules?medicationId=${medicationId}` : '/schedules';
    return await get<Schedule[]>(url);
  },
  
  getSchedule: async (id: string) => {
    return await get<Schedule>(`/schedules/${id}`);
  },
  
  createSchedule: async (data: Omit<Schedule, 'id' | 'createdAt' | 'updatedAt'>) => {
    return await post<Schedule>('/schedules', data);
  },
  
  updateSchedule: async (id: string, data: Partial<Omit<Schedule, 'id' | 'createdAt' | 'updatedAt'>>) => {
    return await put<Schedule>(`/schedules/${id}`, data);
  },
  
  deleteSchedule: async (id: string) => {
    return await del<void>(`/schedules/${id}`);
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
    return await get<DoseResponse[]>(url);
  },
  
  getDose: async (id: string) => {
    return await get<DoseResponse>(`/doses/${id}`);
  },
  
  updateDoseStatus: async (id: string, status: 'taken' | 'missed') => {
    return await patch<DoseResponse>(`/doses/${id}/status`, { status });
  },
  
  // Dashboard
  getDashboardStats: async () => {
    return await get<DashboardStats>('/dashboard/stats');
  },
  
  getUpcomingDoses: async (limit = 5) => {
    return await get<DoseResponse[]>(`/dashboard/upcoming-doses?limit=${limit}`);
  }
};

export default api;