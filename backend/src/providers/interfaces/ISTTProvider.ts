export interface TranscribeOptions {
  language?: string;
  model?: string;
}

export interface TranscriptionResult {
  text: string;
  confidence?: number;
  language?: string;
  duration?: number;
}

export interface ISTTProvider {
  name: string;
  transcribe(audioFile: Buffer, options?: TranscribeOptions): Promise<TranscriptionResult>;
  getSupportedFormats(): string[];
  getLanguages(): string[];
}
