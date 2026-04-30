
import React, { useState, useEffect } from "react";
import { db } from "./firebase";
import { collection, addDoc, updateDoc, doc, onSnapshot, query, where, serverTimestamp } from "firebase/firestore";
import { mockedStudents, agruparPorSerie } from "./mockedStudents";

const styles = {
  container: {
    padding: 20,
    fontFamily: "Arial, sans-serif",
    maxWidth: 1000,
    margin: "0 auto",
  },
  header: {
    color: "#1a1a1a",
    marginBottom: 20,
  },
  tabsContainer: {
    display: "flex",
    gap: 10,
    marginBottom: 30,
    borderBottom: "2px solid #ddd",
    paddingBottom: 10,
  },
  tab: {
    padding: "10px 20px",
    border: "none",
    cursor: "pointer",
    fontSize: 14,
    fontWeight: 500,
    backgroundColor: "transparent",
    borderBottom: "3px solid transparent",
    color: "#666",
  },
  tabActive: {
    color: "#0066cc",
    borderBottomColor: "#0066cc",
  },
  section: {
    marginBottom: 40,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 600,
    color: "#333",
    marginBottom: 15,
    borderLeft: "4px solid #0066cc",
    paddingLeft: 10,
  },
  studentList: {
    display: "flex",
    flexDirection: "column",
    gap: 10,
  },
  studentCard: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 12,
    backgroundColor: "#f9f9f9",
    border: "1px solid #ddd",
    borderRadius: 6,
    hover: { backgroundColor: "#f0f0f0" },
  },
  studentName: {
    fontSize: 16,
    color: "#333",
  },
  callButton: {
    padding: "8px 16px",
    backgroundColor: "#28a745",
    color: "white",
    border: "none",
    borderRadius: 4,
    cursor: "pointer",
    fontWeight: 500,
    fontSize: 14,
  },
  activeCallCard: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 12,
    backgroundColor: "#fff3cd",
    border: "2px solid #ffc107",
    borderRadius: 6,
    marginBottom: 10,
  },
  activeCallInfo: {
    display: "flex",
    flexDirection: "column",
    gap: 4,
  },
  confirmButton: {
    padding: "8px 16px",
    backgroundColor: "#dc3545",
    color: "white",
    border: "none",
    borderRadius: 4,
    cursor: "pointer",
    fontWeight: 500,
    fontSize: 14,
  },
  emptyMessage: {
    color: "#999",
    fontStyle: "italic",
  },
};

export default function Porteiro() {
  const [selectedSerie, setSelectedSerie] = useState(null);
  const [activeCalls, setActiveCalls] = useState([]);
  const [loading, setLoading] = useState(false);

  const studentsBySerie = agruparPorSerie(mockedStudents);
  const series = Object.keys(studentsBySerie).sort();

  // Inicializar com primeira série
  useEffect(() => {
    if (series.length > 0 && !selectedSerie) {
      setSelectedSerie(series[0]);
    }
  }, [series, selectedSerie]);

  // Listener para chamadas ativas na fila
  useEffect(() => {
    const q = query(
      collection(db, "chamadas"),
      where("status", "==", "pending")
    );

    const unsub = onSnapshot(q, (snapshot) => {
      const calls = [];
      snapshot.forEach(doc => {
        calls.push({
          id: doc.id,
          ...doc.data(),
        });
      });
      setActiveCalls(calls);
    });

    return () => unsub();
  }, []);

  const chamarAluno = async (studentId, nome, serie) => {
    setLoading(true);
    try {
      console.log(`[Porteiro] Chamando aluno: ${nome} (${serie})`);
      const payload = {
        studentId,
        studentName: nome,
        studentClass: serie,
        status: "pending",
        createdAt: serverTimestamp(),
      };
      console.log(`[Porteiro] Payload a ser salvo:`, payload);
      
      const docRef = await addDoc(collection(db, "chamadas"), payload);
      console.log(`[Porteiro] ✅ Chamada criada com ID: ${docRef.id}`);
      console.log(`[Porteiro] Acesse em: db.chamadas.${docRef.id}`);
    } catch (error) {
      console.error("[Porteiro] ❌ ERRO ao chamar aluno:", error);
      console.error("[Porteiro] Código de erro:", error.code);
      console.error("[Porteiro] Mensagem:", error.message);
      alert("Erro ao chamar aluno: " + error.message);
    }
    setLoading(false);
  };

  const confirmarSaida = async (callId) => {
    setLoading(true);
    try {
      console.log(`[Porteiro] Confirmando saída da chamada: ${callId}`);
      await updateDoc(doc(db, "chamadas", callId), {
        status: "confirmed",
        confirmedAt: serverTimestamp(),
      });
      console.log(`[Porteiro] Saída confirmada`);
    } catch (error) {
      console.error("[Porteiro] Erro ao confirmar saída:", error);
      alert("Erro ao confirmar saída: " + error.message);
    }
    setLoading(false);
  };

  return (
    <div style={styles.container}>
      <h2 style={styles.header}>📞 Porteiro - Lista de Alunos</h2>

      {/* Abas de Séries */}
      <div style={styles.tabsContainer}>
        {series.map(serie => (
          <button
            key={serie}
            style={{
              ...styles.tab,
              ...(selectedSerie === serie ? styles.tabActive : {}),
            }}
            onClick={() => setSelectedSerie(serie)}
          >
            {serie}
          </button>
        ))}
      </div>

      {/* Lista de Alunos */}
      {selectedSerie && (
        <div style={styles.section}>
          <h3 style={styles.sectionTitle}>Alunos da Série {selectedSerie}</h3>
          <div style={styles.studentList}>
            {studentsBySerie[selectedSerie].map(student => {
              const alreadyInQueue = activeCalls.some(c => c.studentId === student.id);
              return (
                <div key={student.id} style={styles.studentCard}>
                  <span style={styles.studentName}>{student.nome}</span>
                  <button
                    style={{
                      ...styles.callButton,
                      ...(alreadyInQueue
                        ? {
                            backgroundColor: "#ccc",
                            cursor: "not-allowed",
                            opacity: 0.6,
                          }
                        : {}),
                    }}
                    onClick={() => chamarAluno(student.id, student.nome, student.serie)}
                    disabled={loading || alreadyInQueue}
                    title={alreadyInQueue ? "Aluno já está na fila" : ""}
                  >
                    {alreadyInQueue ? "✓ Na Fila" : "Chamar"}
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
                          backgroundColor: "#ff6b6b",
                          borderColor: "#d63031",
                          boxShadow: "0 0 15px rgba(214, 48, 49, 0.3)",
                        }
                      : {}),
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      gap: 15,
                      alignItems: "center",
                      flex: 1,
                    }}
                  >
                    <div
                      style={{
                        fontSize: 18,
                        fontWeight: 700,
                        backgroundColor: isFirst ? "#d63031" : "#999",
                        color: "white",
                        width: 40,
                        height: 40,
                        borderRadius: "50%",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      {idx + 1}
                    </div>
                    <div style={styles.activeCallInfo}>
                      <strong style={isFirst ? { color: "#d63031" , fontSize: 16} : {}}>
                        {call.studentName}
                      </strong>
                      <small>Turma: {call.studentClass}</small>
                      {isFirst && <small style={{ color: "#d63031", fontWeight: 600 }}>🔊 Sendo chamado...</small>}
                    </div>
                  </div>
                  <button
                    style={styles.confirmButton}
                    onClick={() => confirmarSaida(call.id)}
                    disabled={loading}
                  >
                    Confirmar Saída
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
