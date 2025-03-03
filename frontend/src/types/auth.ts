import type {
  User as SharedUser,
  LoginCredentials as SharedLoginCredentials,
  AuthResponse as SharedAuthResponse
} from '@medication-management/shared-types';

// Re-export shared types with frontend-specific adaptations
export type User = Required<Omit<SharedUser, 'password'>> & {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
};

export type LoginCredentials = SharedLoginCredentials;

export interface RegisterData extends LoginCredentials {
  firstName: string;
  lastName: string;
  role?: string;
}

// Frontend-specific state management type
export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

// Adapt the shared AuthResponse to match frontend expectations
export interface AuthResponse {
  success: boolean;
  data: SharedAuthResponse;
} 