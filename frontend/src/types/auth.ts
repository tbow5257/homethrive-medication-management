import type {
  AuthResponse as SharedAuthResponse,
  RegisterRequest,
  LoginRequest,
} from '@medication-management/shared-types';

// export RegisterRequest as RegisterData
export type RegisterData = RegisterRequest;

// export LoginRequest as LoginCredentials
export type LoginCredentials = LoginRequest;

export interface AuthState {
  // user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

// Adapt the shared AuthResponse to match frontend expectations
export type AuthResponse = SharedAuthResponse;