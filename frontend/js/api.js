// API Base URL
const API_BASE = '/api';

// Health Check
async function healthCheck() {
  const res = await fetch(`${API_BASE}/health`);
  return res.json();
}

// STT API
async function getSTTProviders() {
  const res = await fetch(`${API_BASE}/stt/providers`);
  if (!res.ok) throw new Error('Failed to fetch STT providers');
  return res.json();
}

async function transcribeAudio(provider, audioBlob, language) {
  const formData = new FormData();
  formData.append('provider', provider);
  formData.append('audio', audioBlob);
  if (language) {
    formData.append('language', language);
  }

  const res = await fetch(`${API_BASE}/stt/transcribe`, {
    method: 'POST',
    body: formData
  });
  if (!res.ok) throw new Error('Transcription failed');
  return res.json();
}

// TTS API
async function getTTSProviders() {
  const res = await fetch(`${API_BASE}/tts/providers`);
  if (!res.ok) throw new Error('Failed to fetch TTS providers');
  return res.json();
}

async function getTTSVoices(providerId) {
  const res = await fetch(`${API_BASE}/tts/voices/${providerId}`);
  if (!res.ok) throw new Error('Failed to fetch TTS voices');
  return res.json();
}

async function synthesizeSpeech(provider, text, voice) {
  const res = await fetch(`${API_BASE}/tts/synthesize`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ provider, text, voice })
  });
  if (!res.ok) throw new Error('Synthesis failed');
  return res.json();
}

// LLM API
async function getLLMProviders() {
  const res = await fetch(`${API_BASE}/llm/providers`);
  if (!res.ok) throw new Error('Failed to fetch LLM providers');
  return res.json();
}

async function getLLMModels(providerId) {
  const res = await fetch(`${API_BASE}/llm/models/${providerId}`);
  if (!res.ok) throw new Error('Failed to fetch LLM models');
  return res.json();
}

async function sendLLMMessage(provider, model, messages) {
  const res = await fetch(`${API_BASE}/llm/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ provider, model, messages })
  });
  if (!res.ok) throw new Error('LLM request failed');
  return res.json();
}

// Agent API
async function sendVoiceMessage(audioBlob, sttProvider, llmProvider, llmModel, ttsProvider, ttsVoice, conversationHistory, language = 'multi') {
  const formData = new FormData();
  formData.append('audio', audioBlob);
  formData.append('sttProvider', sttProvider);
  formData.append('llmProvider', llmProvider);
  formData.append('llmModel', llmModel);
  formData.append('ttsProvider', ttsProvider);
  formData.append('ttsVoice', ttsVoice);
  formData.append('conversationHistory', JSON.stringify(conversationHistory));
  formData.append('language', language); // Add language parameter (defaults to auto-detect)

  const res = await fetch(`${API_BASE}/agent/conversation`, {
    method: 'POST',
    body: formData
  });
  if (!res.ok) throw new Error('Agent conversation failed');
  return res.json();
}
