import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { 
  successResponse, 
  badRequestResponse, 
  unauthorizedResponse, 
  serverErrorResponse,
  createdResponse
} from '../utils/response';
import { getPrismaClient, disconnectPrisma } from '../utils/prisma';
import { hashPassword, comparePassword, generateToken } from '../utils/auth';

/**
 * Register a new user
 */
export const registerHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  try {
    const prisma = getPrismaClient();
    
    // Parse request body
    const body = JSON.parse(event.body || '{}');
    const { email, password, firstName, lastName, role } = body;
    
    // Validate required fields
    if (!email || !password || !firstName || !lastName) {
      return badRequestResponse('Email, password, first name, and last name are required');
    }
    
    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });
    
    if (existingUser) {
      return badRequestResponse('User with this email already exists');
    }
    
    // Hash password
    const hashedPassword = await hashPassword(password);
    
    // Create user
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        firstName,
        lastName,
        role: role || 'caregiver'
      }
    });
    
    // Generate token
    const token = generateToken(user);
    
    // Return user data without password
    const { password: _, ...userData } = user;
    
    return createdResponse({
      user: userData,
      token
    });
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
    const prisma = getPrismaClient();
    
    // Parse request body
    const body = JSON.parse(event.body || '{}');
    const { email, password } = body;
    
    // Validate required fields
    if (!email || !password) {
      return badRequestResponse('Email and password are required');
    }
    
    // Find user
    const user = await prisma.user.findUnique({
      where: { email }
    });
    
    // Check if user exists
    if (!user) {
      return unauthorizedResponse('Invalid credentials');
    }
    
    // Check if user is active
    if (!user.isActive) {
      return unauthorizedResponse('Account is inactive');
    }
    
    // Verify password
    const isPasswordValid = await comparePassword(password, user.password);
    
    if (!isPasswordValid) {
      return unauthorizedResponse('Invalid credentials');
    }
    
    // Generate token
    const token = generateToken(user);
    
    // Return user data without password
    const { password: _, ...userData } = user;
    
    return successResponse({
      user: userData,
      token
    });
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
    // User is already authenticated by middleware
    const { user } = event as any;
    
    const prisma = getPrismaClient();
    
    // Get fresh user data
    const userData = await prisma.user.findUnique({
      where: { id: user.userId }
    });
    
    if (!userData) {
      return unauthorizedResponse('User not found');
    }
    
    // Return user data without password
    const { password: _, ...userProfile } = userData;
    
    return successResponse({ user: userProfile });
  } catch (error) {
    console.error('Error getting profile:', error);
    return serverErrorResponse();
  } finally {
    await disconnectPrisma();
  }
}; 