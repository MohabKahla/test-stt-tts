import OpenAI from 'openai';
import { ITTSProvider, SynthesizeOptions, AudioResult, Voice } from '../interfaces/ITTSProvider';
import fs from 'fs/promises';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';

export class OpenAITTS implements ITTSProvider {
  name = 'OpenAI TTS';
  private client: OpenAI;
  private voices: Voice[] = [
    { id: 'alloy', name: 'Alloy', language: 'en', gender: 'neutral' },
    { id: 'echo', name: 'Echo', language: 'en', gender: 'male' },
    { id: 'fable', name: 'Fable', language: 'en', gender: 'neutral' },
    { id: 'onyx', name: 'Onyx', language: 'en', gender: 'male' },
    { id: 'nova', name: 'Nova', language: 'en', gender: 'female' },
    { id: 'shimmer', name: 'Shimmer', language: 'en', gender: 'female' }
  ];

  constructor() {
    if (!process.env.OPENAI_API_KEY) {
      throw new Error('OPENAI_API_KEY environment variable is not set');
    }
    this.client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  }

  async synthesize(text: string, options?: SynthesizeOptions): Promise<AudioResult> {
    try {
      const response = await this.client.audio.speech.create({
        model: options?.model || 'tts-1',
        voice: (options?.voice as any) || 'alloy',
        input: text,
        speed: options?.speed || 1.0,
      });

      const buffer = Buffer.from(await response.arrayBuffer());

      return {
        audio: buffer,
        format: 'mp3',
      };
    } catch (error: any) {
      console.error('OpenAI TTS synthesis error:', error);
      throw new Error(`Synthesis failed: ${error.message}`);
    }
  }

  async getVoices(): Promise<Voice[]> {
    return this.voices;
  }

  getSupportedFormats(): string[] {
    return ['mp3'];
  }
}
