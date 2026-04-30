
import React, { useState, useEffect } from 'react';
import { useTenant } from './context/TenantContext';
import { getDataSource } from './services/dataSource';
import Navbar from './components/Navbar';

const agruparPorTurma = (students, classes) => {
  const agrupado = {};
  students.forEach(student => {
    const turmaId = student.turmaId;
    if (!agrupado[turmaId]) {
      const turma = classes.find(c => c.id === turmaId);
      agrupado[turmaId] = {
        nome: turma?.nome || 'Turma desconhecida',
        alunos: [],
      };
    }
    agrupado[turmaId].alunos.push(student);
  });
  return agrupado;
};

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
    color: '#1a1a1a',
    marginBottom: '20px',
    fontSize: '28px',
    fontWeight: '700',
  },
  tabsContainer: {
    display: 'flex',
    gap: '10px',
    marginBottom: '30px',
    borderBottom: '2px solid #ddd',
    paddingBottom: '10px',
    flexWrap: 'wrap',
  },
  tab: {
    padding: '10px 20px',
    border: 'none',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '500',
    backgroundColor: 'transparent',
    borderBottom: '3px solid transparent',
    color: '#666',
    transition: 'all 0.2s',
  },
  tabActive: {
    color: '#0066cc',
    borderBottomColor: '#0066cc',
  },
  section: {
    marginBottom: '40px',
  },
  sectionTitle: {
    fontSize: '18px',
    fontWeight: '600',
    color: '#333',
    marginBottom: '15px',
    borderLeft: '4px solid #0066cc',
    paddingLeft: '10px',
  },
  studentList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
  },
  studentCard: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '12px',
    backgroundColor: '#f9f9f9',
    border: '1px solid #ddd',
    borderRadius: '6px',
    transition: 'background-color 0.2s',
  },
  studentName: {
    fontSize: '16px',
    color: '#333',
  },
  callButton: {
    padding: '8px 16px',
    backgroundColor: '#28a745',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontWeight: '500',
    fontSize: '14px',
    transition: 'background-color 0.2s',
  },
  activeCallCard: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '12px',
    backgroundColor: '#fff3cd',
    border: '2px solid #ffc107',
    borderRadius: '6px',
    marginBottom: '10px',
  },
  activeCallInfo: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
  },
  confirmButton: {
    padding: '8px 16px',
    backgroundColor: '#dc3545',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontWeight: '500',
    fontSize: '14px',
    transition: 'background-color 0.2s',
  },
  emptyMessage: {
    color: '#999',
    fontStyle: 'italic',
  },
};

export default function Porteiro() {
  const tenantId = useTenant();
  const [students, setStudents] = useState([]);
  const [classes, setClasses] = useState([]);
  const [selectedTurmaId, setSelectedTurmaId] = useState(null);
  const [activeCalls, setActiveCalls] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingStudents, setLoadingStudents] = useState(true);

  const dataSource = getDataSource();

  // Load students and classes on mount
  useEffect(() => {
    loadStudents();
    loadClasses();
  }, [tenantId]);

  const loadClasses = async () => {
    try {
      const data = await dataSource.getClasses(tenantId);
      setClasses(data || []);
    } catch (error) {
      console.error('[Porteiro] Erro ao carregar turmas:', error);
    }
  };

  const loadStudents = async () => {
    try {
      setLoadingStudents(true);
      console.log(`[Porteiro] Carregando alunos do tenant: ${tenantId}`);
      const data = await dataSource.getStudents(tenantId);
      setStudents(data || []);
      console.log(`[Porteiro] ✅ ${(data || []).length} alunos carregados`);
    } catch (error) {
      console.error('[Porteiro] ❌ Erro ao carregar alunos:', error);
      alert('Erro ao carregar alunos: ' + error.message);
    } finally {
      setLoadingStudents(false);
    }
  };

  const studentsByTurma = agruparPorTurma(students, classes);
  const turmaIds = Object.keys(studentsByTurma).sort();

  // Initialize with first turma
  useEffect(() => {
    if (turmaIds.length > 0 && !selectedTurmaId) {
      setSelectedTurmaId(turmaIds[0]);
    }
  }, [turmaIds, selectedTurmaId]);

  // Listener for active calls
  useEffect(() => {
    const unsubscribe = dataSource.onSnapshotCalls(tenantId, (calls) => {
      console.log(`[Porteiro] Chamadas atualizadas:`, calls);
      setActiveCalls(calls);
    });

    return () => {
      if (typeof unsubscribe === 'function') {
        unsubscribe();
      }
    };
  }, [tenantId]);

  const chamarAluno = async (studentId, nome, turmaId) => {
    setLoading(true);
    try {
      const turma = classes.find(c => c.id === turmaId);
      console.log(`[Porteiro] Chamando aluno: ${nome} (${turma?.nome || turmaId})`);
      await dataSource.createCall(tenantId, {
        studentId,
        studentName: nome,
        studentClass: turma?.nome || turmaId,
      });
      console.log(`[Porteiro] ✅ Chamada criada`);
    } catch (error) {
      console.error('[Porteiro] ❌ Erro ao chamar aluno:', error);
      alert('Erro ao chamar aluno: ' + error.message);
    }
    setLoading(false);
  };

  const confirmarSaida = async (callId) => {
    setLoading(true);
    try {
      console.log(`[Porteiro] Confirmando saída da chamada: ${callId}`);
      await dataSource.updateCall(tenantId, callId, {
        status: 'confirmed',
      });
      console.log(`[Porteiro] ✅ Saída confirmada`);
    } catch (error) {
      console.error('[Porteiro] Erro ao confirmar saída:', error);
      alert('Erro ao confirmar saída: ' + error.message);
    }
    setLoading(false);
  };

  return (
    <div style={styles.container}>
      <Navbar />
      <div style={styles.content}>
        <h2 style={styles.header}>📞 Porteiro - Lista de Alunos</h2>

        {loadingStudents && (
          <div style={{ textAlign: 'center', padding: '20px', color: '#666' }}>
            Carregando alunos...
          </div>
        )}

        {!loadingStudents && turmaIds.length === 0 && (
          <div style={{ textAlign: 'center', padding: '20px', color: '#999' }}>
            Nenhum aluno disponível
          </div>
        )}

        {!loadingStudents && (
          <>
            <div style={styles.tabsContainer}>
              {turmaIds.map(turmaId => (
                <button
                  key={turmaId}
                  style={{
                    ...styles.tab,
                    ...(selectedTurmaId === turmaId ? styles.tabActive : {}),
                  }}
                  onClick={() => setSelectedTurmaId(turmaId)}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f0f0f0'}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                >
                  {studentsByTurma[turmaId].nome}
                </button>
              ))}
            </div>

            {/* Lista de Alunos */}
            {selectedTurmaId && (
              <div style={styles.section}>
                <h3 style={styles.sectionTitle}>Alunos da Turma {studentsByTurma[selectedTurmaId].nome}</h3>
                <div style={styles.studentList}>
                  {studentsByTurma[selectedTurmaId].alunos.map(student => {
                    const alreadyInQueue = activeCalls.some(c => c.studentId === student.id);
                    return (
                      <div
                        key={student.id}
                        style={styles.studentCard}
                        onMouseEnter={(e) => !alreadyInQueue && (e.currentTarget.style.backgroundColor = '#f0f0f0')}
                        onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#f9f9f9')}
                      >
                        <span style={styles.studentName}>{student.nome}</span>
                        <button
                          style={{
                            ...styles.callButton,
                            ...(alreadyInQueue
                              ? {
                                  backgroundColor: '#ccc',
                                  cursor: 'not-allowed',
                                  opacity: 0.6,
                                }
                              : {}),
                          }}
                          onClick={() => chamarAluno(student.id, student.nome, student.turmaId)}
                          disabled={loading || alreadyInQueue}
                          title={alreadyInQueue ? 'Aluno já está na fila' : ''}
                          onMouseEnter={(e) => !alreadyInQueue && !loading && (e.currentTarget.style.backgroundColor = '#218838')}
                          onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#28a745')}
                        >
                          {alreadyInQueue ? '✓ Na Fila' : 'Chamar'}
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Fila de Chamadas */}
            <div style={styles.section}>
              <h3 style={styles.sectionTitle}>
                📋 Fila de Chamadas ({activeCalls.length})
              </h3>
              {activeCalls.length === 0 ? (
                <p style={styles.emptyMessage}>Nenhuma chamada na fila</p>
              ) : (
                <div>
                  {activeCalls.map((call, idx) => {
                    const isFirst = idx === 0;
                    return (
                      <div
                        key={call.id}
                        style={{
                          ...styles.activeCallCard,
                          ...(isFirst
                            ? {
                                backgroundColor: '#ff6b6b',
                                borderColor: '#d63031',
                                boxShadow: '0 0 15px rgba(214, 48, 49, 0.3)',
                              }
                            : {}),
                        }}
                      >
                        <div
                          style={{
                            display: 'flex',
                            gap: '15px',
                            alignItems: 'center',
                            flex: 1,
                          }}
                        >
                          <div
                            style={{
                              fontSize: '18px',
                              fontWeight: '700',
                              backgroundColor: isFirst ? '#d63031' : '#999',
                              color: 'white',
                              width: '40px',
                              height: '40px',
                              borderRadius: '50%',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                            }}
                          >
                            {idx + 1}
                          </div>
                          <div style={styles.activeCallInfo}>
                            <strong style={isFirst ? { color: '#d63031', fontSize: '16px' } : {}}>
                              {call.studentName}
                            </strong>
                            <small>Turma: {call.studentClass}</small>
                          </div>
                        </div>
                        <button
                          style={styles.confirmButton}
                          onClick={() => confirmarSaida(call.id)}
                          disabled={loading}
                          onMouseEnter={(e) => !loading && (e.currentTarget.style.backgroundColor = '#c82333')}
                          onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#dc3545')}
                        >
                          {isFirst ? '✓ Confirmar' : 'Confirmar'}
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
