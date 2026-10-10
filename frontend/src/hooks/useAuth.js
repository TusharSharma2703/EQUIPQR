import { useState, useEffect } from 'react';
import { apiService } from '../services/api';

export const useAuth = () => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [loading, setLoading] = useState(true);

 

  const fetchUserProfile = async () => {
    try {
      const data = await apiService.getUserProfile(token);
      setUser(data);
    } catch (err) {
      console.error(err);
      logout();
    } finally {
      setLoading(false);
    }
  };

   useEffect(() => {
    if (token && !user) {
      fetchUserProfile();
    } else {
      setLoading(false);
    }
  }, [token]);

  const login = async (email, password) => {
    const data = await apiService.login(email, password);
    if (data.token) {
      setToken(data.token);
      localStorage.setItem('token', data.token);
      setUser(data);
      return { success: true };
    }
    return { success: false, message: data.message };
  };

  const register = async (name, email, password) => {
    const data = await apiService.register(name, email, password);
    if (data.token) {
      setToken(data.token);
      localStorage.setItem('token', data.token);
      setUser(data);
      return { success: true };
    }
    return { success: false, message: data.message };
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('token');
  };

  return { user, token, loading, login, register, logout };
};