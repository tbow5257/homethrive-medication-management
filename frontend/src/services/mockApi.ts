import { User, CareRecipient, Medication, Schedule, Dose, ApiResponse, DashboardStats } from '../types';
import { format, addDays, subDays, setHours, setMinutes } from 'date-fns';

// Mock user data
const mockUsers = [
  {
    id: '1',
    name: 'Demo User',
    email: 'demo@example.com',
    password: 'password123',
  },
];

// Mock care recipients
const mockRecipients: CareRecipient[] = [
  {
    id: '1',
    name: 'John Doe',
    createdAt: '2023-01-15T10:30:00Z',
    updatedAt: '2023-01-15T10:30:00Z',
  },
  {
    id: '2',
    name: 'Jane Smith',
    createdAt: '2023-02-20T14:45:00Z',
    updatedAt: '2023-02-20T14:45:00Z',
  },
  {
    id: '3',
    name: 'Robert Johnson',
    createdAt: '2023-03-10T09:15:00Z',
    updatedAt: '2023-03-10T09:15:00Z',
  },
];

// Mock medications
const mockMedications: Medication[] = [
  {
    id: '1',
    name: 'Lisinopril',
    dosage: '10mg',
    instructions: 'Take once daily with water',
    isActive: true,
    careRecipientId: '1',
    createdAt: '2023-01-20T10:30:00Z',
    updatedAt: '2023-01-20T10:30:00Z',
  },
  {
    id: '2',
    name: 'Metformin',
    dosage: '500mg',
    instructions: 'Take twice daily with meals',
    isActive: true,
    careRecipientId: '2',
    createdAt: '2023-02-15T14:45:00Z',
    updatedAt: '2023-02-15T14:45:00Z',
  },
  {
    id: '3',
    name: 'Atorvastatin',
    dosage: '20mg',
    instructions: 'Take once daily in the evening',
    isActive: false,
    careRecipientId: '1',
    createdAt: '2023-03-05T09:15:00Z',
    updatedAt: '2023-03-05T09:15:00Z',
  },
];

// Mock schedules
const mockSchedules: Schedule[] = [
  {
    id: '1',
    medicationId: '1',
    recurrenceType: 'daily',
    recurrencePattern: {
      times: ['08:00', '20:00'],
    },
    startDate: '2023-01-01T00:00:00Z',
    endDate: null,
    createdAt: '2023-01-01T10:30:00Z',
    updatedAt: '2023-01-01T10:30:00Z',
  },
  {
    id: '2',
    medicationId: '2',
    recurrenceType: 'daily',
    recurrencePattern: {
      times: ['12:00'],
    },
    startDate: '2023-02-01T00:00:00Z',
    endDate: '2023-12-31T00:00:00Z',
    createdAt: '2023-02-01T14:45:00Z',
    updatedAt: '2023-02-01T14:45:00Z',
  },
  {
    id: '3',
    medicationId: '3',
    recurrenceType: 'weekly',
    recurrencePattern: {
      daysOfWeek: [1, 3, 5],
      times: ['19:00'],
    },
    startDate: '2023-03-01T00:00:00Z',
    endDate: null,
    createdAt: '2023-03-01T09:15:00Z',
    updatedAt: '2023-03-01T09:15:00Z',
  },
];

// Generate mock doses
const generateMockDoses = (): Dose[] => {
  const doses: Dose[] = [];
  const medications = [
    { id: '1', name: 'Lisinopril', recipientId: '1' },
    { id: '2', name: 'Metformin', recipientId: '2' },
    { id: '3', name: 'Atorvastatin', recipientId: '1' },
  ];
  
  // Past doses (some taken, some missed)
  for (let i = 1; i <= 30; i++) {
    const date = subDays(new Date(), i);
    
    for (const med of medications) {
      // Morning dose
      const morningTime = setMinutes(setHours(date, 8), 0);
      
      const status = Math.random() > 0.2 ? 'taken' : 'missed';
      const takenTime = status === 'taken' 
        ? new Date(morningTime.getTime() + Math.random() * 30 * 60 * 1000) // Within 30 minutes
        : null;
      
      doses.push({
        id: `past-${i}-${med.id}-morning`,
        scheduleId: `schedule-${med.id}`,
        medicationId: med.id,
        scheduledTime: morningTime.toISOString(),
        status: status as 'taken' | 'missed',
        takenAt: takenTime?.toISOString() || null,
        createdAt: subDays(new Date(), i + 1).toISOString(),
        updatedAt: takenTime?.toISOString() || subDays(new Date(), i + 1).toISOString(),
      });
      
      // Evening dose for some medications
      if (med.id === '1' || med.id === '2') {
        const eveningTime = setMinutes(setHours(date, 20), 0);
        
        const eveningStatus = Math.random() > 0.2 ? 'taken' : 'missed';
        const eveningTakenTime = eveningStatus === 'taken' 
          ? new Date(eveningTime.getTime() + Math.random() * 30 * 60 * 1000)
          : null;
        
        doses.push({
          id: `past-${i}-${med.id}-evening`,
          scheduleId: `schedule-${med.id}`,
          medicationId: med.id,
          scheduledTime: eveningTime.toISOString(),
          status: eveningStatus as 'taken' | 'missed',
          takenAt: eveningTakenTime?.toISOString() || null,
          createdAt: subDays(new Date(), i + 1).toISOString(),
          updatedAt: eveningTakenTime?.toISOString() || subDays(new Date(), i + 1).toISOString(),
        });
      }
    }
  }
  
  // Today and future doses
  for (let i = 0; i <= 7; i++) {
    const date = addDays(new Date(), i);
    
    for (const med of medications) {
      // Morning dose
      const morningTime = setMinutes(setHours(date, 8), 0);
      
      // For today, some doses might be taken already
      let status: 'scheduled' | 'taken' | 'missed' = 'scheduled';
      let takenTime: Date | null = null;
      
      if (i === 0 && morningTime < new Date()) {
        status = Math.random() > 0.5 ? 'taken' : 'scheduled';
        if (status === 'taken') {
          takenTime = new Date(morningTime.getTime() + Math.random() * 30 * 60 * 1000);
        }
      }
      
      doses.push({
        id: `future-${i}-${med.id}-morning`,
        scheduleId: `schedule-${med.id}`,
        medicationId: med.id,
        scheduledTime: morningTime.toISOString(),
        status,
        takenAt: takenTime?.toISOString() || null,
        createdAt: subDays(new Date(), 1).toISOString(),
        updatedAt: takenTime?.toISOString() || subDays(new Date(), 1).toISOString(),
      });
      
      // Evening dose for some medications
      if (med.id === '1' || med.id === '2') {
        const eveningTime = setMinutes(setHours(date, 20), 0);
        
        doses.push({
          id: `future-${i}-${med.id}-evening`,
          scheduleId: `schedule-${med.id}`,
          medicationId: med.id,
          scheduledTime: eveningTime.toISOString(),
          status: 'scheduled',
          takenAt: null,
          createdAt: subDays(new Date(), 1).toISOString(),
          updatedAt: subDays(new Date(), 1).toISOString(),
        });
      }
    }
  }
  
  return doses;
};

const mockDoses = generateMockDoses();

// Mock API functions
export const mockApi = {
  // Auth
  login: async (email: string, password: string) => {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const user = mockUsers.find(u => u.email === email && u.password === password);
    
    if (!user) {
      throw new Error('Invalid credentials');
    }
    
    const { password: _, ...userWithoutPassword } = user;
    
    // Create a simple JWT-like token (not a real JWT, just for mock purposes)
    const token = btoa(JSON.stringify({ user: userWithoutPassword, exp: Date.now() + 24 * 60 * 60 * 1000 }));
    
    return { token };
  },
  
  // Recipients
  getRecipients: async () => {
    await new Promise(resolve => setTimeout(resolve, 300));
    return mockRecipients;
  },
  
  getRecipient: async (id: string) => {
    await new Promise(resolve => setTimeout(resolve, 200));
    const recipient = mockRecipients.find(r => r.id === id);
    if (!recipient) throw new Error('Recipient not found');
    return recipient;
  },
  
  createRecipient: async (data: { name: string }) => {
    await new Promise(resolve => setTimeout(resolve, 400));
    const newRecipient: CareRecipient = {
      id: Date.now().toString(),
      name: data.name,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    mockRecipients.push(newRecipient);
    return newRecipient;
  },
  
  updateRecipient: async (id: string, data: { name: string }) => {
    await new Promise(resolve => setTimeout(resolve, 400));
    const index = mockRecipients.findIndex(r => r.id === id);
    if (index === -1) throw new Error('Recipient not found');
    
    mockRecipients[index] = {
      ...mockRecipients[index],
      name: data.name,
      updatedAt: new Date().toISOString(),
    };
    
    return mockRecipients[index];
  },
  
  deleteRecipient: async (id: string) => {
    await new Promise(resolve => setTimeout(resolve, 300));
    const index = mockRecipients.findIndex(r => r.id === id);
    if (index === -1) throw new Error('Recipient not found');
    
    mockRecipients.splice(index, 1);
    return { success: true };
  },
  
  // Medications
  getMedications: async (recipientId?: string) => {
    await new Promise(resolve => setTimeout(resolve, 300));
    let result = [...mockMedications];
    
    if (recipientId) {
      result = result.filter(m => m.careRecipientId === recipientId);
    }
    
    return result;
  },
  
  getMedication: async (id: string) => {
    await new Promise(resolve => setTimeout(resolve, 200));
    const medication = mockMedications.find(m => m.id === id);
    if (!medication) throw new Error('Medication not found');
    return medication;
  },
  
  createMedication: async (data: Omit<Medication, 'id' | 'createdAt' | 'updatedAt'>) => {
    await new Promise(resolve => setTimeout(resolve, 400));
    const newMedication: Medication = {
      id: Date.now().toString(),
      ...data,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    mockMedications.push(newMedication);
    return newMedication;
  },
  
  updateMedication: async (id: string, data: Partial<Omit<Medication, 'id' | 'createdAt' | 'updatedAt'>>) => {
    await new Promise(resolve => setTimeout(resolve, 400));
    const index = mockMedications.findIndex(m => m.id === id);
    if (index === -1) throw new Error('Medication not found');
    
    mockMedications[index] = {
      ...mockMedications[index],
      ...data,
      updatedAt: new Date().toISOString(),
    };
    
    return mockMedications[index];
  },
  
  deleteMedication: async (id: string) => {
    await new Promise(resolve => setTimeout(resolve, 300));
    const index = mockMedications.findIndex(m => m.id === id);
    if (index === -1) throw new Error('Medication not found');
    
    mockMedications.splice(index, 1);
    return { success: true };
  },
  
  // Schedules
  getSchedules: async (medicationId?: string) => {
    await new Promise(resolve => setTimeout(resolve, 300));
    let result = [...mockSchedules];
    
    if (medicationId) {
      result = result.filter(s => s.medicationId === medicationId);
    }
    
    return result;
  },
  
  getSchedule: async (id: string) => {
    await new Promise(resolve => setTimeout(resolve, 200));
    const schedule = mockSchedules.find(s => s.id === id);
    if (!schedule) throw new Error('Schedule not found');
    return schedule;
  },
  
  createSchedule: async (data: Omit<Schedule, 'id' | 'createdAt' | 'updatedAt'>) => {
    await new Promise(resolve => setTimeout(resolve, 400));
    const newSchedule: Schedule = {
      id: Date.now().toString(),
      ...data,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    mockSchedules.push(newSchedule);
    return newSchedule;
  },
  
  updateSchedule: async (id: string, data: Partial<Omit<Schedule, 'id' | 'createdAt' | 'updatedAt'>>) => {
    await new Promise(resolve => setTimeout(resolve, 400));
    const index = mockSchedules.findIndex(s => s.id === id);
    if (index === -1) throw new Error('Schedule not found');
    
    mockSchedules[index] = {
      ...mockSchedules[index],
      ...data,
      updatedAt: new Date().toISOString(),
    };
    
    return mockSchedules[index];
  },
  
  deleteSchedule: async (id: string) => {
    await new Promise(resolve => setTimeout(resolve, 300));
    const index = mockSchedules.findIndex(s => s.id === id);
    if (index === -1) throw new Error('Schedule not found');
    
    mockSchedules.splice(index, 1);
    return { success: true };
  },
  
  // Doses
  getDoses: async (params?: { 
    recipientId?: string; 
    status?: 'scheduled' | 'taken' | 'missed';
    startDate?: string;
    endDate?: string;
  }) => {
    await new Promise(resolve => setTimeout(resolve, 300));
    let result = [...mockDoses];
    
    if (params?.recipientId) {
      // We need to filter by medication's recipient ID
      const recipientMedications = mockMedications
        .filter(m => m.careRecipientId === params.recipientId)
        .map(m => m.id);
      
      result = result.filter(d => recipientMedications.includes(d.medicationId));
    }
    
    if (params?.status) {
      result = result.filter(d => d.status === params.status);
    }
    
    if (params?.startDate) {
      result = result.filter(d => new Date(d.scheduledTime) >= new Date(params.startDate!));
    }
    
    if (params?.endDate) {
      result = result.filter(d => new Date(d.scheduledTime) <= new Date(params.endDate!));
    }
    
    return result;
  },
  
  getDose: async (id: string) => {
    await new Promise(resolve => setTimeout(resolve, 200));
    const dose = mockDoses.find(d => d.id === id);
    if (!dose) throw new Error('Dose not found');
    return dose;
  },
  
  updateDoseStatus: async (id: string, status: 'taken' | 'missed') => {
    await new Promise(resolve => setTimeout(resolve, 300));
    const index = mockDoses.findIndex(d => d.id === id);
    if (index === -1) throw new Error('Dose not found');
    
    mockDoses[index] = {
      ...mockDoses[index],
      status,
      takenAt: status === 'taken' ? new Date().toISOString() : null,
      updatedAt: new Date().toISOString(),
    };
    
    return mockDoses[index];
  },
  
  // Dashboard data
  getDashboardStats: async (): Promise<ApiResponse<DashboardStats>> => {
    await new Promise(resolve => setTimeout(resolve, 400));
    
    return {
      success: true,
      data: {
        totalRecipients: mockRecipients.length,
        totalMedications: mockMedications.length,
        totalSchedules: mockSchedules.length,
        upcomingDoses: mockDoses.filter(d => {
          const scheduledDate = new Date(d.scheduledTime);
          const today = new Date();
          return scheduledDate.getDate() === today.getDate() &&
                 scheduledDate.getMonth() === today.getMonth() &&
                 scheduledDate.getFullYear() === today.getFullYear();
        }).length,
        takenDoses: mockDoses.filter(d => d.status === 'taken').length,
        missedDoses: mockDoses.filter(d => d.status === 'missed').length
      }
    };
  },
  
  getUpcomingDoses: async (limit = 5): Promise<ApiResponse<Dose[]>> => {
    await new Promise(resolve => setTimeout(resolve, 300));
    
    const upcomingDoses = mockDoses
      .filter(d => new Date(d.scheduledTime) > new Date() && d.status === 'scheduled')
      .sort((a, b) => new Date(a.scheduledTime).getTime() - new Date(b.scheduledTime).getTime())
      .slice(0, limit)
      .map(dose => {
        // Add medication and care recipient details
        const medication = mockMedications.find(m => m.id === dose.medicationId);
        const careRecipient = mockRecipients.find(r => medication && r.id === medication.careRecipientId);
        
        return {
          ...dose,
          medication: medication ? { id: medication.id, name: medication.name } : undefined,
          careRecipient: careRecipient ? { id: careRecipient.id, name: careRecipient.name } : undefined,
        };
      });
    
    return {
      success: true,
      data: upcomingDoses
    };
  },
};