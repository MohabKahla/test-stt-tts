import { ITTSProvider } from '../interfaces/ITTSProvider';
import { OpenAITTS } from './OpenAITTS';
import { HamsaTTS } from './HamsaTTS';
import { DeepgramTTS } from './DeepgramTTS';
import { ElevenLabsTTS } from './ElevenLabsTTS';

export const TTSProviders: Record<string, new () => ITTSProvider> = {
  OpenAITTS: OpenAITTS,
  HamsaTTS: HamsaTTS,
  DeepgramTTS: DeepgramTTS,
  ElevenLabsTTS: ElevenLabsTTS,
};

export function createTTSProvider(classname: string): ITTSProvider {
  const ProviderClass = TTSProviders[classname];
  if (!ProviderClass) {
    throw new Error(`Unknown TTS provider: ${classname}`);
  }
  return new ProviderClass();
}

export { OpenAITTS, HamsaTTS, DeepgramTTS, ElevenLabsTTS };
