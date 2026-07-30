import { Platform } from "react-native";
import * as SecureStore from "expo-secure-store";
import AsyncStorage from "@react-native-async-storage/async-storage";

// The JWT is the only sensitive value we persist; keep it in the OS keystore
// (Keychain / Keystore) on native. SecureStore has no web implementation, so
// fall back to AsyncStorage there.
const TOKEN_KEY = "auth_token";
const isWeb = Platform.OS === "web";

export const setToken = async (token) => {
  if (token == null) return deleteToken();
  if (isWeb) return AsyncStorage.setItem(TOKEN_KEY, token);
  return SecureStore.setItemAsync(TOKEN_KEY, token);
};

export const getToken = async () => {
  if (isWeb) return AsyncStorage.getItem(TOKEN_KEY);
  return SecureStore.getItemAsync(TOKEN_KEY);
};

export const deleteToken = async () => {
  if (isWeb) return AsyncStorage.removeItem(TOKEN_KEY);
  return SecureStore.deleteItemAsync(TOKEN_KEY);
};
