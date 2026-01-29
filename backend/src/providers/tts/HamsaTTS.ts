import axios from 'axios';
import { ITTSProvider, SynthesizeOptions, AudioResult } from '../interfaces/ITTSProvider';

// Default voice ID for Hamsa TTS
// Users should get their voiceId from https://cloud.tryhamsa.com/voices
// This is a placeholder - you need to replace it with your actual voice UUID from the dashboard
const DEFAULT_VOICE_ID = process.env.HAMSA_DEFAULT_VOICE_ID || '';

export class HamsaTTS implements ITTSProvider {
  name = 'Hamsa AI';
  private apiKey: string;
  private baseUrl = 'https://api.tryhamsa.com/v1';

  constructor() {
    this.apiKey = process.env.HAMSA_API_KEY || '';
    if (!this.apiKey) {
      throw new Error('HAMSA_API_KEY environment variable is not set');
    }
    if (!DEFAULT_VOICE_ID) {
      console.warn('WARNING: HAMSA_DEFAULT_VOICE_ID not set in environment variables.');
      console.warn('Please add a valid voice UUID from https://cloud.tryhamsa.com/voices to your .env file');
    }
  }

  async synthesize(text: string, options?: SynthesizeOptions): Promise<AudioResult> {
    try {
      // Step 1: Submit TTS job to Hamsa
      // Get voiceId from options, environment variable, or use a default Arabic voice
      const voiceId = (options?.voice as any) || DEFAULT_VOICE_ID;

      if (!voiceId) {
        throw new Error('Voice ID is required. Please add HAMSA_DEFAULT_VOICE_ID to your .env file or pass voice option in the format: xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx');
      }

      const jobResponse = await axios.post(
        `${this.baseUrl}/jobs/text-to-speech`,
        {
          voiceId: voiceId,
          text: text
        },
        {
          headers: {
            'Authorization': `Token ${this.apiKey}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (!jobResponse.data.success && !jobResponse.data.data) {
        throw new Error(jobResponse.data.message || 'Failed to submit TTS job');
      }

      const jobData = jobResponse.data.data;

      // Check if job is already COMPLETED with mediaUrl
      if (jobData.status === 'COMPLETED') {
        const mediaUrl = jobData.mediaUrl || jobData.jobResponse?.ttsMediaFile;
        if (mediaUrl) {
          // Download the audio file
          const audioResponse = await axios.get(mediaUrl, {
            responseType: 'arraybuffer'
          });
          const audioBuffer = Buffer.from(audioResponse.data);
          return {
            audio: audioBuffer,
            format: 'wav', // Hamsa returns WAV files
          };
        }
      }

      // Handle both response formats for jobId
      const jobId = jobData?.jobId || jobData?.id;

      if (!jobId) {
        throw new Error('No job ID returned from Hamsa');
      }

      // Step 2: Poll for job completion
      const mediaUrl = await this.pollJobCompletion(jobId);

      // Step 3: Download the audio file
      const audioResponse = await axios.get(mediaUrl, {
        responseType: 'arraybuffer'
      });

      const audioBuffer = Buffer.from(audioResponse.data);

      return {
        audio: audioBuffer,
        format: 'wav', // Hamsa returns WAV files
      };

    } catch (error: any) {
      console.error('Hamsa TTS synthesis error:', error.response?.data || error.message);
      throw new Error(`Hamsa TTS failed: ${error.response?.data?.message || error.message}`);
    }
  }

  private async pollJobCompletion(jobId: string, maxAttempts = 30, intervalMs = 2000): Promise<string> {
    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      try {
        const response = await axios.get(
          `${this.baseUrl}/jobs?jobId=${jobId}`,
          {
            headers: {
              'Authorization': `Token ${this.apiKey}`
            }
          }
        );

        const job = response.data.data;

        if (job.status === 'COMPLETED') {
          // Extract mediaUrl from job response
          const mediaUrl = job.jobResponse?.mediaUrl || job.mediaUrl;
          if (!mediaUrl) {
            throw new Error('Job completed but no media URL found');
          }
          return mediaUrl;
        } else if (job.status === 'FAILED') {
          throw new Error(job.jobResponse?.error || 'TTS job failed');
        }

        // Job is still PENDING, wait and retry
        await new Promise(resolve => setTimeout(resolve, intervalMs));

      } catch (error: any) {
        if (attempt === maxAttempts - 1) {
          throw error;
        }
        // Wait before retry on error
        await new Promise(resolve => setTimeout(resolve, intervalMs));
      }
    }

    throw new Error('TTS job timed out');
  }

  async getVoices(): Promise<any[]> {
    try {
      const response = await axios.get(
        `${this.baseUrl}/tts/voices`,
        {
          headers: {
            'Authorization': `Token ${this.apiKey}`
          }
        }
      );

      if (response.data.success && response.data.data) {
        return response.data.data.map((voice: any) => ({
          id: voice.id,
          name: voice.name,
          language: voice.language,
          tags: voice.tags,
          dialect: voice.dialect?.name
        }));
      }

      return [];
    } catch (error) {
      console.error('Failed to fetch Hamsa voices:', error);
      return [];
    }
  }

  getSupportedFormats(): string[] {
    return ['mp3'];
  }
}
