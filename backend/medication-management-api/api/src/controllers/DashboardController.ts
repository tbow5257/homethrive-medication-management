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
      }
    });
    console.log("schedules", JSON.stringify(schedules, null, 2));
    // Get today's taken doses to count how many doses have been taken for each medication
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
    
    // Count doses taken per medication today
    const dosesTakenByMedication = takenDosesToday.reduce((acc, dose) => {
      acc[dose.medicationId] = (acc[dose.medicationId] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    // Transform schedules into upcoming medications
    const upcomingMedications: UpcomingMedication[] = [];
    
    // Flatten schedules with multiple times into individual entries
    for (const schedule of schedules) {
      // Use days of week directly as strings
      const daysOfWeek = schedule.daysOfWeek as string[];
      
      // Skip if today is not in the schedule's days of week
      const todayName = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][now.getDay()];
      if (!daysOfWeek.includes(todayName)) {
        continue;
      }
      
      // Construct recipient name from firstName and lastName
      const recipientName = schedule.medication?.careRecipient ? 
        `${schedule.medication.careRecipient.firstName} ${schedule.medication.careRecipient.lastName}`.trim() : 
        '';
      
      // Get total doses taken for this medication today
      const dosesTaken = dosesTakenByMedication[schedule.medicationId] || 0;
      
      // Create an entry for each time in the schedule
      for (let i = 0; i < schedule.times.length; i++) {
        const time = schedule.times[i];
        
        // Mark as taken if this dose's position is less than the number of doses taken
        // This assumes doses are taken in order of scheduled times
        const takenToday = i < dosesTaken;
        
        upcomingMedications.push({
          medicationId: schedule.medicationId,
          medicationName: schedule.medication?.name || '',
          dosage: schedule.medication?.dosage || '',
          recipientId: schedule.medication?.careRecipientId || '',
          recipientName,
          scheduleId: schedule.id,
          scheduledTime: time,
          daysOfWeek,
          takenToday
        });
      }
    }

    // Sort by time
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