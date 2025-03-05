import { Route, Get, Put, Body, Path, Query, Response, Tags, Security, Post } from 'tsoa';
import { getPrismaClient } from '../utils/prisma';
import { Dose, Medication, CareRecipient } from '@prisma/client';

interface DoseResponse extends Dose {
  medication?: Medication & {
    careRecipient?: CareRecipient;
  };
}

interface FlattenedDoseResponse extends Dose {
  medicationName?: string;
  medicationDosage?: string;
  medicationInstructions?: string;
  careRecipientId?: string;
  careRecipientFirstName?: string;
  careRecipientLastName?: string;
  careRecipientFullName?: string;
}

interface UpdateDoseStatusRequest {
  status: 'scheduled' | 'taken' | 'missed' | 'skipped';
}

interface CreateDoseRequest {
  medicationId: string;
  scheduleId: string;
  scheduledTime: string;
  status?: 'taken';
}

/**
 * Helper function to flatten the dose response
 */
function flattenDose(dose: DoseResponse): FlattenedDoseResponse {
  const flattenedDose: FlattenedDoseResponse = {
    ...dose,
    medicationName: dose.medication?.name,
    medicationDosage: dose.medication?.dosage,
    medicationInstructions: dose.medication?.instructions,
    careRecipientId: dose.medication?.careRecipientId,
    careRecipientFirstName: dose.medication?.careRecipient?.firstName,
    careRecipientLastName: dose.medication?.careRecipient?.lastName,
  };

  // Add full name if both first and last name exist
  if (flattenedDose.careRecipientFirstName && flattenedDose.careRecipientLastName) {
    flattenedDose.careRecipientFullName = 
      `${flattenedDose.careRecipientFirstName} ${flattenedDose.careRecipientLastName}`;
  }

  // Remove the nested objects
  delete (flattenedDose as any).medication;

  return flattenedDose;
}

@Route("doses")
@Tags('Doses')
export class DoseController {
  /**
   * Get all doses with optional filtering
   */
  @Get()
  @Security('jwt')
  public async getDoses(
    @Query() recipientId?: string,
    @Query() status?: string,
    @Query() startDate?: string,
    @Query() endDate?: string
  ): Promise<FlattenedDoseResponse[]> {
    const prisma = getPrismaClient();
    
    // Build query
    const query: any = {
      where: {},
      include: {
        medication: {
          include: {
            careRecipient: true
          }
        }
      },
      orderBy: {
        scheduledFor: 'asc'
      }
    };
    
    // Filter by recipient if provided
    if (recipientId) {
      query.where.medication = {
        careRecipientId: recipientId
      };
    }
    
    // Filter by status if provided
    if (status) {
      query.where.status = status;
    }
    
    // Filter by date range if provided
    if (startDate || endDate) {
      query.where.scheduledFor = {};
      
      if (startDate) {
        query.where.scheduledFor.gte = new Date(startDate);
      }
      
      if (endDate) {
        query.where.scheduledFor.lte = new Date(endDate);
      }
    }
    
    // Get doses
    const doses = await prisma.dose.findMany(query);
    
    // Flatten the doses
    return doses.map(flattenDose);
  }

  /**
   * Get a dose by ID
   */
  @Get("{id}")
  @Security('jwt')
  @Response<{ message: string }>(404, "Dose not found")
  public async getDose(@Path() id: string): Promise<FlattenedDoseResponse> {
    const prisma = getPrismaClient();
    
    // Get dose
    const dose = await prisma.dose.findUnique({
      where: { id },
      include: {
        medication: {
          include: {
            careRecipient: true
          }
        }
      }
    });
    
    if (!dose) {
      throw new Error("Dose not found");
    }
    
    // Flatten the dose
    return flattenDose(dose);
  }

  /**
   * Update a dose status
   */
  @Put("{id}/status")
  @Security('jwt')
  @Response<{ message: string }>(404, "Dose not found")
  @Response<{ message: string }>(400, "Bad request")
  public async updateDoseStatus(
    @Path() id: string,
    @Body() requestBody: UpdateDoseStatusRequest
  ): Promise<FlattenedDoseResponse> {
    const prisma = getPrismaClient();
    const { status } = requestBody;
    
    // Validate status
    if (!status || !['scheduled', 'taken', 'missed', 'skipped'].includes(status)) {
      throw new Error('Valid status is required (scheduled, taken, missed, skipped)');
    }
    
    // Check if dose exists
    const existingDose = await prisma.dose.findUnique({
      where: { id }
    });
    
    if (!existingDose) {
      throw new Error("Dose not found");
    }
    
    // Update dose
    const dose = await prisma.dose.update({
      where: { id },
      data: {
        status,
        takenAt: status === 'taken' ? new Date() : existingDose.takenAt
      },
      include: {
        medication: {
          include: {
            careRecipient: true
          }
        }
      }
    });
    
    // Flatten the dose
    return flattenDose(dose);
  }

  /**
   * Create a new dose record
   */
  @Post()
  @Security('jwt')
  @Response<{ message: string }>(400, "Bad request")
  @Response<{ message: string }>(404, "Medication not found")
  public async createDose(
    @Body() requestBody: CreateDoseRequest
  ): Promise<FlattenedDoseResponse> {
    const prisma = getPrismaClient();
    const { medicationId, scheduleId, scheduledTime, status = 'taken' } = requestBody;
    
    // Validate status - only allow 'taken' for now
    if (status !== 'taken') {
      throw new Error('Only taken status is allowed for new doses');
    }
    
    // Check if medication exists
    const medication = await prisma.medication.findUnique({
      where: { id: medicationId }
    });
    
    if (!medication) {
      throw new Error("Medication not found");
    }

    // Check if schedule exists
    const schedule = await prisma.schedule.findUnique({
      where: { id: scheduleId }
    });
    
    if (!schedule) {
      throw new Error("Schedule not found");
    }
    
    // Validate that scheduledTime exists in the schedule's times
    if (!schedule.times.includes(scheduledTime)) {
      throw new Error("Scheduled time not found in the schedule");
    }
    
    // Parse the time to create a proper scheduled date
    const [hours, minutes] = scheduledTime.split(':').map(Number);
    const now = new Date();
    const scheduledDate = new Date(now);
    scheduledDate.setHours(hours, minutes, 0, 0);
    
    // If the scheduled time is in the future today, use today's date
    // If it's in the past, assume it was for today
    const takenAt = now;
    
    // Create dose
    const dose = await prisma.dose.create({
      data: {
        medicationId,
        status,
        scheduledFor: scheduledDate,
        takenAt: takenAt,
      },
      include: {
        medication: {
          include: {
            careRecipient: true
          }
        }
      }
    });
    
    // Flatten the dose
    return flattenDose(dose);
  }
} 