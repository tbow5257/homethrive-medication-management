import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Initialize Prisma client
const prisma = new PrismaClient();

async function main() {
  console.log('Starting seed...');

  // Create a care recipient
  const careRecipient = await prisma.careRecipient.upsert({
    where: { id: '00000000-0000-0000-0000-000000000001' },
    update: {},
    create: {
      id: '00000000-0000-0000-0000-000000000001',
      firstName: 'John',
      lastName: 'Doe',
      dateOfBirth: new Date('1950-01-01'),
      isActive: true,
    },
  });

  console.log(`Created care recipient: ${careRecipient.firstName} ${careRecipient.lastName}`);

  // Create medications
  const medication1 = await prisma.medication.upsert({
    where: { id: '00000000-0000-0000-0000-000000000002' },
    update: {},
    create: {
      id: '00000000-0000-0000-0000-000000000002',
      name: 'Aspirin',
      dosage: '100mg',
      instructions: 'Take with food',
      careRecipientId: careRecipient.id,
      schedules: {
        create: [
          {
            time: '08:00',
            daysOfWeek: ['Monday', 'Wednesday', 'Friday'],
          },
          {
            time: '20:00',
            daysOfWeek: ['Monday', 'Wednesday', 'Friday'],
          },
        ],
      },
    },
  });

  const medication2 = await prisma.medication.upsert({
    where: { id: '00000000-0000-0000-0000-000000000003' },
    update: {},
    create: {
      id: '00000000-0000-0000-0000-000000000003',
      name: 'Lisinopril',
      dosage: '10mg',
      instructions: 'Take once daily',
      careRecipientId: careRecipient.id,
      schedules: {
        create: [
          {
            time: '09:00',
            daysOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
          },
        ],
      },
    },
  });

  console.log(`Created medications: ${medication1.name}, ${medication2.name}`);

  // Create doses for today and tomorrow
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  // Format dates to remove time
  today.setHours(0, 0, 0, 0);
  tomorrow.setHours(0, 0, 0, 0);

  // Create doses for medication 1
  await prisma.dose.createMany({
    data: [
      {
        medicationId: medication1.id,
        scheduledFor: new Date(today.setHours(8, 0, 0, 0)),
        status: 'taken',
        takenAt: new Date(today.setHours(8, 15, 0, 0)),
      },
      {
        medicationId: medication1.id,
        scheduledFor: new Date(today.setHours(20, 0, 0, 0)),
        status: 'scheduled',
      },
      {
        medicationId: medication1.id,
        scheduledFor: new Date(tomorrow.setHours(8, 0, 0, 0)),
        status: 'scheduled',
      },
      {
        medicationId: medication1.id,
        scheduledFor: new Date(tomorrow.setHours(20, 0, 0, 0)),
        status: 'scheduled',
      },
    ],
  });

  // Create doses for medication 2
  await prisma.dose.createMany({
    data: [
      {
        medicationId: medication2.id,
        scheduledFor: new Date(today.setHours(9, 0, 0, 0)),
        status: 'taken',
        takenAt: new Date(today.setHours(9, 5, 0, 0)),
      },
      {
        medicationId: medication2.id,
        scheduledFor: new Date(tomorrow.setHours(9, 0, 0, 0)),
        status: 'scheduled',
      },
    ],
  });

  console.log('Created doses for medications');

  console.log('Seed completed successfully');
}

main()
  .catch((e) => {
    console.error('Error during seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  }); 