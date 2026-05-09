import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [authUser, setAuthUser] = useState(undefined); // undefined = loading, null = logged out
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // On app launch, check if auth_user exists in storage
    const loadAuth = async () => {
      try {
        const stored = await AsyncStorage.getItem('auth_user');
        if (stored) {
          setAuthUser(JSON.parse(stored));
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
    await AsyncStorage.setItem('auth_user', JSON.stringify(userData));
    setAuthUser(userData);
  };

  const logout = async () => {
    await AsyncStorage.removeItem('auth_user');
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
