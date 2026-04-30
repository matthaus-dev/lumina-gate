
import React, { useEffect, useState } from "react";
import { db } from "./firebase";
import { collection, onSnapshot, query, where, getDocs } from "firebase/firestore";

const styles = {
  container: {
    padding: 20,
    fontFamily: "Arial, sans-serif",
    maxWidth: 800,
    margin: "0 auto",
  },
  header: {
    color: "#1a1a1a",
    marginBottom: 20,
  },
  statusContainer: {
    padding: 20,
    backgroundColor: "#e8f5e9",
    border: "2px solid #4caf50",
    borderRadius: 8,
    marginBottom: 30,
    textAlign: "center",
  },
  statusText: {
    fontSize: 16,
    fontWeight: 600,
    color: "#2e7d32",
  },
  callsList: {
    display: "flex",
    flexDirection: "column",
    gap: 15,
  },
  callCard: {
    padding: 15,
    border: "2px solid #ddd",
    borderRadius: 8,
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    transition: "all 0.3s ease",
  },
  callInfo: {
    display: "flex",
    flexDirection: "column",
    gap: 5,
    flex: 1,
  },
  callStatus: {
    fontSize: 12,
    color: "#fff",
    fontStyle: "italic",
    fontWeight: 600,
    animation: "pulse 1.5s infinite",
  },
  emptyMessage: {
    textAlign: "center",
    color: "#999",
    fontStyle: "italic",
    fontSize: 16,
    padding: 40,
  },
};

const keyframes = `
  @keyframes pulse {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.7; }
  }
`;

export default function Dispositivo() {
  const [allCalls, setAllCalls] = useState([]);
  const [currentCallIndex, setCurrentCallIndex] = useState(0);
  const [callingInterval, setCallingInterval] = useState(null);
  useEffect(() => {
    console.log("[Dispositivo] Iniciando listener de fila...");

    const q = query(
      collection(db, "chamadas"),
      where("status", "==", "pending")
    );

    // DEBUG: Teste imediato de conexão
    getDocs(q)
      .then(snapshot => {
        const calls = [];
        snapshot.forEach(doc => {
          calls.push({
            id: doc.id,
            ...doc.data(),
          });
        });
        // Ordenar por createdAt (mais antigos primeiro)
        calls.sort((a, b) => a.createdAt - b.createdAt);
        console.log(`[Dispositivo] 📊 Teste inicial - ${calls.length} chamadas na fila`);
        calls.forEach((call, idx) => {
          console.log(`  [${idx}] ${call.studentName} (${call.studentClass})`);
        });
      })
      .catch(err => {
        console.error("[Dispositivo] ❌ Erro ao fazer teste getDocs():", err.code, err.message);
      });

    // Listener permanente
    const unsub = onSnapshot(
      q,
      (snapshot) => {
        console.log(`[Dispositivo] 🔄 Fila atualizada - ${snapshot.size} chamadas pendentes`);
        const calls = [];
        snapshot.forEach(doc => {
          const data = doc.data();
          calls.push({
            id: doc.id,
            ...data,
          });
        });
        // Ordenar por createdAt (mais antigos primeiro)
        calls.sort((a, b) => a.createdAt - b.createdAt);

        calls.forEach((call, idx) => {
          console.log(`  [${idx}] ${call.studentName} - ${call.id}`);
        });
        setAllCalls(calls);

        // Resetar índice se fila ficou vazia ou se tamanho mudou drasticamente
        if (calls.length === 0) {
          console.log("[Dispositivo] ✓ Fila vazia");
          setCurrentCallIndex(0);
        } else if (currentCallIndex >= calls.length) {
          // Se o índice saiu do range, volta ao início
          console.log("[Dispositivo] 🔄 Índice resetado para 0");
          setCurrentCallIndex(0);
        }
      },
      (error) => {
        console.error("[Dispositivo] ❌ Erro no listener:", error.code, error.message);
      }
    );

    return () => {
      console.log("[Dispositivo] 🛑 Desmontando listener");
      unsub();
    };
  }, [currentCallIndex]);

  // Gerenciar TTS: chamar cada aluno da fila em sequência
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

    // Chamar imediatamente
    speakCall(currentCall);

    // A cada 7 segundos, passa para o próximo aluno
    const interval = setInterval(() => {
      setCurrentCallIndex((prevIdx) => {
        const nextIdx = (prevIdx + 1) % allCalls.length; // Volta ao 0 quando chegar ao fim
        const nextCall = allCalls[nextIdx];
        console.log(`[Dispositivo] 🔊 Próximo aluno: ${nextCall.studentName} (${nextIdx + 1}/${allCalls.length})`);
        speakCall(nextCall);
        return nextIdx;
      });
    }, 7000);

    setCallingInterval(interval);

    // Cleanup
    return () => {
      clearInterval(interval);
    };
  }, [allCalls, currentCallIndex]);

  const speakCall = (call) => {
    const message = `Aluno ${call.studentName}, turma ${call.studentClass}`;
    const utterance = new SpeechSynthesisUtterance(message);

    utterance.lang = "pt-BR";
    utterance.rate = 0.9;
    utterance.pitch = 1;
    utterance.volume = 1;
    
    // Buscar a voz Daniel PT-BR
    const voices = speechSynthesis.getVoices();
    const danielVoice = voices.find(v => v.name.includes("Daniel") && v.lang.startsWith("pt"));
    
    if (danielVoice) {
      utterance.voice = danielVoice;
    }

    speechSynthesis.cancel();
    speechSynthesis.speak(utterance);

    console.log(`[TTS] ${message}`);
  };

  return (
    <div style={styles.container}>
      <style>{keyframes}</style>

      <h2 style={styles.header}>🔊 Dispositivo - Fila de Chamadas</h2>

      <div style={styles.statusContainer}>
        <p style={styles.statusText}>
          {allCalls.length === 0
            ? "✓ Nenhuma chamada. Aguardando..."
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
                        backgroundColor: "#ff6b6b",
                        borderColor: "#d63031",
                        boxShadow: "0 0 20px rgba(214, 48, 49, 0.5)",
                      }
                    : {
                        backgroundColor: "#e8e8e8",
                        opacity: 0.6,
                      }),
                }}
              >
                <div style={styles.callInfo}>
                  <div
                    style={{
                      display: "flex",
                      gap: 15,
                      alignItems: "center",
                    }}
                  >
                    <div
                      style={{
                        fontSize: 24,
                        fontWeight: 700,
                        backgroundColor: isCurrentCall ? "#d63031" : "#999",
                        color: "white",
                        width: 50,
                        height: 50,
                        borderRadius: "50%",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      {idx + 1}
                    </div>
                    <div>
                      <div
                        style={{
                          fontSize: isCurrentCall ? 24 : 16,
                          fontWeight: 700,
                          color: isCurrentCall ? "#d63031" : "#333",
                        }}
                      >
                        {call.studentName}
                      </div>
                      <div style={{ fontSize: 14, color: isCurrentCall ? "#a93030" : "#666" }}>
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
  );
}
