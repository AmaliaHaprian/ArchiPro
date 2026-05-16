import React, { useState, useEffect } from 'react';
import type { User } from '../models/User';
import { AuthContext } from './AuthContext';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(localStorage.getItem('authUser') ? JSON.parse(localStorage.getItem('authUser') as string) : null);
    const [token, setToken] = useState<string | null>(localStorage.getItem('authToken') ? localStorage.getItem('authToken') : null);
    const IDLE_TIMEOUT_MS = 15 * 60 * 1000;

    const login = (token: string, user: User) => {
        setToken(token);
        setUser(user);
        localStorage.setItem('authToken', token);
        localStorage.setItem('authUser', JSON.stringify(user));
    };

    const logout = () => {
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