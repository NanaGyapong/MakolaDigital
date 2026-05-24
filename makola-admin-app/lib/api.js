
import axios from "axios";
import * as SecureStore from "expo-secure-store";

const BASE = process.env.EXPO_PUBLIC_API_URL || "http://localhost:4000/api/v1";

export const api = axios.create({ baseURL: BASE });

api.interceptors.request.use(async (config) => {
  const token = await SecureStore.getItemAsync("admin_token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(null, async (err) => {
  if (err.response?.status === 401) {
    await SecureStore.deleteItemAsync("admin_token");
  }
  return Promise.reject(err.response?.data || err);
});

export const adminAPI = {
  // Auth
  login: (email, password) => api.post("/auth/login", { email, password }),

  // Dashboard
  getStats: () => api.get("/admin/stats"),

  // KYC
  getKycQueue: (status = "pending", page = 1) =>
    api.get(`/admin/kyc?status=${status}&page=${page}`),
  reviewKyc: (userId, action, note) =>
    api.patch(`/admin/kyc/${userId}/review`, { action, note }),

  // Listings
  getFlaggedListings: (status = "flagged", page = 1) =>
    api.get(`/admin/listings?status=${status}&page=${page}`),
  moderateListing: (id, action, reason) =>
    api.patch(`/admin/listings/${id}/moderate`, { action, reason }),

  // Sellers
  getUsers: (params) => api.get("/admin/users", { params }),
  updateUserStatus: (id, action, reason) =>
    api.patch(`/admin/users/${id}/status`, { action, reason }),

  // Disputes
  getDisputes: (status = "open") =>
    api.get(`/admin/disputes?status=${status}`),
  resolveDispute: (id, resolution, note) =>
    api.post(`/admin/disputes/${id}/resolve`, { resolution, note }),

  // Audit log
  getAuditLog: (page = 1) => api.get(`/admin/audit?page=${page}`),
};
