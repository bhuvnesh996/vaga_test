import React, { createContext, useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const navigate = useNavigate();

  // Set auth token
  const setAuthToken = (token) => {
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      localStorage.setItem('token', token);
    } else {
      delete axios.defaults.headers.common['Authorization'];
      localStorage.removeItem('token');
    }
  };

  // Load user
  const loadUser = async () => {
    try {
      const res = await axios.get('/api/auth/user');
      setUser(res.data);
    } catch (err) {
      console.error(err.response?.data?.message || err.message);
      logout();
    }
  };

  // Register user
  const register = async (formData) => {
    try {
      const res = await axios.post('/api/auth/signup', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      setAuthToken(res.data.token);
      await loadUser();
      navigate('/dashboard');
    } catch (err) {
      console.error(err.response?.data?.message || err.message);
      throw err;
    }
  };

  // Login user
  const login = async (formData) => {
    try {
      const res = await axios.post('/api/auth/login', formData);
      setAuthToken(res.data.token);
      setUser(res.data.user);
      navigate('/dashboard');
    } catch (err) {
      console.error(err.response?.data?.message || err.message);
      throw err;
    }
  };

  // Logout
  const logout = () => {
    setAuthToken(null);
    setUser(null);
    navigate('/login');
  };

  useEffect(() => {
    if (token) {
      setAuthToken(token);
      loadUser();
    }
  }, [token]);

  return (
    <AuthContext.Provider value={{ user, token, register, login, logout, loadUser }}>
      {children}
    </AuthContext.Provider>
  );
};
// 3. Export the useAuth hook
export const useAuth = () => {
  return useContext(AuthContext);
};