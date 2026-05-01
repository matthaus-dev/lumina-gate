import React, { createContext, useContext, useState, useEffect } from 'react';

const TenantContext = createContext(null);

export function TenantProvider({ children, tenantId }) {
  const [dataSource, setDataSourceState] = useState(() => {
    // Initialize from localStorage, then env vars
    const stored = localStorage.getItem('dataSource');
    return stored || (import.meta.env.VITE_DATA_SOURCE || 'firestore');
  });

  const [apiUrl, setApiUrlState] = useState(() => {
    // Initialize from localStorage, then env vars
    const stored = localStorage.getItem('apiUrl');
    return stored || (import.meta.env.VITE_API_URL || 'http://localhost:3000/api');
  });

  const [user, setUserState] = useState(() => {
    const stored = localStorage.getItem('user');
    return stored ? JSON.parse(stored) : null;
  });

  // Persist to localStorage when values change
  useEffect(() => {
    localStorage.setItem('dataSource', dataSource);
  }, [dataSource]);

  useEffect(() => {
    localStorage.setItem('apiUrl', apiUrl);
  }, [apiUrl]);

  useEffect(() => {
    if (user) {
      localStorage.setItem('user', JSON.stringify(user));
    }
  }, [user]);

  const setDataSource = (type, baseUrl) => {
    setDataSourceState(type);
    if (baseUrl) {
      setApiUrlState(baseUrl);
    }
  };

  const setApiUrl = (url) => {
    setApiUrlState(url);
  };

  const setUser = (userData) => {
    setUserState(userData);
  };

  const logout = () => {
    setUserState(null);
    localStorage.removeItem('user');
    localStorage.removeItem('tenant');
  };

  return (
    <TenantContext.Provider
      value={{
        tenantId,
        dataSource,
        apiUrl,
        setDataSource,
        setApiUrl,
        user,
        setUser,
        logout,
      }}
    >
      {children}
    </TenantContext.Provider>
  );
}

export function useTenant() {
  const context = useContext(TenantContext);
  if (!context) {
    throw new Error('useTenant deve ser usado dentro de TenantProvider');
  }
  return context.tenantId;
}

export function useDataSourceConfig() {
  const context = useContext(TenantContext);
  if (!context) {
    throw new Error('useDataSourceConfig deve ser usado dentro de TenantProvider');
  }
  return {
    dataSource: context.dataSource,
    apiUrl: context.apiUrl,
    setDataSource: context.setDataSource,
    setApiUrl: context.setApiUrl,
  };
}

export function useUser() {
  const context = useContext(TenantContext);
  // Return default values if not in TenantProvider
  if (!context) {
    return {
      user: null,
      setUser: () => {},
      logout: () => {},
    };
  }
  return {
    user: context.user,
    setUser: context.setUser,
    logout: context.logout,
  };
}
