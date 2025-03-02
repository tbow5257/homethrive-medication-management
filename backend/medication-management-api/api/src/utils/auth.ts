import { APIGatewayProxyEvent } from 'aws-lambda';
import * as bcrypt from 'bcryptjs';
import * as jwt from 'jsonwebtoken';
import { User } from '@prisma/client';

// JWT secret from environment variables
const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret';
const TOKEN_EXPIRY = '24h';

/**
 * Hash a password
 */
export const hashPassword = async (password: string): Promise<string> => {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
};

/**
 * Compare a password with a hash
 */
export const comparePassword = async (password: string, hash: string): Promise<boolean> => {
  return bcrypt.compare(password, hash);
};

/**
 * Generate a JWT token
 */
export const generateToken = (user: User): string => {
  const payload = {
    userId: user.id,
    email: user.email,
    role: user.role
  };
  
  return jwt.sign(payload, JWT_SECRET, { expiresIn: TOKEN_EXPIRY });
};

/**
 * Verify a JWT token
 */
export const verifyToken = (token: string): any => {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    return null;
  }
};

/**
 * Extract token from Authorization header
 */
export const extractToken = (event: APIGatewayProxyEvent): string | null => {
  const authHeader = event.headers.Authorization || event.headers.authorization;
  
  if (!authHeader) {
    return null;
  }
  
  // Check if it's a Bearer token
  const parts = authHeader.split(' ');
  if (parts.length !== 2 || parts[0] !== 'Bearer') {
    return null;
  }
  
  return parts[1];
};

/**
 * Authenticate a request
 */
export const authenticate = (event: APIGatewayProxyEvent): any => {
  const token = extractToken(event);
  
  if (!token) {
    return null;
  }
  
  return verifyToken(token);
};

/**
 * Create a middleware to protect routes
 */
export const requireAuth = (handler: Function) => {
  return async (event: APIGatewayProxyEvent) => {
    const user = authenticate(event);
    
    if (!user) {
      return {
        statusCode: 401,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Credentials': 'true',
        },
        body: JSON.stringify({
          success: false,
          error: 'Unauthorized',
        }),
      };
    }
    
    // Add user to event for handlers to use
    const eventWithUser = {
      ...event,
      user,
    };
    
    return handler(eventWithUser);
  };
}; 