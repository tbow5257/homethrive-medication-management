import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useRecipients, useCreateRecipient } from './useApi';
import { realApi } from '../services/api';
import React from 'react';
import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';

// Mock the API service
vi.mock('../services/api', () => ({
  realApi: {
    getRecipients: vi.fn(),
    createRecipient: vi.fn()
  }
}));

// Wrapper for the hooks with QueryClientProvider
const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });
  
  return ({ children }: { children: React.ReactNode }) => (
    React.createElement(QueryClientProvider, { client: queryClient }, children)
  );
};

describe('API Hooks', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  describe('useRecipients', () => {
    it('should fetch recipients successfully', async () => {
      const mockRecipients = [
        { id: '1', firstName: 'John', lastName: 'Doe' },
        { id: '2', firstName: 'Jane', lastName: 'Smith' }
      ];
      
      (realApi.getRecipients as ReturnType<typeof vi.fn>).mockResolvedValue(mockRecipients);
      
      const { result } = renderHook(() => useRecipients(), {
        wrapper: createWrapper()
      });
      
      // Initially loading
      expect(result.current.isLoading).toBe(true);
      
      // Wait for the query to resolve
      await waitFor(() => !result.current.isLoading);
      
      expect(result.current.data).toEqual(mockRecipients);
      expect(realApi.getRecipients).toHaveBeenCalledTimes(1);
    });

    it('should handle error when fetching recipients', async () => {
      const error = new Error('Failed to fetch recipients');
      (realApi.getRecipients as ReturnType<typeof vi.fn>).mockRejectedValue(error);
      
      const { result } = renderHook(() => useRecipients(), {
        wrapper: createWrapper()
      });
      
      await waitFor(() => !result.current.isLoading);
      
      expect(result.current.error).toBeDefined();
      expect(result.current.data).toBeUndefined();
    });
  });

  describe('useCreateRecipient', () => {
    it('should create a recipient successfully', async () => {
      const newRecipient = { name: 'New User' };
      const createdRecipient = { id: '3', ...newRecipient };
      
      (realApi.createRecipient as ReturnType<typeof vi.fn>).mockResolvedValue(createdRecipient);
      
      const { result } = renderHook(() => useCreateRecipient(), {
        wrapper: createWrapper()
      });
      
      // Start the mutation
      const mutationPromise = result.current.mutateAsync(newRecipient);
      
      // Wait for the mutation to complete before checking
      await mutationPromise;
      
      // Now check if the API was called with the right parameters
      expect(realApi.createRecipient).toHaveBeenCalledWith(newRecipient);
      
      // Wait for the mutation state to update
      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });
      
      // Check the result data
      expect(result.current.data).toEqual(createdRecipient);
    });
  });
}); 