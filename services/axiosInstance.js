import axios from "axios";
import Constants from "expo-constants";
import { router } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";

const apiBaseUrl = Constants.expoConfig.extra.apiBaseUrl;

const axiosInstance = axios.create({
  baseURL: apiBaseUrl,
});

// ── Request Interceptor: Attach Token ─────────────────────────────────────────
axiosInstance.interceptors.request.use(
  async (config) => {
    try {
      const storedAuth = await AsyncStorage.getItem("auth_user");
      if (storedAuth) {
        const auth = JSON.parse(storedAuth);
        const token = auth?.data?.token;
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
      }
    } catch (error) {
      console.error("Error reading token from AsyncStorage", error);
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ── Response Interceptor: Handle 401 ──────────────────────────────────────────
axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error?.response?.status === 401) {
      // Token expired or invalid, clear storage and go to Login
      await AsyncStorage.removeItem("auth_user");
      router.replace("/Login");
    }
    return Promise.reject(error);
  },
);

export default axiosInstance;
