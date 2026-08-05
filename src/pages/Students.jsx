import React, { useState, useEffect } from 'react';
import { useTenant } from '../context/TenantContext';
import { getDataSource, isApiDataSource } from '../services/dataSource';
import Navbar from '../components/Navbar';

export default function Students() {
  const tenantId = useTenant();
  const [students, setStudents] = useState([]);
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({ nome: '', turmaId: '' });
  const [nameFilter, setNameFilter] = useState('');
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const dataSource = getDataSource();
  const isUsingAPI = isApiDataSource();

  const getStudentClassName = (student) => {
    return student.turmaName || (student.turmaId ? classes.find(c => c.id === student.turmaId)?.nome || '-' : '-');
  };

  const filteredStudents = students.filter((student) => {
    const studentName = (student.nome || '').toLowerCase();
    const searchName = nameFilter.trim().toLowerCase();

    return !searchName || studentName.includes(searchName);
  });

  // Load students and classes on mount
  useEffect(() => {
    loadStudents();
    loadClasses();
  }, [tenantId]);

  const loadClasses = async () => {
    try {
      const data = await dataSource.getClasses(tenantId);
      console.log('[Students] Classes loaded:', data);
      setClasses(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('[Students] Error loading classes:', err);
      setClasses([]);
    }
  };

  const loadStudents = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await dataSource.getStudents(tenantId);
      console.log('[Students] Students loaded:', data);      
      setStudents(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('[Students] Error loading students:', err);
      setError('Erro ao carregar alunos: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (student = null) => {
    if (student) {
      setEditingId(student.id);
      setFormData({ nome: student.nome, turmaId: student.turmaId || '' });
    } else {
      setEditingId(null);
      setFormData({ nome: '', turmaId: '' });
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingId(null);
    setFormData({ nome: '', turmaId: '' });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setError(null);

      if (!formData.nome.trim()) {
        setError('Nome do aluno é obrigatório');
        return;
      }

      if (!formData.turmaId) {
        setError('Turma é obrigatória');
        return;
      }

      if (editingId) {
        await dataSource.updateStudent(tenantId, editingId, formData);
        setSuccess('Aluno atualizado com sucesso!');
      } else {
        await dataSource.createStudent(tenantId, formData);
        setSuccess('Aluno criado com sucesso!');
      }

      setTimeout(() => setSuccess(null), 3000);
      handleCloseModal();
      loadStudents();
    } catch (err) {
      console.error('[Students] Error submitting form:', err);
      setError('Erro ao salvar aluno: ' + err.message);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Tem certeza que deseja deletar este aluno?')) {
      return;
    }

    try {
      setError(null);
      await dataSource.deleteStudent(tenantId, id);
      setSuccess('Aluno deletado com sucesso!');
      setTimeout(() => setSuccess(null), 3000);
      loadStudents();
    } catch (err) {
      console.error('[Students] Error deleting student:', err);
      setError('Erro ao deletar aluno: ' + err.message);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 py-12">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-12">
          <div>
            <h1 className="text-4xl font-bold text-azul-principal mb-2">👥 Gerenciar Alunos</h1>
            <p className="text-gray-600">Cadastre e gerencie os alunos da instituição</p>
          </div>
          {!isUsingAPI && (
            <button
              onClick={() => handleOpenModal()}
              className="mt-4 md:mt-0 bg-verde-principal hover:bg-verde-hover text-white px-6 py-3 rounded-lg font-bold transition"
            >
              + Adicionar Aluno
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
            <p className="mt-4">Carregando alunos...</p>
          </div>
        ) : students.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm p-12 text-center border-l-4 border-azul-principal">
            <p className="text-gray-600 mb-4">Nenhum aluno cadastrado ainda.</p>
            <p className="text-gray-500">Clique no botão "Adicionar Aluno" para começar.</p>
          </div>
        ) : (
          <>
          <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
            <div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  Filtrar por nome
                </label>
                <div className="flex gap-2">
                  <input
                    type="search"
                    value={nameFilter}
                    onChange={(e) => setNameFilter(e.target.value)}
                    placeholder="Digite o nome do aluno"
                    className="min-w-0 flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-azul-principal focus:border-transparent"
                  />
                  <button
                    type="button"
                    onClick={() => setNameFilter('')}
                    className="w-12 h-12 flex items-center justify-center bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-lg font-bold transition"
                    aria-label="Limpar filtro"
                    title="Limpar filtro"
                  >
                    X
                  </button>
                </div>
              </div>
            </div>
            <p className="text-sm text-gray-500 mt-4">
              Exibindo {filteredStudents.length} de {students.length} alunos
            </p>
          </div>

          {filteredStudents.length === 0 ? (
            <div className="bg-white rounded-lg shadow-sm p-12 text-center border-l-4 border-azul-principal">
              <p className="text-gray-600">Nenhum aluno encontrado com os filtros atuais.</p>
            </div>
          ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredStudents.map((student) => (
              <div
                key={student.id}
                className="bg-white rounded-lg shadow-sm hover:shadow-md transition border-l-4 border-verde-secundaria p-6"
              >
                <h3 className="text-xl font-bold text-verde-secundaria mb-4 break-words">{student.nome}</h3>
                <p className="text-sm font-medium text-gray-500 mb-1">Turma</p>
                <p className="text-gray-800 font-semibold break-words">{getStudentClassName(student)}</p>
              </div>
            ))}
          </div>
          )}
          </>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="p-6">
              <h2 className="text-2xl font-bold text-azul-principal mb-6">
                {editingId ? 'Editar Aluno' : 'Novo Aluno'}
              </h2>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    Nome *
                  </label>
                  <input
                    type="text"
                    value={formData.nome}
                    onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                    placeholder="Nome completo"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-azul-principal focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    Turma *
                  </label>
                  <select
                    value={formData.turmaId}
                    onChange={(e) => setFormData({ ...formData, turmaId: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-azul-principal focus:border-transparent"
                  >
                    <option value="">Selecione uma turma</option>
                    {classes.length > 0 ? (
                      classes.map((classItem) => (
                        <option key={classItem.id} value={classItem.id}>
                          {classItem.nome}
                        </option>
                      ))
                    ) : (
                      <option disabled>Nenhuma turma cadastrada</option>
                    )}
                  </select>
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

