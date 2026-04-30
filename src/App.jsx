
import React, { useState } from "react";
import Porteiro from "./Porteiro";
import Dispositivo from "./Dispositivo";

export default function App() {
  const [modo, setModo] = useState(null);

  if (!modo) {
    return (
      <div style={{ padding: 40 }}>
        <h2>Escolha o modo</h2>
        <button onClick={() => setModo("porteiro")}>Porteiro</button>
        <button onClick={() => setModo("dispositivo")}>Dispositivo</button>
      </div>
    );
  }

  return modo === "porteiro" ? <Porteiro /> : <Dispositivo />;
}
