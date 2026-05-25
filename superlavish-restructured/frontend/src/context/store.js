import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import api from '../utils/api';

// ──────────────────────────────────────────────
// AUTH STORE
// ──────────────────────────────────────────────
export const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,

      login: async (email, password) => {
        const res = await api.post('/auth/login', { email, password });
        const { token, user } = res.data;
        localStorage.setItem('token', token);
        set({ user, token, isAuthenticated: true });
        return user;
      },

      register: async (name, email, password) => {
        const res = await api.post('/auth/register', { name, email, password });
        const { token, user } = res.data;
        localStorage.setItem('token', token);
        set({ user, token, isAuthenticated: true });
        return user;
      },

      logout: () => {
        localStorage.removeItem('token');
        set({ user: null, token: null, isAuthenticated: false });
      },

      updateUser: (user) => set({ user }),
    }),
    { name: 'auth-storage', partialize: (state) => ({ user: state.user, token: state.token, isAuthenticated: state.isAuthenticated }) }
  )
);

// ──────────────────────────────────────────────
// CART STORE
// ──────────────────────────────────────────────
export const useCartStore = create(
  persist(
    (set, get) => ({
      items: [],
      isOpen: false,
      isLoading: false,

      openCart: () => set({ isOpen: true }),
      closeCart: () => set({ isOpen: false }),
      toggleCart: () => set((state) => ({ isOpen: !state.isOpen })),

      addItem: async (product, quantity = 1) => {
        const { items } = get();
        const existing = items.find(i => i.productId === product.id);

        if (existing) {
          set({ items: items.map(i => i.productId === product.id ? { ...i, quantity: i.quantity + quantity } : i) });
        } else {
          set({ items: [...items, { productId: product.id, name: product.name, price: product.price, image: product.imageUrl, quantity }] });
        }

        // Sync with backend if authenticated
        const { isAuthenticated } = useAuthStore.getState();
        if (isAuthenticated) {
          try { await api.post('/cart/items', { productId: product.id, quantity }); } catch (_) {}
        }
      },

      removeItem: async (productId) => {
        set({ items: get().items.filter(i => i.productId !== productId) });
        const { isAuthenticated } = useAuthStore.getState();
        if (isAuthenticated) {
          try { await api.delete(`/cart/items/${productId}`); } catch (_) {}
        }
      },

      updateQuantity: async (productId, quantity) => {
        if (quantity <= 0) { get().removeItem(productId); return; }
        set({ items: get().items.map(i => i.productId === productId ? { ...i, quantity } : i) });
        const { isAuthenticated } = useAuthStore.getState();
        if (isAuthenticated) {
          try { await api.put(`/cart/items/${productId}`, { quantity }); } catch (_) {}
        }
      },

      clearCart: () => set({ items: [] }),

      getTotal: () => get().items.reduce((sum, i) => sum + i.price * i.quantity, 0),
      getCount: () => get().items.reduce((sum, i) => sum + i.quantity, 0),

      syncFromServer: async () => {
        const { isAuthenticated } = useAuthStore.getState();
        if (!isAuthenticated) return;
        try {
          set({ isLoading: true });
          const res = await api.get('/cart');
          set({ items: res.data.items || [] });
        } catch (_) {} finally {
          set({ isLoading: false });
        }
      },
    }),
    { name: 'cart-storage', partialize: (state) => ({ items: state.items }) }
  )
);

// ──────────────────────────────────────────────
// UI STORE
// ──────────────────────────────────────────────
export const useUIStore = create((set) => ({
  searchQuery: '',
  setSearchQuery: (q) => set({ searchQuery: q }),
  selectedCategory: null,
  setSelectedCategory: (c) => set({ selectedCategory: c }),
}));
