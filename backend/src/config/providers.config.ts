import { OPENROUTER_MODELS } from './openrouter-models';

export interface ProviderConfig {
  id: string;
  name: string;
  class: string;
  enabled: boolean;
  requiresAuth: boolean;
  models?: any[];
}

export interface ProvidersConfig {
  stt: ProviderConfig[];
  tts: ProviderConfig[];
  llm: ProviderConfig[];
}

export const PROVIDER_CONFIG: ProvidersConfig = {
  stt: [
    {
      id: 'openai-whisper',
      name: 'OpenAI Whisper',
      class: 'OpenAISTT',
      enabled: true,
      requiresAuth: true
    },
    {
      id: 'hamsa-stt',
      name: 'Hamsa AI STT',
      class: 'HamsaSTT',
      enabled: true,
      requiresAuth: true
    },
    {
      id: 'deepgram-stt',
      name: 'Deepgram Nova-3',
      class: 'DeepgramSTT',
      enabled: true,
      requiresAuth: true
    }
  ],
  tts: [
    {
      id: 'openai-tts',
      name: 'OpenAI TTS',
      class: 'OpenAITTS',
      enabled: true,
      requiresAuth: true
    },
    {
      id: 'hamsa-tts',
      name: 'Hamsa AI TTS',
      class: 'HamsaTTS',
      enabled: true,
      requiresAuth: true
    },
    {
      id: 'deepgram-tts',
      name: 'Deepgram Aura',
      class: 'DeepgramTTS',
      enabled: true,
      requiresAuth: true
    },
    {
      id: 'elevenlabs-tts',
      name: 'ElevenLabs',
      class: 'ElevenLabsTTS',
      enabled: true,
      requiresAuth: true
    }
  ],
  llm: [
    {
      id: 'openrouter',
      name: 'OpenRouter',
      class: 'OpenRouterLLM',
      enabled: true,
      requiresAuth: true,
      models: OPENROUTER_MODELS
    }
  ]
};
