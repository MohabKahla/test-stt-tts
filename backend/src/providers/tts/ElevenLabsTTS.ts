import axios from 'axios';
import { ITTSProvider, SynthesizeOptions, AudioResult, Voice } from '../interfaces/ITTSProvider';

// Default voice IDs for ElevenLabs
// You can explore voices at https://elevenlabs.io/voice-lab
const DEFAULT_VOICE_ID = process.env.ELEVENLABS_DEFAULT_VOICE_ID || '21m00Tcm4TlvDq8ikWAM'; // Rachel (default)
const DEFAULT_MODEL = process.env.ELEVENLABS_DEFAULT_MODEL || 'eleven_multilingual_v2'; // Supports 29 languages including Arabic

export class ElevenLabsTTS implements ITTSProvider {
  name = 'ElevenLabs';
  private apiKey: string;
  private baseUrl = 'https://api.elevenlabs.io/v1';

  constructor() {
    this.apiKey = process.env.ELEVENLABS_API_KEY || '';
    if (!this.apiKey) {
      throw new Error('ELEVENLABS_API_KEY environment variable is not set');
    }
  }

  async synthesize(text: string, options?: SynthesizeOptions): Promise<AudioResult> {
    try {
      const voiceId = options?.voice || DEFAULT_VOICE_ID;
      const model = options?.model || DEFAULT_MODEL;
      const stability = options?.speed !== undefined ? options.speed : 0.5; // Use speed option for stability

      if (!voiceId) {
        throw new Error('Voice ID is required. Please pass a voice option or set ELEVENLABS_DEFAULT_VOICE_ID in your .env file');
      }

      const response = await axios.post(
        `${this.baseUrl}/text-to-speech/${voiceId}`,
        {
          text: text,
          model_id: model,
          voice_settings: {
            stability: stability,
            similarity_boost: 0.75,
          }
        },
        {
          headers: {
            'xi-api-key': this.apiKey,
            'Content-Type': 'application/json'
          },
          responseType: 'arraybuffer'
        }
      );

      const audioBuffer = Buffer.from(response.data);

      return {
        audio: audioBuffer,
        format: 'mp3', // ElevenLabs returns MP3 format
      };

    } catch (error: any) {
      console.error('ElevenLabs TTS synthesis error:', error.response?.data || error.message);
      throw new Error(`ElevenLabs TTS failed: ${error.response?.data?.detail?.message || error.message}`);
    }
  }

  async getVoices(): Promise<Voice[]> {
    try {
      const response = await axios.get(
        `${this.baseUrl}/voices`,
        {
          headers: {
            'xi-api-key': this.apiKey
          }
        }
      );

      if (response.data.voices) {
        return response.data.voices.map((voice: any) => {
          // Extract language information
          const labels = voice.labels || {};
          const language = labelsaccent || language; // Try to get accent/language

          return {
            id: voice.voice_id,
            name: voice.name,
            language: language || 'Multilingual',
            gender: labels.gender || undefined,
          };
        });
      }

      return [];
    } catch (error: any) {
      console.error('Failed to fetch ElevenLabs voices:', error.response?.data || error.message);

      // Fallback to popular voices if API call fails (e.g., missing permissions)
      console.log('Using fallback voice list for ElevenLabs');
      return this.getFallbackVoices();
    }
  }

  private getFallbackVoices(): Voice[] {
    return [
      // Predefined popular multilingual voices (support Arabic and other languages)
      { id: '21m00Tcm4TlvDq8ikWAM', name: 'Rachel', language: 'Multilingual', gender: 'Female' },
      { id: 'AZnzlk1XvdvUeBnXmlld', name: 'Domi', language: 'Multilingual', gender: 'Female' },
      { id: 'EXAVITQu4vr4xnSDxMaL', name: 'Bella', language: 'Multilingual', gender: 'Female' },
      { id: 'ErXwobaYiD0MjBEv2gSq', name: 'Antoni', language: 'Multilingual', gender: 'Male' },
      { id: 'MF3mGyEYCl7XYWbV9V6O', name: 'Elli', language: 'Multilingual', gender: 'Female' },
      { id: 'TxGEqnHWrfWFTfGW9XjX', name: 'Josh', language: 'Multilingual', gender: 'Male' },
      { id: 'VR6AewLTigWG4xSOukaG', name: 'Arnold', language: 'Multilingual', gender: 'Male' },
      { id: 'ODq5zmih8GrVes37Dizj', name: 'Patrick', language: 'Multilingual', gender: 'Male' },
      { id: 'bIHGb242EICVFPQLKN2k', name: 'Fin', language: 'Multilingual', gender: 'Male' },
      { id: 'nPczCjzI2devNBz1zQrh', name: 'Seraphina', language: 'Multilingual', gender: 'Female' },
    ];
  }

  getSupportedFormats(): string[] {
    return ['mp3'];
  }
}
