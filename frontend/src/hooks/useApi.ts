import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { mockApi } from '../services/mockApi';
import { realApi } from '../services/api';
import { CareRecipient, Medication, Schedule, Dose } from '../types';

// API Configuration - Change this to switch between mock and real API
export const USE_MOCK_API = false; // Set to false to use the real API
export const currentApi = USE_MOCK_API ? mockApi : realApi;

// Recipients hooks
export const useRecipients = () => {
  return useQuery({
    queryKey: ['recipients'],
    queryFn: () => currentApi.getRecipients(),
  });
};

export const useRecipient = (id: string) => {
  return useQuery({
    queryKey: ['recipients', id],
    queryFn: () => currentApi.getRecipient(id),
    enabled: !!id,
  });
};

export const useCreateRecipient = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: { name: string }) => currentApi.createRecipient(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['recipients'] });
    },
  });
};

export const useUpdateRecipient = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: { name: string } }) => 
      currentApi.updateRecipient(id, data),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['recipients'] });
      queryClient.invalidateQueries({ queryKey: ['recipients', data.id] });
    },
  });
};

export const useDeleteRecipient = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: string) => currentApi.deleteRecipient(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['recipients'] });
    },
  });
};

// Medications hooks
export const useMedications = (recipientId?: string) => {
  return useQuery({
    queryKey: ['medications', { recipientId }],
    queryFn: () => currentApi.getMedications(recipientId),
  });
};

export const useMedication = (id: string) => {
  return useQuery({
    queryKey: ['medications', id],
    queryFn: () => currentApi.getMedication(id),
    enabled: !!id,
  });
};

export const useCreateMedication = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: Omit<Medication, 'id' | 'createdAt' | 'updatedAt'>) => 
      currentApi.createMedication(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['medications'] });
    },
  });
};

export const useUpdateMedication = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: { 
      id: string; 
      data: Partial<Omit<Medication, 'id' | 'createdAt' | 'updatedAt'>>
    }) => currentApi.updateMedication(id, data),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['medications'] });
      queryClient.invalidateQueries({ queryKey: ['medications', data.id] });
    },
  });
};

export const useDeleteMedication = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: string) => currentApi.deleteMedication(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['medications'] });
    },
  });
};

// Schedules hooks
export const useSchedules = (medicationId?: string) => {
  return useQuery({
    queryKey: ['schedules', { medicationId }],
    queryFn: () => currentApi.getSchedules(medicationId),
  });
};

export const useSchedule = (id: string) => {
  return useQuery({
    queryKey: ['schedules', id],
    queryFn: () => currentApi.getSchedule(id),
    enabled: !!id,
  });
};

export const useCreateSchedule = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: Omit<Schedule, 'id' | 'createdAt' | 'updatedAt'>) => 
      currentApi.createSchedule(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['schedules'] });
      queryClient.invalidateQueries({ queryKey: ['doses'] });
    },
  });
};

export const useUpdateSchedule = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: { 
      id: string; 
      data: Partial<Omit<Schedule, 'id' | 'createdAt' | 'updatedAt'>>
    }) => currentApi.updateSchedule(id, data),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['schedules'] });
      queryClient.invalidateQueries({ queryKey: ['schedules', data.id] });
      queryClient.invalidateQueries({ queryKey: ['doses'] });
    },
  });
};

export const useDeleteSchedule = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: string) => currentApi.deleteSchedule(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['schedules'] });
      queryClient.invalidateQueries({ queryKey: ['doses'] });
    },
  });
};

// Doses hooks
export const useDoses = (params?: { 
  recipientId?: string; 
  status?: 'scheduled' | 'taken' | 'missed';
  startDate?: string;
  endDate?: string;
}) => {
  return useQuery({
    queryKey: ['doses', params],
    queryFn: () => currentApi.getDoses(params),
  });
};

export const useDose = (id: string) => {
  return useQuery({
    queryKey: ['doses', id],
    queryFn: () => currentApi.getDose(id),
    enabled: !!id,
  });
};

export const useUpdateDoseStatus = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: 'taken' | 'missed' }) => 
      currentApi.updateDoseStatus(id, status),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['doses'] });
      queryClient.invalidateQueries({ queryKey: ['doses', data.id] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });
};

// Dashboard hooks
export const useDashboardStats = () => {
  return useQuery({
    queryKey: ['dashboard', 'stats'],
    queryFn: () => currentApi.getDashboardStats(),
  });
};

export const useUpcomingDoses = (limit = 5) => {
  return useQuery({
    queryKey: ['dashboard', 'upcomingDoses', limit],
    queryFn: () => currentApi.getUpcomingDoses(limit),
  });
};