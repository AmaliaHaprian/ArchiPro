import React, { useState, useEffect } from 'react';
import type { User } from '../models/User';
import { AuthContext } from './AuthContext';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const safeParseUser = (): User | null => {
    try {
      const raw = localStorage.getItem('authUser');
      if (!raw || raw === 'undefined') return null;
      return JSON.parse(raw) as User;
    } catch (err) {
      console.warn('Failed to parse stored authUser, clearing it.', err);
      localStorage.removeItem('authUser');
      return null;
    }
  };

  const [user, setUser] = useState<User | null>(safeParseUser());
  const [token, setToken] = useState<string | null>(localStorage.getItem('authToken') ?? null);
    const IDLE_TIMEOUT_MS = 15 * 60 * 1000;

    const login = (token: string, user: User) => {
      console.log('AuthProvider.login called', { token, user });
      setToken(token);
      setUser(user);
      localStorage.setItem('authToken', token);
      localStorage.setItem('authUser', JSON.stringify(user));
    };

    const logout = () => {
      console.log('AuthProvider.logout called');
      setToken(null);
      setUser(null);
      localStorage.removeItem('token');
      localStorage.removeItem('authToken');
      localStorage.removeItem('user');
      localStorage.removeItem('authUser');
    };

useEffect(() => {
  let timeoutId: number | undefined;

  const resetTimer = () => {
    if (timeoutId) window.clearTimeout(timeoutId);
    timeoutId = window.setTimeout(() => {
      logout();
    }, IDLE_TIMEOUT_MS);
  };

  const events = ['mousemove', 'keydown', 'click', 'scroll', 'touchstart'];

  events.forEach((event) => window.addEventListener(event, resetTimer));
  resetTimer();

  return () => {
    if (timeoutId) window.clearTimeout(timeoutId);
    events.forEach((event) => window.removeEventListener(event, resetTimer));
  };
}, [logout]);
    return (
        <AuthContext.Provider value={{ user, token, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
}