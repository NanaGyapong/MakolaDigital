
import * as SecureStore from "expo-secure-store";
import axios from "axios";

const API = process.env.EXPO_PUBLIC_API_URL || "http://localhost:4000/api/v1";

export const api = axios.create({ baseURL: API });

// Auto-attach token
api.interceptors.request.use(async (config) => {
  const token = await SecureStore.getItemAsync("makola_token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Auto-refresh on 401
api.interceptors.response.use(null, async (error) => {
  if (error.response?.status === 401 && error.config && !error.config._retry) {
    error.config._retry = true;
    try {
      const refresh = await SecureStore.getItemAsync("makola_refresh");
      const { data } = await axios.post(`${API}/auth/refresh`, { refreshToken: refresh });
      await SecureStore.setItemAsync("makola_token", data.accessToken);
      error.config.headers.Authorization = `Bearer ${data.accessToken}`;
      return api(error.config);
    } catch {
      await SecureStore.deleteItemAsync("makola_token");
      await SecureStore.deleteItemAsync("makola_refresh");
    }
  }
  return Promise.reject(error.response?.data || error);
});

export const authService = {
  async login(email, password) {
    const { data } = await api.post("/auth/login", { email, password });
    await SecureStore.setItemAsync("makola_token", data.accessToken);
    await SecureStore.setItemAsync("makola_refresh", data.refreshToken);
    return data.user;
  },
  async register(payload) {
    const { data } = await api.post("/auth/register", payload);
    return data;
  },
  async verifyEmail(email, otp) {
    const { data } = await api.post("/auth/verify-email", { email, otp });
    await SecureStore.setItemAsync("makola_token", data.accessToken);
    await SecureStore.setItemAsync("makola_refresh", data.refreshToken);
    return data.user;
  },
  async getMe() {
    const { data } = await api.get("/users/me");
    return data.user;
  },
  async logout() {
    await api.post("/auth/logout").catch(() => {});
    await SecureStore.deleteItemAsync("makola_token");
    await SecureStore.deleteItemAsync("makola_refresh");
  },
  async isLoggedIn() {
    const t = await SecureStore.getItemAsync("makola_token");
    return !!t;
  },
};
