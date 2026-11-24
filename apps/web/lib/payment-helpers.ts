export function getPaymentVerifyEndpoint(reference: string): string {
  return `/payments/verify/${encodeURIComponent(reference)}`;
}
