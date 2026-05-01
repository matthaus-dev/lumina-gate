import React from 'react';
import { createBrowserRouter, Navigate, useParams, Outlet, useNavigate } from 'react-router-dom';
import { TenantProvider } from './context/TenantContext';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';

/**
 * Layout that checks authentication and extracts tenantId from URL
 */
function ProtectedTenantLayout() {
  const { tenantId } = useParams();
  const navigate = useNavigate();
  const [isAuthenticated, setIsAuthenticated] = React.useState(() => {
    const tenant = localStorage.getItem('tenant');
    const user = localStorage.getItem('user');
    
    if (tenant && user) {
      const tenantData = JSON.parse(tenant);
      return tenantData.slug === tenantId;
    }
    return false;
  });

  React.useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  if (!isAuthenticated) {
    return null; // Will redirect via navigate
  }

  return (
    <TenantProvider tenantId={tenantId}>
      <Outlet />
    </TenantProvider>
  );
}

export const router = createBrowserRouter([
  {
    path: '/login',
    element: <Login />,
  },
  {
    path: '/',
    element: <Navigate to="/login" replace />,
  },
  {
    path: '/:tenantId',
    element: <ProtectedTenantLayout />,
    children: [
      {
        index: true,
        element: <Dashboard />,
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
