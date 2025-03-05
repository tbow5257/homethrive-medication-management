// jest-dom adds custom jest matchers for asserting on DOM nodes.
// allows you to do things like:
// expect(element).toHaveTextContent(/react/i)
// learn more: https://github.com/testing-library/jest-dom
import '@testing-library/jest-dom';
import { vi } from 'vitest';
// Mock import.meta for Vite environment variables
Object.defineProperty(window, 'process', {
  value: {
    env: {
      VITE_API_URL: 'http://localhost:3000',
    },
  },
  writable: true,
});

// Mock import.meta
(globalThis as any).import = {
  meta: {
    env: {
      VITE_API_URL: 'http://localhost:3000'
    }
  }
};

// Mock localStorage
Object.defineProperty(window, 'localStorage', {
  value: {
    getItem: vi.fn(),
    setItem: vi.fn(),
    removeItem: vi.fn(),
    clear: vi.fn(),
  },
  writable: true
});