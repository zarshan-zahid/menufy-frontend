import React, { createContext, useContext, useState, useEffect } from 'react';
import { api, getAuthToken, setAuthToken } from '../utils/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [restaurant, setRestaurant] = useState(null);
  const [loading, setLoading] = useState(true);

  // Initialize auth state from local token
  useEffect(() => {
    const initAuth = async () => {
      const token = getAuthToken();
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const res = await api.get('/auth/me');
        if (res.success && res.user) {
          setUser(res.user);
          // Fetch associated restaurant
          await fetchUserRestaurant();
        } else {
          setAuthToken(null);
        }
      } catch (err) {
        console.warn('Session expired or invalid:', err.message);
        setAuthToken(null);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    initAuth();
  }, []);

  const fetchUserRestaurant = async () => {
    try {
      const res = await api.get('/restaurants/my-restaurant');
      if (res.success && res.restaurant) {
        setRestaurant(res.restaurant);
        return res.restaurant;
      }
    } catch (err) {
      // It's possible the user has not created a restaurant yet
      setRestaurant(null);
    }
    return null;
  };

  const login = async (email, password) => {
    const res = await api.post('/auth/login', { email, password });
    if (res.success && res.token) {
      setAuthToken(res.token);
      setUser(res.user);
      await fetchUserRestaurant();
      return res;
    }
    throw new Error(res.message || 'Login failed');
  };

  const register = async (userData) => {
    const res = await api.post('/auth/register', userData);
    if (res.success && res.token) {
      setAuthToken(res.token);
      setUser(res.user);
      await fetchUserRestaurant();
      return res;
    }
    throw new Error(res.message || 'Registration failed');
  };

  const registerPartner = async (partnerData) => {
    const res = await api.post('/auth/register-partner', partnerData);
    if (res.success && res.token) {
      setAuthToken(res.token);
      setUser(res.user);
      if (res.restaurant) {
        setRestaurant(res.restaurant);
      } else {
        await fetchUserRestaurant();
      }
      return res;
    }
    throw new Error(res.message || 'Partner registration failed');
  };

  const logout = () => {
    setAuthToken(null);
    setUser(null);
    setRestaurant(null);
  };

  const refreshRestaurant = async () => {
    return await fetchUserRestaurant();
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        restaurant,
        setRestaurant,
        loading,
        login,
        register,
        registerPartner,
        logout,
        refreshRestaurant,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
