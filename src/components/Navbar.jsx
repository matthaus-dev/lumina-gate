import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { BookOpen, DoorOpen, GraduationCap, Monitor, Phone, Settings, Users } from 'lucide-react';
import { useTenant, useUser } from '../context/TenantContext';
import { getDataSource } from '../services/dataSource';

export default function Navbar() {
  const tenantId = useTenant();
  const navigate = useNavigate();
  const location = useLocation();
  const { logout, user } = useUser();
  const [tenantName, setTenantName] = useState(tenantId);
  const [activeLink, setActiveLink] = useState('alunos');

  useEffect(() => {
    const pathSegments = location.pathname.split('/').filter(Boolean);
    if (pathSegments.length >= 2) {
      setActiveLink(pathSegments[1]);
    }
  }, [location.pathname]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  useEffect(() => {
    const loadTenantName = async () => {
      try {
        const dataSource = getDataSource();
        const settings = await dataSource.getSettings(tenantId);
        if (settings?.nome || settings?.name) {
          setTenantName(settings.nome || settings.name);
        }
      } catch (error) {
        console.error('[Navbar] Error loading tenant settings:', error);
      }
    };

    loadTenantName();
  }, [tenantId]);

  const handleNavigate = (path) => {
    setActiveLink(path);
    navigate(`/${tenantId}/${path}`);
  };

  const navItems = [
    { path: 'alunos', label: 'Alunos', icon: Users },
    { path: 'turmas', label: 'Turmas', icon: BookOpen },
    { path: 'porteiro', label: 'Porteiro', icon: Phone },
    { path: 'display', label: 'Display', icon: Monitor },
    { path: 'configuracoes', label: 'Configuracoes', icon: Settings },
  ];

  return (
    <header className="sticky top-0 z-50 w-full bg-white border-b border-gray-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4">
        <div className="hidden md:flex items-center justify-between h-20">
          <div className="flex items-center gap-4 cursor-pointer" onClick={() => handleNavigate('alunos')}>
            <GraduationCap className="w-8 h-8 text-azul-principal" />
            <div>
              <h1 className="text-lg font-bold text-azul-principal leading-tight">Chamada</h1>
              <p className="text-xs text-gray-500">{tenantName}</p>
            </div>
          </div>

          <nav className="flex gap-1 items-center">
            {navItems.map(item => {
              const Icon = item.icon;
              return (
                <button
                  key={item.path}
                  onClick={() => handleNavigate(item.path)}
                  className={`px-4 py-2 text-sm font-medium rounded-lg transition inline-flex items-center gap-2 ${
                    activeLink === item.path
                      ? 'text-azul-principal bg-azul-claro'
                      : 'text-gray-700 hover:text-azul-principal hover:bg-azul-claro'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {item.label}
                </button>
              );
            })}

            <button
              onClick={handleLogout}
              className="ml-4 px-4 py-2 text-sm font-medium text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition inline-flex items-center gap-2"
              title={user?.name ? `Logout - ${user.name}` : 'Logout'}
            >
              <DoorOpen className="w-4 h-4" />
              Sair
            </button>
          </nav>
        </div>

        <div className="md:hidden py-3">
          <div className="flex items-center gap-2 mb-4 cursor-pointer" onClick={() => handleNavigate('alunos')}>
            <GraduationCap className="w-7 h-7 text-azul-principal" />
            <div>
              <h1 className="text-base font-bold text-azul-principal leading-tight">Chamada</h1>
              <p className="text-xs text-gray-500">{tenantName}</p>
            </div>
          </div>

          <nav className="grid grid-cols-5 gap-1">
            {navItems.map(item => {
              const Icon = item.icon;
              return (
                <button
                  key={item.path}
                  onClick={() => handleNavigate(item.path)}
                  className={`py-2 text-xs font-medium rounded-lg transition text-center flex flex-col items-center ${
                    activeLink === item.path
                      ? 'text-azul-principal bg-azul-claro'
                      : 'text-gray-700 hover:text-azul-principal hover:bg-azul-claro'
                  }`}
                >
                  <Icon className="w-5 h-5 mb-1" />
                  <div className="line-clamp-1">{item.label}</div>
                </button>
              );
            })}
          </nav>

          <button
            onClick={handleLogout}
            className="w-full mt-2 py-2 text-xs font-medium text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition inline-flex items-center justify-center gap-2"
          >
            <DoorOpen className="w-4 h-4" />
            Sair
          </button>
        </div>
      </div>
    </header>
  );
}
