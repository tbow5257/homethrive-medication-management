import { Route, Get, Post, Put, Delete, Body, Path, Query, Response, Tags, Security } from 'tsoa';
import { getPrismaClient } from '../utils/prisma';
import { CareRecipient, Medication } from '@prisma/client';

interface CareRecipientResponse extends CareRecipient {
  medications?: Medication[];
}

interface CreateCareRecipientRequest {
  firstName: string;
  lastName: string;
  dateOfBirth: string;
}

interface UpdateCareRecipientRequest {
  firstName?: string;
  lastName?: string;
  dateOfBirth?: string;
  isActive?: boolean;
}

@Route("care-recipients")
@Tags('Care Recipients')
export class CareRecipientController {
  /**
   * Get all care recipients
   */
  @Get()
  @Security('jwt')
  public async getCareRecipients(): Promise<CareRecipient[]> {
    const prisma = getPrismaClient();
    const careRecipients = await prisma.careRecipient.findMany();
    return careRecipients;
  }

  /**
   * Get a care recipient by ID
   */
  @Get("{id}")
  @Security('jwt')
  @Response<{ message: string }>(404, "Care recipient not found")
  public async getCareRecipient(@Path() id: string): Promise<CareRecipientResponse> {
    const prisma = getPrismaClient();
    const careRecipient = await prisma.careRecipient.findUnique({
      where: { id },
      include: { medications: true }
    });
    
    if (!careRecipient) {
      throw new Error("Care recipient not found");
    }
    
    return careRecipient;
  }

  /**
   * Create a new care recipient
   */
  @Post()
  @Security('jwt')
  @Response<{ message: string }>(400, "Bad request")
  public async createCareRecipient(@Body() requestBody: CreateCareRecipientRequest): Promise<CareRecipient> {
    const prisma = getPrismaClient();
    const { firstName, lastName, dateOfBirth } = requestBody;
    
    if (!firstName || !lastName || !dateOfBirth) {
      throw new Error("First name, last name, and date of birth are required");
    }
    
    const careRecipient = await prisma.careRecipient.create({
      data: {
        firstName,
        lastName,
        dateOfBirth: new Date(dateOfBirth)
      }
    });
    
    return careRecipient;
  }

  /**
   * Update a care recipient
   */
  @Put("{id}")
  @Security('jwt')
  @Response<{ message: string }>(404, "Care recipient not found")
  @Response<{ message: string }>(400, "Bad request")
  public async updateCareRecipient(
    @Path() id: string,
    @Body() requestBody: UpdateCareRecipientRequest
  ): Promise<CareRecipient> {
    const prisma = getPrismaClient();
    const { firstName, lastName, dateOfBirth, isActive } = requestBody;
    
    // Check if care recipient exists
    const existingCareRecipient = await prisma.careRecipient.findUnique({
      where: { id }
    });
    
    if (!existingCareRecipient) {
      throw new Error("Care recipient not found");
    }
    
    // Update care recipient
    const careRecipient = await prisma.careRecipient.update({
      where: { id },
      data: {
        firstName: firstName !== undefined ? firstName : undefined,
        lastName: lastName !== undefined ? lastName : undefined,
        dateOfBirth: dateOfBirth !== undefined ? new Date(dateOfBirth) : undefined,
        isActive: isActive !== undefined ? isActive : undefined
      }
    });
    
    return careRecipient;
  }

  /**
   * Delete a care recipient (mark as inactive)
   */
  @Delete("{id}")
  @Security('jwt')
  @Response<{ message: string }>(404, "Care recipient not found")
  @Response<void>(204, "No content")
  public async deleteCareRecipient(@Path() id: string): Promise<void> {
    const prisma = getPrismaClient();
    
    // Check if care recipient exists
    const existingCareRecipient = await prisma.careRecipient.findUnique({
      where: { id }
    });
    
    if (!existingCareRecipient) {
      throw new Error("Care recipient not found");
    }
    
    // Instead of deleting, mark as inactive
    await prisma.careRecipient.update({
      where: { id },
      data: {
        isActive: false
      }
    });
  }
}