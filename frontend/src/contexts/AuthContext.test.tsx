import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AuthProvider, useAuth } from './AuthContext';
import * as authService from '../services/authService';
import '@testing-library/jest-dom';
import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';

// Mock the auth service
vi.mock('../services/authService', () => ({
  login: vi.fn(),
  setToken: vi.fn(),
  getToken: vi.fn(),
  removeToken: vi.fn(),
  isAuthenticated: vi.fn()
}));

// Create a proper localStorage mock
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: vi.fn((key: string) => store[key] || null),
    setItem: vi.fn((key: string, value: string) => {
      store[key] = value;
    }),
    removeItem: vi.fn((key: string) => {
      delete store[key];
    }),
    clear: vi.fn(() => {
      store = {};
    })
  };
})();

// Replace the global localStorage with our mock
Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
  writable: true
});

// Test component that uses the auth context
const TestComponent = () => {
  const { user, isAuthenticated, login, logout, loading } = useAuth();
  
  return (
    <div>
      <div data-testid="loading">{loading ? 'Loading' : 'Not Loading'}</div>
      <div data-testid="authenticated">{isAuthenticated ? 'Authenticated' : 'Not Authenticated'}</div>
      <div data-testid="user">{user ? user.name : 'No User'}</div>
      <button onClick={() => login('test@example.com', 'password')}>Login</button>
      <button onClick={logout}>Logout</button>
    </div>
  );
};

describe('AuthContext', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorageMock.clear();
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  it('should initialize with not authenticated state', () => {
    (authService.getToken as ReturnType<typeof vi.fn>).mockReturnValue(null);
    
    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );
    
    expect(screen.getByTestId('authenticated')).toHaveTextContent('Not Authenticated');
    expect(screen.getByTestId('user')).toHaveTextContent('No User');
  });

  it('should login user successfully', async () => {
    const mockUser = { id: '123', name: 'Test User', email: 'test@example.com' };
    const mockToken = 'test-token';
    
    // Update the mock to match the expected input format
    (authService.login as ReturnType<typeof vi.fn>).mockResolvedValue({ 
      token: mockToken, 
      user: { id: '123', firstName: 'Test User', email: 'test@example.com' } 
    });
    
    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );
    
    const user = userEvent.setup();
    await user.click(screen.getByText('Login'));
    
    await waitFor(() => {
      // Update the expectation to match the actual call format
      expect(authService.login).toHaveBeenCalledWith({ 
        email: 'test@example.com', 
        password: 'password' 
      });
      expect(authService.setToken).toHaveBeenCalledWith(mockToken);
      expect(screen.getByTestId('authenticated')).toHaveTextContent('Authenticated');
    });
  });

  it('should logout user', async () => {
    // Setup initial authenticated state
    localStorageMock.setItem('token', 'test-token');
    localStorageMock.setItem('user', JSON.stringify({ id: '123', name: 'Test User', email: 'test@example.com' }));
    
    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );
    
    // Wait for auth to initialize
    await waitFor(() => {
      expect(screen.getByTestId('authenticated')).toHaveTextContent('Authenticated');
    });
    
    // Logout
    const user = userEvent.setup();
    await user.click(screen.getByText('Logout'));
    
    expect(screen.getByTestId('authenticated')).toHaveTextContent('Not Authenticated');
    expect(screen.getByTestId('user')).toHaveTextContent('No User');
    expect(localStorageMock.getItem('token')).toBeNull();
    expect(localStorageMock.getItem('user')).toBeNull();
  });
}); 