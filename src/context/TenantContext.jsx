import React, { createContext, useContext } from 'react';

const TenantContext = createContext(null);

export function TenantProvider({ children, tenantId }) {
  return (
    <TenantContext.Provider value={{ tenantId }}>
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
