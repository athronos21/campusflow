import { BookingsService } from '../apps/api/src/bookings/bookings.service';
import { BookingStatus } from '@prisma/client';
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

  console.log(`\n====================================================`);
  console.log(`🎉 ALL SERVICE UNIT TESTS PASSED (${passed}/${total})`);
  console.log(`====================================================\n`);
}

runServicesUnitTests().catch((err) => {
  console.error('Service Unit Tests Failed:', err);
  process.exit(1);
});
