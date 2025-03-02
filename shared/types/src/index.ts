// Auto-generated from Prisma schema
// Do not edit directly

/**
 * Shared types for Medication Management application
 * Generated from Prisma schema
 */

export interface CareRecipient {
  id?: string;
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  isActive?: boolean;
  createdAt?: string;
  updatedAt: string;
  medications: Medication[];
}

export interface Medication {
  id?: string;
  name: string;
  dosage: string;
  instructions: string;
  isActive?: boolean;
  careRecipientId: string;
  createdAt?: string;
  updatedAt: string;
  careRecipient: CareRecipient;
  schedules: Schedule[];
  doses: Dose[];
}

export interface Schedule {
  id?: string;
  time: string;
  daysOfWeek: string[];
  isActive?: boolean;
  medicationId: string;
  createdAt?: string;
  updatedAt: string;
  medication: Medication;
}

export interface Dose {
  id?: string;
  takenAt?: string;
  scheduledFor: string;
  status?: string;
  medicationId: string;
  createdAt?: string;
  updatedAt: string;
  medication: Medication;
}

export interface User {
  id?: string;
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role?: string;
  isActive?: boolean;
  createdAt?: string;
  updatedAt: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}

export type DoseStatus = 'scheduled' | 'taken' | 'missed';

export interface DoseFilters {
  recipientId?: string;
  status?: DoseStatus;
  startDate?: string;
  endDate?: string;
}

export interface DashboardStats {
  totalRecipients: number;
  totalMedications: number;
  totalSchedules: number;
  upcomingDoses: number;
  takenDoses: number;
  missedDoses: number;
}
