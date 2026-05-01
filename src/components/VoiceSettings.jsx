import React, { useState, useEffect } from 'react';

export default function VoiceSettings({ value = {}, onChange }) {
  const [voices, setVoices] = useState([]);
  const [testSpeaking, setTestSpeaking] = useState(false);
  const [settings, setSettings] = useState({
    enabled: value.enabled ?? true,
    rate: value.rate ?? 0.9,
    pitch: value.pitch ?? 1.0,
    selectedVoice: value.selectedVoice ?? null,
  });

  // Update local state when prop changes
  useEffect(() => {
    setSettings({
      enabled: value.enabled ?? true,
      rate: value.rate ?? 0.9,
      pitch: value.pitch ?? 1.0,
      selectedVoice: value.selectedVoice ?? null,
    });
  }, [value]);

  useEffect(() => {
    // Load available voices
    const loadVoices = () => {
      const availableVoices = window.speechSynthesis.getVoices();
      // Filter for Portuguese voices
      const ptVoices = availableVoices.filter(v => v.lang.startsWith('pt'));
      setVoices(ptVoices.length > 0 ? ptVoices : availableVoices);
    };

    loadVoices();
    window.speechSynthesis.onvoiceschanged = loadVoices;

    return () => {
      window.speechSynthesis.onvoiceschanged = null;
    };
  }, []);

  const handleChange = (key, newValue) => {
    const updatedSettings = {
      ...settings,
      [key]: newValue,
    };
    setSettings(updatedSettings);
    onChange(updatedSettings);
  };

  const handlePreview = () => {
    if (!settings.enabled) {
      alert('TTS está desativado. Ative para ouvir a prévia.');
      return;
    }

    setTestSpeaking(true);
    const text = 'Aluno João Silva, da turma Infantil 4.';
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'pt-BR';
    utterance.rate = settings.rate;
    utterance.pitch = settings.pitch;

    if (settings.selectedVoice) {
      const voice = voices.find(v => v.name === settings.selectedVoice);
      if (voice) {
        utterance.voice = voice;
      }
    } else if (voices.length > 0) {
      // Use first PT voice
      utterance.voice = voices[0];
    }

    utterance.onend = () => setTestSpeaking(false);
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(utterance);
  };

  return (
    <div className="space-y-6 p-6 bg-gray-50 rounded-lg border border-gray-200">
      <div>
        <h3 className="text-lg font-bold text-gray-900 mb-4">⚙️ Configuração de Voz (TTS)</h3>
      </div>

      {/* Enable/Disable Toggle */}
      <div className="flex items-center justify-between">
        <label className="block text-sm font-medium text-gray-700">
          Ativar Text-to-Speech
        </label>
        <button
          type="button"
          onClick={() => handleChange('enabled', !settings.enabled)}
          className={`relative inline-flex h-6 w-11 items-center rounded-full transition ${
            settings.enabled ? 'bg-azul-principal' : 'bg-gray-300'
          }`}
        >
          <span
            className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${
              settings.enabled ? 'translate-x-6' : 'translate-x-1'
            }`}
          />
        </button>
      </div>

      {settings.enabled && (
        <>
          {/* Speed Slider */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Velocidade: <span className="text-azul-principal font-bold">{settings.rate.toFixed(1)}x</span>
            </label>
            <input
              type="range"
              min="0.5"
              max="2.0"
              step="0.1"
              value={settings.rate}
              onChange={(e) => handleChange('rate', parseFloat(e.target.value))}
              className="w-full h-2 bg-gray-300 rounded-lg appearance-none cursor-pointer accent-azul-principal"
            />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>Muito lento</span>
              <span>Normal</span>
              <span>Muito rápido</span>
            </div>
          </div>

          {/* Pitch Slider */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tom (Pitch): <span className="text-azul-principal font-bold">{settings.pitch.toFixed(1)}</span>
            </label>
            <input
              type="range"
              min="0.5"
              max="2.0"
              step="0.1"
              value={settings.pitch}
              onChange={(e) => handleChange('pitch', parseFloat(e.target.value))}
              className="w-full h-2 bg-gray-300 rounded-lg appearance-none cursor-pointer accent-azul-principal"
            />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>Grave</span>
              <span>Normal</span>
              <span>Agudo</span>
            </div>
          </div>

          {/* Voice Selection */}
          {voices.length > 1 && (
            <div>
              <label htmlFor="voice" className="block text-sm font-medium text-gray-700 mb-2">
                Voz
              </label>
              <select
                id="voice"
                value={settings.selectedVoice || ''}
                onChange={(e) => handleChange('selectedVoice', e.target.value || null)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-azul-principal focus:border-transparent"
              >
                <option value="">Padrão (automático)</option>
                {voices.map((voice) => (
                  <option key={voice.name} value={voice.name}>
                    {voice.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Preview Button */}
          <div>
            <button
              type="button"
              onClick={handlePreview}
              disabled={testSpeaking}
              className="w-full px-4 py-2 bg-azul-principal hover:bg-azul-hover text-white font-medium rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {testSpeaking ? '🔊 Ouvindo prévia...' : '🔊 Ouvir Prévia'}
            </button>
            <p className="text-xs text-gray-500 mt-2 text-center">
              Testa: "Aluno João Silva, da turma Infantil 4."
            </p>
          </div>
        </>
      )}

      {!settings.enabled && (
        <div className="p-4 bg-blue-50 border-l-4 border-blue-400 text-blue-700 rounded text-sm">
          TTS desativado. Ative o toggle acima para configurar a voz.
        </div>
      )}
    </div>
  );
}
