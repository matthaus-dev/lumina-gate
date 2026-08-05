import React, { useState, useEffect } from 'react';
import { Check, ClipboardList, Phone, Users } from 'lucide-react';
import { useTenant } from './context/TenantContext';
import { getDataSource, isApiDataSource } from './services/dataSource';
import Navbar from './components/Navbar';

const agruparPorTurma = (students, classes) => {
  const agrupado = {};
  students.forEach(student => {
    // Use turmaName if available (from API), otherwise use turmaId (from Firestore)
    const key = student.turmaName || student.turmaId;
    const turmaName = student.turmaName || classes.find(c => c.id === student.turmaId)?.nome || 'Turma desconhecida';
    
    if (!agrupado[key]) {
      agrupado[key] = {
        nome: turmaName,
        alunos: [],
      };
    }
    agrupado[key].alunos.push(student);
  });
  return agrupado;
};

export default function Porteiro() {
  const tenantId = useTenant();
  const [students, setStudents] = useState([]);
  const [classes, setClasses] = useState([]);
  const [selectedTurmaId, setSelectedTurmaId] = useState(null);
  const [activeCalls, setActiveCalls] = useState([]);
  const [callingStudentIds, setCallingStudentIds] = useState(() => new Set());
  const [confirmingCallIds, setConfirmingCallIds] = useState(() => new Set());
  const [loadingStudents, setLoadingStudents] = useState(true);
  const [voiceSettings, setVoiceSettings] = useState({
    enabled: true,
    rate: 0.9,
    pitch: 1.0,
    selectedVoice: null,
  });

  const dataSource = getDataSource();
  const isUsingAPI = isApiDataSource();

  // Load students and classes on mount
  useEffect(() => {
    loadStudents();
    loadClasses();
    loadVoiceSettings();
  }, [tenantId]);

  const loadVoiceSettings = async () => {
    try {
      const settings = await dataSource.getSettings(tenantId);
      if (settings?.features?.voice) {
        setVoiceSettings(settings.features.voice);
      }
    } catch (error) {
      console.error('[Porteiro] Error loading voice settings:', error);
    }
  };

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
      console.log(`[Porteiro] ${(data || []).length} alunos carregados`);
    } catch (error) {
      console.error('[Porteiro] Erro ao carregar alunos:', error);
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

  const chamarAluno = async (studentId, nome, turmaIdOrName) => {
    setCallingStudentIds(prev => new Set(prev).add(studentId));
    try {
      // turmaIdOrName can be either an ID (from Firestore) or the name (from API)
      const turma = classes.find(c => c.id === turmaIdOrName);
      const turmaName = turma?.nome || turmaIdOrName; // Use turma name if found, otherwise use the value as-is
      console.log(`[Porteiro] Chamando aluno: ${nome} (${turmaName})`);
      await dataSource.createCall(tenantId, {
        studentId,
        studentName: nome,
        studentClass: turmaName,
      });
      console.log(`[Porteiro] Chamada criada`);

      // Play sound with voice settings
      if (voiceSettings.enabled) {
        playCallSound(nome, turmaName);
      }
    } catch (error) {
      console.error('[Porteiro] Erro ao chamar aluno:', error);
      alert('Erro ao chamar aluno: ' + error.message);
    } finally {
      setCallingStudentIds(prev => {
        const next = new Set(prev);
        next.delete(studentId);
        return next;
      });
    }
  };

  const playCallSound = (studentName, turmaName) => {
    const synthesis = window.speechSynthesis;
    if (synthesis) {
      synthesis.cancel();

      const utterance = new SpeechSynthesisUtterance(
        `Aluno ${studentName}, da turma ${turmaName}.`
      );
      utterance.lang = 'pt-BR';
      utterance.rate = voiceSettings.rate;
      utterance.pitch = voiceSettings.pitch;

      // Find selected voice or use first PT voice
      const voices = synthesis.getVoices();
      if (voiceSettings.selectedVoice) {
        const selectedVoice = voices.find(v => v.name === voiceSettings.selectedVoice);
        if (selectedVoice) {
          utterance.voice = selectedVoice;
        }
      } else {
        // Use first Portuguese voice available
        const ptVoice = voices.find(v => v.lang.startsWith('pt'));
        if (ptVoice) {
          utterance.voice = ptVoice;
        }
      }

      synthesis.speak(utterance);
    }
  };

  const confirmarSaida = async (callId) => {
    setConfirmingCallIds(prev => new Set(prev).add(callId));
    try {
      console.log(`[Porteiro] Confirmando saida da chamada: ${callId}`);
      await dataSource.updateCall(tenantId, callId, {
        status: 'confirmed',
      });
      console.log(`[Porteiro] Saida confirmada`);
    } catch (error) {
      console.error('[Porteiro] Erro ao confirmar saida:', error);
      alert('Erro ao confirmar saida: ' + error.message);
    } finally {
      setConfirmingCallIds(prev => {
        const next = new Set(prev);
        next.delete(callId);
        return next;
      });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 py-12">
        <h2 className="text-4xl font-bold text-azul-principal mb-12 flex items-center gap-3">
          <Phone className="w-10 h-10" />
          Porteiro - Lista de Alunos
        </h2>

        {loadingStudents && (
          <div className="text-center py-12 text-gray-600">
            <div className="inline-block animate-spin">
              <div className="border-4 border-gray-300 border-t-azul-principal rounded-full w-12 h-12"></div>
            </div>
            <p className="mt-4">Carregando alunos...</p>
          </div>
        )}

        {!loadingStudents && turmaIds.length === 0 && (
          <div className="text-center py-12 text-gray-600">
            Nenhum aluno disponível
          </div>
        )}

        {!loadingStudents && (
          <>
            {/* Abas de Turmas */}
            <div className="mb-8 max-h-56 overflow-y-auto overflow-x-hidden rounded-lg border border-gray-200 bg-white p-3">
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-2">
              {turmaIds.map(turmaId => (
                <button
                  key={turmaId}
                  onClick={() => setSelectedTurmaId(turmaId)}
                  className={`w-full min-w-0 px-4 py-3 text-left font-medium rounded-lg break-words transition ${
                    selectedTurmaId === turmaId
                      ? 'bg-azul-principal text-white'
                      : 'bg-white text-gray-700 border border-gray-300 hover:border-azul-principal hover:text-azul-principal'
                  }`}
                >
                  {studentsByTurma[turmaId].nome}
                </button>
              ))}
              </div>
            </div>

            {/* Lista de Alunos */}
            {selectedTurmaId && (
              <div className="mb-12">
                <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                  <Users className="w-8 h-8 text-azul-principal" />
                  Alunos da Turma {studentsByTurma[selectedTurmaId].nome}
                </h3>
                <div className="space-y-3">
                  {studentsByTurma[selectedTurmaId].alunos.map(student => {
                    const alreadyInQueue = activeCalls.some(c => c.studentId === student.id);
                    const isCallingStudent = callingStudentIds.has(student.id);
                    return (
                      <div
                        key={student.id}
                        className="flex items-center justify-between p-4 bg-white rounded-lg hover:bg-gray-50 transition border border-gray-200"
                      >
                        <span className="font-medium text-gray-900">{student.nome}</span>
                        <button
                          onClick={() => chamarAluno(student.id, student.nome, student.turmaName || student.turmaId)}
                          disabled={isCallingStudent || alreadyInQueue}
                          className={`px-6 py-2 rounded-lg font-bold transition ${
                            alreadyInQueue
                              ? 'bg-gray-300 text-gray-600 cursor-not-allowed opacity-60'
                              : 'bg-verde-principal hover:bg-verde-hover text-white'
                          }`}
                          title={alreadyInQueue ? 'Aluno já está na fila' : ''}
                        >
                          {alreadyInQueue ? (
                            <span className="inline-flex items-center gap-2">
                              <Check className="w-4 h-4" />
                              Na Fila
                            </span>
                          ) : isCallingStudent ? 'Chamando...' : 'Chamar'}
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Fila de Chamadas */}
            <div>
              <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                <ClipboardList className="w-8 h-8 text-azul-principal" />
                Fila de Chamadas ({activeCalls.length})
              </h3>
              {activeCalls.length === 0 ? (
                <div className="bg-white p-8 rounded-lg text-center border-l-4 border-azul-principal">
                  <p className="text-gray-600 italic">Nenhuma chamada pendente</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {activeCalls.map(call => {
                    const isConfirmingCall = confirmingCallIds.has(call.id);
                    return (
                      <div
                        key={call.id}
                        className="flex items-center justify-between p-4 bg-yellow-50 rounded-lg border-l-4 border-yellow-400"
                      >
                        <div>
                          <p className="font-bold text-gray-900">{call.studentName}</p>
                          <p className="text-sm text-gray-600">{call.studentClass}</p>
                        </div>
                        <button
                          onClick={() => confirmarSaida(call.id)}
                          disabled={isConfirmingCall}
                          className="px-6 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg font-bold transition disabled:opacity-50"
                        >
                          {isConfirmingCall ? 'Confirmando...' : 'Confirmar Saida'}
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


