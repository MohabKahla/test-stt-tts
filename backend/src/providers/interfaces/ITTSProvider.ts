export interface SynthesizeOptions {
  voice?: string;
  speed?: number;
  model?: string;
}

export interface Voice {
  id: string;
  name: string;
  language?: string;
  gender?: string;
}

export interface AudioResult {
  audio: Buffer;
  format: string;
  duration?: number;
}

export interface ITTSProvider {
  name: string;
  synthesize(text: string, options?: SynthesizeOptions): Promise<AudioResult>;
  getVoices(): Promise<Voice[]>;
  getSupportedFormats(): string[];
}
