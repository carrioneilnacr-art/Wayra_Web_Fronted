import React, { createContext, useState, useEffect, useMemo } from 'react';
import PropTypes from 'prop-types';
import wayraApi from '../api/wayraApi';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuth, setIsAuth] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Validar si existe sesión previa persistida
    const token = localStorage.getItem('wayra_token');
    const userData = localStorage.getItem('wayra_user');

    if (token && userData) {
      setUser(JSON.parse(userData));
      setIsAuth(true);
      // Configurar el token por defecto en Axios
      wayraApi.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    }
    setLoading(false);
  }, []);

  const login = (userData, token) => {
    setUser(userData);
    setIsAuth(true);
    localStorage.setItem('wayra_token', token);
    localStorage.setItem('wayra_user', JSON.stringify(userData));
    wayraApi.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  };

  const logout = () => {
    setUser(null);
    setIsAuth(false);
    localStorage.removeItem('wayra_token');
    localStorage.removeItem('wayra_user');
    delete wayraApi.defaults.headers.common['Authorization'];
  };

  const contextValue = useMemo(() => ({
    user, isAuth, login, logout
  }), [user, isAuth]);

  if (loading) {
    return (
      <div className="h-screen w-screen flex flex-col items-center justify-center bg-slate-50">
        <div className="w-8 h-8 border-4 border-slate-900 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-[10px] font-black tracking-[0.4em] uppercase text-slate-400 mt-4 animate-pulse">Sincronizando Wayra...</p>
      </div>
    );
  }

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

AuthProvider.propTypes = {
  children: PropTypes.node.isRequired,
};