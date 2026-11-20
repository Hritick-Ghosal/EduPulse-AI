import { useState, useEffect, useCallback } from 'react';
import { api } from '../api/client';
import { AuthContext } from './authContextDef';

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem('teacher_token') || '');
  const [teacher, setTeacher] = useState(() => {
    try {
      const saved = localStorage.getItem('teacher_info');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });
  const [loading, setLoading] = useState(false);

  const logout = useCallback(async () => {
    if (token) {
      try {
        await api.logout();
      } catch {
        // Ignore network / logout errors
      }
    }
    localStorage.removeItem('teacher_token');
    localStorage.removeItem('teacher_info');
    setToken('');
    setTeacher(null);
  }, [token]);

  useEffect(() => {
    const handleUnauthorized = () => {
      setToken('');
      setTeacher(null);
    };

    window.addEventListener('teacher:unauthorized', handleUnauthorized);
    return () => window.removeEventListener('teacher:unauthorized', handleUnauthorized);
  }, []);

  const login = async (username, password) => {
    setLoading(true);
    try {
      const data = await api.login(username, password);
      localStorage.setItem('teacher_token', data.token);
      localStorage.setItem('teacher_info', JSON.stringify(data.teacher));
      setToken(data.token);
      setTeacher(data.teacher);
      return data;
    } finally {
      setLoading(false);
    }
  };

  const value = {
    token,
    teacher,
    isAuthenticated: Boolean(token),
    loading,
    login,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export default AuthProvider;
