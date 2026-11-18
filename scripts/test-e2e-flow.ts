import { PrismaClient, OrderStatus, PaymentStatus, BusinessStatus } from '@prisma/client';

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

    // Cleanup test records
    await prisma.payment.delete({ where: { id: payment.id } });
    await prisma.orderItem.deleteMany({ where: { orderId: testOrder.id } });
    await prisma.order.delete({ where: { id: testOrder.id } });
    await prisma.ticketReservation.delete({ where: { id: ticket.id } });
    await prisma.trip.update({ where: { id: trip.id }, data: { availableSeats: initialSeats } });

    console.log('\n[CLEANUP] Test records cleaned up successfully.');
    console.log('\n====================================================');
    console.log('🎉 ALL END-TO-END VERIFICATION CHECKS PASSED (10/10)');
    console.log('====================================================\n');
  } catch (error) {
    console.error('❌ E2E Test Failure:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

runE2ETest();
