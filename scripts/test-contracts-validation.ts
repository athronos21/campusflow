import { InitiateWalletTransferSchema, TopupWalletSchema, RecordMealScanSchema } from '../packages/contracts/src';

console.log('Running Contract Validation Tests (TDD)...');

// 1. Test Negative amount in InitiateWalletTransferSchema
const negativeTransfer = InitiateWalletTransferSchema.safeParse({
  recipientIdentifier: '+251922334455',
  amountMinor: -5000,
  description: 'Negative test',
});
if (negativeTransfer.success) {
  console.error('FAIL: InitiateWalletTransferSchema accepted negative amount -5000');
  process.exit(1);
} else {
  console.log('PASS: InitiateWalletTransferSchema correctly rejected negative amount -5000');
}

// 2. Test Zero amount in TopupWalletSchema
const zeroTopup = TopupWalletSchema.safeParse({
  provider: 'telebirr',
  amountMinor: 0,
});
if (zeroTopup.success) {
  console.error('FAIL: TopupWalletSchema accepted zero amount');
  process.exit(1);
} else {
  console.log('PASS: TopupWalletSchema correctly rejected zero amount');
}

// 3. Test Positive amount in InitiateWalletTransferSchema
const validTransfer = InitiateWalletTransferSchema.safeParse({
  recipientIdentifier: 'HU-8921',
  amountMinor: 125000,
  description: 'Valid transfer',
});
if (!validTransfer.success) {
  console.error('FAIL: InitiateWalletTransferSchema rejected valid positive amount 125000', validTransfer.error);
  process.exit(1);
} else {
  console.log('PASS: InitiateWalletTransferSchema accepted valid positive amount 125000');
}

// 4. Test RecordMealScanSchema exists and validates correctly
const validMealScan = RecordMealScanSchema.safeParse({
  mealPassId: 'a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d',
  mealPeriod: 'breakfast',
  diningHall: 'Main Campus Dining Hall 02',
  scannedDate: '2026-11-21',
});
if (!validMealScan.success) {
  console.error('FAIL: RecordMealScanSchema failed to validate valid scan payload', validMealScan.error);
  process.exit(1);
} else {
  console.log('PASS: RecordMealScanSchema validated correctly');
}

console.log('ALL CONTRACT TESTS PASSED! 🚀');
