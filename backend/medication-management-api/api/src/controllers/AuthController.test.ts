import { describe, it, expect, jest, beforeEach, afterEach } from '@jest/globals';
import { AuthController } from './AuthController';
import * as prismaUtils from '../utils/prisma';
import * as authUtils from '../utils/auth';

// TODO: Use later, setup to properly define types for the mocked functions to match the original signatures
type HashPasswordFn = (password: string) => Promise<string>;
type ComparePasswordFn = (password: string, hash: string) => Promise<boolean>;
type GenerateTokenFn = (user: any) => string;

// Mock the getPrismaClient function
jest.mock('../utils/prisma', () => ({
  getPrismaClient: jest.fn()
}));

// Mock auth utilities
jest.mock('../utils/auth', () => ({
  hashPassword: jest.fn(),
  comparePassword: jest.fn(),
  generateToken: jest.fn()
}));

describe('AuthController', () => {
  let controller: AuthController;
  let mockPrisma: any;
  
  beforeEach(() => {
    // Create mock Prisma client
    mockPrisma = {
      user: {
        findUnique: jest.fn(),
        create: jest.fn()
      }
    };
    
    // Set up the mock to return our mockPrisma
    (prismaUtils.getPrismaClient as jest.Mock).mockReturnValue(mockPrisma);
    
    // Reset mocks
    jest.clearAllMocks();
    
    // Create a new instance of the controller before each test
    controller = new AuthController();
  });
  
  afterEach(() => {
    jest.clearAllMocks();
  });
  
  describe('register', () => {
    it('should register a new user successfully', async () => {
      // Setup mock data
      const requestBody = {
        email: 'test@example.com',
        password: 'password123',
        firstName: 'John',
        lastName: 'Doe'
      };
      
      const hashedPassword = 'hashed_password';
      const mockUser = {
        id: 'user-1',
        email: 'test@example.com',
        password: hashedPassword,
        firstName: 'John',
        lastName: 'Doe',
        role: 'caregiver' as const,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      const mockToken = 'jwt_token';
      
      // Mock return values
      mockPrisma.user.findUnique.mockResolvedValue(null); // User doesn't exist yet
      mockPrisma.user.create.mockResolvedValue(mockUser);
      
      // Mock auth utilities
      // @ts-ignore - Bypass TypeScript error for testing
      (authUtils.hashPassword as jest.Mock).mockResolvedValue(hashedPassword);
      // @ts-ignore - Bypass TypeScript error for testing
      (authUtils.generateToken as jest.Mock).mockReturnValue(mockToken);
      
      // Execute
      const result = await controller.register(requestBody);
      
      // Assert
      expect(mockPrisma.user.findUnique).toHaveBeenCalledWith({
        where: { email: 'test@example.com' }
      });
      
      expect(authUtils.hashPassword).toHaveBeenCalledWith('password123');
      
      expect(mockPrisma.user.create).toHaveBeenCalledWith({
        data: {
          email: 'test@example.com',
          password: hashedPassword,
          firstName: 'John',
          lastName: 'Doe',
          role: 'caregiver'
        }
      });
      
      expect(authUtils.generateToken).toHaveBeenCalledWith(mockUser);
      
      expect(result).toEqual({
        user: {
          id: 'user-1',
          email: 'test@example.com',
          firstName: 'John',
          lastName: 'Doe',
          role: 'caregiver',
          isActive: true,
          createdAt: expect.any(Date),
          updatedAt: expect.any(Date)
        },
        token: mockToken
      });
    });
    
    it('should register a user with admin role when specified', async () => {
      // Setup mock data
      const requestBody = {
        email: 'admin@example.com',
        password: 'password123',
        firstName: 'Admin',
        lastName: 'User',
        role: 'admin' as const
      };
      
      const hashedPassword = 'hashed_password';
      const mockUser = {
        id: 'user-2',
        email: 'admin@example.com',
        password: hashedPassword,
        firstName: 'Admin',
        lastName: 'User',
        role: 'admin' as const,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      const mockToken = 'jwt_token';
      
      // Mock return values
      mockPrisma.user.findUnique.mockResolvedValue(null);
      mockPrisma.user.create.mockResolvedValue(mockUser);
      
      // Mock auth utilities
      // @ts-ignore - Bypass TypeScript error for testing
      (authUtils.hashPassword as jest.Mock).mockResolvedValue(hashedPassword);
      // @ts-ignore - Bypass TypeScript error for testing
      (authUtils.generateToken as jest.Mock).mockReturnValue(mockToken);
      
      // Execute
      const result = await controller.register(requestBody);
      
      // Assert
      expect(mockPrisma.user.create).toHaveBeenCalledWith({
        data: {
          email: 'admin@example.com',
          password: hashedPassword,
          firstName: 'Admin',
          lastName: 'User',
          role: 'admin'
        }
      });
      
      expect(result.user.role).toBe('admin');
    });
    
    it('should throw an error if user already exists', async () => {
      // Setup mock data
      const requestBody = {
        email: 'existing@example.com',
        password: 'password123',
        firstName: 'John',
        lastName: 'Doe'
      };
      
      const existingUser = {
        id: 'user-3',
        email: 'existing@example.com',
        password: 'hashed_password',
        firstName: 'John',
        lastName: 'Doe',
        role: 'caregiver' as const,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      // Mock return values
      mockPrisma.user.findUnique.mockResolvedValue(existingUser);
      
      // Execute and assert
      await expect(controller.register(requestBody)).rejects.toThrow('User with this email already exists');
      
      // Verify that create was not called
      expect(mockPrisma.user.create).not.toHaveBeenCalled();
    });
    
    it('should throw an error if required fields are missing', async () => {
      // Setup mock data with missing fields
      const requestBody = {
        email: 'test@example.com',
        password: 'password123',
        // Missing firstName
        lastName: 'Doe'
      } as any;
      
      // Execute and assert
      await expect(controller.register(requestBody)).rejects.toThrow('Email, password, first name, and last name are required');
      
      // Verify that findUnique was not called
      expect(mockPrisma.user.findUnique).not.toHaveBeenCalled();
    });
  });
  
  describe('login', () => {
    it('should login a user successfully', async () => {
      // Setup mock data
      const requestBody = {
        email: 'test@example.com',
        password: 'password123'
      };
      
      const mockUser = {
        id: 'user-1',
        email: 'test@example.com',
        password: 'hashed_password',
        firstName: 'John',
        lastName: 'Doe',
        role: 'caregiver' as const,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      const mockToken = 'jwt_token';
      
      // Mock return values
      mockPrisma.user.findUnique.mockResolvedValue(mockUser);
      
      // Mock auth utilities
      // @ts-ignore - Bypass TypeScript error for testing
      (authUtils.comparePassword as jest.Mock).mockResolvedValue(true);
      // @ts-ignore - Bypass TypeScript error for testing
      (authUtils.generateToken as jest.Mock).mockReturnValue(mockToken);
      
      // Execute
      const result = await controller.login(requestBody);
      
      // Assert
      expect(mockPrisma.user.findUnique).toHaveBeenCalledWith({
        where: { email: 'test@example.com' }
      });
      
      expect(authUtils.comparePassword).toHaveBeenCalledWith('password123', 'hashed_password');
      expect(authUtils.generateToken).toHaveBeenCalledWith(mockUser);
      
      expect(result).toEqual({
        user: {
          id: 'user-1',
          email: 'test@example.com',
          firstName: 'John',
          lastName: 'Doe',
          role: 'caregiver',
          isActive: true,
          createdAt: expect.any(Date),
          updatedAt: expect.any(Date)
        },
        token: mockToken
      });
    });
    
    it('should throw an error if user does not exist', async () => {
      // Setup mock data
      const requestBody = {
        email: 'nonexistent@example.com',
        password: 'password123'
      };
      
      // Mock return values
      mockPrisma.user.findUnique.mockResolvedValue(null);
      
      // Execute and assert
      await expect(controller.login(requestBody)).rejects.toThrow('Invalid credentials');
      
      // Verify that comparePassword was not called
      expect(authUtils.comparePassword).not.toHaveBeenCalled();
    });
    
    it('should throw an error if user account is inactive', async () => {
      // Setup mock data
      const requestBody = {
        email: 'inactive@example.com',
        password: 'password123'
      };
      
      const inactiveUser = {
        id: 'user-4',
        email: 'inactive@example.com',
        password: 'hashed_password',
        firstName: 'Inactive',
        lastName: 'User',
        role: 'caregiver' as const,
        isActive: false,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      // Mock return values
      mockPrisma.user.findUnique.mockResolvedValue(inactiveUser);
      
      // Execute and assert
      await expect(controller.login(requestBody)).rejects.toThrow('Account is inactive');
      
      // Verify that comparePassword was not called
      expect(authUtils.comparePassword).not.toHaveBeenCalled();
    });
    
    it('should throw an error if password is incorrect', async () => {
      // Setup mock data
      const requestBody = {
        email: 'test@example.com',
        password: 'wrong_password'
      };
      
      const mockUser = {
        id: 'user-1',
        email: 'test@example.com',
        password: 'hashed_password',
        firstName: 'John',
        lastName: 'Doe',
        role: 'caregiver' as const,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      // Mock return values
      mockPrisma.user.findUnique.mockResolvedValue(mockUser);
      
      // Mock auth utilities
      // @ts-ignore - Bypass TypeScript error for testing
      (authUtils.comparePassword as jest.Mock).mockResolvedValue(false);
      
      // Execute and assert
      await expect(controller.login(requestBody)).rejects.toThrow('Invalid credentials');
      
      // Verify that generateToken was not called
      expect(authUtils.generateToken).not.toHaveBeenCalled();
    });
    
    it('should throw an error if required fields are missing', async () => {
      // Setup mock data with missing fields
      const requestBody = {
        email: 'test@example.com'
        // Missing password
      } as any;
      
      // Execute and assert
      await expect(controller.login(requestBody)).rejects.toThrow('Email and password are required');
      
      // Verify that findUnique was not called
      expect(mockPrisma.user.findUnique).not.toHaveBeenCalled();
    });
  });
  
  describe('getProfile', () => {
    it('should return user profile successfully', async () => {
      // Setup mock data
      const userId = 'user-1';
      
      const mockUser = {
        id: 'user-1',
        email: 'test@example.com',
        password: 'hashed_password',
        firstName: 'John',
        lastName: 'Doe',
        role: 'caregiver' as const,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      // Mock return values
      mockPrisma.user.findUnique.mockResolvedValue(mockUser);
      
      // Execute
      const result = await controller.getProfile(userId);
      
      // Assert
      expect(mockPrisma.user.findUnique).toHaveBeenCalledWith({
        where: { id: 'user-1' }
      });
      
      expect(result).toEqual({
        user: {
          id: 'user-1',
          email: 'test@example.com',
          firstName: 'John',
          lastName: 'Doe',
          role: 'caregiver',
          isActive: true,
          createdAt: expect.any(Date),
          updatedAt: expect.any(Date)
        }
      });
    });
    
    it('should throw an error if user is not found', async () => {
      // Setup mock data
      const userId = 'non-existent-id';
      
      // Mock return values
      mockPrisma.user.findUnique.mockResolvedValue(null);
      
      // Execute and assert
      await expect(controller.getProfile(userId)).rejects.toThrow('User not found');
    });
  });
}); 