import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { realApi } from '../services/api';
import { 
  CareRecipient, 
  Medication, 
  Schedule, 
  DoseResponse, 
  ApiResponse, 
  DashboardStats 
} from '../types';
import { useState, useEffect } from 'react';

// Recipients hooks
export const useRecipients = () => {
  return useQuery({
    queryKey: ['recipients'],
    queryFn: () => realApi.getRecipients(),
  });
};

export const useRecipient = (id: string) => {
  return useQuery({
    queryKey: ['recipients', id],
    queryFn: () => realApi.getRecipient(id),
    enabled: !!id,
  });
};

export const useCreateRecipient = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: { name: string }) => realApi.createRecipient(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['recipients'] });
    },
  });
};

export const useUpdateRecipient = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: { name: string } }) => 
      realApi.updateRecipient(id, data),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['recipients'] });
      queryClient.invalidateQueries({ queryKey: ['recipients', data.id] });
    },
  });
};

export const useDeleteRecipient = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: string) => realApi.deleteRecipient(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['recipients'] });
    },
  });
};

// Medications hooks
export const useMedications = (recipientId?: string) => {
  return useQuery({
    queryKey: ['medications', { recipientId }],
    queryFn: () => realApi.getMedications(recipientId),
  });
};

export const useMedication = (id: string) => {
  return useQuery({
    queryKey: ['medications', id],
    queryFn: () => realApi.getMedication(id),
    enabled: !!id,
  });
};

export const useCreateMedication = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: Omit<Medication, 'id' | 'createdAt' | 'updatedAt'>) => 
      realApi.createMedication(data),
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
    }) => realApi.updateMedication(id, data),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['medications'] });
      queryClient.invalidateQueries({ queryKey: ['medications', data.id] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard', 'upcomingDoses'] });
    },
  });
};

export const useDeleteMedication = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: string) => realApi.deleteMedication(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['medications'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard', 'upcomingDoses'] });
    },
  });
};

// Schedules hooks
export const useSchedules = (medicationId?: string) => {
  return useQuery({
    queryKey: ['schedules', { medicationId }],
    queryFn: () => realApi.getSchedules(medicationId),
  });
};

export const useSchedule = (id: string) => {
  return useQuery({
    queryKey: ['schedules', id],
    queryFn: () => realApi.getSchedule(id),
    enabled: !!id,
  });
};

export const useCreateSchedule = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: Omit<Schedule, 'id' | 'createdAt' | 'updatedAt'>) => 
      realApi.createSchedule(data),
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
    }) => realApi.updateSchedule(id, data),
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
    mutationFn: (id: string) => realApi.deleteSchedule(id),
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
    queryFn: () => realApi.getDoses(params),
  });
};

export const useDose = (id: string) => {
  return useQuery({
    queryKey: ['doses', id],
    queryFn: () => realApi.getDose(id),
    enabled: !!id,
  });
};

export const useCreateDose = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ medicationId, status = 'taken' }: { medicationId: string; status?: 'taken' }) => 
      realApi.createDose(medicationId, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['doses'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });
};

// Dashboard hooks
export const useDashboardStats = () => {
  return useQuery({
    queryKey: ['dashboard', 'stats'],
    queryFn: () => realApi.getDashboardStats(),
  });
};

export const useUpcomingDoses = (limit = 5) => {
  return useQuery({
    queryKey: ['dashboard', 'upcomingDoses', limit],
    queryFn: () => realApi.getUpcomingDoses(limit),
  });
};
