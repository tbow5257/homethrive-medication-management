import { Route, Get, Put, Body, Path, Query, Response, Tags, Security } from 'tsoa';
import { getPrismaClient } from '../utils/prisma';
import { Dose, Medication, CareRecipient } from '@prisma/client';

interface DoseResponse extends Dose {
  medication?: Medication & {
    careRecipient?: CareRecipient;
  };
}

interface UpdateDoseStatusRequest {
  status: 'scheduled' | 'taken' | 'missed' | 'skipped';
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
  ): Promise<DoseResponse[]> {
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
    
    return doses;
  }

  /**
   * Get a dose by ID
   */
  @Get("{id}")
  @Security('jwt')
  @Response<{ message: string }>(404, "Dose not found")
  public async getDose(@Path() id: string): Promise<DoseResponse> {
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
    
    return dose;
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
  ): Promise<DoseResponse> {
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
    
    return dose;
  }
} 