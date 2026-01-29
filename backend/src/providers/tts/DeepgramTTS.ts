import axios from 'axios';
import { ITTSProvider, SynthesizeOptions, AudioResult } from '../interfaces/ITTSProvider';

export class DeepgramTTS implements ITTSProvider {
  name = 'Deepgram Aura';
  private apiKey: string;
  private baseUrl = 'https://api.deepgram.com';

  constructor() {
    this.apiKey = process.env.DEEPGRAM_API_KEY || '';
    // Don't throw error - allow provider to be listed without API key
  }

  async synthesize(text: string, options?: SynthesizeOptions): Promise<AudioResult> {
    // Check if API key is configured
    if (!this.apiKey) {
      throw new Error('DEEPGRAM_API_KEY environment variable is not set. Please add your Deepgram API key to the .env file.');
    }

    try {
      // Deepgram TTS endpoint
      const url = `${this.baseUrl}/v1/speak`;

      // Get voice model from options or use default
      const voice = (options?.voice as string) || 'aura-2-thalia';

      const config = {
        headers: {
          'Authorization': `Token ${this.apiKey}`,
          'Content-Type': 'application/json'
        },
        params: {
          model: voice,
          encoding: 'mp3' // Default to MP3 format
        },
        responseType: 'arraybuffer' as const
      };

      const data = {
        text: text
      };

      // Send TTS request
      const response = await axios.post(url, data, config);

      // Return audio buffer
      return {
        audio: Buffer.from(response.data),
        format: 'mp3'
      };

    } catch (error: any) {
      console.error('Deepgram TTS synthesis error:', error.response?.data || error.message);

      // Try to parse error response
      let errorMessage = error.message;
      if (error.response?.data) {
        if (Buffer.isBuffer(error.response.data)) {
          const errorText = error.response.data.toString('utf8');
          try {
            const errorJson = JSON.parse(errorText);
            errorMessage = errorJson.err_msg || errorJson.error || errorText;
          } catch {
            errorMessage = errorText;
          }
        } else {
          errorMessage = error.response.data?.error || error.response.data?.err_msg || error.message;
        }
      }

      throw new Error(`Deepgram TTS failed: ${errorMessage}`);
    }
  }

  async getVoices(): Promise<any[]> {
    // Deepgram Aura voices
    return [
      {
        id: 'aura-2-thalia',
        name: 'Aura 2 Thalia',
        language: 'en',
        gender: 'female',
        description: 'English female voice (Aura 2)'
      },
      {
        id: 'aura-asteria-en',
        name: 'Aura Asteria English',
        language: 'en',
        gender: 'female',
        description: 'English female voice'
      },
      {
        id: 'aura-2-luna',
        name: 'Aura 2 Luna',
        language: 'en',
        gender: 'female',
        description: 'English female voice (Aura 2)'
      },
      {
        id: 'aura-2-stella',
        name: 'Aura 2 Stella',
        language: 'en',
        gender: 'female',
        description: 'English female voice (Aura 2)'
      },
      {
        id: 'aura-2-saoirse',
        name: 'Aura 2 Saoirse',
        language: 'en',
        gender: 'female',
        description: 'Irish English female voice (Aura 2)'
      },
      {
        id: 'aura-2-orion',
        name: 'Aura 2 Orion',
        language: 'en',
        gender: 'male',
        description: 'English male voice (Aura 2)'
      },
      {
        id: 'aura-zeus-en',
        name: 'Aura Zeus English',
        language: 'en',
        gender: 'male',
        description: 'English male voice'
      },
      {
        id: 'aura-arcas-en',
        name: 'Aura Arcas English',
        language: 'en',
        gender: 'male',
        description: 'English male voice'
      },
      {
        id: 'aura-2-harmony',
        name: 'Aura 2 Harmony',
        language: 'en',
        gender: 'female',
        description: 'English female voice with emotional range (Aura 2)'
      },
      // Additional language voices from Aura-2 expansion
      {
        id: 'aura-2-linnea',
        name: 'Aura 2 Linnea',
        language: 'sv',
        gender: 'female',
        description: 'Swedish female voice (Aura 2)'
      },
      {
        id: 'aura-2-mads',
        name: 'Aura 2 Mads',
        language: 'da',
        gender: 'male',
        description: 'Danish male voice (Aura 2)'
      },
      {
        id: 'aura-2-nanami',
        name: 'Aura 2 Nanami',
        language: 'ja',
        gender: 'female',
        description: 'Japanese female voice (Aura 2)'
      }
    ];
  }

  getSupportedFormats(): string[] {
    return ['mp3', 'pcm', 'mulaw'];
  }
}
