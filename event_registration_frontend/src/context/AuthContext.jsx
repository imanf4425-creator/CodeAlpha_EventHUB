import { createContext, useContext, useState, useEffect } from 'react';
import api from '../api/axios';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // On mount: fetch fresh profile from DB using stored token
  useEffect(() => {
    const token = localStorage.getItem('access_token');
    if (token) {
      api.get('/auth/profile')
        .then(({ data }) => setUser(data))
        .catch(() => {
          localStorage.removeItem('access_token');
          localStorage.removeItem('refresh_token');
          setUser(null);
        })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  async function login(email, password) {
    // Clear any previous session first
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    setUser(null);

    const { data } = await api.post('/auth/login', { email, password });
    localStorage.setItem('access_token', data.tokens.access);
    localStorage.setItem('refresh_token', data.tokens.refresh);

    // Always get fresh profile from DB (not from JWT which may be stale)
    const profile = await api.get('/auth/profile');
    setUser(profile.data);
    return profile.data;
  }

  async function register(formData) {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    setUser(null);

    const { data } = await api.post('/auth/register', formData);
    localStorage.setItem('access_token', data.tokens.access);
    localStorage.setItem('refresh_token', data.tokens.refresh);
    setUser(data.user);
    return data.user;
  }

  function logout() {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    setUser(null);
  }

  function updateUser(updated) {
    setUser((prev) => ({ ...prev, ...updated }));
  }

  async function refreshUser() {
    try {
      const { data } = await api.get('/auth/profile');
      setUser(data);
    } catch { /* silent */ }
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, updateUser, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
