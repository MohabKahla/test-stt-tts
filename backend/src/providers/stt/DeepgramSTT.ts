import axios from 'axios';
import { ISTTProvider, TranscribeOptions, TranscriptionResult } from '../interfaces/ISTTProvider';

export class DeepgramSTT implements ISTTProvider {
  name = 'Deepgram';
  private apiKey: string;
  private baseUrl = 'https://api.deepgram.com';

  constructor() {
    this.apiKey = process.env.DEEPGRAM_API_KEY || '';
    // Don't throw error - allow provider to be listed without API key
  }

  async transcribe(audioFile: Buffer, options?: TranscribeOptions): Promise<TranscriptionResult> {
    // Check if API key is configured
    if (!this.apiKey) {
      throw new Error('DEEPGRAM_API_KEY environment variable is not set. Please add your Deepgram API key to the .env file.');
    }

    try {
      // Deepgram uses pre-recorded transcription endpoint
      const url = `${this.baseUrl}/v1/listen`;

      // Use 'multi' for automatic language detection
      // Nova-3 will automatically detect Arabic, English, or any other supported language
      const language = options?.language || 'multi';
      const deepgramLanguage = this.mapLanguageCode(language);

      console.log('[DeepgramSTT] Input language option:', options?.language);
      console.log('[DeepgramSTT] Mapped language:', deepgramLanguage);

      // Build request parameters - use multi for automatic language detection
      // Don't set encoding/sample_rate - let Deepgram auto-detect from the audio
      const params: any = {
        model: options?.model || 'nova-3', // nova-3 is Deepgram's latest model
        language: deepgramLanguage, // Use 'multi' for automatic detection
        smart_vocab: true,
        punctuate: true,
        paragraphs: true,
        diarize: false // Set to true if you want speaker diarization
      };

      const config = {
        headers: {
          'Authorization': `Token ${this.apiKey}`
          // Don't set Content-Type - let Deepgram auto-detect
        },
        params: params
      };

      console.log('[DeepgramSTT] Request params:', JSON.stringify(params, null, 2));

      // Send audio buffer for transcription
      const response = await axios.post(url, audioFile, config);

      // Debug: log full response
      console.log('[DeepgramSTT] Full response:', JSON.stringify(response.data, null, 2));

      // Extract transcription from Deepgram response
      const results = response.data.results;
      const alternative = results?.channels?.[0]?.alternatives?.[0];
      const transcript = alternative?.transcript || '';

      console.log('[DeepgramSTT] Transcript:', transcript);

      // Get detected languages from multilingual response
      const detectedLanguages = alternative?.languages || [];
      const primaryLanguage = detectedLanguages[0] || language;

      console.log('[DeepgramSTT] Detected languages:', detectedLanguages);
      console.log('[DeepgramSTT] Primary language:', primaryLanguage);

      // Get confidence score
      const confidence = alternative?.confidence || 0;

      return {
        text: transcript,
        language: primaryLanguage,
        confidence: confidence
      };

    } catch (error: any) {
      console.error('Deepgram STT transcription error:', error.response?.data || error.message);
      throw new Error(`Deepgram transcription failed: ${error.response?.data?.error || error.message}`);
    }
  }

  private mapLanguageCode(language: string): string {
    // Handle special auto-detect values
    if (language === 'auto' || language === 'multi' || language === 'detect') {
      return 'multi'; // Use multilingual mode for automatic language detection
    }

    // Map common language codes to Deepgram format
    // Deepgram Nova-3 supports full BCP 47 language tags including Arabic dialects (as of Jan 27, 2026)
    const languageMap: Record<string, string> = {
      'en-US': 'en',
      'en-GB': 'en',
      'en': 'en',
      // Arabic dialects - use full code (Nova-3 supports all major Arabic dialects as of Jan 27, 2026)
      'ar-SA': 'ar-SA', // Saudi Arabian Arabic
      'ar-AE': 'ar-AE', // UAE Arabic
      'ar-EG': 'ar-EG', // Egyptian Arabic
      'ar-QA': 'ar-QA', // Qatari Arabic
      'ar-KW': 'ar-KW', // Kuwaiti Arabic
      'ar-SY': 'ar-SY', // Syrian Arabic
      'ar-LB': 'ar-LB', // Lebanese Arabic
      'ar-PS': 'ar-PS', // Palestinian Arabic
      'ar-JO': 'ar-JO', // Jordanian Arabic
      'ar-SD': 'ar-SD', // Sudanese Arabic
      'ar-TD': 'ar-TD', // Chadian Arabic
      'ar-MA': 'ar-MA', // Moroccan Arabic
      'ar-DZ': 'ar-DZ', // Algerian Arabic
      'ar-TN': 'ar-TN', // Tunisian Arabic
      'ar-IQ': 'ar-IQ', // Iraqi Arabic
      'ar-IR': 'ar-IR', // Iranian Arabic
      'ar': 'ar',       // Arabic (General)
      'es': 'es',
      'fr': 'fr',
      'de': 'de',
      'it': 'it',
      'pt': 'pt',
      'nl': 'nl',
      'hi': 'hi',
      'ja': 'ja',
      'ko': 'ko',
      'sv': 'sv',
      'ru': 'ru',
      'tr': 'tr',
      'vi': 'vi',
      'th': 'th',
      'zh': 'zh',
      'uk': 'uk',
      'cs': 'cs',
      'pl': 'pl',
      'fi': 'fi'
    };

    // Return mapped language, or original if no mapping exists
    return languageMap[language] || language;
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
    // Languages supported by Deepgram Nova-3 (as of January 27, 2026)
    return [
      'en',       // English
      'es',       // Spanish
      'fr',       // French
      'de',       // German
      'it',       // Italian
      'pt',       // Portuguese
      'nl',       // Dutch
      'hi',       // Hindi
      'ja',       // Japanese
      'ko',       // Korean
      'sv',       // Swedish
      'ru',       // Russian
      'tr',       // Turkish
      'vi',       // Vietnamese
      'th',       // Thai
      'zh',       // Chinese
      'uk',       // Ukrainian
      'cs',       // Czech
      'pl',       // Polish
      'fi',       // Finnish
      'ar',       // Arabic (General)
      'ar-SA',    // Arabic (Saudi Arabia)
      'ar-AE',    // Arabic (UAE)
      'ar-EG',    // Arabic (Egypt)
      'ar-QA',    // Arabic (Qatar)
      'ar-KW',    // Arabic (Kuwait)
      'ar-SY',    // Arabic (Syria)
      'ar-LB',    // Arabic (Lebanon)
      'ar-PS',    // Arabic (Palestine)
      'ar-JO',    // Arabic (Jordan)
      'ar-SD',    // Arabic (Sudan)
      'ar-TD',    // Arabic (Chad)
      'ar-MA',    // Arabic (Morocco)
      'ar-DZ',    // Arabic (Algeria)
      'ar-TN',    // Arabic (Tunisia)
      'ar-IQ',    // Arabic (Iraq)
      'ar-IR'     // Arabic (Iran)
    ];
  }
}
