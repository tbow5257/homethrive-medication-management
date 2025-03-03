import { Route, Post, Get, Body, Response, Tags, Security, Path } from 'tsoa';
import { getPrismaClient } from '../utils/prisma';
import { User } from '@prisma/client';
import { hashPassword, comparePassword, generateToken } from '../utils/auth';

interface RegisterRequest {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role?: 'admin' | 'caregiver';
}

interface LoginRequest {
  email: string;
  password: string;
}

interface AuthResponse {
  user: Omit<User, 'password'>;
  token: string;
}

interface UserProfile {
  user: Omit<User, 'password'>;
}

@Route("auth")
@Tags('Authentication')
export class AuthController {
  /**
   * Register a new user
   */
  @Post("register")
  @Response<{ message: string }>(400, "Bad request")
  public async register(@Body() requestBody: RegisterRequest): Promise<AuthResponse> {
    const prisma = getPrismaClient();
    const { email, password, firstName, lastName, role } = requestBody;
    
    // Validate required fields
    if (!email || !password || !firstName || !lastName) {
      throw new Error('Email, password, first name, and last name are required');
    }
    
    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });
    
    if (existingUser) {
      throw new Error('User with this email already exists');
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
    
    return {
      user: userData,
      token
    };
  }

  /**
   * Login a user
   */
  @Post("login")
  @Response<{ message: string }>(400, "Bad request")
  @Response<{ message: string }>(401, "Unauthorized")
  public async login(@Body() requestBody: LoginRequest): Promise<AuthResponse> {
    const prisma = getPrismaClient();
    const { email, password } = requestBody;
    
    // Validate required fields
    if (!email || !password) {
      throw new Error('Email and password are required');
    }
    
    // Find user
    const user = await prisma.user.findUnique({
      where: { email }
    });
    
    // Check if user exists
    if (!user) {
      throw new Error('Invalid credentials');
    }
    
    // Check if user is active
    if (!user.isActive) {
      throw new Error('Account is inactive');
    }
    
    // Verify password
    const isPasswordValid = await comparePassword(password, user.password);
    
    if (!isPasswordValid) {
      throw new Error('Invalid credentials');
    }
    
    // Generate token
    const token = generateToken(user);
    
    // Return user data without password
    const { password: _, ...userData } = user;
    
    return {
      user: userData,
      token
    };
  }

  /**
   * Get current user profile
   */
  @Get("profile/{userId}")
  @Security('jwt')
  @Response<{ message: string }>(401, "Unauthorized")
  public async getProfile(@Path('userId') userId: string): Promise<UserProfile> {
    const prisma = getPrismaClient();
    
    // Get fresh user data
    const userData = await prisma.user.findUnique({
      where: { id: userId }
    });
    
    if (!userData) {
      throw new Error('User not found');
    }
    
    // Return user data without password
    const { password: _, ...userProfile } = userData;
    
    return { user: userProfile };
  }
}