import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTenant } from '../context/TenantContext';
import { getDataSource } from '../services/dataSource';

const styles = {
  navbar: {
    backgroundColor: '#0066cc',
    color: 'white',
    padding: '0 20px',
    minHeight: '60px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
    position: 'sticky',
    top: 0,
    zIndex: 100,
  },
  left: {
    display: 'flex',
    alignItems: 'center',
    gap: '30px',
  },
  brand: {
    fontSize: '20px',
    fontWeight: '700',
    cursor: 'pointer',
  },
  tenantName: {
    fontSize: '14px',
    color: '#e0e0e0',
  },
  nav: {
    display: 'flex',
    gap: '20px',
    alignItems: 'center',
  },
  navLink: {
    color: 'white',
    textDecoration: 'none',
    padding: '10px 15px',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '500',
    transition: 'background-color 0.2s',
    border: 'none',
    background: 'transparent',
  },
  navLinkActive: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  navLinkHover: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
};

export default function Navbar() {
  const tenantId = useTenant();
  const navigate = useNavigate();
  const [tenantName, setTenantName] = useState(tenantId);
  const [activeLink, setActiveLink] = useState('alunos');

  useEffect(() => {
    // Load tenant settings to get the display name
    const loadTenantName = async () => {
      try {
        const dataSource = getDataSource();
        const settings = await dataSource.getSettings(tenantId);
        if (settings.name) {
          setTenantName(settings.name);
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

  return (
    <nav style={styles.navbar}>
      <div style={styles.left}>
        <div style={styles.brand} onClick={() => handleNavigate('alunos')}>
          🎓 Chamada
        </div>
        <div style={styles.tenantName}>{tenantName}</div>
      </div>

      <div style={styles.nav}>
        <button
          style={{
            ...styles.navLink,
            ...(activeLink === 'alunos' ? styles.navLinkActive : {}),
          }}
          onClick={() => handleNavigate('alunos')}
          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.1)'}
          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = activeLink === 'alunos' ? 'rgba(255, 255, 255, 0.2)' : 'transparent'}
        >
          👥 Alunos
        </button>

        <button
          style={{
            ...styles.navLink,
            ...(activeLink === 'turmas' ? styles.navLinkActive : {}),
          }}
          onClick={() => handleNavigate('turmas')}
          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.1)'}
          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = activeLink === 'turmas' ? 'rgba(255, 255, 255, 0.2)' : 'transparent'}
        >
          📚 Turmas
        </button>

        <button
          style={{
            ...styles.navLink,
            ...(activeLink === 'porteiro' ? styles.navLinkActive : {}),
          }}
          onClick={() => handleNavigate('porteiro')}
          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.1)'}
          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = activeLink === 'porteiro' ? 'rgba(255, 255, 255, 0.2)' : 'transparent'}
        >
          📞 Porteiro
        </button>

        <button
          style={{
            ...styles.navLink,
            ...(activeLink === 'dispositivo' ? styles.navLinkActive : {}),
          }}
          onClick={() => handleNavigate('dispositivo')}
          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.1)'}
          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = activeLink === 'dispositivo' ? 'rgba(255, 255, 255, 0.2)' : 'transparent'}
        >
          📺 Display
        </button>

        <button
          style={{
            ...styles.navLink,
            ...(activeLink === 'configuracoes' ? styles.navLinkActive : {}),
          }}
          onClick={() => handleNavigate('configuracoes')}
          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.1)'}
          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = activeLink === 'configuracoes' ? 'rgba(255, 255, 255, 0.2)' : 'transparent'}
        >
          ⚙️ Configurações
        </button>
      </div>
    </nav>
  );
}
