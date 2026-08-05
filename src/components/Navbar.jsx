import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useTenant, useUser } from '../context/TenantContext';
import { getDataSource } from '../services/dataSource';

export default function Navbar() {
  const tenantId = useTenant();
  const navigate = useNavigate();
  const location = useLocation();
  const { logout, user } = useUser();
  const [tenantName, setTenantName] = useState(tenantId);
  const [activeLink, setActiveLink] = useState('alunos');

  // Update activeLink based on current location
  useEffect(() => {
    const pathSegments = location.pathname.split('/').filter(Boolean);
    if (pathSegments.length >= 2) {
      const currentPath = pathSegments[1]; // Get the second segment (after tenantId)
      setActiveLink(currentPath);
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
    { path: 'alunos', label: 'Alunos', icon: '👥' },
    { path: 'turmas', label: 'Turmas', icon: '📚' },
    { path: 'porteiro', label: 'Porteiro', icon: '📞' },
    { path: 'display', label: 'Display', icon: '📺' },
    { path: 'configuracoes', label: 'Configurações', icon: '⚙️' },
  ];

  return (
    <header className="sticky top-0 z-50 w-full bg-white border-b border-gray-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4">
        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center justify-between h-20">
          {/* Left: Brand */}
          <div className="flex items-center gap-4 cursor-pointer" onClick={() => handleNavigate('alunos')}>
            <div className="text-3xl font-bold text-azul-principal">🎓</div>
            <div>
              <h1 className="text-lg font-bold text-azul-principal leading-tight">Chamada</h1>
              <p className="text-xs text-gray-500">{tenantName}</p>
            </div>
          </div>

          {/* Right: Navigation Links */}
          <nav className="flex gap-1 items-center">
            {navItems.map(item => (
              <button
                key={item.path}
                onClick={() => handleNavigate(item.path)}
                className={`px-4 py-2 text-sm font-medium rounded-lg transition ${
                  activeLink === item.path
                    ? 'text-azul-principal bg-azul-claro'
                    : 'text-gray-700 hover:text-azul-principal hover:bg-azul-claro'
                }`}
              >
                <span className="mr-1">{item.icon}</span>
                {item.label}
              </button>
            ))}
            
            {/* Logout Button */}
            <button
              onClick={handleLogout}
              className="ml-4 px-4 py-2 text-sm font-medium text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition"
              title={user?.name ? `Logout - ${user.name}` : 'Logout'}
            >
              🚪 Sair
            </button>
          </nav>
        </div>

        {/* Mobile Navigation */}
        <div className="md:hidden py-3">
          {/* Brand */}
          <div className="flex items-center gap-2 mb-4 cursor-pointer" onClick={() => handleNavigate('alunos')}>
            <div className="text-2xl">🎓</div>
            <div>
              <h1 className="text-base font-bold text-azul-principal leading-tight">Chamada</h1>
              <p className="text-xs text-gray-500">{tenantName}</p>
            </div>
          </div>

          {/* Mobile Menu */}
          <nav className="grid grid-cols-5 gap-1">
            {navItems.map(item => (
              <button
                key={item.path}
                onClick={() => handleNavigate(item.path)}
                className={`py-2 text-xs font-medium rounded-lg transition text-center ${
                  activeLink === item.path
                    ? 'text-azul-principal bg-azul-claro'
                    : 'text-gray-700 hover:text-azul-principal hover:bg-azul-claro'
                }`}
              >
                <div className="text-lg mb-1">{item.icon}</div>
                <div className="line-clamp-1">{item.label}</div>
              </button>
            ))}
          </nav>
          
          {/* Mobile Logout */}
          <button
            onClick={handleLogout}
            className="w-full mt-2 py-2 text-xs font-medium text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition"
          >
            🚪 Sair
          </button>
        </div>
      </div>
    </header>
  );
}
