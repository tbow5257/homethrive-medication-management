import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { 
  successResponse, 
  badRequestResponse, 
  unauthorizedResponse, 
  serverErrorResponse,
  createdResponse
} from '../utils/response';
import { disconnectPrisma } from '../utils/prisma';
import { authenticate } from '../utils/auth';
import { AuthController } from '../controllers/AuthController';

/**
 * Register a new user
 */
export const registerHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  try {
    // Parse request body
    if (!event.body) {
      return badRequestResponse('Request body is required');
    }
    
    const body = JSON.parse(event.body);
    
    // Use the controller
    const controller = new AuthController();
    
    try {
      const result = await controller.register(body);
      return createdResponse(result);
    } catch (error: any) {
      if (error.message.includes('required') || error.message.includes('already exists')) {
        return badRequestResponse(error.message);
      }
      throw error;
    }
  } catch (error) {
    console.error('Error registering user:', error);
    return serverErrorResponse();
  } finally {
    await disconnectPrisma();
  }
};

/**
 * Login a user
 */
export const loginHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  try {
    // Parse request body
    if (!event.body) {
      return badRequestResponse('Request body is required');
    }
    
    const body = JSON.parse(event.body);
    
    // Use the controller
    const controller = new AuthController();
    
    try {
      const result = await controller.login(body);
      return successResponse(result);
    } catch (error: any) {
      if (error.message.includes('required')) {
        return badRequestResponse(error.message);
      }
      if (error.message.includes('Invalid credentials') || error.message.includes('inactive')) {
        return unauthorizedResponse(error.message);
      }
      throw error;
    }
  } catch (error) {
    console.error('Error logging in:', error);
    return serverErrorResponse();
  } finally {
    await disconnectPrisma();
  }
};

/**
 * Get current user profile
 */
export const profileHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  try {
    // Authenticate user
    const user = authenticate(event);
    if (!user) {
      return unauthorizedResponse();
    }
    
    // Use the controller
    const controller = new AuthController();
    
    try {
      const result = await controller.getProfile(user.userId);
      return successResponse(result);
    } catch (error: any) {
      if (error.message === 'User not found') {
        return unauthorizedResponse(error.message);
      }
      throw error;
    }
  } catch (error) {
    console.error('Error getting profile:', error);
    return serverErrorResponse();
  } finally {
    await disconnectPrisma();
  }
}; 