import { z } from 'zod';

export const PaymentProviderSchema = z.enum([
  'telebirr',
  'cbe_birr',
  'chapa',
  'cash_on_pickup',
  'cash_at_station',
]);

export type PaymentProvider = z.infer<typeof PaymentProviderSchema>;

export const InitializePaymentSchema = z.object({
  orderId: z.string().uuid().optional(),
  reservationId: z.string().uuid().optional(),
  provider: PaymentProviderSchema,
  returnUrl: z.string().url().optional(),
});

export type InitializePaymentDto = z.infer<typeof InitializePaymentSchema>;

export const PaymentWebhookSchema = z.object({
  provider: PaymentProviderSchema,
  providerReference: z.string(),
  orderId: z.string().uuid().optional(),
  reservationId: z.string().uuid().optional(),
  amountMinor: z.union([z.string(), z.number()]),
  currency: z.string().default('ETB'),
  status: z.enum(['succeeded', 'failed', 'refunded']),
  signature: z.string().optional(),
});

export type PaymentWebhookDto = z.infer<typeof PaymentWebhookSchema>;

export interface PaymentDto {
  id: string;
  orderId?: string | null;
  reservationId?: string | null;
  provider: string;
  providerReference?: string | null;
  amountMinor: string;
  currency: string;
  status: string;
  createdAt: string;
}

export interface PaymentInitResultDto {
  paymentId: string;
  provider: string;
  providerReference: string;
  checkoutUrl?: string;
  qrCodeData?: string;
  amountMinor: string;
  currency: string;
  instructions: string;
}
