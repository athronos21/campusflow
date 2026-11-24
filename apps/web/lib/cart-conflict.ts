export interface CartItem {
  id: string;
  name: string;
  priceMinor: number | string;
  quantity: number;
  businessId: string;
  businessName: string;
  campusId: string;
}

export interface CartAddResolution {
  conflict: boolean;
  nextItems: CartItem[];
}

/**
 * Pure single-merchant cart rule: merges items from the same business and signals
 * an explicit conflict when the cart already holds items from another merchant.
 */
export function resolveCartAdd(
  currentItems: CartItem[],
  nextItem: Omit<CartItem, 'quantity'>,
  quantity: number = 1,
): CartAddResolution {
  const existingBusinessId = currentItems[0]?.businessId;
  if (existingBusinessId && existingBusinessId !== nextItem.businessId) {
    return {
      conflict: true,
      nextItems: currentItems,
    };
  }

  const existingIndex = currentItems.findIndex((item) => item.id === nextItem.id);
  if (existingIndex > -1) {
    const updated = currentItems.map((item, idx) =>
      idx === existingIndex ? { ...item, quantity: item.quantity + quantity } : item,
    );
    return {
      conflict: false,
      nextItems: updated,
    };
  }

  return {
    conflict: false,
    nextItems: [...currentItems, { ...nextItem, quantity }],
  };
}
