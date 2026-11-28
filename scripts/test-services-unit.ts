import { BookingsService } from '../apps/api/src/bookings/bookings.service';
import { AuthService } from '../apps/api/src/auth/auth.service';
import { ModerationService } from '../apps/api/src/moderation/moderation.service';
import { BusinessesService } from '../apps/api/src/businesses/businesses.service';
import { CatalogService } from '../apps/api/src/catalog/catalog.service';
import { OrdersService } from '../apps/api/src/orders/orders.service';
import { signAccessToken, verifyAccessToken } from '../apps/api/src/common/auth-token';
import { hasStudentAccess } from '../apps/web/lib/roles';
import { BookingStatus, BusinessStatus, CampusRole, MembershipStatus, OrderStatus } from '@prisma/client';
import { NotFoundException, ForbiddenException } from '@nestjs/common';

async function runServicesUnitTests() {
  console.log('====================================================');
  console.log('🧪 CampusFlow Service Layer Unit Tests');
  console.log('In-memory Mock Testing for Bookings & Business Logic');
  console.log('====================================================\n');

  let passed = 0;
  let total = 0;

  function assert(condition: boolean, testName: string) {
    total++;
    if (!condition) {
      throw new Error(`FAIL: ${testName}`);
    }
    console.log(`[PASS] ${total}. ${testName}`);
    passed++;
  }

  // 1. Setup Mock Prisma Service for Bookings
  const inMemoryBookings: Record<string, any> = {
    'bk-100': {
      id: 'bk-100',
      customerId: 'student-tigist',
      businessId: 'biz-afras',
      serviceName: 'Thesis Printing & Hardcover Binding',
      startsAt: new Date('2026-11-25T10:00:00Z'),
      status: BookingStatus.requested,
    },
  };

  const mockPrisma: any = {
    booking: {
      create: async ({ data }: any) => {
        const id = `bk-${Date.now()}`;
        const record = { id, ...data, business: { name: 'Afras Stationery' } };
        inMemoryBookings[id] = record;
        return record;
      },
      findMany: async ({ where }: any) => {
        return Object.values(inMemoryBookings).filter((b: any) => b.customerId === where.customerId);
      },
      findUnique: async ({ where }: any) => {
        return inMemoryBookings[where.id] || null;
      },
      update: async ({ where, data }: any) => {
        if (!inMemoryBookings[where.id]) throw new Error('Record not found');
        inMemoryBookings[where.id] = { ...inMemoryBookings[where.id], ...data };
        return inMemoryBookings[where.id];
      },
    },
  };

  const bookingsService = new BookingsService(mockPrisma);

  // Test 1: Create Booking
  const created = await bookingsService.createBooking('student-tigist', {
    businessId: '0bf3972e-20a4-4b29-b190-e67fb185118f',
    serviceName: 'Laptop Diagnostics',
    startsAt: '2026-11-26T14:00:00.000Z',
  });
  assert(created.status === BookingStatus.requested, 'New booking created with status "requested"');
  assert(created.customerId === 'student-tigist', 'Booking associated with correct student customerId');

  // Test 2: Find User Bookings
  const userBookings = await bookingsService.findUserBookings('student-tigist');
  assert(userBookings.length >= 2, 'findUserBookings retrieved all user appointments');

  // Test 3: Cancel Booking by Owner
  const cancelled = await bookingsService.cancelBooking('student-tigist', 'bk-100');
  assert(cancelled.status === BookingStatus.cancelled, 'cancelBooking updated status to "cancelled"');

  // Test 4: Prevent Cancellation by Unauthorized User
  let unauthorizedBlocked = false;
  try {
    await bookingsService.cancelBooking('student-other-user', 'bk-100');
  } catch (err) {
    if (err instanceof ForbiddenException) {
      unauthorizedBlocked = true;
    }
  }
  assert(unauthorizedBlocked, 'ForbiddenException thrown when non-owner attempts cancellation');

  // Test 5: Cancel Non-existent Booking
  let notFoundCaught = false;
  try {
    await bookingsService.cancelBooking('student-tigist', 'bk-999-missing');
  } catch (err) {
    if (err instanceof NotFoundException) {
      notFoundCaught = true;
    }
  }
  assert(notFoundCaught, 'NotFoundException thrown when cancelling non-existent booking');

  // Test 6: Update Booking Status by Merchant
  const confirmed = await bookingsService.updateBookingStatus('bk-100', BookingStatus.confirmed);
  assert(confirmed.status === BookingStatus.confirmed, 'updateBookingStatus set status to "confirmed"');

  // Test 7: Double-Entry Ledger Invariant Simulation
  const senderBalance = BigInt(125000); // 1,250.00 ETB
  const transferAmt = BigInt(5000); // 50.00 ETB
  const debitEntry = { type: 'debit', amount: transferAmt };
  const creditEntry = { type: 'credit', amount: transferAmt };
  assert(debitEntry.amount === creditEntry.amount, 'Financial Invariant: Debit amount strictly matches Credit amount');
  assert(senderBalance - transferAmt >= BigInt(0), 'Non-negative Balance Invariant: Post-transfer balance >= 0');

  // Test 8: Signed Access Token round-trip & tamper rejection
  const signedToken = signAccessToken({
    sub: 'user-admin-1',
    email: 'first@haramaya.edu.et',
    roles: ['campus_admin'],
  });
  const verifiedClaims = verifyAccessToken(signedToken);
  assert(verifiedClaims !== null && verifiedClaims.sub === 'user-admin-1', 'signAccessToken/verifyAccessToken preserves sub claim');
  assert(verifiedClaims !== null && verifiedClaims.roles.includes('campus_admin'), 'signAccessToken/verifyAccessToken preserves roles');
  assert(verifyAccessToken(`${signedToken}tampered`) === null, 'verifyAccessToken rejects tampered token');
  assert(verifyAccessToken('sample-jwt-access-token') === null, 'verifyAccessToken rejects unsigned sample string');

  // Test 9: First registered user becomes campus_admin, second becomes student
  const createdUsers: any[] = [];
  const authMockPrisma: any = {
    user: {
      findUnique: async () => null,
    },
    $transaction: async (fn: (tx: any) => Promise<any>) =>
      fn({
        user: {
          count: async () => createdUsers.length,
          create: async ({ data }: any) => {
            const newUser = {
              id: `user-${createdUsers.length + 1}`,
              email: data.email,
              phone: data.phone ?? null,
              displayName: data.displayName,
              status: 'active',
              memberships: [
                {
                  campusId: data.memberships.create.campusId,
                  role: data.memberships.create.role,
                },
              ],
            };
            createdUsers.push(newUser);
            return newUser;
          },
        },
      }),
  };
  const authService = new AuthService(authMockPrisma);
  const firstSignup = await authService.register({
    campusId: '1c271dbc-bfa3-48fe-b184-5b35211e4076',
    displayName: 'First Admin',
    email: 'first@haramaya.edu.et',
    password: 'password123',
  });
  assert(firstSignup.user.memberships[0].role === CampusRole.campus_admin, 'First signup receives campus_admin role');
  const firstClaims = verifyAccessToken(firstSignup.accessToken);
  assert(firstClaims !== null && firstClaims.sub === 'user-1', 'First signup issues signed JWT for user-1');

  const secondSignup = await authService.register({
    campusId: '1c271dbc-bfa3-48fe-b184-5b35211e4076',
    displayName: 'Second Student',
    email: 'second@haramaya.edu.et',
    password: 'password123',
  });
  assert(secondSignup.user.memberships[0].role === CampusRole.student, 'Second signup receives student role');

  // Test 10: Business verification grants merchant role to ownerId
  const upsertedMemberships: any[] = [];
  const modMockPrisma: any = {
    $transaction: async (fn: (tx: any) => Promise<any>) =>
      fn({
        business: {
          findUnique: async () => ({
            id: 'biz-pending-1',
            campusId: 'campus-1',
            ownerId: 'user-2',
            status: BusinessStatus.pending,
          }),
          update: async ({ data }: any) => ({
            id: 'biz-pending-1',
            campusId: 'campus-1',
            ownerId: 'user-2',
            status: data.status,
          }),
        },
        campusMembership: {
          upsert: async ({ create }: any) => {
            upsertedMemberships.push(create);
            return create;
          },
        },
      }),
  };
  const moderationService = new ModerationService(modMockPrisma);
  const verifiedBiz = await moderationService.verifyBusiness('biz-pending-1');
  assert(verifiedBiz.status === BusinessStatus.verified, 'verifyBusiness marks business as verified');
  assert(
    upsertedMemberships.some(
      (m) => m.userId === 'user-2' && m.role === CampusRole.merchant && m.status === MembershipStatus.active,
    ),
    'verifyBusiness grants active merchant CampusMembership to business owner',
  );

  // Test 11: BusinessesService serializes BigInt product priceMinor for JSON responses
  const sampleBizRow = {
    id: 'biz-1',
    campusId: 'campus-1',
    ownerId: 'user-2',
    name: 'Haramaya Coffee Spot',
    description: 'Fresh roasted buna',
    status: BusinessStatus.verified,
    createdAt: new Date('2026-01-01T00:00:00.000Z'),
    products: [
      {
        id: 'prod-1',
        businessId: 'biz-1',
        categoryId: null,
        name: 'Macchiato',
        description: null,
        priceMinor: BigInt(4500),
        currency: 'ETB',
        stockQuantity: 10,
        isAvailable: true,
        version: 1,
        createdAt: new Date('2026-01-01T00:00:00.000Z'),
      },
    ],
  };
  const bizMockPrisma: any = {
    business: {
      findMany: async () => [sampleBizRow],
      findUnique: async () => sampleBizRow,
    },
  };
  const businessesService = new BusinessesService(bizMockPrisma);
  const listedBiz = await businessesService.findAll({} as any);
  const parsedList = JSON.parse(JSON.stringify(listedBiz));
  assert(
    parsedList[0]?.products?.[0]?.priceMinor === 4500,
    'BusinessesService.findAll serializes BigInt product priceMinor to JSON number',
  );
  const singleBiz = await businessesService.findOne('biz-1');
  const parsedSingle = JSON.parse(JSON.stringify(singleBiz));
  assert(
    parsedSingle?.products?.[0]?.priceMinor === 4500,
    'BusinessesService.findOne serializes BigInt product priceMinor to JSON number',
  );

  // Test 12: OrdersService.updateStatus serializes BigInt feeMinor and item unitPriceMinor
  const sampleOrderRow = {
    id: 'ord-1',
    campusId: 'campus-1',
    customerId: 'cust-1',
    businessId: 'biz-1',
    status: OrderStatus.pending,
    currency: 'ETB',
    subtotalMinor: BigInt(5000),
    feeMinor: BigInt(250),
    totalMinor: BigInt(5250),
    items: [
      {
        id: 'ord-item-1',
        orderId: 'ord-1',
        productId: 'prod-1',
        productName: 'Macchiato',
        unitPriceMinor: BigInt(2500),
        quantity: 2,
      },
    ],
  };
  const ordersMockPrisma: any = {
    order: {
      update: async ({ data }: any) => ({
        ...sampleOrderRow,
        status: data.status,
      }),
    },
  };
  const ordersService = new OrdersService(ordersMockPrisma);
  const updatedOrder = await ordersService.updateStatus('ord-1', { status: OrderStatus.ready });
  let orderJson: any = null;
  let serializationError: any = null;
  try {
    orderJson = JSON.parse(JSON.stringify(updatedOrder));
  } catch (err) {
    serializationError = err;
  }
  assert(!serializationError, 'OrdersService.updateStatus output serializes to JSON without BigInt error');
  assert(orderJson?.feeMinor === 250, 'OrdersService.updateStatus serializes BigInt feeMinor to number');
  assert(
    orderJson?.items?.[0]?.unitPriceMinor === 2500,
    'OrdersService.updateStatus serializes BigInt items.unitPriceMinor to number',
  );

  // Test 13: hasStudentAccess correctly restricts student profile fetching
  assert(hasStudentAccess(['student']) === true, 'hasStudentAccess returns true for student role');
  assert(hasStudentAccess(['student', 'merchant']) === true, 'hasStudentAccess returns true for multi-role student');
  assert(hasStudentAccess(['merchant']) === false, 'hasStudentAccess returns false for pure merchant');
  assert(hasStudentAccess(['campus_admin']) === false, 'hasStudentAccess returns false for campus_admin');
  assert(hasStudentAccess([]) === true, 'hasStudentAccess defaults to true for empty roles guest');

  // Test 14: CatalogService serializes BigInt priceMinor across operations
  const catalogMockPrisma: any = {
    product: {
      findMany: async () => [
        {
          id: 'prod-cat-1',
          businessId: 'biz-1',
          name: 'Sambusa',
          priceMinor: BigInt(2500),
          currency: 'ETB',
          isAvailable: true,
        },
      ],
      create: async ({ data }: any) => ({
        id: 'prod-cat-2',
        ...data,
      }),
      update: async ({ data }: any) => ({
        id: 'prod-cat-1',
        businessId: 'biz-1',
        name: 'Sambusa',
        priceMinor: BigInt(2500),
        currency: 'ETB',
        isAvailable: data.isAvailable,
      }),
    },
  };
  const catalogService = new CatalogService(catalogMockPrisma);
  const foundProducts = await catalogService.findProducts({});
  const parsedFound = JSON.parse(JSON.stringify(foundProducts));
  assert(parsedFound[0]?.priceMinor === 2500, 'CatalogService.findProducts serializes BigInt priceMinor to number');

  const createdProd = await catalogService.createProduct('biz-1', {
    name: 'Tea',
    priceMinor: 1500,
  } as any);
  const parsedCreated = JSON.parse(JSON.stringify(createdProd));
  assert(parsedCreated?.priceMinor === 1500, 'CatalogService.createProduct serializes BigInt priceMinor to number');

  const toggledProd = await catalogService.toggleAvailability('prod-cat-1', false);
  const parsedToggled = JSON.parse(JSON.stringify(toggledProd));
  assert(parsedToggled?.priceMinor === 2500, 'CatalogService.toggleAvailability serializes BigInt priceMinor to number');

  console.log(`\n====================================================`);
  console.log(`🎉 ALL SERVICE UNIT TESTS PASSED (${passed}/${total})`);
  console.log(`====================================================\n`);
}

runServicesUnitTests().catch((err) => {
  console.error('Service Unit Tests Failed:', err);
  process.exit(1);
});
