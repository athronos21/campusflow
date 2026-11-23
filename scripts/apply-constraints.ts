import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Applying PostgreSQL Engine Constraints & Partial Indexes...');

  // 1. Non-negative wallet balance constraint
  await prisma.$executeRawUnsafe(`
    DO $$ BEGIN
      IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'chk_wallets_non_negative_balance'
      ) THEN
        ALTER TABLE "wallets" ADD CONSTRAINT "chk_wallets_non_negative_balance" CHECK ("balance_minor" >= 0);
      END IF;
    END $$;
  `);
  console.log('[PASS] Check Constraint: chk_wallets_non_negative_balance applied');

  // 2. Partial unique index for active seat reservations
  await prisma.$executeRawUnsafe(`
    CREATE UNIQUE INDEX IF NOT EXISTS "idx_reservations_active_seat" 
    ON "ticket_reservations" ("trip_id", "seat_number") 
    WHERE "status" != 'cancelled';
  `);
  console.log('[PASS] Partial Unique Index: idx_reservations_active_seat applied');
}

main()
  .catch((e) => {
    console.error('Error applying constraints:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
