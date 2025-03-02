import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { 
  successResponse, 
  badRequestResponse, 
  notFoundResponse, 
  serverErrorResponse
} from '../utils/response';
import { getPrismaClient, disconnectPrisma } from '../utils/prisma';
// Import Prisma types directly
import { Dose } from '@prisma/client';
import { ApiResponse } from '../types/api';

/**
 * Get all doses with optional filtering
 */
export const getDosesHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  try {
    const prisma = getPrismaClient();
    
    // Get query parameters
    const { 
      recipientId, 
      status, 
      startDate, 
      endDate 
    } = event.queryStringParameters || {};
    
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
    
    return successResponse(doses);
  } catch (error) {
    console.error('Error getting doses:', error);
    return serverErrorResponse();
  } finally {
    await disconnectPrisma();
  }
};

/**
 * Get a dose by ID
 */
export const getDoseHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  try {
    const prisma = getPrismaClient();
    
    // Get dose ID from path parameters
    const { id } = event.pathParameters || {};
    
    if (!id) {
      return badRequestResponse('Dose ID is required');
    }
    
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
      return notFoundResponse('Dose not found');
    }
    
    return successResponse(dose);
  } catch (error) {
    console.error('Error getting dose:', error);
    return serverErrorResponse();
  } finally {
    await disconnectPrisma();
  }
};

/**
 * Update a dose status
 */
export const updateDoseStatusHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  try {
    const prisma = getPrismaClient();
    
    // Get dose ID from path parameters
    const { id } = event.pathParameters || {};
    
    if (!id) {
      return badRequestResponse('Dose ID is required');
    }
    
    // Parse request body
    const body = JSON.parse(event.body || '{}');
    const { status } = body;
    
    // Validate status
    if (!status || !['scheduled', 'taken', 'missed', 'skipped'].includes(status)) {
      return badRequestResponse('Valid status is required (scheduled, taken, missed, skipped)');
    }
    
    // Check if dose exists
    const existingDose = await prisma.dose.findUnique({
      where: { id }
    });
    
    if (!existingDose) {
      return notFoundResponse('Dose not found');
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
    
    return successResponse(dose);
  } catch (error) {
    console.error('Error updating dose status:', error);
    return serverErrorResponse();
  } finally {
    await disconnectPrisma();
  }
};

/**
 * Get upcoming doses
 */
export const getUpcomingDosesHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  try {
    const prisma = getPrismaClient();
    
    // Get query parameters
    const { limit = '5' } = event.queryStringParameters || {};
    
    // Parse limit
    const limitNum = parseInt(limit, 10);
    
    // Get upcoming doses
    const doses = await prisma.dose.findMany({
      where: {
        status: 'scheduled',
        scheduledFor: {
          gte: new Date()
        }
      },
      include: {
        medication: {
          include: {
            careRecipient: true
          }
        }
      },
      orderBy: {
        scheduledFor: 'asc'
      },
      take: limitNum
    });
    
    return successResponse(doses);
  } catch (error) {
    console.error('Error getting upcoming doses:', error);
    return serverErrorResponse();
  } finally {
    await disconnectPrisma();
  }
};

/**
 * Get dashboard statistics
 */
export const getDashboardStatsHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  try {
    const prisma = getPrismaClient();
    
    // Get today's date
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    // Get counts
    const [
      totalRecipients,
      totalMedications,
      totalSchedules,
      todayDoses,
      takenDoses,
      missedDoses
    ] = await Promise.all([
      prisma.careRecipient.count({ where: { isActive: true } }),
      prisma.medication.count({ where: { isActive: true } }),
      prisma.schedule.count({ where: { isActive: true } }),
      prisma.dose.count({
        where: {
          scheduledFor: {
            gte: today,
            lt: tomorrow
          }
        }
      }),
      prisma.dose.count({
        where: {
          status: 'taken',
          scheduledFor: {
            gte: today,
            lt: tomorrow
          }
        }
      }),
      prisma.dose.count({
        where: {
          status: 'missed'
        }
      })
    ]);
    
    // Calculate compliance rate
    const complianceRate = todayDoses > 0 ? (takenDoses / todayDoses) * 100 : 0;
    
    // Return stats
    return successResponse({
      totalRecipients,
      totalMedications,
      totalSchedules,
      todayDoses,
      takenDoses,
      missedDoses,
      complianceRate: Math.round(complianceRate)
    });
  } catch (error) {
    console.error('Error getting dashboard stats:', error);
    return serverErrorResponse();
  } finally {
    await disconnectPrisma();
  }
}; 