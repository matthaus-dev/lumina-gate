import React, { useState, useEffect } from 'react';
import { Monitor, UserRound } from 'lucide-react';
import { useTenant } from './context/TenantContext';
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

        const voices = synthesis.getVoices();
        if (voiceSettings.selectedVoice) {
          const selectedVoice = voices.find(v => v.name === voiceSettings.selectedVoice);
          if (selectedVoice) {
            utterance.voice = selectedVoice;
          }
        } else {
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

      <main className="max-w-7xl mx-auto px-4 pt-8 pb-28">
        {!currentCall ? (
          <div className="min-h-[calc(100vh-12rem)] flex flex-col items-center justify-center text-center">
            <Monitor className="w-24 h-24 mb-8 text-white/90" />
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">Aguardando Chamadas</h1>
            <p className="text-xl md:text-2xl text-blue-100">
              {activeCalls.length === 0
                ? 'Nenhuma chamada pendente'
                : 'Preparando proximo aluno...'}
            </p>
          </div>
        ) : (
          <div className="min-h-[calc(100vh-12rem)] flex flex-col items-center justify-center gap-8">
            <section className="bg-white rounded-xl shadow-2xl max-w-4xl w-full overflow-hidden border border-white/70">
              <div className="bg-verde-principal text-white px-6 py-4 flex items-center justify-center gap-3">
                <UserRound className="w-7 h-7" />
                <p className="text-lg md:text-xl font-bold tracking-wide">PROXIMO ALUNO</p>
              </div>

              <div className="p-8 md:p-12">
                <h2 className="text-center text-4xl md:text-6xl font-bold text-azul-principal mb-8 break-words leading-tight">
                  {currentCall.studentName}
                </h2>

                <div className="bg-azul-claro rounded-lg p-6 mb-8 border border-blue-100">
                  <p className="text-center text-xl md:text-2xl text-azul-principal font-bold break-words">
                    Turma: {currentCall.studentClass}
                  </p>
                </div>

                <div className="text-center">
                  <p className="text-gray-600 text-lg">
                    {callIndex + 1} de {activeCalls.length}
                  </p>
                  <div className="mt-4 flex gap-2 justify-center flex-wrap">
                    {activeCalls.map((_, idx) => (
                      <div
                        key={idx}
                        className={`h-3 rounded-full transition ${
                          idx === callIndex
                            ? 'w-8 bg-verde-principal'
                            : 'w-3 bg-gray-300'
                        }`}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </section>

            {activeCalls.length > 1 && (
              <section className="w-full max-w-4xl">
                <h3 className="text-xl md:text-2xl font-bold text-white mb-4 text-center">
                  Proximas Chamadas
                </h3>
                <div className="grid md:grid-cols-2 gap-3 max-h-56 overflow-y-auto pr-1">
                  {activeCalls
                    .slice(callIndex + 1)
                    .concat(activeCalls.slice(0, callIndex))
                    .map((call, idx) => (
                      <div
                        key={call.id}
                        className="bg-white/20 backdrop-blur-sm rounded-lg p-4 flex items-center gap-4 border border-white/30"
                      >
                        <div className="w-10 h-10 flex-shrink-0 rounded-full bg-white/20 text-white font-bold flex items-center justify-center">
                          {idx + 2}
                        </div>
                        <div className="flex-grow min-w-0">
                          <p className="text-white font-bold text-lg break-words">
                            {call.studentName}
                          </p>
                          <p className="text-blue-100 text-sm break-words">
                            Turma: {call.studentClass}
                          </p>
                        </div>
                      </div>
                    ))}
                </div>
              </section>
            )}
          </div>
        )}
      </main>

      <div className="fixed bottom-0 left-0 right-0 bg-black/40 backdrop-blur-sm border-t border-white/20">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <p className="text-white text-base md:text-lg font-semibold">
            Total na Fila: <span className="text-verde-principal">{activeCalls.length}</span>
          </p>
          <p className="text-white text-base md:text-lg font-semibold">
            Hora: <span className="text-verde-principal">{new Date().toLocaleTimeString('pt-BR')}</span>
          </p>
        </div>
      </div>
    </div>
  );
}
