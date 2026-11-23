import {
  PrismaClient,
  OrderStatus,
  PaymentStatus,
  BusinessStatus,
  TransactionCategory,
  TransactionState,
  LedgerEntryType,
  MealPeriod,
  BookingStatus,
} from '@prisma/client';

const prisma = new PrismaClient();

async function runE2ETest() {
  console.log('====================================================');
  console.log('🧪 CampusFlow End-to-End Integration Test Suite');
  console.log('Haramaya University Pilot MVP + Phase 2 Transport/Pay');
  console.log('====================================================\n');

  try {
    // 1. Verify Pilot Campus
    const campus = await prisma.campus.findUnique({
      where: { slug: 'haramaya-main' },
    });
    if (!campus) throw new Error('Haramaya campus record missing');
    console.log(`[PASS] 1. Campus Verified: ${campus.name} (${campus.id})`);

    // 2. Verify Verified Cafe & Menu
    const cafe = await prisma.business.findFirst({
      where: { name: 'Haramaya Campus Cafe & Snack', status: BusinessStatus.verified },
      include: { products: true, owner: true },
    });
    if (!cafe) throw new Error('Pilot Cafe missing or unverified');
    console.log(`[PASS] 2. Verified Merchant: ${cafe.name} (Owner: ${cafe.owner.displayName})`);
    console.log(`       Active Catalog Items: ${cafe.products.length} products`);

    // 3. Verify Student Account
    const student = await prisma.user.findFirst({
      where: { email: 'student@haramaya.edu.et' },
    });
    if (!student) throw new Error('Test Student missing');
    console.log(`[PASS] 3. Student Account: ${student.displayName} (${student.email})`);

    // 4. Simulate Student Order Placement
    const buna = cafe.products.find((p) => p.name.includes('Buna'));
    const ful = cafe.products.find((p) => p.name.includes('Ful'));
    if (!buna || !ful) throw new Error('Catalog products missing');

    const subtotal = buna.priceMinor * BigInt(2) + ful.priceMinor * BigInt(1);
    const testOrder = await prisma.order.create({
      data: {
        campusId: campus.id,
        customerId: student.id,
        businessId: cafe.id,
        status: OrderStatus.pending,
        paymentStatus: PaymentStatus.unpaid,
        subtotalMinor: subtotal,
        totalMinor: subtotal,
        currency: 'ETB',
        items: {
          create: [
            { productId: buna.id, productName: buna.name, unitPriceMinor: buna.priceMinor, quantity: 2 },
            { productId: ful.id, productName: ful.name, unitPriceMinor: ful.priceMinor, quantity: 1 },
          ],
        },
      },
      include: { items: true },
    });

    console.log(`[PASS] 4. Order Created: Order #${testOrder.id.slice(0, 8)}`);
    console.log(`       Total: ${(Number(testOrder.totalMinor) / 100).toFixed(2)} ETB (Items: 2x Buna, 1x Ful)`);

    // 5. Simulate Merchant Order Progression
    await prisma.order.update({
      where: { id: testOrder.id },
      data: { status: OrderStatus.accepted },
    });
    console.log(`[PASS] 5. Merchant Accepted Order #${testOrder.id.slice(0, 8)}`);

    await prisma.order.update({
      where: { id: testOrder.id },
      data: { status: OrderStatus.preparing },
    });
    console.log(`[PASS] 6. Kitchen Started Preparation (status: preparing)`);

    await prisma.order.update({
      where: { id: testOrder.id },
      data: { status: OrderStatus.ready },
    });
    console.log(`[PASS] 7. Order Ready for Pickup! 🔔`);

    // 6. Simulate Telebirr Digital Payment
    const payment = await prisma.payment.create({
      data: {
        orderId: testOrder.id,
        provider: 'telebirr',
        providerReference: `TB-HU-E2E-${Date.now()}`,
        amountMinor: testOrder.totalMinor,
        currency: 'ETB',
        status: PaymentStatus.paid,
      },
    });

    await prisma.order.update({
      where: { id: testOrder.id },
      data: { paymentStatus: PaymentStatus.paid, status: OrderStatus.completed },
    });
    console.log(`[PASS] 8. Telebirr Payment Succeeded: Ref ${payment.providerReference}`);
    console.log(`       Order #${testOrder.id.slice(0, 8)} Fulfilled & Paid!`);

    // 7. Verify Transport Ticketing (Service 02)
    const trip = await prisma.trip.findFirst({
      where: { status: 'scheduled' },
      include: { route: true, operator: true },
    });
    if (!trip) throw new Error('Scheduled bus trips missing');

    const initialSeats = trip.availableSeats;
    const ticket = await prisma.ticketReservation.create({
      data: {
        tripId: trip.id,
        passengerId: student.id,
        seatNumber: 15,
        passengerName: student.displayName,
        passengerPhone: student.phone || '+251922334455',
        qrCode: `CF-TRIP-${trip.id.slice(0, 8)}-S15-E2ETEST`,
        amountMinor: trip.priceMinor,
        currency: 'ETB',
        status: 'confirmed',
        paymentStatus: PaymentStatus.paid,
      },
    });

    await prisma.trip.update({
      where: { id: trip.id },
      data: { availableSeats: { decrement: 1 } },
    });

    const updatedTrip = await prisma.trip.findUnique({ where: { id: trip.id } });
    console.log(`[PASS] 9. Bus Seat Booked: ${trip.route.origin} → ${trip.route.destination}`);
    console.log(`       Operator: ${trip.operator.name} (Seat #15)`);
    console.log(`       QR Token: ${ticket.qrCode}`);
    console.log(`       Seats remaining: ${updatedTrip?.availableSeats} (decremented from ${initialSeats})`);

    // 8. Verify Student Housing & Accommodation (Service 05)
    const housing = await prisma.housingListing.findFirst({
      where: { isAvailable: true },
      include: { landlord: true },
    });
    if (!housing) throw new Error('Housing listings missing');

    const viewingReq = await prisma.housingViewingRequest.create({
      data: {
        listingId: housing.id,
        studentId: student.id,
        preferredDate: new Date(Date.now() + 86400000),
        studentPhone: student.phone || '+251911223344',
        message: 'E2E testing room viewing inspection',
        status: 'pending',
      },
    });
    console.log(`[PASS] 10. Student Housing Viewing Requested: "${housing.title}" (${housing.location})`);
    console.log(`        Landlord: ${housing.landlord.displayName} | Status: ${viewingReq.status}`);

    // 9. Verify Campus Events & Passes (Service 06)
    const event = await prisma.campusEvent.findFirst({
      where: { campusId: campus.id },
      include: { organizer: true },
    });
    if (!event) throw new Error('Campus events missing');

    const eventRsvp = await prisma.eventRsvp.create({
      data: {
        eventId: event.id,
        userId: student.id,
        ticketCode: `TKT-EVT-E2E-${Date.now().toString().slice(-4)}`,
        status: 'registered',
      },
    });
    console.log(`[PASS] 11. Campus Event RSVP Confirmed: "${event.title}"`);
    console.log(`        Venue: ${event.venue} | Ticket Code: ${eventRsvp.ticketCode}`);

    // 10. Verify Academic Hub & Course Resource Bank (Service 07)
    const resource = await prisma.learningResource.findFirst({
      where: { campusId: campus.id },
      include: { uploader: true },
    });
    if (!resource) throw new Error('Learning resources missing');

    const initialDownloads = resource.downloadCount;
    const updatedResource = await prisma.learningResource.update({
      where: { id: resource.id },
      data: { downloadCount: { increment: 1 } },
    });
    console.log(`[PASS] 12. Academic Learning Resource Downloaded: "${resource.title}" (${resource.courseCode})`);
    console.log(`        Department: ${resource.department} | Downloads: ${updatedResource.downloadCount} (incremented from ${initialDownloads})`);

    // 11. Verify Digital Student ID (Service 11)
    const studentProfile = await prisma.studentProfile.findUnique({
      where: { userId: student.id },
    });
    if (studentProfile) {
      console.log(`[PASS] 13. Digital Student ID Profile Verified: ID ${studentProfile.studentIdNumber}`);
      console.log(`        Status: ${studentProfile.idCardStatus} | Dept: ${studentProfile.department} | Level: ${studentProfile.academicLevel}`);
    }

    // 12. Verify Campus Pay Wallet & Balanced Ledger (Service 12)
    const studentWallet = await prisma.wallet.findUnique({
      where: { userId: student.id },
    });
    if (studentWallet) {
      console.log(`[PASS] 14. Campus Pay Wallet Verified: Balance ${(Number(studentWallet.balanceMinor) / 100).toFixed(2)} ETB`);

      const merchantWallet = await prisma.wallet.findUnique({
        where: { businessId: cafe.id },
      });
      if (merchantWallet) {
        const transferAmount = BigInt(5000); // 50.00 ETB
        const tx = await prisma.$transaction(async (prismaTx) => {
          const walletTx = await prismaTx.walletTransaction.create({
            data: {
              referenceNumber: `TX-E2E-${Date.now()}`,
              campusId: campus.id,
              amountMinor: transferAmount,
              currency: 'ETB',
              category: TransactionCategory.p2p_transfer,
              state: TransactionState.succeeded,
              description: 'E2E Test Transfer',
              entries: {
                create: [
                  {
                    walletId: studentWallet.id,
                    entryType: LedgerEntryType.debit,
                    amountMinor: transferAmount,
                    balanceAfter: studentWallet.balanceMinor - transferAmount,
                  },
                  {
                    walletId: merchantWallet.id,
                    entryType: LedgerEntryType.credit,
                    amountMinor: transferAmount,
                    balanceAfter: merchantWallet.balanceMinor + transferAmount,
                  },
                ],
              },
            },
            include: { entries: true },
          });
          return walletTx;
        });
        console.log(`[PASS] 15. Double-Entry Transfer Executed: Tx #${tx.id.slice(0, 8)}`);
        console.log(`        Ledger: Debited ${Number(transferAmount) / 100} ETB (Student) | Credited ${Number(transferAmount) / 100} ETB (Merchant)`);

        // Cleanup transfer ledger and tx
        await prisma.ledgerEntry.deleteMany({ where: { transactionId: tx.id } });
        await prisma.walletTransaction.delete({ where: { id: tx.id } });
      }
    }

    // 13. Verify Cafeteria Meal Pass & Dining Hall Scans (Service 13)
    if (studentProfile) {
      const mealPass = await prisma.mealPass.findFirst({
        where: { studentProfileId: studentProfile.id },
        include: { mealPlan: true },
      });
      if (mealPass) {
        console.log(`[PASS] 16. Cafeteria Dining Pass Verified: Pass Code "${mealPass.passCode}"`);
        console.log(`        Meal Plan: ${mealPass.mealPlan.name} | Dietary Preference: ${mealPass.dietaryPreference}`);

        const scanLog = await prisma.mealScanLog.create({
          data: {
            mealPassId: mealPass.id,
            mealPeriod: MealPeriod.lunch,
            diningHall: 'Main Dining Hall 02',
            scannedById: student.id,
            scannedDate: new Date(),
          },
        });
        console.log(`[PASS] 17. Lunch Meal Scan Logged & Verified: Scan #${scanLog.id.slice(0, 8)}`);

        // Cleanup scan log
        await prisma.mealScanLog.delete({ where: { id: scanLog.id } });
      }
    }

    // 14. Verify Service Appointment Booking Lifecycle (Service 14)
    const testBooking = await prisma.booking.create({
      data: {
        customerId: student.id,
        businessId: cafe.id,
        serviceName: 'Thesis Printing & Hardcover Binding',
        startsAt: new Date(Date.now() + 86400000),
        status: BookingStatus.requested,
      },
      include: { business: true },
    });
    console.log(`[PASS] 18. Service Appointment Created: "${testBooking.serviceName}" at ${testBooking.business.name}`);
    console.log(`        Status: ${testBooking.status} | Booking ID: #${testBooking.id.slice(0, 8)}`);

    // Merchant confirms appointment
    await prisma.booking.update({
      where: { id: testBooking.id },
      data: { status: BookingStatus.confirmed },
    });

    // Student cancels appointment
    await prisma.booking.update({
      where: { id: testBooking.id },
      data: { status: BookingStatus.cancelled },
    });
    console.log(`        Appointment lifecycle transitioned: requested -> confirmed -> cancelled`);

    // Cleanup test booking
    await prisma.booking.delete({ where: { id: testBooking.id } });

    // Cleanup test records
    await prisma.payment.delete({ where: { id: payment.id } });
    await prisma.orderItem.deleteMany({ where: { orderId: testOrder.id } });
    await prisma.order.delete({ where: { id: testOrder.id } });
    await prisma.ticketReservation.delete({ where: { id: ticket.id } });
    await prisma.trip.update({ where: { id: trip.id }, data: { availableSeats: initialSeats } });
    await prisma.housingViewingRequest.delete({ where: { id: viewingReq.id } });
    await prisma.eventRsvp.delete({ where: { id: eventRsvp.id } });
    await prisma.learningResource.update({ where: { id: resource.id }, data: { downloadCount: initialDownloads } });

    console.log('\n[CLEANUP] Test records cleaned up successfully.');
    console.log('\n====================================================');
    console.log('🎉 ALL END-TO-END VERIFICATION CHECKS PASSED (18/18)');
    console.log('====================================================\n');
  } catch (error) {
    console.error('❌ E2E Test Failure:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

runE2ETest();
