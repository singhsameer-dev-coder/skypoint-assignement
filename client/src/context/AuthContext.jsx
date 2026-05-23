import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { login as apiLogin, getMe } from '../api/auth';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('jp_access'));
  const [loading, setLoading] = useState(true);

  const hydrateUser = useCallback(async () => {
    const storedToken = localStorage.getItem('jp_access');
    if (!storedToken) {
      setLoading(false);
      return;
    }
    try {
      const res = await getMe();
      setUser(res.data);
      localStorage.setItem('jp_user', JSON.stringify(res.data));
    } catch {
      localStorage.removeItem('jp_access');
      localStorage.removeItem('jp_user');
      setToken(null);
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    hydrateUser();
  }, [hydrateUser]);

  const login = async (email, password) => {
    const res = await apiLogin(email, password);
    const { access } = res.data;
    localStorage.setItem('jp_access', access);
    setToken(access);
    // Fetch full user profile
    const meRes = await getMe();
    setUser(meRes.data);
    localStorage.setItem('jp_user', JSON.stringify(meRes.data));
    return meRes.data;
  };

  const logout = () => {
    localStorage.removeItem('jp_access');
    localStorage.removeItem('jp_user');
    setToken(null);
    setUser(null);
  };

  const updateUser = (updatedUser) => {
    setUser(updatedUser);
    localStorage.setItem('jp_user', JSON.stringify(updatedUser));
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout, loading, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
