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
  gridContainer: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
    gap: '20px',
  },
  card: {
    backgroundColor: 'white',
    borderRadius: '8px',
    padding: '20px',
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
    transition: 'transform 0.2s, box-shadow 0.2s',
  },
  cardHover: {
    transform: 'translateY(-4px)',
    boxShadow: '0 4px 16px rgba(0, 0, 0, 0.15)',
  },
  cardTitle: {
    fontSize: '20px',
    fontWeight: '700',
    color: '#1a1a1a',
    marginBottom: '10px',
  },
  cardInfo: {
    color: '#666',
    marginBottom: '15px',
    fontSize: '14px',
  },
  cardActions: {
    display: 'flex',
    gap: '10px',
    marginTop: '15px',
  },
  editButton: {
    backgroundColor: '#0066cc',
    color: 'white',
    border: 'none',
    padding: '8px 16px',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '14px',
    flex: 1,
    transition: 'background-color 0.2s',
  },
  deleteButton: {
    backgroundColor: '#dc3545',
    color: 'white',
    border: 'none',
    padding: '8px 16px',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '14px',
    flex: 1,
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

  // Load classes
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
    <div style={styles.container}>
      <Navbar />
      <div style={styles.content}>
        <div style={styles.header}>
          <h1 style={styles.title}>📚 Gerenciar Turmas</h1>
          <button
            style={styles.addButton}
            onClick={() => handleOpenModal()}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#218838'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#28a745'}
          >
            + Adicionar Turma
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
          <div style={styles.loader}>Carregando turmas...</div>
        ) : classes.length === 0 ? (
          <div style={styles.emptyState}>
            <p>Nenhuma turma cadastrada ainda.</p>
            <p>Clique no botão "Adicionar Turma" para começar.</p>
          </div>
        ) : (
          <div style={styles.gridContainer}>
            {classes.map((classItem) => (
              <div
                key={classItem.id}
                style={styles.card}
                onMouseEnter={(e) => Object.assign(e.currentTarget.style, styles.cardHover)}
                onMouseLeave={(e) => Object.assign(e.currentTarget.style, { transform: 'none', boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)' })}
              >
                <div style={styles.cardTitle}>{classItem.nome}</div>
                <div style={styles.cardActions}>
                  <button
                    style={styles.editButton}
                    onClick={() => handleOpenModal(classItem)}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#0052a3'}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#0066cc'}
                  >
                    Editar
                  </button>
                  <button
                    style={styles.deleteButton}
                    onClick={() => handleDelete(classItem.id)}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#c82333'}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#dc3545'}
                  >
                    Deletar
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal */}
      <div style={{ ...styles.modal, ...(showModal ? styles.modalVisible : {}) }}>
        <div style={styles.modalContent}>
          <h2 style={{ marginTop: 0 }}>{editingId ? 'Editar Turma' : 'Nova Turma'}</h2>
          <form onSubmit={handleSubmit}>
            <div style={styles.formGroup}>
              <label style={styles.label}>Nome da Turma *</label>
              <input
                style={styles.input}
                type="text"
                value={formData.nome}
                onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                placeholder="Ex: 5A"
              />
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
