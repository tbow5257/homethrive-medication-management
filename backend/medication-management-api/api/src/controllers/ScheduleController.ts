import { Route, Get, Post, Put, Delete, Body, Path, Query, Response, Tags, Security } from 'tsoa';
import { getPrismaClient } from '../utils/prisma';
import { Schedule, Medication, CareRecipient } from '@prisma/client';
import { DayOfWeek } from '../types';

interface ScheduleResponse extends Schedule {
  medication?: Medication & {
    careRecipient?: CareRecipient;
  };
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

@Route("schedules")
@Tags('Schedules')
export class ScheduleController {
  /**
   * Get all schedules with optional filtering by medication
   */
  @Get()
  @Security('jwt')
  public async getSchedules(@Query() medicationId?: string): Promise<ScheduleResponse[]> {
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
    
    return schedules;
  }

  /**
   * Get a schedule by ID
   */
  @Get("{id}")
  @Security('jwt')
  @Response<{ message: string }>(404, "Schedule not found")
  public async getSchedule(@Path() id: string): Promise<ScheduleResponse> {
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
    
    return schedule;
  }

  /**
   * Create a new schedule
   */
  @Post()
  @Security('jwt')
  @Response<{ message: string }>(400, "Bad request")
  public async createSchedule(@Body() requestBody: CreateScheduleRequest): Promise<ScheduleResponse> {
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
    
    return schedule;
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
  ): Promise<ScheduleResponse> {
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
    
    return schedule;
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