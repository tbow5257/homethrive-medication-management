import { Route, Get, Post, Put, Delete, Body, Path, Query, Response, Tags, Security } from 'tsoa';
import { getPrismaClient } from '../utils/prisma';
import { Medication, CareRecipient, Schedule } from '@prisma/client';

// Original nested response type (kept for reference)
interface MedicationResponse extends Medication {
  careRecipient?: CareRecipient;
  schedules?: Schedule[];
}

// New flattened response type
interface FlattenedMedicationResponse {
  id: string;
  name: string;
  dosage: string;
  instructions: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  careRecipientId: string;
  careRecipientFirstName?: string;
  careRecipientLastName?: string;
  careRecipientFullName?: string;
  scheduleIds?: string[];
  scheduleTimes?: string[][];
  scheduleDaysOfWeek?: string[][];
}

interface CreateMedicationRequest {
  name: string;
  dosage: string;
  instructions: string;
  careRecipientId: string;
  schedule: {
    times: string[];
    daysOfWeek: string[];
  };
  isActive?: boolean;
  daysOfWeek?: string[];
}

interface UpdateMedicationRequest {
  name?: string;
  dosage?: string;
  instructions?: string;
  isActive?: boolean;
  careRecipientId?: string;
}

// Helper function to flatten medication data
function flattenMedication(
  medication: MedicationResponse
): FlattenedMedicationResponse {
  const flattenedMedication: FlattenedMedicationResponse = {
    id: medication.id,
    name: medication.name,
    dosage: medication.dosage,
    instructions: medication.instructions,
    isActive: medication.isActive,
    createdAt: medication.createdAt.toISOString(),
    updatedAt: medication.updatedAt.toISOString(),
    careRecipientId: medication.careRecipientId,
  };

  // Add care recipient data if available
  if (medication.careRecipient) {
    flattenedMedication.careRecipientFirstName = medication.careRecipient.firstName;
    flattenedMedication.careRecipientLastName = medication.careRecipient.lastName;
    flattenedMedication.careRecipientFullName = 
      `${medication.careRecipient.firstName} ${medication.careRecipient.lastName}`;
  }

  // Add schedule data if available
  if (medication.schedules && medication.schedules.length > 0) {
    flattenedMedication.scheduleIds = medication.schedules.map(s => s.id);
    flattenedMedication.scheduleTimes = medication.schedules.map(s => s.times);
    flattenedMedication.scheduleDaysOfWeek = medication.schedules.map(s => s.daysOfWeek);
  }

  return flattenedMedication;
}

@Route("medications")
@Tags('Medications')
export class MedicationController {
  /**
   * Get all medications with optional filtering by care recipient
   */
  @Get()
  @Security('jwt')
  public async getMedications(@Query() careRecipientId?: string): Promise<FlattenedMedicationResponse[]> {
    const prisma = getPrismaClient();
    
    // Build query
    const query: any = {
      include: {
        careRecipient: true,
        schedules: true
      }
    };
    
    // Filter by care recipient if provided
    if (careRecipientId) {
      query.where = { careRecipientId };
    }
    
    // Get medications
    const medications = await prisma.medication.findMany(query);
    
    // Flatten the response
    return medications.map(flattenMedication);
  }

  /**
   * Get a medication by ID
   */
  @Get("{id}")
  @Security('jwt')
  @Response<{ message: string }>(404, "Medication not found")
  public async getMedication(@Path() id: string): Promise<FlattenedMedicationResponse> {
    const prisma = getPrismaClient();
    
    // Get medication
    const medication = await prisma.medication.findUnique({
      where: { id },
      include: {
        careRecipient: true,
        schedules: true
      }
    });
    
    if (!medication) {
      throw new Error("Medication not found");
    }
    
    // Flatten the response
    return flattenMedication(medication);
  }

  /**
   * Create a new medication
   */
  @Post()
  @Security('jwt')
  @Response<{ message: string }>(400, "Bad request")
  public async createMedication(@Body() requestBody: CreateMedicationRequest): Promise<FlattenedMedicationResponse> {
    const prisma = getPrismaClient();
    const { name, dosage, instructions, careRecipientId, schedule } = requestBody;
    
    // Validate required fields
    if (!name || !dosage || !instructions || !careRecipientId) {
      throw new Error('Name, dosage, instructions, and care recipient ID are required');
    }
    
    // Validate schedule is provided (now required by business rules)
    if (!schedule || !schedule.times || !schedule.daysOfWeek) {
      throw new Error('Schedule with times and daysOfWeek is required');
    }
    
    // Validate times
    if (!Array.isArray(schedule.times) || schedule.times.length === 0) {
      throw new Error('Times must be a non-empty array');
    }
    
    // Validate days of week
    if (!Array.isArray(schedule.daysOfWeek) || schedule.daysOfWeek.length === 0) {
      throw new Error('Days of week must be a non-empty array');
    }
    
    // Check if care recipient exists
    const careRecipient = await prisma.careRecipient.findUnique({
      where: { id: careRecipientId }
    });
    
    if (!careRecipient) {
      throw new Error('Care recipient not found');
    }
    
    // Create medication
    const medication = await prisma.medication.create({
      data: {
        name,
        dosage,
        instructions,
        careRecipientId,
        isActive: requestBody.isActive !== undefined ? requestBody.isActive : true
      },
      include: {
        careRecipient: true
      }
    });
    
    // Create schedule
    try {
      const createdSchedule = await prisma.schedule.create({
        data: {
          times: schedule.times,
          daysOfWeek: schedule.daysOfWeek,
          medicationId: medication.id,
          isActive: true
        }
      });
      
      // Return flattened response with schedule data
      return flattenMedication({
        ...medication,
        schedules: [createdSchedule]
      });
    } catch (error: any) {
      // Now we throw an error since schedule is required
      throw new Error(`Failed to create required schedule: ${error.message}`);
    }
  }

  /**
   * Update a medication
   */
  @Put("{id}")
  @Security('jwt')
  @Response<{ message: string }>(404, "Medication not found")
  @Response<{ message: string }>(400, "Bad request")
  public async updateMedication(
    @Path() id: string,
    @Body() requestBody: UpdateMedicationRequest
  ): Promise<FlattenedMedicationResponse> {
    const prisma = getPrismaClient();
    const { name, dosage, instructions, isActive, careRecipientId } = requestBody;
    
    // Check if medication exists
    const existingMedication = await prisma.medication.findUnique({
      where: { id }
    });
    
    if (!existingMedication) {
      throw new Error("Medication not found");
    }
    
    // Update medication
    const medication = await prisma.medication.update({
      where: { id },
      data: {
        name: name !== undefined ? name : undefined,
        dosage: dosage !== undefined ? dosage : undefined,
        instructions: instructions !== undefined ? instructions : undefined,
        isActive: isActive !== undefined ? isActive : undefined,
        careRecipientId: careRecipientId !== undefined ? careRecipientId : undefined
      },
      include: {
        careRecipient: true,
        schedules: true
      }
    });
    
    // Return flattened response
    return flattenMedication(medication);
  }

  /**
   * Delete a medication
   */
  @Delete("{id}")
  @Security('jwt')
  @Response<{ message: string }>(404, "Medication not found")
  @Response<void>(204, "No content")
  public async deleteMedication(@Path() id: string): Promise<void> {
    const prisma = getPrismaClient();
    
    // Check if medication exists
    const existingMedication = await prisma.medication.findUnique({
      where: { id }
    });
    
    if (!existingMedication) {
      throw new Error("Medication not found");
    }
    
    // Delete medication
    await prisma.medication.delete({
      where: { id }
    });
  }
} 