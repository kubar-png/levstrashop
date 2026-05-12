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

type CartState = {
  items: CartItem[];
  drawerOpen: boolean;
  add: (item: CartItem) => void;
  remove: (sku: string) => void;
  setQty: (sku: string, qty: number) => void;
  clear: () => void;
  openDrawer: () => void;
  closeDrawer: () => void;
  toggleDrawer: () => void;
  totalCents: () => number;
  itemCount: () => number;
};

export const useCart = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      drawerOpen: false,
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
      clear: () => set({ items: [] }),
      openDrawer: () => set({ drawerOpen: true }),
      closeDrawer: () => set({ drawerOpen: false }),
      toggleDrawer: () => set((state) => ({ drawerOpen: !state.drawerOpen })),
      totalCents: () => get().items.reduce((sum, i) => sum + i.priceCents * i.qty, 0),
      itemCount: () => get().items.reduce((sum, i) => sum + i.qty, 0),
    }),
    {
      name: 'levstra-cart',
      /* Only persist items — drawer state is ephemeral UI. */
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ items: state.items }),
    },
  ),
);
