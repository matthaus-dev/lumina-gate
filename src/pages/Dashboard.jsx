import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';

export default function Dashboard() {
  const navigate = useNavigate();
  const { tenantId } = useParams();

  return (
    <div className="min-h-screen bg-gradient-to-br from-azul-principal to-azul-hover flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="text-6xl mb-4">🎓</div>
          <h1 className="text-4xl font-bold text-white mb-2">LUMINA GATE</h1>
          <p className="text-blue-100 text-lg">Escolha o módulo que deseja acessar</p>
        </div>

        {/* Buttons Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Porteiro Button */}
          <button
            onClick={() => navigate(`/${tenantId}/porteiro`)}
            className="bg-white rounded-lg shadow-2xl p-8 hover:shadow-3xl transition transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-blue-400"
          >
            <div className="text-5xl mb-4 text-center">📞</div>
            <h2 className="text-2xl font-bold text-azul-principal mb-3 text-center">Porteiro</h2>
            <p className="text-gray-600 text-center text-sm">
              Registre visitas e faça chamadas para os alunos
            </p>
          </button>

          {/* Display Button */}
          <button
            onClick={() => navigate(`/${tenantId}/display`)}
            className="bg-white rounded-lg shadow-2xl p-8 hover:shadow-3xl transition transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-blue-400"
          >
            <div className="text-5xl mb-4 text-center">📺</div>
            <h2 className="text-2xl font-bold text-azul-principal mb-3 text-center">Display</h2>
            <p className="text-gray-600 text-center text-sm">
              Exiba informações em tempo real na tela
            </p>
          </button>
        </div>

        {/* Footer */}
        <div className="text-center mt-16">
          <p className="text-blue-100 text-sm">
            © 2026 LUMINA GATE. Todos os direitos reservados.
          </p>
        </div>
      </div>
    </div>
  );
}
