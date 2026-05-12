'use client';

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

export type CartItem = {
  productId: string;
  variantSku: string;
  title: string;
  image?: string;
  size?: string;
  color?: string;
  priceCents: number;
  qty: number;
  slug: string;
};

export type AppliedDiscount = {
  code: string;
  type: 'percent' | 'fixed' | 'free-shipping';
  value: number;
  /** Computed against the cart subtotal at apply-time. Re-validated on checkout. */
  discountCents: number;
  forcesFreeShipping: boolean;
};

type CartState = {
  items: CartItem[];
  drawerOpen: boolean;
  discount: AppliedDiscount | null;
  add: (item: CartItem) => void;
  remove: (sku: string) => void;
  setQty: (sku: string, qty: number) => void;
  clear: () => void;
  openDrawer: () => void;
  closeDrawer: () => void;
  toggleDrawer: () => void;
  applyDiscount: (d: AppliedDiscount) => void;
  clearDiscount: () => void;
  totalCents: () => number;
  itemCount: () => number;
};

export const useCart = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      drawerOpen: false,
      discount: null,
      add: (item) =>
        set((state) => {
          const existing = state.items.find((i) => i.variantSku === item.variantSku);
          if (existing) {
            return {
              items: state.items.map((i) =>
                i.variantSku === item.variantSku ? { ...i, qty: i.qty + item.qty } : i,
              ),
            };
          }
          return { items: [...state.items, item] };
        }),
      remove: (sku) =>
        set((state) => ({ items: state.items.filter((i) => i.variantSku !== sku) })),
      setQty: (sku, qty) =>
        set((state) => ({
          items: state.items
            .map((i) => (i.variantSku === sku ? { ...i, qty } : i))
            .filter((i) => i.qty > 0),
        })),
      clear: () => set({ items: [], discount: null }),
      openDrawer: () => set({ drawerOpen: true }),
      closeDrawer: () => set({ drawerOpen: false }),
      toggleDrawer: () => set((state) => ({ drawerOpen: !state.drawerOpen })),
      applyDiscount: (d) => set({ discount: d }),
      clearDiscount: () => set({ discount: null }),
      totalCents: () => get().items.reduce((sum, i) => sum + i.priceCents * i.qty, 0),
      itemCount: () => get().items.reduce((sum, i) => sum + i.qty, 0),
    }),
    {
      name: 'levstra-cart',
      storage: createJSONStorage(() => localStorage),
      /* Only persist items + discount; drawer state is ephemeral UI. */
      partialize: (state) => ({ items: state.items, discount: state.discount }),
    },
  ),
);
