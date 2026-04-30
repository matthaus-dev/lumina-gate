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
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '30px 20px',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '30px',
  },
  title: {
    fontSize: '28px',
    fontWeight: '700',
    color: '#1a1a1a',
    margin: 0,
  },
  addButton: {
    backgroundColor: '#28a745',
    color: 'white',
    border: 'none',
    padding: '12px 24px',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '16px',
    fontWeight: '600',
    transition: 'background-color 0.2s',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    backgroundColor: 'white',
    borderRadius: '8px',
    overflow: 'hidden',
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
  },
  th: {
    backgroundColor: '#f0f0f0',
    padding: '15px',
    textAlign: 'left',
    fontWeight: '600',
    color: '#333',
    borderBottom: '2px solid #ddd',
  },
  td: {
    padding: '15px',
    borderBottom: '1px solid #ddd',
    color: '#666',
  },
  trHover: {
    backgroundColor: '#f9f9f9',
  },
  actions: {
    display: 'flex',
    gap: '10px',
  },
  editButton: {
    backgroundColor: '#0066cc',
    color: 'white',
    border: 'none',
    padding: '6px 12px',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '14px',
    transition: 'background-color 0.2s',
  },
  deleteButton: {
    backgroundColor: '#dc3545',
    color: 'white',
    border: 'none',
    padding: '6px 12px',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '14px',
    transition: 'background-color 0.2s',
  },
  modal: {
    display: 'none',
    position: 'fixed',
    zIndex: '1000',
    left: 0,
    top: 0,
    width: '100%',
    height: '100%',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalVisible: {
    display: 'flex',
  },
  modalContent: {
    backgroundColor: 'white',
    padding: '30px',
    borderRadius: '8px',
    boxShadow: '0 4px 16px rgba(0, 0, 0, 0.2)',
    width: '90%',
    maxWidth: '400px',
  },
  formGroup: {
    marginBottom: '20px',
  },
  label: {
    display: 'block',
    marginBottom: '8px',
    fontWeight: '600',
    color: '#333',
  },
  input: {
    width: '100%',
    padding: '10px',
    border: '1px solid #ddd',
    borderRadius: '4px',
    fontSize: '14px',
    boxSizing: 'border-box',
  },
  buttonGroup: {
    display: 'flex',
    gap: '10px',
    justifyContent: 'flex-end',
  },
  submitButton: {
    backgroundColor: '#28a745',
    color: 'white',
    border: 'none',
    padding: '10px 20px',
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
    padding: '10px 20px',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '16px',
    fontWeight: '600',
    transition: 'background-color 0.2s',
  },
  emptyState: {
    textAlign: 'center',
    padding: '60px 20px',
    color: '#999',
  },
  loader: {
    textAlign: 'center',
    padding: '40px',
    color: '#666',
  },
};

export default function Students() {
  const tenantId = useTenant();
  const [students, setStudents] = useState([]);
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({ nome: '', turmaId: '' });
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const dataSource = getDataSource();

  // Load students
  useEffect(() => {
    loadStudents();
    loadClasses();
  }, [tenantId]);

  const loadClasses = async () => {
    try {
      const data = await dataSource.getClasses(tenantId);
      setClasses(data || []);
    } catch (err) {
      console.error('[Students] Error loading classes:', err);
    }
  };

  const loadStudents = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await dataSource.getStudents(tenantId);
      setStudents(data || []);
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
    <div style={styles.container}>
      <Navbar />
      <div style={styles.content}>
        <div style={styles.header}>
          <h1 style={styles.title}>👥 Gerenciar Alunos</h1>
          <button
            style={styles.addButton}
            onClick={() => handleOpenModal()}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#218838'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#28a745'}
          >
            + Adicionar Aluno
          </button>
        </div>

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

        {loading ? (
          <div style={styles.loader}>Carregando alunos...</div>
        ) : students.length === 0 ? (
          <div style={styles.emptyState}>
            <p>Nenhum aluno cadastrado ainda.</p>
            <p>Clique no botão "Adicionar Aluno" para começar.</p>
          </div>
        ) : (
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>Nome</th>
                <th style={styles.th}>Turma</th>
                <th style={styles.th}>Ações</th>
              </tr>
            </thead>
            <tbody>
              {students.map((student) => (
                <tr key={student.id} style={{ cursor: 'pointer' }}>
                  <td style={styles.td}>{student.nome}</td>
                  <td style={styles.td}>
                    {student.turmaId
                      ? classes.find(c => c.id === student.turmaId)?.nome || '-'
                      : '-'}
                  </td>
                  <td style={styles.td}>
                    <div style={styles.actions}>
                      <button
                        style={styles.editButton}
                        onClick={() => handleOpenModal(student)}
                        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#0052a3'}
                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#0066cc'}
                      >
                        Editar
                      </button>
                      <button
                        style={styles.deleteButton}
                        onClick={() => handleDelete(student.id)}
                        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#c82333'}
                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#dc3545'}
                      >
                        Deletar
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Modal */}
      <div style={{ ...styles.modal, ...(showModal ? styles.modalVisible : {}) }}>
        <div style={styles.modalContent}>
          <h2 style={{ marginTop: 0 }}>{editingId ? 'Editar Aluno' : 'Novo Aluno'}</h2>
          <form onSubmit={handleSubmit}>
            <div style={styles.formGroup}>
              <label style={styles.label}>Nome *</label>
              <input
                style={styles.input}
                type="text"
                value={formData.nome}
                onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                placeholder="Nome completo"
              />
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>Turma *</label>
              <select
                style={styles.input}
                value={formData.turmaId}
                onChange={(e) => setFormData({ ...formData, turmaId: e.target.value })}
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

            <div style={styles.buttonGroup}>
              <button
                type="button"
                style={styles.cancelButton}
                onClick={handleCloseModal}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#5a6268'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#6c757d'}
              >
                Cancelar
              </button>
              <button
                type="submit"
                style={styles.submitButton}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#218838'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#28a745'}
              >
                {editingId ? 'Atualizar' : 'Criar'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
