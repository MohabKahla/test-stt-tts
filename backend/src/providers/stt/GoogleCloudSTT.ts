import speech from '@google-cloud/speech';
import { ISTTProvider, TranscribeOptions, TranscriptionResult } from '../interfaces/ISTTProvider';

export class GoogleCloudSTT implements ISTTProvider {
  name = 'Google Cloud Speech-to-Text';
  private client: speech.SpeechClient | null = null;
  private apiKey: string;

  constructor() {
    this.apiKey = process.env.GOOGLE_CLOUD_API_KEY || '';

    // Only initialize client if API key is present
    if (this.apiKey) {
      try {
        this.client = new speech.SpeechClient({
          apiKey: this.apiKey
        });
      } catch (error) {
        console.error('Failed to initialize Google Cloud Speech client:', error);
      }
    }
  }

  async transcribe(audioFile: Buffer, options?: TranscribeOptions): Promise<TranscriptionResult> {
    // Check if API key is configured
    if (!this.apiKey || !this.client) {
      throw new Error('GOOGLE_CLOUD_API_KEY environment variable is not set. Please add your Google Cloud API key to the .env file.');
    }

    try {
      // Convert buffer to base64 for Google Cloud
      const audioContent = audioFile.toString('base64');

      const config = {
        encoding: 'WEBM_OPUS' as const,
        sampleRateHertz: 48000,
        languageCode: (options?.language || 'ar-SA') as string,
        audioChannelCount: 1,
        enableAutomaticPunctuation: true,
        model: (options?.model || 'chirp') as string
      };

      const request = {
        audio: {
          content: audioContent
        },
        config
      };

      // Detect speech in the audio file
      const [response] = await this.client.recognize(request);

      // Extract transcription from response
      const transcription = response.results
        ?.map(result => result.alternatives?.[0]?.transcript)
        .filter(transcript => transcript)
        .join('\n') || '';

      // Calculate confidence (average of all alternatives)
      const confidence = response.results
        ?.map(result => result.alternatives?.[0]?.confidence || 0)
        .reduce((sum, conf) => sum + conf, 0) / (response.results?.length || 1) || 0;

      return {
        text: transcription,
        language: options?.language || 'ar-SA',
        confidence: confidence
      };

    } catch (error: any) {
      console.error('Google Cloud STT transcription error:', error.response?.data || error.message);
      throw new Error(`Google Cloud transcription failed: ${error.response?.data?.message || error.message}`);
    }
  }

  getSupportedFormats(): string[] {
    return [
      'audio/webm',
      'audio/wav',
      'audio/mp3',
      'audio/mpeg',
      'audio/ogg',
      'audio/flac',
      'audio/linear16',
      'audio/mulaw',
      'audio/amr-wb'
    ];
  }

  getLanguages(): string[] {
    // Arabic languages supported by Google Cloud Speech-to-Text
    return [
      'ar-SA', // Arabic (Saudi Arabia)
      'ar-AE', // Arabic (United Arab Emirates)
      'ar-BH', // Arabic (Bahrain)
      'ar-DZ', // Arabic (Algeria)
      'ar-EG', // Arabic (Egypt)
      'ar-IQ', // Arabic (Iraq)
      'ar-IL', // Arabic (Israel)
      'ar-JO', // Arabic (Jordan)
      'ar-KW', // Arabic (Kuwait)
      'ar-LB', // Arabic (Lebanon)
      'ar-MA', // Arabic (Morocco)
      'ar-OM', // Arabic (Oman)
      'ar-PS', // Arabic (State of Palestine)
      'ar-QA', // Arabic (Qatar)
      'ar-SY', // Arabic (Syria)
      'ar-TN', // Arabic (Tunisia)
      'ar-YE'   // Arabic (Yemen)
    ];
  }
}
