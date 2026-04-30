
import React, { useEffect, useState } from 'react';
import { useTenant } from './context/TenantContext';
import { getDataSource } from './services/dataSource';
import Navbar from './components/Navbar';

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
  header: {
    color: '#1a1a1a',
    marginBottom: '20px',
    fontSize: '28px',
    fontWeight: '700',
  },
  statusContainer: {
    padding: '20px',
    backgroundColor: '#e8f5e9',
    border: '2px solid #4caf50',
    borderRadius: '8px',
    marginBottom: '30px',
    textAlign: 'center',
  },
  statusText: {
    fontSize: '16px',
    fontWeight: '600',
    color: '#2e7d32',
  },
  callsList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '15px',
  },
  callCard: {
    padding: '15px',
    border: '2px solid #ddd',
    borderRadius: '8px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    transition: 'all 0.3s ease',
  },
  callInfo: {
    display: 'flex',
    flexDirection: 'column',
    gap: '5px',
    flex: 1,
  },
  callStatus: {
    fontSize: '12px',
    color: '#fff',
    fontStyle: 'italic',
    fontWeight: '600',
    animation: 'pulse 1.5s infinite',
  },
  emptyMessage: {
    textAlign: 'center',
    color: '#999',
    fontStyle: 'italic',
    fontSize: '16px',
    padding: '40px',
  },
};

const keyframes = `
  @keyframes pulse {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.7; }
  }
`;

export default function Dispositivo() {
  const tenantId = useTenant();
  const [allCalls, setAllCalls] = useState([]);
  const [currentCallIndex, setCurrentCallIndex] = useState(0);
  const [callingInterval, setCallingInterval] = useState(null);

  const dataSource = getDataSource();

  // Setup listener for calls
  useEffect(() => {
    console.log('[Dispositivo] Iniciando listener de fila...');

    const unsubscribe = dataSource.onSnapshotCalls(tenantId, (calls) => {
      console.log(`[Dispositivo] 🔄 Fila atualizada - ${calls.length} chamadas pendentes`);
      
      // Sort by createdAt (oldest first)
      const sortedCalls = [...calls].sort((a, b) => {
        const timeA = a.createdAt?.toMillis?.() || a.createdAt || 0;
        const timeB = b.createdAt?.toMillis?.() || b.createdAt || 0;
        return timeA - timeB;
      });

      sortedCalls.forEach((call, idx) => {
        console.log(`  [${idx}] ${call.studentName} - ${call.id}`);
      });

      setAllCalls(sortedCalls);

      // Reset index if queue is empty or index out of range
      if (sortedCalls.length === 0) {
        console.log('[Dispositivo] ✓ Fila vazia');
        setCurrentCallIndex(0);
      } else if (currentCallIndex >= sortedCalls.length) {
        console.log('[Dispositivo] 🔄 Índice resetado para 0');
        setCurrentCallIndex(0);
      }
    });

    return () => {
      console.log('[Dispositivo] 🛑 Desmontando listener');
      if (typeof unsubscribe === 'function') {
        unsubscribe();
      }
    };
  }, [tenantId]);

  // Manage TTS: call each student in sequence
  useEffect(() => {
    if (allCalls.length === 0) {
      if (callingInterval) {
        clearInterval(callingInterval);
        setCallingInterval(null);
      }
      return;
    }

    const currentCall = allCalls[currentCallIndex];
    if (!currentCall) return;

    console.log(`[Dispositivo] 🔊 Chamando: ${currentCall.studentName} (${currentCallIndex + 1}/${allCalls.length})`);

    // Call immediately
    speakCall(currentCall);

    // Every 7 seconds, move to next student
    const interval = setInterval(() => {
      setCurrentCallIndex((prevIdx) => {
        const nextIdx = (prevIdx + 1) % allCalls.length;
        const nextCall = allCalls[nextIdx];
        console.log(`[Dispositivo] 🔊 Próximo aluno: ${nextCall.studentName} (${nextIdx + 1}/${allCalls.length})`);
        speakCall(nextCall);
        return nextIdx;
      });
    }, 7000);

    setCallingInterval(interval);

    return () => {
      clearInterval(interval);
    };
  }, [allCalls, currentCallIndex]);

  const speakCall = (call) => {
    const message = `${call.studentName}, turma ${call.studentClass}`;
    const utterance = new SpeechSynthesisUtterance(message);

    utterance.lang = 'pt-BR';
    utterance.rate = 0.9;
    utterance.pitch = 1;
    utterance.volume = 1;

    // Try to find Daniel voice
    const voices = speechSynthesis.getVoices();
    const danielVoice = voices.find(v => v.name.includes('Daniel') && v.lang.startsWith('pt'));

    if (danielVoice) {
      utterance.voice = danielVoice;
    }

    speechSynthesis.cancel();
    speechSynthesis.speak(utterance);

    console.log(`[TTS] ${message}`);
  };

  return (
    <div style={styles.container}>
      <Navbar />
      <style>{keyframes}</style>

      <div style={styles.content}>
        <h2 style={styles.header}>🔊 Dispositivo - Fila de Chamadas</h2>

        <div style={styles.statusContainer}>
          <p style={styles.statusText}>
            {allCalls.length === 0
              ? '✓ Nenhuma chamada. Aguardando...'
              : `🔴 ${allCalls.length} aluno(s) na fila - Chamando...`}
          </p>
        </div>

        {allCalls.length === 0 ? (
          <p style={styles.emptyMessage}>Nenhuma chamada no momento. Aguardando...</p>
        ) : (
          <div style={styles.callsList}>
            {allCalls.map((call, idx) => {
              const isCurrentCall = idx === currentCallIndex;
              return (
                <div
                  key={call.id}
                  style={{
                    ...styles.callCard,
                    ...(isCurrentCall
                      ? {
                          backgroundColor: '#ff6b6b',
                          borderColor: '#d63031',
                          boxShadow: '0 0 20px rgba(214, 48, 49, 0.5)',
                        }
                      : {
                          backgroundColor: '#e8e8e8',
                          opacity: 0.6,
                        }),
                  }}
                >
                  <div style={styles.callInfo}>
                    <div
                      style={{
                        display: 'flex',
                        gap: '15px',
                        alignItems: 'center',
                      }}
                    >
                      <div
                        style={{
                          fontSize: '24px',
                          fontWeight: '700',
                          backgroundColor: isCurrentCall ? '#d63031' : '#999',
                          color: 'white',
                          width: '50px',
                          height: '50px',
                          borderRadius: '50%',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        {idx + 1}
                      </div>
                      <div>
                        <div
                          style={{
                            fontSize: isCurrentCall ? '24px' : '16px',
                            fontWeight: '700',
                            color: isCurrentCall ? '#d63031' : '#333',
                          }}
                        >
                          {call.studentName}
                        </div>
                        <div style={{ fontSize: '14px', color: isCurrentCall ? '#a93030' : '#666' }}>
                          Turma: {call.studentClass}
                        </div>
                      </div>
                    </div>
                  </div>
                  {isCurrentCall && (
                    <div style={styles.callStatus}>🔊 Chamando...</div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
