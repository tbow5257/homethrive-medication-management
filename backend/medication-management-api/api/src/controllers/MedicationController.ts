import { Route, Get, Post, Put, Delete, Body, Path, Query, Response, Tags, Security } from 'tsoa';
import { getPrismaClient } from '../utils/prisma';
import { Medication, CareRecipient, Schedule } from '@prisma/client';

interface MedicationResponse extends Medication {
  careRecipient?: CareRecipient;
  schedules?: Schedule[];
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

@Route("medications")
@Tags('Medications')
export class MedicationController {
  /**
   * Get all medications with optional filtering by care recipient
   */
  @Get()
  @Security('jwt')
  public async getMedications(@Query() careRecipientId?: string): Promise<MedicationResponse[]> {
    const prisma = getPrismaClient();
    
    // Build query
    const query: any = {
      include: {
        careRecipient: true
      }
    };
    
    // Filter by care recipient if provided
    if (careRecipientId) {
      query.where.careRecipientId = careRecipientId;
    }
    
    // Get medications
    const medications = await prisma.medication.findMany(query);
    
    return medications;
  }

  /**
   * Get a medication by ID
   */
  @Get("{id}")
  @Security('jwt')
  @Response<{ message: string }>(404, "Medication not found")
  public async getMedication(@Path() id: string): Promise<MedicationResponse> {
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
    
    return medication;
  }

  /**
   * Create a new medication
   */
  @Post()
  @Security('jwt')
  @Response<{ message: string }>(400, "Bad request")
  public async createMedication(@Body() requestBody: CreateMedicationRequest): Promise<MedicationResponse> {
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
      await prisma.schedule.create({
        data: {
          times: schedule.times,
          daysOfWeek: schedule.daysOfWeek,
          medicationId: medication.id,
          isActive: true
        }
      });
    } catch (error: any) {
      // Now we throw an error since schedule is required
      throw new Error(`Failed to create required schedule: ${error.message}`);
    }
    
    return medication;
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
  ): Promise<MedicationResponse> {
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
        careRecipient: true
      }
    });
    
    return medication;
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