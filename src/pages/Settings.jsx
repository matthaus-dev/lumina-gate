import React, { useState, useEffect } from 'react';
import { useTenant } from '../context/TenantContext';
import { getDataSource, isApiDataSource } from '../services/dataSource';
import Navbar from '../components/Navbar';

export default function Settings() {
  const tenantId = useTenant();
  const [formData, setFormData] = useState({ nome: '', email: '', features: {} });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [saveLoading, setSaveLoading] = useState(false);

  const dataSource = getDataSource();
  const isUsingAPI = isApiDataSource();

  useEffect(() => {
    loadSettings();
  }, [tenantId]);

  const loadSettings = async () => {
    try {
      setLoading(true);
      setError(null);
      const settings = await dataSource.getSettings(tenantId);
      setFormData({
        nome: settings?.nome || tenantId,
        email: settings?.email || '',
        features: settings?.features || { porteiro: false, display: false },
      });
    } catch (err) {
      console.error('[Settings] Error loading settings:', err);
      setError('Erro ao carregar configurações: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleFeatureToggle = (featureName) => {
    setFormData(prev => ({
      ...prev,
      features: {
        ...prev.features,
        [featureName]: !prev.features[featureName],
      },
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setSaveLoading(true);
      setError(null);

      if (!formData.nome.trim()) {
        setError('Nome do tenant é obrigatório');
        return;
      }

      await dataSource.updateSettings(tenantId, formData);
      setSuccess('Configurações salvas com sucesso!');
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      console.error('[Settings] Error saving settings:', err);
      setError('Erro ao salvar configurações: ' + err.message);
    } finally {
      setSaveLoading(false);
    }
  };

  const handleCancel = async () => {
    loadSettings();
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-4xl mx-auto px-4 py-12">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-4xl font-bold text-azul-principal mb-2">⚙️ Configurações</h1>
          <p className="text-gray-600">Gerencie as configurações da sua instituição</p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-100 border-l-4 border-red-500 text-red-700 rounded-lg">
            {error}
          </div>
        )}

        {/* Success Message */}
        {success && (
          <div className="mb-6 p-4 bg-verde-claro border-l-4 border-verde-principal text-verde-secundaria rounded-lg">
            {success}
          </div>
        )}

        {/* Content */}
        {loading ? (
          <div className="text-center py-12 text-gray-600">
            <div className="inline-block animate-spin">
              <div className="border-4 border-gray-300 border-t-azul-principal rounded-full w-12 h-12"></div>
            </div>
            <p className="mt-4">Carregando configurações...</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-sm p-8">
            {/* Nome do Tenant */}
            <div className="mb-8">
              <label className="block text-sm font-bold text-gray-700 mb-3">
                Nome do Tenant
              </label>
              <input
                type="text"
                value={formData.nome}
                onChange={(e) => handleInputChange('nome', e.target.value)}
                disabled={isUsingAPI}
                placeholder="Nome do tenant"
                className={`w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-azul-principal focus:border-transparent ${
                  isUsingAPI ? 'bg-gray-100 cursor-not-allowed' : ''
                }`}
              />
              <p className="text-xs text-gray-500 mt-2">Identificador único da instituição</p>
            </div>

            {/* Email */}
            <div className="mb-8">
              <label className="block text-sm font-bold text-gray-700 mb-3">
                Email de Contato
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                disabled={isUsingAPI}
                placeholder="email@exemplo.com"
                className={`w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-azul-principal focus:border-transparent ${
                  isUsingAPI ? 'bg-gray-100 cursor-not-allowed' : ''
                }`}
              />
              <p className="text-xs text-gray-500 mt-2">Email para contato e notificações</p>
            </div>

            {/* Features */}
            <div className="mb-12 pb-8 border-b border-gray-200">
              <h3 className="text-lg font-bold text-gray-900 mb-6">Funcionalidades</h3>

              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition">
                  <div>
                    <p className="font-medium text-gray-900">Sistema de Porteiro</p>
                    <p className="text-xs text-gray-600 mt-1">Permite chamadas de alunos via porteiro</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.features.porteiro || false}
                      onChange={() => handleFeatureToggle('porteiro')}
                      disabled={isUsingAPI}
                      className="sr-only peer"
                    />
                    <div className={`w-11 h-6 bg-gray-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-azul-claro rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-azul-principal ${
                      isUsingAPI ? 'cursor-not-allowed opacity-50' : ''
                    }`}></div>
                  </label>
                </div>

                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition">
                  <div>
                    <p className="font-medium text-gray-900">Dispositivo de Exibição</p>
                    <p className="text-xs text-gray-600 mt-1">Display para visualizar fila de chamadas</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.features.display || false}
                      onChange={() => handleFeatureToggle('display')}
                      disabled={isUsingAPI}
                      className="sr-only peer"
                    />
                    <div className={`w-11 h-6 bg-gray-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-azul-claro rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-azul-principal ${
                      isUsingAPI ? 'cursor-not-allowed opacity-50' : ''
                    }`}></div>
                  </label>
                </div>
              </div>
            </div>

            {/* Buttons */}
            <div className="flex gap-4 justify-end">
              {!isUsingAPI && (
                <>
                  <button
                    type="button"
                    onClick={handleCancel}
                    disabled={saveLoading}
                    className="px-6 py-3 bg-gray-300 hover:bg-gray-400 text-gray-800 rounded-lg font-bold transition disabled:opacity-50"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={saveLoading}
                    className="px-6 py-3 bg-verde-principal hover:bg-verde-hover text-white rounded-lg font-bold transition disabled:opacity-50"
                  >
                    {saveLoading ? 'Salvando...' : 'Salvar Configurações'}
                  </button>
                </>
              )}
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
