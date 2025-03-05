import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';
import { hashPassword } from '../utils/auth';

// Load environment variables
dotenv.config();

// Initialize Prisma client
const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // Create admin user
  const adminEmail = 'admin@example.com';
  const existingAdmin = await prisma.user.findUnique({
    where: { email: adminEmail }
  });

  if (!existingAdmin) {
    const hashedPassword = await hashPassword('Admin123!');
    await prisma.user.create({
      data: {
        email: adminEmail,
        password: hashedPassword,
        firstName: 'Admin',
        lastName: 'User',
        role: 'admin'
      }
    });
    console.log('Admin user created');
  } else {
    console.log('Admin user already exists');
  }

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

  // Create second care recipient - Tina Turner
  const careRecipient2 = await prisma.careRecipient.upsert({
    where: { id: '00000000-0000-0000-0000-000000000004' },
    update: {},
    create: {
      id: '00000000-0000-0000-0000-000000000004',
      firstName: 'Tina',
      lastName: 'Turner',
      dateOfBirth: new Date('1939-11-26'),
      isActive: true,
    },
  });

  console.log(`Created care recipient: ${careRecipient2.firstName} ${careRecipient2.lastName}`);

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
            times: ['08:00'],
            daysOfWeek: ['Monday', 'Wednesday', 'Friday'],
          },
          {
            times: ['20:00'],
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
            times: ['09:00'],
            daysOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
          },
        ],
      },
    },
  });

  // Create medications for Tina Turner
  const medication3 = await prisma.medication.upsert({
    where: { id: '00000000-0000-0000-0000-000000000005' },
    update: {},
    create: {
      id: '00000000-0000-0000-0000-000000000005',
      name: 'Metformin',
      dosage: '500mg',
      instructions: 'Take with meals',
      careRecipientId: careRecipient2.id,
      schedules: {
        create: [
          {
            times: ['08:00', '13:00', '19:00'],
            daysOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
          },
        ],
      },
    },
  });

  const medication4 = await prisma.medication.upsert({
    where: { id: '00000000-0000-0000-0000-000000000006' },
    update: {},
    create: {
      id: '00000000-0000-0000-0000-000000000006',
      name: 'Atorvastatin',
      dosage: '20mg',
      instructions: 'Take at bedtime',
      careRecipientId: careRecipient2.id,
      schedules: {
        create: [
          {
            times: ['22:00'],
            daysOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
          },
        ],
      },
    },
  });

  const medication5 = await prisma.medication.upsert({
    where: { id: '00000000-0000-0000-0000-000000000007' },
    update: {},
    create: {
      id: '00000000-0000-0000-0000-000000000007',
      name: 'Vitamin D',
      dosage: '1000 IU',
      instructions: 'Take with breakfast',
      careRecipientId: careRecipient2.id,
      schedules: {
        create: [
          {
            times: ['08:00'],
            daysOfWeek: ['Monday', 'Wednesday', 'Friday', 'Sunday'],
          },
        ],
      },
    },
  });

  console.log(`Created medications: ${medication1.name}, ${medication2.name}, ${medication3.name}, ${medication4.name}, ${medication5.name}`);

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

  // Create doses for medication 3, 4, and 5 (Tina's medications)
  await prisma.dose.createMany({
    data: [
      // Metformin doses for today
      {
        medicationId: medication3.id,
        scheduledFor: new Date(today.setHours(8, 0, 0, 0)),
        status: 'taken',
        takenAt: new Date(today.setHours(8, 10, 0, 0)),
      },
      {
        medicationId: medication3.id,
        scheduledFor: new Date(today.setHours(13, 0, 0, 0)),
        status: 'taken',
        takenAt: new Date(today.setHours(13, 5, 0, 0)),
      },
      {
        medicationId: medication3.id,
        scheduledFor: new Date(today.setHours(19, 0, 0, 0)),
        status: 'scheduled',
      },
      // Metformin doses for tomorrow
      {
        medicationId: medication3.id,
        scheduledFor: new Date(tomorrow.setHours(8, 0, 0, 0)),
        status: 'scheduled',
      },
      {
        medicationId: medication3.id,
        scheduledFor: new Date(tomorrow.setHours(13, 0, 0, 0)),
        status: 'scheduled',
      },
      {
        medicationId: medication3.id,
        scheduledFor: new Date(tomorrow.setHours(19, 0, 0, 0)),
        status: 'scheduled',
      },
      // Atorvastatin doses
      {
        medicationId: medication4.id,
        scheduledFor: new Date(today.setHours(22, 0, 0, 0)),
        status: 'scheduled',
      },
      {
        medicationId: medication4.id,
        scheduledFor: new Date(tomorrow.setHours(22, 0, 0, 0)),
        status: 'scheduled',
      },
      // Vitamin D doses
      {
        medicationId: medication5.id,
        scheduledFor: new Date(today.setHours(8, 0, 0, 0)),
        status: 'taken',
        takenAt: new Date(today.setHours(8, 15, 0, 0)),
      },
      {
        medicationId: medication5.id,
        scheduledFor: new Date(tomorrow.setHours(8, 0, 0, 0)),
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