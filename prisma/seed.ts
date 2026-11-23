import { PrismaClient, CampusRole, BusinessStatus } from '@prisma/client';

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
  // Valid bcrypt hash for demo password 'password123'
  const defaultPasswordHash = '$2b$10$PkLoAcKyfZkPM1XVwq7lX.LPxXvyTTJuWNdEOsk4RriXbqSBhdWEG';

  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@campusflow.et' },
    update: { passwordHash: defaultPasswordHash },
    create: {
      email: 'admin@campusflow.et',
      displayName: 'System Admin',
      status: 'active',
      passwordHash: defaultPasswordHash,
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
    update: { passwordHash: defaultPasswordHash },
    create: {
      email: 'merchant@haramayacafe.et',
      phone: '+251911223344',
      displayName: 'Abebe Merchant',
      status: 'active',
      passwordHash: defaultPasswordHash,
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
    update: { passwordHash: defaultPasswordHash },
    create: {
      email: 'student@haramaya.edu.et',
      phone: '+251922334455',
      displayName: 'Tigist Haile',
      status: 'active',
      passwordHash: defaultPasswordHash,
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

  let stationeryBiz = await prisma.business.findFirst({
    where: { name: 'Afras Campus Stationery & Thesis Binding', campusId: haramaya.id },
  });

  if (!stationeryBiz) {
    stationeryBiz = await prisma.business.create({
      data: {
        campusId: haramaya.id,
        ownerId: merchantUser.id,
        name: 'Afras Campus Stationery & Thesis Binding',
        description: 'Official academic printing, color photocopying, spiral and hardcover thesis binding.',
        status: BusinessStatus.verified,
        products: {
          create: [
            {
              name: 'A4 Double-Sided Thesis Printing & Spiral Binding',
              description: 'Laser high-speed printing with protective transparent cover.',
              priceMinor: BigInt(6000), // 60.00 ETB
              currency: 'ETB',
              isAvailable: true,
              categoryId: printingCategory.id,
            },
            {
              name: 'Casio Scientific Calculator FX-991ES',
              description: 'Essential calculator for engineering and science faculties.',
              priceMinor: BigInt(45000), // 450.00 ETB
              currency: 'ETB',
              isAvailable: true,
              categoryId: printingCategory.id,
            },
            {
              name: 'Examination Pen & Highlighter 5-Pack',
              description: 'Smooth writing ballpoint pens approved for university exams.',
              priceMinor: BigInt(5000), // 50.00 ETB
              currency: 'ETB',
              isAvailable: true,
              categoryId: printingCategory.id,
            },
          ],
        },
      },
    });
    console.log(`Stationery business seeded: ${stationeryBiz.name}`);
  }

  let techBiz = await prisma.business.findFirst({
    where: { name: 'Haramaya Campus Tech & Electronics', campusId: haramaya.id },
  });

  if (!techBiz) {
    techBiz = await prisma.business.create({
      data: {
        campusId: haramaya.id,
        ownerId: merchantUser.id,
        name: 'Haramaya Campus Tech & Electronics',
        description: 'Student laptop diagnostics, software reinstallation, phone repairs, and charger sales.',
        status: BusinessStatus.verified,
        products: {
          create: [
            {
              name: 'Laptop OS & Software Diagnostics',
              description: 'Virus removal, Windows/Linux dual boot, and driver restoration.',
              priceMinor: BigInt(15000), // 150.00 ETB
              currency: 'ETB',
              isAvailable: true,
              categoryId: printingCategory.id,
            },
            {
              name: 'Fast Charging USB-C Data Cable (65W)',
              description: 'Braided durable cable for laptops and smartphones.',
              priceMinor: BigInt(18000), // 180.00 ETB
              currency: 'ETB',
              isAvailable: true,
              categoryId: printingCategory.id,
            },
          ],
        },
      },
    });
    console.log(`Tech repair business seeded: ${techBiz.name}`);
  }

  // 5. Create Welcome Announcement
  const existingAnnouncement = await prisma.announcement.findFirst({
    where: { campusId: haramaya.id, title: 'Welcome to CampusFlow Pilot at Haramaya University!' },
  });
  if (!existingAnnouncement) {
    await prisma.announcement.create({
      data: {
        campusId: haramaya.id,
        authorId: adminUser.id,
        title: 'Welcome to CampusFlow Pilot at Haramaya University!',
        body: 'CampusFlow is live for testing. Browse campus food, discover verified campus merchants, book intercity transport, and place pickup orders directly.',
        publishedAt: new Date(),
      },
    });
  }

  // 6. Create Transport Operators & Routes (Service 02)
  console.log('Seeding Transport routes and trips...');
  let studentShuttle = await prisma.transportOperator.findFirst({
    where: { name: 'Haramaya Student Union Express' },
  });
  if (!studentShuttle) {
    studentShuttle = await prisma.transportOperator.create({
      data: {
        name: 'Haramaya Student Union Express',
        phone: '+251915001122',
        email: 'transport@haramaya.edu.et',
        isActive: true,
      },
    });
  }

  let selamBus = await prisma.transportOperator.findFirst({
    where: { name: 'Selam Bus Line' },
  });
  if (!selamBus) {
    selamBus = await prisma.transportOperator.create({
      data: {
        name: 'Selam Bus Line',
        phone: '+251115512244',
        email: 'info@selambus.et',
        isActive: true,
      },
    });
  }

  let routeDireDawa = await prisma.transportRoute.findFirst({
    where: { campusId: haramaya.id, origin: 'Haramaya Main Campus', destination: 'Dire Dawa' },
  });
  if (!routeDireDawa) {
    routeDireDawa = await prisma.transportRoute.create({
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
  }

  let routeHarar = await prisma.transportRoute.findFirst({
    where: { campusId: haramaya.id, origin: 'Haramaya Main Campus', destination: 'Harar' },
  });
  if (!routeHarar) {
    routeHarar = await prisma.transportRoute.create({
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
  }

  let routeAddis = await prisma.transportRoute.findFirst({
    where: { campusId: haramaya.id, origin: 'Haramaya Main Campus', destination: 'Addis Ababa' },
  });
  if (!routeAddis) {
    routeAddis = await prisma.transportRoute.create({
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
  }

  const existingTripsCount = await prisma.trip.count({
    where: { routeId: { in: [routeDireDawa.id, routeHarar.id, routeAddis.id] } },
  });

  if (existingTripsCount === 0) {
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
  }

  // 7. Create Housing Listings (Service 05)
  console.log('Seeding Housing & Accommodation listings...');
  const existingHousingCount = await prisma.housingListing.count({
    where: { campusId: haramaya.id },
  });

  if (existingHousingCount === 0) {
    await prisma.housingListing.createMany({
      data: [
        {
          campusId: haramaya.id,
          landlordId: merchantUser.id,
          title: 'Furnished Student Room near Gate 2, Bate',
          description: 'Clean, quiet student room with study table, secure compound wall, and reliable water reservoir.',
          location: 'Bate Town, 5 min walk to Main Gate 2',
          propertyType: 'room',
          rentMinor: BigInt(250000), // 2,500.00 ETB / month
          currency: 'ETB',
          hasWater: true,
          hasElectricity: true,
          hasWifi: true,
          contactPhone: '+251911223344',
          isAvailable: true,
        },
        {
          campusId: haramaya.id,
          landlordId: merchantUser.id,
          title: '2-Bed Shared Student Apartment, Bate Center',
          description: 'Spacious apartment ideal for 2 university students. Independent electric meter and kitchen sink.',
          location: 'Bate Market Square',
          propertyType: 'apartment',
          rentMinor: BigInt(360000), // 3,600.00 ETB / month
          currency: 'ETB',
          hasWater: true,
          hasElectricity: true,
          hasWifi: false,
          contactPhone: '+251911223344',
          isAvailable: true,
        },
      ],
    });
  }

  // 8. Create Campus Events (Service 06)
  console.log('Seeding Campus Events & Hackathons...');
  const existingEventsCount = await prisma.campusEvent.count({
    where: { campusId: haramaya.id },
  });

  if (existingEventsCount === 0) {
    const now = new Date();
    const nextFriday = new Date(now);
    nextFriday.setDate(nextFriday.getDate() + 5);
    nextFriday.setHours(14, 0, 0, 0);

    await prisma.campusEvent.createMany({
      data: [
        {
          campusId: haramaya.id,
          organizerId: adminUser.id,
          title: 'Haramaya University Annual Hackathon 2026',
          description: 'Build real-world software and hardware prototypes solving agricultural, healthcare, and educational challenges in Ethiopia. Prizes funded by tech alumni!',
          venue: 'Afras Hall, Main Campus',
          startsAt: nextFriday,
          endsAt: new Date(nextFriday.getTime() + 6 * 60 * 60 * 1000),
          category: 'Technology & Innovation',
          entryFeeMinor: BigInt(0), // Free
          currency: 'ETB',
          maxAttendees: 200,
        },
        {
          campusId: haramaya.id,
          organizerId: adminUser.id,
          title: 'Agricultural Biotechnology & Crop Science Symposium',
          description: 'Keynote lectures from senior Ethiopian research fellows on drought-tolerant crops and post-harvest preservation.',
          venue: 'Auditorium 1, College of Agriculture',
          startsAt: new Date(nextFriday.getTime() + 24 * 60 * 60 * 1000),
          category: 'Academic & Science',
          entryFeeMinor: BigInt(0),
          currency: 'ETB',
          maxAttendees: 150,
        },
      ],
    });
  }

  // 9. Create Learning Resources (Service 07)
  console.log('Seeding Academic Learning Resources...');
  const existingResourcesCount = await prisma.learningResource.count({
    where: { campusId: haramaya.id },
  });

  if (existingResourcesCount === 0) {
    await prisma.learningResource.createMany({
      data: [
        {
          campusId: haramaya.id,
          uploaderId: studentUser.id,
          title: 'Data Structures & Algorithms Complete Lecture Summary',
          description: 'Comprehensive handwritten & typed notes covering Binary Trees, Graph Traversal, Dynamic Programming, and Big-O notation.',
          department: 'Computer Science & Engineering',
          courseCode: 'COSC-2041',
          resourceType: 'lecture_note',
          fileUrl: '/uploads/resources/cosc2041-notes.pdf',
          downloadCount: 42,
          isApproved: true,
        },
        {
          campusId: haramaya.id,
          uploaderId: studentUser.id,
          title: 'Agro-Economics & Farming Systems Midterm 2025 Past Exam',
          description: 'Official 2025 midterm exam questions with detailed solution walk-throughs and marking scheme.',
          department: 'Agricultural Economics',
          courseCode: 'AGEC-1011',
          resourceType: 'past_exam',
          fileUrl: '/uploads/resources/agec1011-exam.pdf',
          downloadCount: 88,
          isApproved: true,
        },
      ],
    });
  }

  // 10. Seed Digital Student ID, Campus Pay Wallets & Cafeteria Passes
  console.log('Seeding Student Profile, Campus Pay Wallets, and Dining Passes...');

  // Student Profile
  const studentProfile = await prisma.studentProfile.upsert({
    where: {
      campusId_studentIdNumber: {
        campusId: haramaya.id,
        studentIdNumber: 'HU-8921',
      },
    },
    update: {},
    create: {
      userId: studentUser.id,
      campusId: haramaya.id,
      studentIdNumber: 'HU-8921',
      college: 'College of Computing and Informatics',
      department: 'Software Engineering',
      academicLevel: 'undergraduate',
      batchYear: 2023,
      emergencyPhone: '+251911223344',
      idCardStatus: 'active',
      expiresAt: new Date('2027-07-07T00:00:00Z'),
    },
  });
  console.log(`Student profile seeded: HU-8921 for ${studentUser.displayName}`);

  // Campus Treasury Wallet
  let treasuryWallet = await prisma.wallet.findFirst({
    where: { campusId: haramaya.id, walletType: 'campus_treasury' },
  });
  if (!treasuryWallet) {
    treasuryWallet = await prisma.wallet.create({
      data: {
        campusId: haramaya.id,
        walletType: 'campus_treasury',
        currency: 'ETB',
        balanceMinor: BigInt(499875000), // 4,998,750.00 ETB (after initial 1,250.00 ETB student allocation)
        status: 'active',
      },
    });
  }

  // Student Wallet
  let studentWallet = await prisma.wallet.findUnique({
    where: { userId: studentUser.id },
  });
  if (!studentWallet) {
    studentWallet = await prisma.wallet.create({
      data: {
        campusId: haramaya.id,
        userId: studentUser.id,
        walletType: 'student',
        currency: 'ETB',
        balanceMinor: BigInt(125000), // 1,250.00 ETB
        status: 'active',
      },
    });

    // Double-entry ledger transaction for initial student balance
    const topupTx = await prisma.walletTransaction.create({
      data: {
        campusId: haramaya.id,
        referenceNumber: 'TXN-202611-9482',
        category: 'topup_telebirr',
        state: 'succeeded',
        amountMinor: BigInt(125000),
        feeMinor: BigInt(0),
        currency: 'ETB',
        description: 'Telebirr Student Deposit',
        completedAt: new Date(),
        entries: {
          create: [
            {
              walletId: studentWallet.id,
              entryType: 'credit',
              amountMinor: BigInt(125000),
              currency: 'ETB',
              balanceAfter: BigInt(125000),
            },
            {
              walletId: treasuryWallet.id,
              entryType: 'debit',
              amountMinor: BigInt(125000),
              currency: 'ETB',
              balanceAfter: BigInt(499875000),
            },
          ],
        },
      },
    });
    console.log(`Student wallet seeded with double-entry tx: ${topupTx.referenceNumber}`);
  }

  // Merchant Wallet
  if (business) {
    let merchantWallet = await prisma.wallet.findUnique({
      where: { businessId: business.id },
    });
    if (!merchantWallet) {
      merchantWallet = await prisma.wallet.create({
        data: {
          campusId: haramaya.id,
          businessId: business.id,
          walletType: 'merchant',
          currency: 'ETB',
          balanceMinor: BigInt(785000), // 7,850.00 ETB
          status: 'active',
        },
      });
      console.log(`Merchant store wallet seeded for: ${business.name}`);
    }
  }

  // Cafeteria Meal Plan & Pass
  let mealPlan = await prisma.mealPlan.findFirst({
    where: { campusId: haramaya.id, name: 'Haramaya University Boarding Meal Plan' },
  });
  if (!mealPlan) {
    mealPlan = await prisma.mealPlan.create({
      data: {
        campusId: haramaya.id,
        name: 'Haramaya University Boarding Meal Plan',
        description: 'Official university-subsidized dining hall meal plan covering daily breakfast, lunch, and dinner.',
        priceMinor: null,
        billingDurationDays: 120,
        isActive: true,
      },
    });
  }

  const mealPass = await prisma.mealPass.upsert({
    where: { passCode: 'HU-DINING-PASS-NONFASTING-2026' },
    update: {},
    create: {
      studentProfileId: studentProfile.id,
      mealPlanId: mealPlan.id,
      dietaryPreference: 'non_fasting',
      passCode: 'HU-DINING-PASS-NONFASTING-2026',
      validFrom: new Date(),
      validUntil: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000),
      isActive: true,
    },
  });
  console.log(`Meal pass seeded: ${mealPass.passCode}`);

  // Sample meal scan log for today
  const existingScan = await prisma.mealScanLog.findFirst({
    where: { mealPassId: mealPass.id, mealPeriod: 'breakfast' },
  });
  if (!existingScan) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    await prisma.mealScanLog.create({
      data: {
        mealPassId: mealPass.id,
        scannedById: adminUser.id,
        mealPeriod: 'breakfast',
        scannedDate: today,
        diningHall: 'Main Campus Dining Hall 02',
      },
    });
    console.log('Sample breakfast meal scan recorded at Dining Hall 02');
  }

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
