import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { setToken, getToken, deleteToken } from '../services/secureStorage';

const AuthContext = createContext(null);

// Persist the token in the secure keystore and the rest of the (non-sensitive)
// session profile in AsyncStorage. They are recombined in memory on load.
const AUTH_KEY = 'auth_user';

export function AuthProvider({ children }) {
  const [authUser, setAuthUser] = useState(undefined); // undefined = loading, null = logged out
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadAuth = async () => {
      try {
        const [stored, token] = await Promise.all([
          AsyncStorage.getItem(AUTH_KEY),
          getToken(),
        ]);
        if (stored) {
          const parsed = JSON.parse(stored);
          if (token && parsed?.data) parsed.data.token = token;
          setAuthUser(parsed);
        } else {
          setAuthUser(null);
        }
      } catch (e) {
        setAuthUser(null);
      } finally {
        setIsLoading(false);
      }
    };
    loadAuth();
  }, []);

  const login = async (userData) => {
    const token = userData?.data?.token ?? null;
    await setToken(token);
    // Strip the token before persisting the profile to AsyncStorage.
    const persistable = { ...userData, data: { ...userData?.data, token: undefined } };
    await AsyncStorage.setItem(AUTH_KEY, JSON.stringify(persistable));
    setAuthUser(userData); // keep the token in memory for immediate use
  };

  const logout = async () => {
    await Promise.all([AsyncStorage.removeItem(AUTH_KEY), deleteToken()]);
    setAuthUser(null);
  };

  return (
    <AuthContext.Provider value={{ authUser, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used inside AuthProvider');
  return context;
}
