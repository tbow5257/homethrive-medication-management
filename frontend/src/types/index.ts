import type {
  // Import utility types
  ApiResponse,
  AuthResponse as SharedAuthResponse,
  DashboardStats,
  DoseStatus,
  PaginatedResponse,
  ScheduleResponse as Schedule,
  FlattenedMedicationResponse as Medication,
  CareRecipientResponse as CareRecipient,
  CreateCareRecipientRequest,
  UpdateCareRecipientRequest,
  DoseResponse,
  UpcomingMedication,
  // Import API services
  CareRecipientsService,
  
  // Import core API utilities
  ApiError,
  CancelablePromise,
  OpenAPI,
  
  // Import auth-related types
} from '@medication-management/shared-types';

// Re-export shared types
export type {
  // Re-export utility types
  ApiResponse,
  SharedAuthResponse,
  DashboardStats,
  DoseStatus,
  PaginatedResponse,
  
  // Re-export Swagger-generated models
  CareRecipient,
  DoseResponse,
  Medication,
  Schedule,
  CreateCareRecipientRequest,
  UpdateCareRecipientRequest,
  UpcomingMedication,
  
  // Re-export API services
  CareRecipientsService,
  
  // Re-export core API utilities
  ApiError,
  CancelablePromise,
  OpenAPI,
  
  // Re-export auth-related types
};

// Re-export DayOfWeek enum (not as a type)
export { DayOfWeek } from '@medication-management/shared-types';

// Re-export frontend-specific auth types
export * from './auth';

/**
 * TRANSITION GUIDE:
 * 
 * We're transitioning from legacy types to Swagger-generated types:
 * 
 * 1. Legacy types (User, CareRecipient, Medication, etc.) - Keep for backward compatibility
 * 2. Shared types (SharedUser, SharedCareRecipient, etc.) - Intermediate types from shared package
 * 3. API types (ApiCareRecipient, ApiMedication, etc.) - New Swagger-generated types
 * 
 * When using API client, use the Api* prefixed types. For new components, prefer Api* types.
 * Legacy types will be phased out gradually.
 */

/**
 * FRONTEND-SPECIFIC TYPES
 * These types extend or complement the Swagger-generated types
 * for frontend-specific use cases.
 */

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
