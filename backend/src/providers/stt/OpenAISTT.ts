import OpenAI from 'openai';
import { ISTTProvider, TranscribeOptions, TranscriptionResult } from '../interfaces/ISTTProvider';

export class OpenAISTT implements ISTTProvider {
  name = 'OpenAI Whisper';
  private client: OpenAI;

  constructor() {
    if (!process.env.OPENAI_API_KEY) {
      throw new Error('OPENAI_API_KEY environment variable is not set');
    }
    this.client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  }

  async transcribe(audioFile: Buffer, options?: TranscribeOptions): Promise<TranscriptionResult> {
    try {
      // Create a temporary file
      const file = new File([audioFile], 'audio.webm', { type: 'audio/webm' });

      // Build request parameters
      // If language is 'multi' or 'auto', don't send it - Whisper will auto-detect
      const params: any = {
        file: file as any,
        model: options?.model || 'whisper-1',
      };

      // Only add language parameter if it's a valid ISO-639-1 code (not 'multi' or 'auto')
      if (options?.language && options.language !== 'multi' && options.language !== 'auto') {
        params.language = options.language;
      }

      console.log('[OpenAI Whisper] Request params:', JSON.stringify({ ...params, file: 'audio.webm' }, null, 2));

      const response = await this.client.audio.transcriptions.create(params);

      return {
        text: response.text,
        language: options?.language || 'en',
      };
    } catch (error: any) {
      console.error('OpenAI Whisper transcription error:', error);
      throw new Error(`Transcription failed: ${error.message}`);
    }
  }

  getSupportedFormats(): string[] {
    return ['mp3', 'mp4', 'mpeg', 'mpga', 'm4a', 'wav', 'webm'];
  }

  getLanguages(): string[] {
    return [
      'en', 'es', 'fr', 'de', 'it', 'pt', 'nl', 'pl', 'ru', 'zh',
      'ja', 'ko', 'ar', 'tr', 'sv', 'hi', 'id', 'vi', 'th', 'ms'
    ];
  }
}
