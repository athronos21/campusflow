export interface BusinessSummaryRef {
  id: string;
  ownerId?: string;
}

export function resolveMerchantBusinessId(
  businesses: BusinessSummaryRef[],
  userId?: string | null,
): string | null {
  if (!businesses || businesses.length === 0) return null;
  if (userId) {
    const owned = businesses.find((b) => b.ownerId === userId);
    if (owned) return owned.id;
  }
  return businesses[0].id;
}

export function partitionMerchantOrders<T extends { status: string }>(orders: T[]): {
  activeOrders: T[];
  pastOrders: T[];
} {
  const pastStatuses = new Set(['completed', 'rejected', 'cancelled']);
  const activeOrders: T[] = [];
  const pastOrders: T[] = [];

  for (const order of orders) {
    if (pastStatuses.has(order.status.toLowerCase())) {
      pastOrders.push(order);
    } else {
      activeOrders.push(order);
    }
  }

  return { activeOrders, pastOrders };
}
