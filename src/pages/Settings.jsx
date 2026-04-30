import React, { useState, useEffect } from 'react';
import { useTenant } from '../context/TenantContext';
import { getDataSource } from '../services/dataSource';
import Navbar from '../components/Navbar';

const styles = {
  container: {
    minHeight: '100vh',
    backgroundColor: '#f5f5f5',
  },
  content: {
    maxWidth: '800px',
    margin: '0 auto',
    padding: '30px 20px',
  },
  title: {
    fontSize: '28px',
    fontWeight: '700',
    color: '#1a1a1a',
    marginBottom: '30px',
    margin: 0,
  },
  card: {
    backgroundColor: 'white',
    borderRadius: '8px',
    padding: '30px',
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
  },
  section: {
    marginBottom: '30px',
    paddingBottom: '30px',
    borderBottom: '1px solid #eee',
  },
  sectionTitle: {
    fontSize: '18px',
    fontWeight: '700',
    color: '#1a1a1a',
    marginBottom: '20px',
  },
  formGroup: {
    marginBottom: '20px',
  },
  label: {
    display: 'block',
    marginBottom: '8px',
    fontWeight: '600',
    color: '#333',
    fontSize: '14px',
  },
  input: {
    width: '100%',
    padding: '10px',
    border: '1px solid #ddd',
    borderRadius: '4px',
    fontSize: '14px',
    boxSizing: 'border-box',
  },
  toggleContainer: {
    display: 'flex',
    alignItems: 'center',
    gap: '15px',
    padding: '15px',
    backgroundColor: '#f9f9f9',
    borderRadius: '4px',
    marginBottom: '15px',
  },
  toggleSwitch: {
    width: '50px',
    height: '30px',
    backgroundColor: '#ddd',
    borderRadius: '15px',
    cursor: 'pointer',
    transition: 'background-color 0.3s',
    border: 'none',
    padding: 0,
    position: 'relative',
  },
  toggleLabel: {
    fontSize: '14px',
    fontWeight: '600',
    color: '#333',
    flex: 1,
  },
  buttonGroup: {
    display: 'flex',
    gap: '10px',
    justifyContent: 'flex-end',
    marginTop: '30px',
    paddingTop: '30px',
    borderTop: '1px solid #eee',
  },
  saveButton: {
    backgroundColor: '#28a745',
    color: 'white',
    border: 'none',
    padding: '12px 24px',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '16px',
    fontWeight: '600',
    transition: 'background-color 0.2s',
  },
  cancelButton: {
    backgroundColor: '#6c757d',
    color: 'white',
    border: 'none',
    padding: '12px 24px',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '16px',
    fontWeight: '600',
    transition: 'background-color 0.2s',
  },
  loader: {
    textAlign: 'center',
    padding: '40px',
    color: '#666',
  },
};

export default function Settings() {
  const tenantId = useTenant();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [settings, setSettings] = useState({
    id: 'general',
    name: tenantId,
    email: '',
    enablePorteiro: true,
    enableDispositivo: true,
  });

  const dataSource = getDataSource();

  // Load settings
  useEffect(() => {
    loadSettings();
  }, [tenantId]);

  const loadSettings = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await dataSource.getSettings(tenantId);
      setSettings(data || {
        id: 'general',
        name: tenantId,
        email: '',
        enablePorteiro: true,
        enableDispositivo: true,
      });
    } catch (err) {
      console.error('[Settings] Error loading settings:', err);
      setError('Erro ao carregar configurações: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      setError(null);

      if (!settings.name.trim()) {
        setError('Nome do tenant é obrigatório');
        setSaving(false);
        return;
      }

      await dataSource.updateSettings(tenantId, settings);
      setSuccess('Configurações salvas com sucesso!');
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      console.error('[Settings] Error saving settings:', err);
      setError('Erro ao salvar configurações: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    loadSettings();
    setError(null);
  };

  const toggleFeature = (feature) => {
    setSettings({
      ...settings,
      [feature]: !settings[feature],
    });
  };

  if (loading) {
    return (
      <div style={styles.container}>
        <Navbar />
        <div style={styles.content}>
          <div style={styles.loader}>Carregando configurações...</div>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <Navbar />
      <div style={styles.content}>
        <h1 style={styles.title}>⚙️ Configurações do Tenant</h1>

        <div style={styles.card}>
          {error && (
            <div style={{ backgroundColor: '#f8d7da', color: '#721c24', padding: '15px', borderRadius: '4px', marginBottom: '20px' }}>
              {error}
            </div>
          )}

          {success && (
            <div style={{ backgroundColor: '#d4edda', color: '#155724', padding: '15px', borderRadius: '4px', marginBottom: '20px' }}>
              {success}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            {/* Informações Gerais */}
            <div style={styles.section}>
              <h2 style={styles.sectionTitle}>Informações Gerais</h2>

              <div style={styles.formGroup}>
                <label style={styles.label}>Nome do Tenant *</label>
                <input
                  style={styles.input}
                  type="text"
                  value={settings.name}
                  onChange={(e) => setSettings({ ...settings, name: e.target.value })}
                  placeholder="Ex: Criança Inteligente"
                />
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>Email de Contato</label>
                <input
                  style={styles.input}
                  type="email"
                  value={settings.email}
                  onChange={(e) => setSettings({ ...settings, email: e.target.value })}
                  placeholder="Ex: contato@exemplo.com"
                />
              </div>
            </div>

            {/* Funcionalidades */}
            <div style={styles.section}>
              <h2 style={styles.sectionTitle}>Funcionalidades Ativadas</h2>

              <div style={styles.toggleContainer}>
                <label style={styles.toggleLabel}>📞 Sistema de Porteiro</label>
                <button
                  type="button"
                  style={{
                    ...styles.toggleSwitch,
                    backgroundColor: settings.enablePorteiro ? '#28a745' : '#ddd',
                  }}
                  onClick={() => toggleFeature('enablePorteiro')}
                >
                  <div
                    style={{
                      position: 'absolute',
                      width: '26px',
                      height: '26px',
                      backgroundColor: 'white',
                      borderRadius: '50%',
                      top: '2px',
                      left: settings.enablePorteiro ? '22px' : '2px',
                      transition: 'left 0.3s',
                    }}
                  />
                </button>
              </div>

              <div style={styles.toggleContainer}>
                <label style={styles.toggleLabel}>📺 Dispositivo de Exibição</label>
                <button
                  type="button"
                  style={{
                    ...styles.toggleSwitch,
                    backgroundColor: settings.enableDispositivo ? '#28a745' : '#ddd',
                  }}
                  onClick={() => toggleFeature('enableDispositivo')}
                >
                  <div
                    style={{
                      position: 'absolute',
                      width: '26px',
                      height: '26px',
                      backgroundColor: 'white',
                      borderRadius: '50%',
                      top: '2px',
                      left: settings.enableDispositivo ? '22px' : '2px',
                      transition: 'left 0.3s',
                    }}
                  />
                </button>
              </div>
            </div>

            {/* Botões de Ação */}
            <div style={styles.buttonGroup}>
              <button
                type="button"
                style={styles.cancelButton}
                onClick={handleCancel}
                disabled={saving}
                onMouseEnter={(e) => !saving && (e.currentTarget.style.backgroundColor = '#5a6268')}
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#6c757d')}
              >
                Cancelar
              </button>
              <button
                type="submit"
                style={styles.saveButton}
                disabled={saving}
                onMouseEnter={(e) => !saving && (e.currentTarget.style.backgroundColor = '#218838')}
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#28a745')}
              >
                {saving ? 'Salvando...' : 'Salvar Configurações'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
