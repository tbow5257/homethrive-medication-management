import { describe, it, expect, jest, beforeEach, afterEach } from '@jest/globals';
import { DashboardController } from './DashboardController';
import * as prismaUtils from '../utils/prisma';

// Mock the getPrismaClient function
jest.mock('../utils/prisma', () => ({
  getPrismaClient: jest.fn()
}));

describe('DashboardController', () => {
  let controller: DashboardController;
  let mockPrisma: any;
  
  beforeEach(() => {
    // Create mock Prisma client
    mockPrisma = {
      schedule: {
        findMany: jest.fn(),
        count: jest.fn()
      },
      dose: {
        findMany: jest.fn(),
        count: jest.fn()
      },
      medication: {
        count: jest.fn()
      },
      careRecipient: {
        count: jest.fn()
      }
    };
    
    // Set up the mock to return our mockPrisma
    (prismaUtils.getPrismaClient as jest.Mock).mockReturnValue(mockPrisma);
    
    // Create a new instance of the controller before each test
    controller = new DashboardController();
    
    // Mock Date to ensure consistent test results
    jest.useFakeTimers();
    jest.setSystemTime(new Date('2023-03-15T12:00:00Z')); // Wednesday
  });
  
  afterEach(() => {
    jest.useRealTimers();
    jest.clearAllMocks();
  });
  
  describe('getUpcomingDoses', () => {
    it('should return upcoming doses for today', async () => {
      // Setup mock data
      mockPrisma.schedule.findMany.mockResolvedValue([{
        id: 'schedule-1',
        medicationId: 'med-1',
        times: ['08:00', '20:00'],
        daysOfWeek: ['Monday', 'Wednesday', 'Friday'],
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
        medication: {
          id: 'med-1',
          name: 'Aspirin',
          dosage: '100mg',
          instructions: 'Take with food',
          isActive: true,
          careRecipientId: 'recipient-1',
          createdAt: new Date(),
          updatedAt: new Date(),
          careRecipient: {
            id: 'recipient-1',
            firstName: 'John',
            lastName: 'Doe',
            isActive: true,
            dateOfBirth: '1980-01-01',
            createdAt: new Date(),
            updatedAt: new Date()
          }
        }
      }]);
      
      mockPrisma.dose.findMany.mockResolvedValue([
        { 
          id: 'dose-1',
          medicationId: 'med-1',
          createdAt: new Date(),
          updatedAt: new Date(),
          takenAt: new Date(),
          scheduledFor: new Date(),
          status: 'taken'
        }
      ]);
      
      // Execute
      const result = await controller.getUpcomingDoses(5);
      
      // Assert
      expect(result).toHaveLength(2); // Two times in the schedule
      expect(result[0]).toEqual(expect.objectContaining({
        medicationId: 'med-1',
        medicationName: 'Aspirin',
        dosage: '100mg',
        recipientId: 'recipient-1',
        recipientName: 'John Doe',
        scheduleId: 'schedule-1',
        scheduledTime: '08:00',
        daysOfWeek: ['Monday', 'Wednesday', 'Friday'],
        takenToday: true // First dose should be marked as taken
      }));
      
      expect(result[1]).toEqual(expect.objectContaining({
        scheduledTime: '20:00',
        takenToday: false // Second dose should not be marked as taken
      }));
    });
    
    it('should limit the number of returned doses', async () => {
      // Setup mock data with multiple schedules
      mockPrisma.schedule.findMany.mockResolvedValue([
        {
          id: 'schedule-1',
          medicationId: 'med-1',
          times: ['08:00', '12:00', '16:00', '20:00'],
          daysOfWeek: ['Wednesday'],
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date(),
          medication: {
            id: 'med-1',
            name: 'Aspirin',
            dosage: '100mg',
            instructions: 'Take with food',
            isActive: true,
            careRecipientId: 'recipient-1',
            createdAt: new Date(),
            updatedAt: new Date(),
            careRecipient: {
              id: 'recipient-1',
              firstName: 'John',
              lastName: 'Doe',
              isActive: true,
              dateOfBirth: '1980-01-01',
              createdAt: new Date(),
              updatedAt: new Date()
            }
          }
        },
        {
          id: 'schedule-2',
          medicationId: 'med-2',
          times: ['09:00', '21:00'],
          daysOfWeek: ['Wednesday'],
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date(),
          medication: {
            id: 'med-2',
            name: 'Ibuprofen',
            dosage: '200mg',
            instructions: 'Take as needed',
            isActive: true,
            careRecipientId: 'recipient-1',
            createdAt: new Date(),
            updatedAt: new Date(),
            careRecipient: {
              id: 'recipient-1',
              firstName: 'John',
              lastName: 'Doe',
              isActive: true,
              dateOfBirth: '1980-01-01',
              createdAt: new Date(),
              updatedAt: new Date()
            }
          }
        }
      ]);
      
      mockPrisma.dose.findMany.mockResolvedValue([]);
      
      // Execute with limit of 3
      const result = await controller.getUpcomingDoses(3);
      
      // Assert
      expect(result).toHaveLength(3); // Should be limited to 3 doses
    });
    
    it('should skip schedules not for today', async () => {
      // Setup mock data with a schedule not for today (Wednesday)
      mockPrisma.schedule.findMany.mockResolvedValue([
        {
          id: 'schedule-1',
          medicationId: 'med-1',
          times: ['08:00', '20:00'],
          daysOfWeek: ['Tuesday', 'Thursday'], // Not Wednesday
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date(),
          medication: {
            id: 'med-1',
            name: 'Aspirin',
            dosage: '100mg',
            instructions: 'Take with food',
            isActive: true,
            careRecipientId: 'recipient-1',
            createdAt: new Date(),
            updatedAt: new Date(),
            careRecipient: {
              id: 'recipient-1',
              firstName: 'John',
              lastName: 'Doe',
              isActive: true,
              dateOfBirth: '1980-01-01',
              createdAt: new Date(),
              updatedAt: new Date()
            }
          }
        }
      ]);
      
      mockPrisma.dose.findMany.mockResolvedValue([]);
      
      // Execute
      const result = await controller.getUpcomingDoses(5);
      
      // Assert - Wednesday is 2023-03-15 as set in beforeEach
      expect(result).toHaveLength(0); // No doses for today since schedule is for Tuesday and Thursday
    });
  });
  
  describe('getDashboardStats', () => {
    it('should calculate dashboard statistics correctly', async () => {
      // Setup mock data for counts
      mockPrisma.careRecipient.count.mockResolvedValue(5);
      mockPrisma.medication.count.mockResolvedValue(10);
      mockPrisma.schedule.count.mockResolvedValue(15);
      
      // Setup separate mocks for each specific dose count call
      // First call - total doses today
      mockPrisma.dose.count.mockResolvedValueOnce(20);
      
      // Second call - taken doses today
      mockPrisma.dose.count.mockResolvedValueOnce(15);
      
      // Third call - missed doses
      mockPrisma.dose.count.mockResolvedValueOnce(8);
      
      // Execute
      const result = await controller.getDashboardStats();
      
      // Assert
      expect(result).toEqual({
        totalRecipients: 5,
        totalMedications: 10,
        totalSchedules: 15,
        todayDoses: 20,
        takenDoses: 15,
        missedDoses: 8,
        complianceRate: 75 // (15/20) * 100 = 75%
      });
    });
    
    it('should handle zero doses gracefully', async () => {
      // Setup mock data with zero doses
      mockPrisma.careRecipient.count.mockResolvedValue(2);
      mockPrisma.medication.count.mockResolvedValue(3);
      mockPrisma.schedule.count.mockResolvedValue(4);
      
      // Mock all dose count calls to return 0
      mockPrisma.dose.count.mockResolvedValue(0);
      
      // Execute
      const result = await controller.getDashboardStats();
      
      // Assert
      expect(result.complianceRate).toBe(0); // Should not throw division by zero
      expect(result.todayDoses).toBe(0);
      expect(result.takenDoses).toBe(0);
    });
  });
}); 