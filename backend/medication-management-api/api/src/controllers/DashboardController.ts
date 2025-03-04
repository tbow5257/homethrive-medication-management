import { Route, Get, Query, Security, Tags } from 'tsoa';
import { getPrismaClient } from '../utils/prisma';
import { Dose, Medication, CareRecipient, Schedule } from '@prisma/client';

interface UpcomingMedication {
  medicationId: string;
  medicationName: string;
  dosage: string;
  recipientId: string;
  recipientName: string;
  scheduleId: string;
  scheduledTime: string; // HH:mm format
  daysOfWeek: string[]; // Day names as strings
  takenToday: boolean; // Flag to indicate if the medication has been taken today
}

interface DashboardStats {
  totalRecipients: number;
  totalMedications: number;
  totalSchedules: number;
  todayDoses: number;
  takenDoses: number;
  missedDoses: number;
  complianceRate: number;
}

@Route("dashboard")
@Tags('Dashboard')
export class DashboardController {
  /**
   * Get upcoming medications for next 7 days based on schedules
   */
  @Get("upcoming")
  @Security('jwt')
  public async getUpcomingDoses(@Query() limit: number = 5): Promise<UpcomingMedication[]> {
    const prisma = getPrismaClient();
    
    const now = new Date();
    const sevenDaysFromNow = new Date(now);
    sevenDaysFromNow.setDate(now.getDate() + 7);
    
    // Get active schedules with their medications and recipients
    const schedules = await prisma.schedule.findMany({
      where: {
        isActive: true,
        medication: {
          isActive: true,
          careRecipient: {
            isActive: true
          }
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
        time: 'asc'
      }
    });

    // Get today's taken doses to check if medications have been taken today
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    const takenDosesToday = await prisma.dose.findMany({
      where: {
        status: 'taken',
        takenAt: {
          gte: today,
          lt: tomorrow
        }
      },
      select: {
        medicationId: true
      }
    });
    
    // Create a Set of medication IDs that have been taken today for quick lookup
    const takenMedicationIds = new Set(takenDosesToday.map(dose => dose.medicationId));

    // Transform schedules into upcoming medications
    const upcomingMedications: UpcomingMedication[] = schedules.flatMap(schedule => {
      // Use days of week directly as strings
      const daysOfWeek = schedule.daysOfWeek as string[];
      
      // Construct recipient name from firstName and lastName
      const recipientName = schedule.medication?.careRecipient ? 
        `${schedule.medication.careRecipient.firstName} ${schedule.medication.careRecipient.lastName}`.trim() : 
        '';
      
      // Check if this medication has been taken today
      const takenToday = takenMedicationIds.has(schedule.medicationId);
      
      return {
        medicationId: schedule.medicationId,
        medicationName: schedule.medication?.name || '',
        dosage: schedule.medication?.dosage || '',
        recipientId: schedule.medication?.careRecipientId || '',
        recipientName,
        scheduleId: schedule.id,
        scheduledTime: schedule.time,
        daysOfWeek,
        takenToday
      };
    });

    // Sort by next occurrence and limit results
    const sortedMedications = upcomingMedications.sort((a, b) => {
      const aTime = new Date(`1970-01-01T${a.scheduledTime}`);
      const bTime = new Date(`1970-01-01T${b.scheduledTime}`);
      return aTime.getTime() - bTime.getTime();
    });

    return sortedMedications.slice(0, limit);
  }

  /**
   * Get dashboard statistics
   */
  @Get("stats")
  @Security('jwt')
  public async getDashboardStats(): Promise<DashboardStats> {
    const prisma = getPrismaClient();
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
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
    
    const complianceRate = todayDoses > 0 ? (takenDoses / todayDoses) * 100 : 0;
    
    return {
      totalRecipients,
      totalMedications,
      totalSchedules,
      todayDoses,
      takenDoses,
      missedDoses,
      complianceRate: Math.round(complianceRate)
    };
  }
} 