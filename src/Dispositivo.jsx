import React, { useState, useEffect } from 'react';
import { Monitor, UserRound } from 'lucide-react';
import { useTenant } from './context/TenantContext';
import { useDataSourceConfig } from './context/TenantContext';
import { getDataSource } from './services/dataSource';
import Navbar from './components/Navbar';

export default function Dispositivo() {
  const tenantId = useTenant();
  const [currentCall, setCurrentCall] = useState(null);
  const [activeCalls, setActiveCalls] = useState([]);
  const [callIndex, setCallIndex] = useState(0);
  const [voiceSettings, setVoiceSettings] = useState({
    enabled: true,
    rate: 0.9,
    pitch: 1.0,
    selectedVoice: null,
  });

  const dataSource = getDataSource();

  // Listener for active calls
  useEffect(() => {
    const unsubscribe = dataSource.onSnapshotCalls(tenantId, (calls) => {
      console.log('[Dispositivo] Chamadas atualizadas:', calls);
      setActiveCalls(calls || []);
    });

    return () => {
      if (typeof unsubscribe === 'function') {
        unsubscribe();
      }
    };
  }, [tenantId]);

  // Load voice settings
  useEffect(() => {
    const loadVoiceSettings = async () => {
      try {
        const settings = await dataSource.getSettings(tenantId);
        if (settings?.features?.voice) {
          setVoiceSettings(settings.features.voice);
        }
      } catch (error) {
        console.error('[Dispositivo] Error loading voice settings:', error);
      }
    };

    loadVoiceSettings();
  }, [tenantId]);

  // Update current call every 7 seconds
  useEffect(() => {
    if (activeCalls.length === 0) {
      setCurrentCall(null);
      setCallIndex(0);
      return;
    }

    setCurrentCall(activeCalls[callIndex]);

    const interval = setInterval(() => {
      setCallIndex(prev => (prev + 1) % activeCalls.length);
    }, 7000);

    return () => clearInterval(interval);
  }, [activeCalls, callIndex]);

  // Speak current call name
  useEffect(() => {
    if (currentCall?.studentName && voiceSettings.enabled) {
      console.log(`[Dispositivo] Anunciando: ${currentCall.studentName}`);

      const synthesis = window.speechSynthesis;
      if (synthesis) {
        synthesis.cancel();

        const utterance = new SpeechSynthesisUtterance(
          `Aluno ${currentCall.studentName}, da turma ${currentCall.studentClass}.`
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
    }
  }, [currentCall, voiceSettings]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-azul-principal to-azul-hover">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 py-8">
        {!currentCall ? (
          <div className="h-[60vh] flex flex-col items-center justify-center text-center">
            <Monitor className="w-28 h-28 mb-8 animate-pulse text-white" />
            <h1 className="text-5xl font-bold text-white mb-4">Aguardando Chamadas</h1>
            <p className="text-2xl text-blue-100">
              {activeCalls.length === 0
                ? 'Nenhuma chamada pendente'
                : 'Preparando próximo aluno...'}
            </p>
          </div>
        ) : (
          <div className="min-h-[60vh] flex flex-col items-center justify-center">
            {/* Current Call Card */}
            <div className="bg-white rounded-2xl shadow-2xl p-12 max-w-2xl w-full mb-12 border-l-8 border-verde-principal animate-bounce">
              <p className="text-center text-gray-600 text-xl mb-6 inline-flex items-center justify-center gap-2 w-full">
                <UserRound className="w-6 h-6" />
                PROXIMO ALUNO
              </p>

              <h2 className="text-center text-6xl font-bold text-azul-principal mb-6">
                {currentCall.studentName}
              </h2>

              <div className="bg-azul-claro rounded-xl p-8 mb-8">
                <p className="text-center text-xl text-azul-principal font-bold">
                  Turma: {currentCall.studentClass}
                </p>
              </div>

              <div className="text-center">
                <p className="text-gray-600 text-lg">
                  {callIndex + 1} de {activeCalls.length}
                </p>
                <div className="mt-4 flex gap-2 justify-center">
                  {activeCalls.map((_, idx) => (
                    <div
                      key={idx}
                      className={`h-3 rounded-full transition ${
                        idx === callIndex
                          ? 'w-8 bg-verde-principal'
                          : 'w-3 bg-gray-300'
                      }`}
                    ></div>
                  ))}
                </div>
              </div>
            </div>

            {/* Queue List */}
            {activeCalls.length > 1 && (
              <div className="w-full max-w-2xl">
                <h3 className="text-2xl font-bold text-white mb-6 text-center">
                  Próximas Chamadas
                </h3>
                <div className="space-y-3">
                  {activeCalls
                    .slice(callIndex + 1)
                    .concat(activeCalls.slice(0, callIndex))
                    .map((call, idx) => (
                      <div
                        key={call.id}
                        className="bg-white bg-opacity-20 backdrop-blur-sm rounded-lg p-4 flex items-center gap-4 border border-white border-opacity-30"
                      >
                        <div className="text-4xl flex-shrink-0">
                          {idx + 2}
                        </div>
                        <div className="flex-grow">
                          <p className="text-white font-bold text-lg">
                            {call.studentName}
                          </p>
                          <p className="text-blue-100 text-sm">
                            Turma: {call.studentClass}
                          </p>
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Footer Stats */}
      <div className="fixed bottom-0 left-0 right-0 bg-black bg-opacity-40 backdrop-blur-sm border-t border-white border-opacity-20">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <p className="text-white text-lg font-semibold">
            Total na Fila: <span className="text-verde-principal">{activeCalls.length}</span>
          </p>
          <p className="text-white text-lg font-semibold">
            Hora: <span className="text-verde-principal">{new Date().toLocaleTimeString('pt-BR')}</span>
          </p>
        </div>
      </div>
    </div>
  );
}
