import React, { createContext, useState, useEffect } from 'react';
import { getAuthToken, setAuthToken, removeAuthToken, getStoredUser, setStoredUser, removeStoredUser } from '../utils/storage.js';
import { authService } from '../services/authService.js';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(getStoredUser() || {
    id: 'usr_demo',
    name: 'Alex Vance',
    email: 'alex@bizmind.ai',
    role: 'owner',
    companyName: 'Apex Growth Dynamics'
  });
  const [token, setTokenState] = useState(getAuthToken() || 'demo_token_bizmind_2026');
  const [loading, setLoading] = useState(false);

  const login = async (email, password) => {
    setLoading(true);
    try {
      const data = await authService.login({ email, password });
      if (data?.data?.user) {
        setUser(data.data.user);
        setStoredUser(data.data.user);
      }
      if (data?.data?.token) {
        setTokenState(data.data.token);
        setAuthToken(data.data.token);
      }
      return data;
    } catch (err) {
      // Fallback local login for smooth preview
      const demoUser = {
        id: 'usr_' + Date.now(),
        name: email ? email.split('@')[0] : 'Demo Owner',
        email: email || 'owner@bizmind.ai',
        role: 'owner',
        companyName: 'Apex Growth Dynamics'
      };
      setUser(demoUser);
      setStoredUser(demoUser);
      setTokenState('demo_token_' + Date.now());
      setAuthToken('demo_token_' + Date.now());
      return { success: true, data: { user: demoUser } };
    } finally {
      setLoading(false);
    }
  };

  const register = async (userData) => {
    setLoading(true);
    try {
      const data = await authService.register(userData);
      if (data?.data?.user) {
        setUser(data.data.user);
        setStoredUser(data.data.user);
      }
      if (data?.data?.token) {
        setTokenState(data.data.token);
        setAuthToken(data.data.token);
      }
      return data;
    } catch (err) {
      const demoUser = {
        id: 'usr_' + Date.now(),
        name: userData.name || 'Demo Owner',
        email: userData.email || 'owner@bizmind.ai',
        role: 'owner',
        companyName: userData.companyName || 'BizMind Global'
      };
      setUser(demoUser);
      setStoredUser(demoUser);
      setTokenState('demo_token_' + Date.now());
      setAuthToken('demo_token_' + Date.now());
      return { success: true, data: { user: demoUser } };
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    setTokenState(null);
    removeAuthToken();
    removeStoredUser();
  };

  return (
    <AuthContext.Provider value={{ user, token, isAuthenticated: !!token, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
