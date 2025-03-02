export interface User {
  id: string;
  name: string;
  email: string;
}

export interface CareRecipient {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
}

export interface Medication {
  id: string;
  name: string;
  dosage: string;
  instructions: string;
  isActive: boolean;
  careRecipientId: string;
  createdAt: string;
  updatedAt: string;
}

export interface Schedule {
  id: string;
  medicationId: string;
  recurrenceType: 'daily' | 'weekly';
  recurrencePattern: {
    daysOfWeek?: number[];
    times: string[];
  };
  startDate: string;
  endDate: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Dose {
  id: string;
  scheduleId: string;
  medicationId: string;
  scheduledTime: string;
  status: 'scheduled' | 'taken' | 'missed';
  takenAt: string | null;
  createdAt: string;
  updatedAt: string;
}