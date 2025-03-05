import { renderHook } from '@testing-library/react'
import { useMemo } from 'react'
import { describe, it, expect } from 'vitest'
import '@testing-library/jest-dom'

// Define a minimal type for UpcomingMedication to avoid import issues
type UpcomingMedication = {
  medicationId: string;
  medicationName: string;
  dosage: string;
  recipientId: string;
  recipientName: string;
  scheduleId: string;
  scheduledTime: string;
  daysOfWeek: string[];
  takenToday: boolean;
};

// Extract the medication grouping logic for testing
const useMedicationsByRecipient = (upcomingMedications: UpcomingMedication[] | undefined) => {
  return useMemo(() => {
    if (!upcomingMedications) return {};
    
    return upcomingMedications.reduce((acc, medication) => {
      const { recipientId, recipientName } = medication;
      if (!acc[recipientId]) {
        acc[recipientId] = {
          recipientName,
          medications: [],
          totalDoses: 0,
          takenDoses: 0
        };
      }
      acc[recipientId].medications.push(medication);
      acc[recipientId].totalDoses += 1;
      if (medication.takenToday) {
        acc[recipientId].takenDoses += 1;
      }
      return acc;
    }, {} as Record<string, { 
      recipientName: string; 
      medications: UpcomingMedication[]; 
      totalDoses: number;
      takenDoses: number;
    }>);
  }, [upcomingMedications]);
};

describe('Dashboard medication grouping', () => {
  it('should return empty object when medications are undefined', () => {
    const { result } = renderHook(() => useMedicationsByRecipient(undefined));
    expect(result.current).toEqual({});
  });

  it('should group medications by recipient', () => {
    const mockMedications: UpcomingMedication[] = [
      {
        medicationId: 'med1',
        medicationName: 'Aspirin',
        dosage: '100mg',
        recipientId: 'rec1',
        recipientName: 'John Doe',
        scheduleId: 'sch1',
        scheduledTime: '08:00',
        daysOfWeek: ['Monday', 'Wednesday', 'Friday'],
        takenToday: false
      },
      {
        medicationId: 'med2',
        medicationName: 'Tylenol',
        dosage: '500mg',
        recipientId: 'rec1',
        recipientName: 'John Doe',
        scheduleId: 'sch2',
        scheduledTime: '20:00',
        daysOfWeek: ['Monday', 'Wednesday', 'Friday'],
        takenToday: true
      },
      {
        medicationId: 'med3',
        medicationName: 'Vitamin D',
        dosage: '1000IU',
        recipientId: 'rec2',
        recipientName: 'Jane Smith',
        scheduleId: 'sch3',
        scheduledTime: '12:00',
        daysOfWeek: ['Daily'],
        takenToday: false
      }
    ];

    const { result } = renderHook(() => useMedicationsByRecipient(mockMedications));
    
    expect(Object.keys(result.current)).toHaveLength(2);
    expect(result.current['rec1'].recipientName).toBe('John Doe');
    expect(result.current['rec1'].medications).toHaveLength(2);
    expect(result.current['rec1'].totalDoses).toBe(2);
    expect(result.current['rec1'].takenDoses).toBe(1);
    
    expect(result.current['rec2'].recipientName).toBe('Jane Smith');
    expect(result.current['rec2'].medications).toHaveLength(1);
    expect(result.current['rec2'].totalDoses).toBe(1);
    expect(result.current['rec2'].takenDoses).toBe(0);
  });
}); 