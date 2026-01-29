import axios from 'axios';
import { ISTTProvider, TranscribeOptions, TranscriptionResult } from '../interfaces/ISTTProvider';
import FormData from 'form-data';

export class HamsaSTT implements ISTTProvider {
  name = 'Hamsa AI';
  private apiKey: string;
  private baseUrl = 'https://api.tryhamsa.com/v1';

  constructor() {
    this.apiKey = process.env.HAMSA_API_KEY || '';
    if (!this.apiKey) {
      throw new Error('HAMSA_API_KEY environment variable is not set');
    }
  }

  async transcribe(audioFile: Buffer, options?: TranscribeOptions): Promise<TranscriptionResult> {
    let mediaUrl = '';
    try {
      // Step 1: Upload audio buffer to get a public URL
      // Using litterbox.catbox.moe - a reliable temporary file hosting service
      const formData = new FormData();
      formData.append('reqtype', 'fileupload');
      formData.append('time', '24h'); // File expires after 24 hours
      formData.append('fileToUpload', audioFile, {
        filename: `audio-${Date.now()}.webm`,
        contentType: 'audio/webm'
      });

      const uploadResponse = await axios.post('https://litterbox.catbox.moe/resources/internals/api.php', formData, {
        headers: formData.getHeaders(),
        maxBodyLength: Infinity,
        maxContentLength: Infinity
      });

      mediaUrl = uploadResponse.data;

      if (!mediaUrl || typeof mediaUrl !== 'string') {
        throw new Error('Failed to get valid URL from file hosting service');
      }

      // Step 2: Submit transcription job to Hamsa
      // Hamsa only supports 'ar' (Arabic) and 'en' (English)
      // Map 'multi' or 'auto' to 'ar' (Arabic) as default
      let hamsaLanguage = options?.language || 'ar';
      if (hamsaLanguage === 'multi' || hamsaLanguage === 'auto') {
        hamsaLanguage = 'ar'; // Default to Arabic for Hamsa (optimized for Arabic)
      }

      console.log('[HamsaSTT] Using language:', hamsaLanguage);

      const jobResponse = await axios.post(
        `${this.baseUrl}/jobs/transcribe`,
        {
          mediaUrl: mediaUrl,
          model: options?.model || 'Hamsa-General-V2.0',
          language: hamsaLanguage
        },
        {
          headers: {
            'Authorization': `Token ${this.apiKey}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (!jobResponse.data.success) {
        throw new Error(jobResponse.data.message || 'Failed to submit transcription job');
      }

      const jobId = jobResponse.data.data.jobId;

      // Step 3: Poll for job completion
      const result = await this.pollJobCompletion(jobId);

      // Note: litterbox.catbox.moe files expire after 24h, no manual cleanup needed

      return {
        text: result.text || result.transcription || '',
        language: options?.language || 'ar',
        confidence: result.confidence
      };

    } catch (error: any) {
      console.error('Hamsa STT transcription error:', error.response?.data || error.message);
      throw new Error(`Hamsa transcription failed: ${error.response?.data?.message || error.message}`);
    }
  }

  private async pollJobCompletion(jobId: string, maxAttempts = 60, intervalMs = 3000): Promise<any> {
    console.log(`[HamsaSTT] Polling job ${jobId} (max ${maxAttempts} attempts, ${intervalMs}ms interval)`);
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

        // Log full response structure on first attempt to debug
        if (attempt === 0) {
          console.log(`[HamsaSTT] Full response structure:`, JSON.stringify(response.data, null, 2));
        }

        // Hamsa API response structure: { data: { data: { status, jobResponse } } }
        const job = response.data.data?.data || response.data.data;
        const jobStatus = job?.status;

        console.log(`[HamsaSTT] Job ${jobId} status: ${jobStatus} (attempt ${attempt + 1}/${maxAttempts})`);

        if (jobStatus === 'COMPLETED') {
          console.log(`[HamsaSTT] Job ${jobId} completed successfully`);
          return job.jobResponse || job;
        } else if (jobStatus === 'FAILED') {
          console.error(`[HamsaSTT] Job ${jobId} failed:`, job.jobResponse?.error || job);
          throw new Error(job.jobResponse?.error || 'Transcription job failed');
        }

        // Job is still PENDING, wait and retry
        await new Promise(resolve => setTimeout(resolve, intervalMs));

      } catch (error: any) {
        if (attempt === maxAttempts - 1) {
          throw error;
        }
        // Wait before retry on error
        console.error(`[HamsaSTT] Error polling job ${jobId} (attempt ${attempt + 1}):`, error.message);
        await new Promise(resolve => setTimeout(resolve, intervalMs));
      }
    }

    throw new Error('Transcription job timed out');
  }

  getSupportedFormats(): string[] {
    return ['audio/webm', 'audio/wav', 'audio/mp3', 'audio/mpeg', 'audio/ogg'];
  }

  getLanguages(): string[] {
    return ['ar', 'en']; // Arabic and English
  }
}
