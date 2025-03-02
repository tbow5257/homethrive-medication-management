// Import types from shared package
// Note: This import will work once the shared types package is built and linked
// For now, we'll keep the original types to avoid breaking the application
import type {
  User as SharedUser,
  CareRecipient as SharedCareRecipient,
  Medication as SharedMedication,
  Schedule as SharedSchedule,
  Dose as SharedDose,
  DoseStatus,
  ApiResponse,
  AuthResponse,
  DashboardStats
} from '@medication-management/shared-types';

// Re-export shared types
export type {
  SharedUser,
  SharedCareRecipient,
  SharedMedication,
  SharedSchedule,
  SharedDose,
  DoseStatus,
  ApiResponse,
  AuthResponse,
  DashboardStats
};

// Frontend-specific types and extensions
export interface UserWithName {
  id: string;
  name: string;
  email: string;
}

// Extended types for UI components
export interface MedicationWithRecipient {
  id: string;
  name: string;
  dosage: string;
  instructions: string;
  isActive: boolean;
  careRecipientId: string;
  createdAt: string;
  updatedAt: string;
  careRecipient?: {
    id: string;
    name: string;
  };
}

export interface DoseWithDetails {
  id: string;
  scheduleId: string;
  medicationId: string;
  scheduledTime: string;
  status: 'scheduled' | 'taken' | 'missed';
  takenAt: string | null;
  createdAt: string;
  updatedAt: string;
  medication?: {
    id: string;
    name: string;
  };
  careRecipient?: {
    id: string;
    name: string;
  };
}

// UI-specific types
export interface SidebarItem {
  key: string;
  icon: React.ReactNode;
  label: string;
}

export interface FormMode {
  isEditing: boolean;
  currentId?: string;
}

// Original types (will be replaced by shared types once the package is built)
export interface User {
  id: string;
  name: string;
  email: string;
}

export interface CareRecipient {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
}

export interface Medication {
  id: string;
  name: string;
  dosage: string;
  instructions: string;
  isActive: boolean;
  careRecipientId: string;
  createdAt: string;
  updatedAt: string;
}

export interface Schedule {
  id: string;
  medicationId: string;
  recurrenceType: 'daily' | 'weekly';
  recurrencePattern: {
    daysOfWeek?: number[];
    times: string[];
  };
  startDate: string;
  endDate: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Dose {
  id: string;
  scheduleId: string;
  medicationId: string;
  scheduledTime: string;
  status: 'scheduled' | 'taken' | 'missed';
  takenAt: string | null;
  createdAt: string;
  updatedAt: string;
}

// Keep these interfaces for backward compatibility
// They will be removed once the migration to shared types is complete
export interface LegacyUser {
  id: string;
  name: string;
  email: string;
}

export interface LegacyCareRecipient {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
}

export interface LegacyMedication {
  id: string;
  name: string;
  dosage: string;
  instructions: string;
  isActive: boolean;
  careRecipientId: string;
  createdAt: string;
  updatedAt: string;
}

export interface LegacySchedule {
  id: string;
  medicationId: string;
  recurrenceType: 'daily' | 'weekly';
  recurrencePattern: {
    daysOfWeek?: number[];
    times: string[];
  };
  startDate: string;
  endDate: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface LegacyDose {
  id: string;
  scheduleId: string;
  medicationId: string;
  scheduledTime: string;
  status: 'scheduled' | 'taken' | 'missed';
  takenAt: string | null;
  createdAt: string;
  updatedAt: string;
}