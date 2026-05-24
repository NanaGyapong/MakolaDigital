
import { create } from "zustand";
import { api, authService } from "./auth";

export const useAuthStore = create((set) => ({
  user: null,
  loading: true,
  setUser: (user) => set({ user }),
  logout: async () => {
    await authService.logout();
    set({ user: null });
  },
  init: async () => {
    try {
      const user = await authService.getMe();
      set({ user, loading: false });
    } catch {
      set({ user: null, loading: false });
    }
  },
}));

export const useListingsStore = create((set, get) => ({
  listings: [],
  loading: false,
  page: 1,
  hasMore: true,
  filters: { type: "all", category: "", search: "", country: "" },

  setFilters: (filters) => set({ filters: { ...get().filters, ...filters }, listings: [], page: 1, hasMore: true }),

  fetch: async (reset = false) => {
    const { page, filters, loading, hasMore } = get();
    if (loading || (!hasMore && !reset)) return;
    set({ loading: true });
    try {
      const p = reset ? 1 : page;
      const params = new URLSearchParams({ page: p, limit: 20, ...filters });
      const { data } = await api.get(`/listings?${params}`);
      set((s) => ({
        listings: reset ? data.listings : [...s.listings, ...data.listings],
        page: p + 1,
        hasMore: data.listings.length === 20,
        loading: false,
      }));
    } catch {
      set({ loading: false });
    }
  },
}));
