import React from 'react';
import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface AuthState {
  isAuthenticated: boolean;
  token: string | null;
  phone: string | null;
  sessionId: string | null;
  setAuth: (token: string, phone: string) => Promise<void>;
  setToken: (token: string) => Promise<void>;
  setPhone: (phone: string) => void;
  setSessionId: (sessionId: string) => void;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  isAuthenticated: false,
  token: null,
  phone: null,
  sessionId: null,
  
  setAuth: async (token: string, phone: string) => {
    await AsyncStorage.setItem('token', token);
    await AsyncStorage.setItem('phone', phone);
    set({ isAuthenticated: true, token, phone });
  },
  
  setToken: async (token: string) => {
    await AsyncStorage.setItem('token', token);
    set({ token, isAuthenticated: true });
  },
  
  setPhone: (phone: string) => {
    set({ phone });
  },
  
  setSessionId: (sessionId: string) => {
    set({ sessionId });
  },
  
  logout: async () => {
    console.log('=== LOGOUT CALLED ===');
    try {
      await AsyncStorage.removeItem('token');
      await AsyncStorage.removeItem('phone');
      console.log('AsyncStorage cleared');
      set({ isAuthenticated: false, token: null, phone: null, sessionId: null });
      console.log('Auth state reset');
    } catch (error) {
      console.error('Logout error:', error);
    }
  },
  
  checkAuth: async () => {
    const token = await AsyncStorage.getItem('token');
    const phone = await AsyncStorage.getItem('phone');
    if (token && phone) {
      set({ isAuthenticated: true, token, phone });
    } else {
      set({ isAuthenticated: false, token: null, phone: null });
    }
  },
}));
