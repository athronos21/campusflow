import { PrismaClient, CampusRole, BusinessStatus, OrderStatus, PaymentStatus } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding CampusFlow database for Haramaya University pilot...');

  // 1. Create Pilot Campus
  const haramaya = await prisma.campus.upsert({
    where: { slug: 'haramaya-main' },
    update: {},
    create: {
      name: 'Haramaya University - Main Campus',
      slug: 'haramaya-main',
      city: 'Haramaya',
      isActive: true,
    },
  });
  console.log(`Campus established: ${haramaya.name} (${haramaya.id})`);

  // 2. Create Users
  // In production use Argon2id/bcrypt. Here we store placeholder hashes for dev.
  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@campusflow.et' },
    update: {},
    create: {
      email: 'admin@campusflow.et',
      displayName: 'System Admin',
      status: 'active',
      passwordHash: '$2b$10$devPlaceholderPasswordHashForDevelopmentOnly12345',
      memberships: {
        create: {
          campusId: haramaya.id,
          role: CampusRole.campus_admin,
        },
      },
    },
  });

  const merchantUser = await prisma.user.upsert({
    where: { email: 'merchant@haramayacafe.et' },
    update: {},
    create: {
      email: 'merchant@haramayacafe.et',
      phone: '+251911223344',
      displayName: 'Abebe Merchant',
      status: 'active',
      passwordHash: '$2b$10$devPlaceholderPasswordHashForDevelopmentOnly12345',
      memberships: {
        create: {
          campusId: haramaya.id,
          role: CampusRole.merchant,
        },
      },
    },
  });

  const studentUser = await prisma.user.upsert({
    where: { email: 'student@haramaya.edu.et' },
    update: {},
    create: {
      email: 'student@haramaya.edu.et',
      phone: '+251922334455',
      displayName: 'Tigist Haile',
      status: 'active',
      passwordHash: '$2b$10$devPlaceholderPasswordHashForDevelopmentOnly12345',
      memberships: {
        create: {
          campusId: haramaya.id,
          role: CampusRole.student,
        },
      },
    },
  });
  console.log('Test users created (admin, merchant, student)');

  // 3. Create Categories
  const foodCategory = await prisma.category.upsert({
    where: {
      campusId_slug: {
        campusId: haramaya.id,
        slug: 'food-drinks',
      },
    },
    update: {},
    create: {
      campusId: haramaya.id,
      name: 'Food & Drinks',
      slug: 'food-drinks',
    },
  });

  const printingCategory = await prisma.category.upsert({
    where: {
      campusId_slug: {
        campusId: haramaya.id,
        slug: 'printing-supplies',
      },
    },
    update: {},
    create: {
      campusId: haramaya.id,
      name: 'Printing & Stationery',
      slug: 'printing-supplies',
    },
  });

  // 4. Create Pilot Business
  let business = await prisma.business.findFirst({
    where: { name: 'Haramaya Campus Cafe & Snack', campusId: haramaya.id },
  });

  if (!business) {
    business = await prisma.business.create({
      data: {
        campusId: haramaya.id,
        ownerId: merchantUser.id,
        name: 'Haramaya Campus Cafe & Snack',
        description: 'Fresh coffee, snacks, breakfast, and fast food near Student Lounge.',
        status: BusinessStatus.verified,
        products: {
          create: [
            {
              name: 'Special Buna (Coffee)',
              description: 'Freshly brewed traditional Ethiopian coffee.',
              priceMinor: BigInt(2500), // 25.00 ETB
              currency: 'ETB',
              isAvailable: true,
              categoryId: foodCategory.id,
            },
            {
              name: 'Ful with Egg and Bread',
              description: 'Hearty fava bean stew served with fresh bread.',
              priceMinor: BigInt(8000), // 80.00 ETB
              currency: 'ETB',
              isAvailable: true,
              categoryId: foodCategory.id,
            },
          ],
        },
      },
    });
    console.log(`Pilot business seeded: ${business.name}`);
  }

  // 5. Create Welcome Announcement
  await prisma.announcement.create({
    data: {
      campusId: haramaya.id,
      authorId: adminUser.id,
      title: 'Welcome to CampusFlow Pilot at Haramaya University!',
      body: 'CampusFlow is live for testing. Browse campus food, discover verified campus merchants, book intercity transport, and place pickup orders directly.',
      publishedAt: new Date(),
    },
  });

  // 6. Create Transport Operators & Routes (Service 02)
  console.log('Seeding Transport routes and trips...');
  const studentShuttle = await prisma.transportOperator.create({
    data: {
      name: 'Haramaya Student Union Express',
      phone: '+251915001122',
      email: 'transport@haramaya.edu.et',
      isActive: true,
    },
  });

  const selamBus = await prisma.transportOperator.create({
    data: {
      name: 'Selam Bus Line',
      phone: '+251115512244',
      email: 'info@selambus.et',
      isActive: true,
    },
  });

  const routeDireDawa = await prisma.transportRoute.create({
    data: {
      campusId: haramaya.id,
      origin: 'Haramaya Main Campus',
      destination: 'Dire Dawa',
      departureStation: 'Main Campus Terminal Gate 1',
      arrivalStation: 'Gada Square Station, Dire Dawa',
      distanceKm: 45,
      estimatedDurationMin: 50,
      isActive: true,
    },
  });

  const routeHarar = await prisma.transportRoute.create({
    data: {
      campusId: haramaya.id,
      origin: 'Haramaya Main Campus',
      destination: 'Harar',
      departureStation: 'Main Campus Terminal Gate 1',
      arrivalStation: 'Ras Makonnen Square, Harar',
      distanceKm: 20,
      estimatedDurationMin: 30,
      isActive: true,
    },
  });

  const routeAddis = await prisma.transportRoute.create({
    data: {
      campusId: haramaya.id,
      origin: 'Haramaya Main Campus',
      destination: 'Addis Ababa',
      departureStation: 'Haramaya Administration Gate',
      arrivalStation: 'Meskel Square Terminal, Addis Ababa',
      distanceKm: 510,
      estimatedDurationMin: 540,
      isActive: true,
    },
  });

  const now = new Date();
  const tripTime1 = new Date(now.getTime() + 2 * 60 * 60 * 1000); // in 2 hours
  const tripTime2 = new Date(now.getTime() + 4 * 60 * 60 * 1000); // in 4 hours
  const tomorrowMorning = new Date(now);
  tomorrowMorning.setDate(tomorrowMorning.getDate() + 1);
  tomorrowMorning.setHours(6, 0, 0, 0);

  await prisma.trip.createMany({
    data: [
      {
        operatorId: studentShuttle.id,
        routeId: routeDireDawa.id,
        vehicleNumber: 'HU-BUS-04',
        vehicleType: 'Student Campus Coaster (30 Seats)',
        departureTime: tripTime1,
        arrivalTime: new Date(tripTime1.getTime() + 50 * 60 * 1000),
        totalSeats: 30,
        availableSeats: 26,
        priceMinor: BigInt(8000), // 80.00 ETB
        currency: 'ETB',
        status: 'scheduled',
      },
      {
        operatorId: studentShuttle.id,
        routeId: routeHarar.id,
        vehicleNumber: 'HU-MINI-08',
        vehicleType: 'Campus HiAce Van (16 Seats)',
        departureTime: tripTime2,
        arrivalTime: new Date(tripTime2.getTime() + 30 * 60 * 1000),
        totalSeats: 16,
        availableSeats: 12,
        priceMinor: BigInt(5000), // 50.00 ETB
        currency: 'ETB',
        status: 'scheduled',
      },
      {
        operatorId: selamBus.id,
        routeId: routeAddis.id,
        vehicleNumber: 'ET-SELAM-912',
        vehicleType: 'Luxury AC Coach (54 Seats)',
        departureTime: tomorrowMorning,
        arrivalTime: new Date(tomorrowMorning.getTime() + 9 * 60 * 60 * 1000),
        totalSeats: 54,
        availableSeats: 38,
        priceMinor: BigInt(95000), // 950.00 ETB
        currency: 'ETB',
        status: 'scheduled',
      },
    ],
  });

  console.log('Database seed completed successfully! 🚀');
}

main()
  .catch((e) => {
    console.error('Seed error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
