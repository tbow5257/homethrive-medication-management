import { describe, it, expect, jest, beforeEach, afterEach } from '@jest/globals';
import { MedicationController } from './MedicationController';
import * as prismaUtils from '../utils/prisma';

// Mock the getPrismaClient function
jest.mock('../utils/prisma', () => ({
  getPrismaClient: jest.fn()
}));

describe('MedicationController', () => {
  let controller: MedicationController;
  let mockPrisma: any;
  
  beforeEach(() => {
    // Create mock Prisma client
    mockPrisma = {
      medication: {
        findMany: jest.fn(),
        findUnique: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
        delete: jest.fn()
      },
      careRecipient: {
        findUnique: jest.fn()
      },
      schedule: {
        create: jest.fn()
      }
    };
    
    // Set up the mock to return our mockPrisma
    (prismaUtils.getPrismaClient as jest.Mock).mockReturnValue(mockPrisma);
    
    // Create a new instance of the controller before each test
    controller = new MedicationController();
  });
  
  afterEach(() => {
    jest.clearAllMocks();
  });
  
  describe('getMedications', () => {
    it('should return all medications when no careRecipientId is provided', async () => {
      // Setup mock data
      const mockMedications = [
        {
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
          },
          schedules: [
            {
              id: 'schedule-1',
              medicationId: 'med-1',
              times: ['08:00', '20:00'],
              daysOfWeek: ['Monday', 'Wednesday', 'Friday'],
              isActive: true,
              createdAt: new Date(),
              updatedAt: new Date()
            }
          ]
        },
        {
          id: 'med-2',
          name: 'Ibuprofen',
          dosage: '200mg',
          instructions: 'Take as needed',
          isActive: true,
          careRecipientId: 'recipient-2',
          createdAt: new Date(),
          updatedAt: new Date(),
          careRecipient: {
            id: 'recipient-2',
            firstName: 'Jane',
            lastName: 'Smith',
            isActive: true,
            dateOfBirth: '1985-05-15',
            createdAt: new Date(),
            updatedAt: new Date()
          },
          schedules: []
        }
      ];
      
      mockPrisma.medication.findMany.mockResolvedValue(mockMedications);
      
      // Execute
      const result = await controller.getMedications();
      
      // Assert
      expect(mockPrisma.medication.findMany).toHaveBeenCalledWith({
        include: {
          careRecipient: true,
          schedules: true
        }
      });
      
      expect(result).toHaveLength(2);
      expect(result[0]).toEqual(expect.objectContaining({
        id: 'med-1',
        name: 'Aspirin',
        careRecipientFullName: 'John Doe',
        scheduleIds: ['schedule-1'],
        scheduleTimes: [['08:00', '20:00']],
        scheduleDaysOfWeek: [['Monday', 'Wednesday', 'Friday']]
      }));
      
      expect(result[1]).toEqual(expect.objectContaining({
        id: 'med-2',
        name: 'Ibuprofen',
        careRecipientFullName: 'Jane Smith'
      }));
      expect(result[1].scheduleIds).toBeUndefined();
    });
    
    it('should filter medications by careRecipientId when provided', async () => {
      // Setup mock data
      const mockMedications = [
        {
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
          },
          schedules: [
            {
              id: 'schedule-1',
              medicationId: 'med-1',
              times: ['08:00', '20:00'],
              daysOfWeek: ['Monday', 'Wednesday', 'Friday'],
              isActive: true,
              createdAt: new Date(),
              updatedAt: new Date()
            }
          ]
        }
      ];
      
      mockPrisma.medication.findMany.mockResolvedValue(mockMedications);
      
      // Execute
      const result = await controller.getMedications('recipient-1');
      
      // Assert
      expect(mockPrisma.medication.findMany).toHaveBeenCalledWith({
        include: {
          careRecipient: true,
          schedules: true
        },
        where: { careRecipientId: 'recipient-1' }
      });
      
      expect(result).toHaveLength(1);
      expect(result[0].careRecipientId).toBe('recipient-1');
    });
  });
  
  describe('getMedication', () => {
    it('should return a medication by id', async () => {
      // Setup mock data
      const mockMedication = {
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
        },
        schedules: [
          {
            id: 'schedule-1',
            medicationId: 'med-1',
            times: ['08:00', '20:00'],
            daysOfWeek: ['Monday', 'Wednesday', 'Friday'],
            isActive: true,
            createdAt: new Date(),
            updatedAt: new Date()
          }
        ]
      };
      
      mockPrisma.medication.findUnique.mockResolvedValue(mockMedication);
      
      // Execute
      const result = await controller.getMedication('med-1');
      
      // Assert
      expect(mockPrisma.medication.findUnique).toHaveBeenCalledWith({
        where: { id: 'med-1' },
        include: {
          careRecipient: true,
          schedules: true
        }
      });
      
      expect(result).toEqual(expect.objectContaining({
        id: 'med-1',
        name: 'Aspirin',
        dosage: '100mg',
        careRecipientFullName: 'John Doe',
        scheduleIds: ['schedule-1'],
        scheduleTimes: [['08:00', '20:00']],
        scheduleDaysOfWeek: [['Monday', 'Wednesday', 'Friday']]
      }));
    });
    
    it('should throw an error when medication is not found', async () => {
      // Setup mock to return null
      mockPrisma.medication.findUnique.mockResolvedValue(null);
      
      // Execute and assert
      await expect(controller.getMedication('non-existent-id')).rejects.toThrow('Medication not found');
    });
  });
  
  describe('createMedication', () => {
    it('should create a medication with schedule', async () => {
      // Setup mock data
      const mockCareRecipient = {
        id: 'recipient-1',
        firstName: 'John',
        lastName: 'Doe',
        isActive: true,
        dateOfBirth: '1980-01-01',
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      const mockCreatedMedication = {
        id: 'med-1',
        name: 'Aspirin',
        dosage: '100mg',
        instructions: 'Take with food',
        isActive: true,
        careRecipientId: 'recipient-1',
        createdAt: new Date(),
        updatedAt: new Date(),
        careRecipient: mockCareRecipient
      };
      
      const mockCreatedSchedule = {
        id: 'schedule-1',
        medicationId: 'med-1',
        times: ['08:00', '20:00'],
        daysOfWeek: ['Monday', 'Wednesday', 'Friday'],
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      mockPrisma.careRecipient.findUnique.mockResolvedValue(mockCareRecipient);
      mockPrisma.medication.create.mockResolvedValue(mockCreatedMedication);
      mockPrisma.schedule.create.mockResolvedValue(mockCreatedSchedule);
      
      // Request body
      const requestBody = {
        name: 'Aspirin',
        dosage: '100mg',
        instructions: 'Take with food',
        careRecipientId: 'recipient-1',
        schedule: {
          times: ['08:00', '20:00'],
          daysOfWeek: ['Monday', 'Wednesday', 'Friday']
        }
      };
      
      // Execute
      const result = await controller.createMedication(requestBody);
      
      // Assert
      expect(mockPrisma.careRecipient.findUnique).toHaveBeenCalledWith({
        where: { id: 'recipient-1' }
      });
      
      expect(mockPrisma.medication.create).toHaveBeenCalledWith({
        data: {
          name: 'Aspirin',
          dosage: '100mg',
          instructions: 'Take with food',
          careRecipientId: 'recipient-1',
          isActive: true
        },
        include: {
          careRecipient: true
        }
      });
      
      expect(mockPrisma.schedule.create).toHaveBeenCalledWith({
        data: {
          times: ['08:00', '20:00'],
          daysOfWeek: ['Monday', 'Wednesday', 'Friday'],
          medicationId: 'med-1',
          isActive: true
        }
      });
      
      expect(result).toEqual(expect.objectContaining({
        id: 'med-1',
        name: 'Aspirin',
        careRecipientFullName: 'John Doe',
        scheduleIds: ['schedule-1'],
        scheduleTimes: [['08:00', '20:00']],
        scheduleDaysOfWeek: [['Monday', 'Wednesday', 'Friday']]
      }));
    });
    
    it('should throw an error when care recipient is not found', async () => {
      // Setup mock to return null for care recipient
      mockPrisma.careRecipient.findUnique.mockResolvedValue(null);
      
      // Request body
      const requestBody = {
        name: 'Aspirin',
        dosage: '100mg',
        instructions: 'Take with food',
        careRecipientId: 'non-existent-id',
        schedule: {
          times: ['08:00', '20:00'],
          daysOfWeek: ['Monday', 'Wednesday', 'Friday']
        }
      };
      
      // Execute and assert
      await expect(controller.createMedication(requestBody)).rejects.toThrow('Care recipient not found');
    });
    
    it('should throw an error when required fields are missing', async () => {
      // Request body with missing fields
      const requestBody = {
        name: 'Aspirin',
        // Missing dosage
        instructions: 'Take with food',
        careRecipientId: 'recipient-1',
        schedule: {
          times: ['08:00', '20:00'],
          daysOfWeek: ['Monday', 'Wednesday', 'Friday']
        }
      } as any;
      
      // Execute and assert
      await expect(controller.createMedication(requestBody)).rejects.toThrow('Name, dosage, instructions, and care recipient ID are required');
    });
  });
  
  describe('updateMedication', () => {
    it('should update a medication', async () => {
      // Setup mock data
      const existingMedication = {
        id: 'med-1',
        name: 'Aspirin',
        dosage: '100mg',
        instructions: 'Take with food',
        isActive: true,
        careRecipientId: 'recipient-1',
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      const updatedMedication = {
        ...existingMedication,
        name: 'Updated Aspirin',
        dosage: '200mg',
        careRecipient: {
          id: 'recipient-1',
          firstName: 'John',
          lastName: 'Doe',
          isActive: true,
          dateOfBirth: '1980-01-01',
          createdAt: new Date(),
          updatedAt: new Date()
        },
        schedules: [
          {
            id: 'schedule-1',
            medicationId: 'med-1',
            times: ['08:00', '20:00'],
            daysOfWeek: ['Monday', 'Wednesday', 'Friday'],
            isActive: true,
            createdAt: new Date(),
            updatedAt: new Date()
          }
        ]
      };
      
      mockPrisma.medication.findUnique.mockResolvedValue(existingMedication);
      mockPrisma.medication.update.mockResolvedValue(updatedMedication);
      
      // Request body
      const requestBody = {
        name: 'Updated Aspirin',
        dosage: '200mg'
      };
      
      // Execute
      const result = await controller.updateMedication('med-1', requestBody);
      
      // Assert
      expect(mockPrisma.medication.findUnique).toHaveBeenCalledWith({
        where: { id: 'med-1' }
      });
      
      expect(mockPrisma.medication.update).toHaveBeenCalledWith({
        where: { id: 'med-1' },
        data: {
          name: 'Updated Aspirin',
          dosage: '200mg',
          instructions: undefined,
          isActive: undefined,
          careRecipientId: undefined
        },
        include: {
          careRecipient: true,
          schedules: true
        }
      });
      
      expect(result).toEqual(expect.objectContaining({
        id: 'med-1',
        name: 'Updated Aspirin',
        dosage: '200mg',
        careRecipientFullName: 'John Doe'
      }));
    });
    
    it('should throw an error when medication is not found', async () => {
      // Setup mock to return null
      mockPrisma.medication.findUnique.mockResolvedValue(null);
      
      // Execute and assert
      await expect(controller.updateMedication('non-existent-id', { name: 'Updated Name' })).rejects.toThrow('Medication not found');
    });
  });
  
  describe('deleteMedication', () => {
    it('should delete a medication', async () => {
      // Setup mock data
      const existingMedication = {
        id: 'med-1',
        name: 'Aspirin',
        dosage: '100mg',
        instructions: 'Take with food',
        isActive: true,
        careRecipientId: 'recipient-1',
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      mockPrisma.medication.findUnique.mockResolvedValue(existingMedication);
      mockPrisma.medication.delete.mockResolvedValue(undefined);
      
      // Execute
      await controller.deleteMedication('med-1');
      
      // Assert
      expect(mockPrisma.medication.findUnique).toHaveBeenCalledWith({
        where: { id: 'med-1' }
      });
      
      expect(mockPrisma.medication.delete).toHaveBeenCalledWith({
        where: { id: 'med-1' }
      });
    });
    
    it('should throw an error when medication is not found', async () => {
      // Setup mock to return null
      mockPrisma.medication.findUnique.mockResolvedValue(null);
      
      // Execute and assert
      await expect(controller.deleteMedication('non-existent-id')).rejects.toThrow('Medication not found');
    });
  });
}); 