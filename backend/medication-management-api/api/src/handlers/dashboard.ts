import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { 
  successResponse, 
  unauthorizedResponse, 
  serverErrorResponse 
} from '../utils/response';
import { disconnectPrisma } from '../utils/prisma';
import { authenticate } from '../utils/auth';
import { DashboardController } from '../controllers/DashboardController';

/**
 * Get upcoming doses
 */
export const getDashboardUpcomingDosesHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  try {
    const user = authenticate(event);
    if (!user) {
      return unauthorizedResponse();
    }
    
    const { limit = '5' } = event.queryStringParameters || {};
    const limitNum = parseInt(limit, 10);
    
    const controller = new DashboardController();
    const result = await controller.getUpcomingDoses(limitNum);
    
    return successResponse(result);
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
    const user = authenticate(event);
    if (!user) {
      return unauthorizedResponse();
    }
    
    const controller = new DashboardController();
    const result = await controller.getDashboardStats();
    
    return successResponse(result);
  } catch (error) {
    console.error('Error getting dashboard stats:', error);
    return serverErrorResponse();
  } finally {
    await disconnectPrisma();
  }
}; 