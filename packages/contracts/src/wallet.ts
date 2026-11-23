import { z } from 'zod';

export const WalletStatusSchema = z.enum(['active', 'frozen', 'closed']);
export type WalletStatus = z.infer<typeof WalletStatusSchema>;

export const WalletTypeSchema = z.enum([
  'student',
  'merchant',
  'campus_treasury',
  'system_fee',
]);
export type WalletType = z.infer<typeof WalletTypeSchema>;

export const LedgerEntryTypeSchema = z.enum(['credit', 'debit']);
export type LedgerEntryType = z.infer<typeof LedgerEntryTypeSchema>;

export const TransactionCategorySchema = z.enum([
  'topup_telebirr',
  'topup_cbe_birr',
  'topup_chapa',
  'p2p_transfer',
  'merchant_payment',
  'transport_payment',
  'cafeteria_payment',
  'housing_deposit',
  'refund',
  'system_fee',
]);
export type TransactionCategory = z.infer<typeof TransactionCategorySchema>;

export const TransactionStateSchema = z.enum([
  'pending',
  'succeeded',
  'failed',
  'reversed',
]);
export type TransactionState = z.infer<typeof TransactionStateSchema>;

export const PositiveMinorUnitSchema = z
  .union([z.string(), z.number(), z.bigint()])
  .refine(
    (val) => {
      try {
        const b = BigInt(val);
        return b > 0n;
      } catch {
        return false;
      }
    },
    { message: 'Amount must be a positive integer greater than zero' }
  );

export const WalletDtoSchema = z.object({
  id: z.string().uuid(),
  campusId: z.string().uuid(),
  userId: z.string().uuid().nullable(),
  businessId: z.string().uuid().nullable(),
  walletType: WalletTypeSchema,
  currency: z.string().default('ETB'),
  balanceMinor: z.union([z.string(), z.number(), z.bigint()]),
  status: WalletStatusSchema,
  version: z.number().int(),
  createdAt: z.string(),
});
export type WalletDto = z.infer<typeof WalletDtoSchema>;

export const InitiateWalletTransferSchema = z.object({
  recipientIdentifier: z.string().min(3),
  amountMinor: PositiveMinorUnitSchema,
  description: z.string().max(255).default('P2P Transfer'),
  idempotencyKey: z.string().uuid().optional(),
});
export type InitiateWalletTransferDto = z.infer<typeof InitiateWalletTransferSchema>;

export const TopupWalletSchema = z.object({
  provider: z.enum(['telebirr', 'cbe_birr', 'chapa']),
  amountMinor: PositiveMinorUnitSchema,
  returnUrl: z.string().url().optional(),
});
export type TopupWalletDto = z.infer<typeof TopupWalletSchema>;
export const WalletTopupSchema = TopupWalletSchema;
export type WalletTopupDto = TopupWalletDto;

export const LedgerEntryDtoSchema = z.object({
  id: z.string().uuid(),
  transactionId: z.string().uuid(),
  walletId: z.string().uuid(),
  entryType: LedgerEntryTypeSchema,
  amountMinor: z.union([z.string(), z.number(), z.bigint()]),
  currency: z.string(),
  balanceAfter: z.union([z.string(), z.number(), z.bigint()]),
  createdAt: z.string(),
});
export type LedgerEntryDto = z.infer<typeof LedgerEntryDtoSchema>;

export const WalletTransactionDtoSchema = z.object({
  id: z.string().uuid(),
  referenceNumber: z.string(),
  idempotencyKey: z.string().nullable(),
  campusId: z.string().uuid(),
  category: TransactionCategorySchema,
  state: TransactionStateSchema,
  amountMinor: z.union([z.string(), z.number(), z.bigint()]),
  feeMinor: z.union([z.string(), z.number(), z.bigint()]),
  currency: z.string(),
  description: z.string(),
  metadata: z.record(z.any()).nullable().optional(),
  createdAt: z.string(),
  completedAt: z.string().nullable(),
});
export type WalletTransactionDto = z.infer<typeof WalletTransactionDtoSchema>;
