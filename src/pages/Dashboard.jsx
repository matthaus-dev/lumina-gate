import React from 'react';
import { Monitor, Phone, GraduationCap } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';

export default function Dashboard() {
  const navigate = useNavigate();
  const { tenantId } = useParams();

  return (
    <div className="min-h-screen bg-gradient-to-br from-azul-principal to-azul-hover flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        <div className="text-center mb-16">
          <GraduationCap className="w-16 h-16 mx-auto mb-4 text-white" />
          <h1 className="text-4xl font-bold text-white mb-2">LUMINA GATE</h1>
          <p className="text-blue-100 text-lg">Escolha o modulo que deseja acessar</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <button
            onClick={() => navigate(`/${tenantId}/porteiro`)}
            className="bg-white rounded-lg shadow-2xl p-8 hover:shadow-3xl transition transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-blue-400"
          >
            <Phone className="w-14 h-14 mb-4 mx-auto text-azul-principal" />
            <h2 className="text-2xl font-bold text-azul-principal mb-3 text-center">Porteiro</h2>
            <p className="text-gray-600 text-center text-sm">
              Registre visitas e faca chamadas para os alunos
            </p>
          </button>

          <button
            onClick={() => navigate(`/${tenantId}/display`)}
            className="bg-white rounded-lg shadow-2xl p-8 hover:shadow-3xl transition transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-blue-400"
          >
            <Monitor className="w-14 h-14 mb-4 mx-auto text-azul-principal" />
            <h2 className="text-2xl font-bold text-azul-principal mb-3 text-center">Display</h2>
            <p className="text-gray-600 text-center text-sm">
              Exiba informacoes em tempo real na tela
            </p>
          </button>
        </div>

        <div className="text-center mt-16">
          <p className="text-blue-100 text-sm">
            (c) 2026 LUMINA GATE. Todos os direitos reservados.
          </p>
        </div>
      </div>
    </div>
  );
}
