import { Route, Get, Post, Put, Delete, Body, Path, Query, Response, Tags, Security } from 'tsoa';
import { getPrismaClient } from '../utils/prisma';
import { Schedule, Medication, CareRecipient } from '@prisma/client';
import { DayOfWeek } from '../types';

interface ScheduleResponse extends Schedule {
  medication?: Medication & {
    careRecipient?: CareRecipient;
  };
}

interface FlattenedScheduleResponse {
  id: string;
  times: string[];
  daysOfWeek: string[];
  isActive: boolean;
  medicationId: string;
  createdAt: string;
  updatedAt: string;
  medicationName?: string;
  medicationDosage?: string;
  careRecipientId?: string;
  careRecipientFirstName?: string;
  careRecipientLastName?: string;
  careRecipientFullName?: string;
}

interface CreateScheduleRequest {
  times: string[];
  daysOfWeek: DayOfWeek[];
  medicationId: string;
}

interface UpdateScheduleRequest {
  times?: string[];
  daysOfWeek?: DayOfWeek[];
  isActive?: boolean;
  medicationId?: string;
}

function flattenSchedule(schedule: ScheduleResponse): FlattenedScheduleResponse {
  const flattened: FlattenedScheduleResponse = {
    id: schedule.id,
    times: schedule.times,
    daysOfWeek: schedule.daysOfWeek,
    isActive: schedule.isActive,
    medicationId: schedule.medicationId,
    createdAt: schedule.createdAt.toISOString(),
    updatedAt: schedule.updatedAt.toISOString(),
  };

  if (schedule.medication) {
    flattened.medicationName = schedule.medication.name;
    flattened.medicationDosage = schedule.medication.dosage;
    
    if (schedule.medication.careRecipient) {
      const careRecipient = schedule.medication.careRecipient;
      flattened.careRecipientId = careRecipient.id;
      flattened.careRecipientFirstName = careRecipient.firstName;
      flattened.careRecipientLastName = careRecipient.lastName;
      flattened.careRecipientFullName = `${careRecipient.firstName} ${careRecipient.lastName}`.trim();
    }
  }

  return flattened;
}

@Route("schedules")
@Tags('Schedules')
export class ScheduleController {
  /**
   * Get all schedules with optional filtering by medication
   */
  @Get()
  @Security('jwt')
  public async getSchedules(@Query() medicationId?: string): Promise<FlattenedScheduleResponse[]> {
    const prisma = getPrismaClient();
    
    // Build query
    const query: any = {
      where: {
        isActive: true
      },
      include: {
        medication: {
          include: {
            careRecipient: true
          }
        }
      }
    };
    
    // Filter by medication if provided
    if (medicationId) {
      query.where.medicationId = medicationId;
    }
    
    // Get schedules
    const schedules = await prisma.schedule.findMany(query);
    
    return schedules.map(flattenSchedule);
  }

  /**
   * Get a schedule by ID
   */
  @Get("{id}")
  @Security('jwt')
  @Response<{ message: string }>(404, "Schedule not found")
  public async getSchedule(@Path() id: string): Promise<FlattenedScheduleResponse> {
    const prisma = getPrismaClient();
    
    // Get schedule
    const schedule = await prisma.schedule.findUnique({
      where: { id },
      include: {
        medication: {
          include: {
            careRecipient: true
          }
        }
      }
    });
    
    if (!schedule) {
      throw new Error("Schedule not found");
    }
    
    return flattenSchedule(schedule);
  }

  /**
   * Create a new schedule
   */
  @Post()
  @Security('jwt')
  @Response<{ message: string }>(400, "Bad request")
  public async createSchedule(@Body() requestBody: CreateScheduleRequest): Promise<FlattenedScheduleResponse> {
    const prisma = getPrismaClient();
    const { times, daysOfWeek, medicationId } = requestBody;
    
    // Validate required fields
    if (!times || !daysOfWeek || !medicationId) {
      throw new Error('Times, days of week, and medication ID are required');
    }
    
    // Validate times
    if (!Array.isArray(times) || times.length === 0) {
      throw new Error('Times must be a non-empty array');
    }
    
    // Validate days of week
    if (!Array.isArray(daysOfWeek) || daysOfWeek.length === 0) {
      throw new Error('Days of week must be a non-empty array');
    }
    
    // Check if medication exists
    const medication = await prisma.medication.findUnique({
      where: { id: medicationId }
    });
    
    if (!medication) {
      throw new Error('Medication not found');
    }
    
    // Create schedule
    const schedule = await prisma.schedule.create({
      data: {
        times,
        daysOfWeek,
        medicationId
      },
      include: {
        medication: {
          include: {
            careRecipient: true
          }
        }
      }
    });
    
    return flattenSchedule(schedule);
  }

  /**
   * Update a schedule
   */
  @Put("{id}")
  @Security('jwt')
  @Response<{ message: string }>(404, "Schedule not found")
  @Response<{ message: string }>(400, "Bad request")
  public async updateSchedule(
    @Path() id: string,
    @Body() requestBody: UpdateScheduleRequest
  ): Promise<FlattenedScheduleResponse> {
    const prisma = getPrismaClient();
    const { times, daysOfWeek, isActive, medicationId } = requestBody;
    
    // Check if schedule exists
    const existingSchedule = await prisma.schedule.findUnique({
      where: { id }
    });
    
    if (!existingSchedule) {
      throw new Error("Schedule not found");
    }
    
    // Validate times if provided
    if (times !== undefined && (!Array.isArray(times) || times.length === 0)) {
      throw new Error('Times must be a non-empty array');
    }
    
    // Validate days of week if provided
    if (daysOfWeek !== undefined && (!Array.isArray(daysOfWeek) || daysOfWeek.length === 0)) {
      throw new Error('Days of week must be a non-empty array');
    }
    
    // Check if medication exists if provided
    if (medicationId !== undefined) {
      const medication = await prisma.medication.findUnique({
        where: { id: medicationId }
      });
      
      if (!medication) {
        throw new Error('Medication not found');
      }
    }
    
    // Update schedule
    const schedule = await prisma.schedule.update({
      where: { id },
      data: {
        times: times !== undefined ? times : undefined,
        daysOfWeek: daysOfWeek !== undefined ? daysOfWeek : undefined,
        isActive: isActive !== undefined ? isActive : undefined,
        medicationId: medicationId !== undefined ? medicationId : undefined
      },
      include: {
        medication: {
          include: {
            careRecipient: true
          }
        }
      }
    });
    
    return flattenSchedule(schedule);
  }

  /**
   * Delete a schedule (mark as inactive)
   */
  @Delete("{id}")
  @Security('jwt')
  @Response<{ message: string }>(404, "Schedule not found")
  @Response<void>(204, "No content")
  public async deleteSchedule(@Path() id: string): Promise<void> {
    const prisma = getPrismaClient();
    
    // Check if schedule exists
    const existingSchedule = await prisma.schedule.findUnique({
      where: { id }
    });
    
    if (!existingSchedule) {
      throw new Error("Schedule not found");
    }
    
    // Instead of deleting, mark as inactive
    await prisma.schedule.update({
      where: { id },
      data: {
        isActive: false
      }
    });
  }
} 