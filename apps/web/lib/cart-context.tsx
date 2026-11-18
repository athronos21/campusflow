'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

export interface CartItem {
  id: string; // product id
  name: string;
  priceMinor: number | string;
  quantity: number;
  businessId: string;
  businessName: string;
  campusId: string;
}

interface CartContextType {
  items: CartItem[];
  addItem: (item: Omit<CartItem, 'quantity'>, quantity?: number) => void;
  updateQuantity: (productId: string, delta: number) => void;
  removeItem: (productId: string) => void;
  clearCart: () => void;
  totalMinor: number;
  itemCount: number;
  businessId: string | null;
  businessName: string | null;
  campusId: string | null;
}

const CartContext = createContext<CartContextType>({
  items: [],
  addItem: () => {},
  updateQuantity: () => {},
  removeItem: () => {},
  clearCart: () => {},
  totalMinor: 0,
  itemCount: 0,
  businessId: null,
  businessName: null,
  campusId: null,
});

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isInitialized, setIsInitialized] = useState<boolean>(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem('campusflow_cart');
      if (saved) {
        setItems(JSON.parse(saved));
      }
    } catch (e) {
      console.error('Failed to load cart from storage', e);
    } finally {
      setIsInitialized(true);
    }
  }, []);

  useEffect(() => {
    if (isInitialized) {
      localStorage.setItem('campusflow_cart', JSON.stringify(items));
    }
  }, [items, isInitialized]);

  const addItem = (item: Omit<CartItem, 'quantity'>, quantity: number = 1) => {
    setItems((prev) => {
      // If adding from a different business, confirm / reset or keep single merchant per order
      const existingBusinessId = prev[0]?.businessId;
      if (existingBusinessId && existingBusinessId !== item.businessId) {
        if (!confirm(`Your cart already contains items from "${prev[0].businessName}". Clear cart and start a new order with "${item.businessName}"?`)) {
          return prev;
        }
        return [{ ...item, quantity }];
      }

      const existingIndex = prev.findIndex((i) => i.id === item.id);
      if (existingIndex > -1) {
        const copy = [...prev];
        copy[existingIndex].quantity += quantity;
        return copy;
      }
      return [...prev, { ...item, quantity }];
    });
  };

  const updateQuantity = (productId: string, delta: number) => {
    setItems((prev) => {
      return prev
        .map((item) => {
          if (item.id === productId) {
            const newQty = item.quantity + delta;
            return newQty > 0 ? { ...item, quantity: newQty } : null;
          }
          return item;
        })
        .filter(Boolean) as CartItem[];
    });
  };

  const removeItem = (productId: string) => {
    setItems((prev) => prev.filter((item) => item.id !== productId));
  };

  const clearCart = () => {
    setItems([]);
  };

  const totalMinor = items.reduce((sum, item) => sum + Number(item.priceMinor) * item.quantity, 0);
  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);
  const businessId = items[0]?.businessId || null;
  const businessName = items[0]?.businessName || null;
  const campusId = items[0]?.campusId || null;

  return (
    <CartContext.Provider
      value={{
        items,
        addItem,
        updateQuantity,
        removeItem,
        clearCart,
        totalMinor,
        itemCount,
        businessId,
        businessName,
        campusId,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  return useContext(CartContext);
}
