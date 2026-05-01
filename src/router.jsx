import React from 'react';
import { createBrowserRouter, Navigate, useParams, Outlet } from 'react-router-dom';
import { TenantProvider } from './context/TenantContext';
import Porteiro from './Porteiro';
import Dispositivo from './Dispositivo';

/**
 * Layout that extracts tenantId from URL and provides via TenantProvider
 */
function TenantLayout() {
  const { tenantId } = useParams();
  
  if (!tenantId) {
    return <Navigate to="/crianca-inteligente" replace />;
  }

  return (
    <TenantProvider tenantId={tenantId}>
      <Outlet />
    </TenantProvider>
  );
}

export const router = createBrowserRouter([
  {
    path: '/',
    element: <Navigate to="/crianca-inteligente" replace />,
  },
  {
    path: '/:tenantId',
    element: <TenantLayout />,
    children: [
      {
        index: true,
        element: <Navigate to="alunos" replace />,
      },
      {
        path: 'alunos',
        lazy: () => import('./pages/Students').then(m => ({ Component: m.default })),
      },
      {
        path: 'turmas',
        lazy: () => import('./pages/Classes').then(m => ({ Component: m.default })),
      },
      {
        path: 'porteiro',
        lazy: () => import('./Porteiro').then(m => ({ Component: m.default })),
      },
      {
        path: 'display',
        lazy: () => import('./Dispositivo').then(m => ({ Component: m.default })),
      },
      {
        path: 'configuracoes',
        lazy: () => import('./pages/Settings').then(m => ({ Component: m.default })),
      },
    ],
  },
]);
