import React, { useState, useEffect } from 'react';
import { BookOpen } from 'lucide-react';
import { useTenant } from '../context/TenantContext';
import { getDataSource, isApiDataSource } from '../services/dataSource';
import Navbar from '../components/Navbar';

export default function Classes() {
  const tenantId = useTenant();
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({ nome: '' });
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const dataSource = getDataSource();
  const isUsingAPI = isApiDataSource();

  useEffect(() => {
    loadClasses();
  }, [tenantId]);

  const loadClasses = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await dataSource.getClasses(tenantId);
      setClasses(data || []);
    } catch (err) {
      console.error('[Classes] Error loading classes:', err);
      setError('Erro ao carregar turmas: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (classItem = null) => {
    if (classItem) {
      setEditingId(classItem.id);
      setFormData({ nome: classItem.nome });
    } else {
      setEditingId(null);
      setFormData({ nome: '' });
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingId(null);
    setFormData({ nome: '' });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setError(null);

      if (!formData.nome.trim()) {
        setError('Nome da turma é obrigatório');
        return;
      }

      if (editingId) {
        await dataSource.updateClass(tenantId, editingId, formData);
        setSuccess('Turma atualizada com sucesso!');
      } else {
        await dataSource.createClass(tenantId, formData);
        setSuccess('Turma criada com sucesso!');
      }

      setTimeout(() => setSuccess(null), 3000);
      handleCloseModal();
      loadClasses();
    } catch (err) {
      console.error('[Classes] Error submitting form:', err);
      setError('Erro ao salvar turma: ' + err.message);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Tem certeza que deseja deletar esta turma?')) {
      return;
    }

    try {
      setError(null);
      await dataSource.deleteClass(tenantId, id);
      setSuccess('Turma deletada com sucesso!');
      setTimeout(() => setSuccess(null), 3000);
      loadClasses();
    } catch (err) {
      console.error('[Classes] Error deleting class:', err);
      setError('Erro ao deletar turma: ' + err.message);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 py-12">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-12">
          <div>
            <h1 className="text-4xl font-bold text-azul-principal mb-2 flex items-center gap-3">
              <BookOpen className="w-10 h-10" />
              Gerenciar Turmas
            </h1>
            <p className="text-gray-600">Cadastre e organize as turmas da instituição</p>
          </div>
          {!isUsingAPI && (
            <button
              onClick={() => handleOpenModal()}
              className="mt-4 md:mt-0 bg-verde-principal hover:bg-verde-hover text-white px-6 py-3 rounded-lg font-bold transition"
            >
              + Adicionar Turma
            </button>
          )}
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
            <p className="mt-4">Carregando turmas...</p>
          </div>
        ) : classes.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm p-12 text-center border-l-4 border-azul-principal">
            <p className="text-gray-600 mb-4">Nenhuma turma cadastrada ainda.</p>
            <p className="text-gray-500">Clique no botão "Adicionar Turma" para começar.</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {classes.map((classItem) => (
              <div
                key={classItem.id}
                className="bg-white rounded-lg shadow-sm hover:shadow-md transition border-l-4 border-verde-secundaria p-6"
              >
                <h3 className="text-xl font-bold text-verde-secundaria mb-4">{classItem.nome}</h3>

                <div className="flex gap-3">
                  {!isUsingAPI && (
                    <>
                      <button
                        onClick={() => handleOpenModal(classItem)}
                        className="flex-1 px-4 py-2 bg-azul-principal hover:bg-azul-hover text-white rounded-lg font-medium text-sm transition"
                      >
                        Editar
                      </button>
                      <button
                        onClick={() => handleDelete(classItem.id)}
                        className="flex-1 px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg font-medium text-sm transition"
                      >
                        Deletar
                      </button>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="p-6">
              <h2 className="text-2xl font-bold text-azul-principal mb-6">
                {editingId ? 'Editar Turma' : 'Nova Turma'}
              </h2>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    Nome da Turma *
                  </label>
                  <input
                    type="text"
                    value={formData.nome}
                    onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                    placeholder="Ex: 5A"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-azul-principal focus:border-transparent"
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={handleCloseModal}
                    className="flex-1 px-4 py-3 bg-gray-300 hover:bg-gray-400 text-gray-800 rounded-lg font-bold transition"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-4 py-3 bg-verde-principal hover:bg-verde-hover text-white rounded-lg font-bold transition"
                  >
                    {editingId ? 'Atualizar' : 'Criar'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
