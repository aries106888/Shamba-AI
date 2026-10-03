import React, { createContext, useContext, useState, useEffect } from 'react';
import { authAPI } from '../api/client';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser]       = useState(() => JSON.parse(localStorage.getItem('sp_user') || 'null'));
  const [token, setToken]     = useState(() => localStorage.getItem('sp_token') || null);
  const [loading, setLoading] = useState(false);

  const login = async (phone, password) => {
    setLoading(true);
    try {
      const res = await authAPI.login({ phone, password });
      localStorage.setItem('sp_token', res.data.token);
      localStorage.setItem('sp_user', JSON.stringify(res.data.user));
      setToken(res.data.token);
      setUser(res.data.user);
      return { ok: true, role: res.data.user.role };
    } catch (err) {
      return { ok: false, error: err.response?.data?.error || 'Login failed' };
    } finally {
      setLoading(false);
    }
  };

  const register = async (data) => {
    setLoading(true);
    try {
      const res = await authAPI.register(data);
      localStorage.setItem('sp_token', res.data.token);
      localStorage.setItem('sp_user', JSON.stringify(res.data.user));
      setToken(res.data.token);
      setUser(res.data.user);
      return { ok: true, role: res.data.user.role };
    } catch (err) {
      return { ok: false, error: err.response?.data?.error || 'Registration failed' };
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('sp_token');
    localStorage.removeItem('sp_user');
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, logout, isAuth: !!token }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
