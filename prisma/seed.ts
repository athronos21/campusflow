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
      body: 'CampusFlow is live for testing. Browse campus food, discover verified campus merchants, and place pickup orders directly.',
      publishedAt: new Date(),
    },
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
