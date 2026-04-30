
import React, { useState } from "react";
import Porteiro from "./Porteiro";
import Dispositivo from "./Dispositivo";

const styles = {
  container: {
    padding: 20,
    fontFamily: "Arial, sans-serif",
    minHeight: "100vh",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
  },
  contentWrapper: {
    backgroundColor: "white",
    borderRadius: 12,
    padding: 40,
    boxShadow: "0 10px 40px rgba(0, 0, 0, 0.2)",
    maxWidth: 600,
    width: "100%",
    textAlign: "center",
  },
  header: {
    color: "#1a1a1a",
    marginBottom: 30,
    fontSize: 28,
    fontWeight: 700,
  },
  subtitle: {
    color: "#666",
    fontSize: 16,
    marginBottom: 40,
    lineHeight: 1.5,
  },
  buttonsContainer: {
    display: "flex",
    gap: 20,
    flexDirection: "row",
    justifyContent: "center",
    flexWrap: "wrap",
  },
  modeButton: {
    padding: "16px 32px",
    fontSize: 16,
    fontWeight: 600,
    border: "none",
    borderRadius: 8,
    cursor: "pointer",
    transition: "all 0.3s ease",
    flex: "1 1 200px",
    minWidth: "200px",
    maxWidth: "250px",
    textAlign: "center",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
  },
  porteirButton: {
    backgroundColor: "#0066cc",
    color: "white",
  },
  porteirButtonHover: {
    backgroundColor: "#0052a3",
    transform: "translateY(-2px)",
    boxShadow: "0 8px 20px rgba(0, 102, 204, 0.3)",
  },
  dispositivoButton: {
    backgroundColor: "#28a745",
    color: "white",
  },
  dispositivoButtonHover: {
    backgroundColor: "#218838",
    transform: "translateY(-2px)",
    boxShadow: "0 8px 20px rgba(40, 167, 69, 0.3)",
  },
  icon: {
    fontSize: 24,
  },
};

export default function App() {
  const [modo, setModo] = useState(null);
  const [hoverPorteiro, setHoverPorteiro] = useState(false);
  const [hoverDispositivo, setHoverDispositivo] = useState(false);

  if (!modo) {
    return (
      <div style={styles.container}>
        <div style={styles.contentWrapper} className="app-content-wrapper">
          <h1 style={styles.header} className="app-header">🚪 Sistema Chamada Escolar</h1>
          <p style={styles.subtitle}>
            Selecione o modo de operação para começar
          </p>
          
          <div style={styles.buttonsContainer} className="app-buttons-container">
            <button
              style={{
                ...styles.modeButton,
                ...styles.porteirButton,
                ...(hoverPorteiro ? styles.porteirButtonHover : {}),
              }}
              onClick={() => setModo("porteiro")}
              onMouseEnter={() => setHoverPorteiro(true)}
              onMouseLeave={() => setHoverPorteiro(false)}
            >
              <span style={styles.icon}>📞</span>
              <span>Porteiro</span>
            </button>
            
            <button
              style={{
                ...styles.modeButton,
                ...styles.dispositivoButton,
                ...(hoverDispositivo ? styles.dispositivoButtonHover : {}),
              }}
              onClick={() => setModo("dispositivo")}
              onMouseEnter={() => setHoverDispositivo(true)}
              onMouseLeave={() => setHoverDispositivo(false)}
            >
              <span style={styles.icon}>📺</span>
              <span>Dispositivo</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  return modo === "porteiro" ? <Porteiro /> : <Dispositivo />;
}
