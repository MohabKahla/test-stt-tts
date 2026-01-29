import { ISTTProvider } from '../interfaces/ISTTProvider';
import { OpenAISTT } from './OpenAISTT';
import { HamsaSTT } from './HamsaSTT';
import { GoogleCloudSTT } from './GoogleCloudSTT';
import { DeepgramSTT } from './DeepgramSTT';

export const STTProviders: Record<string, new () => ISTTProvider> = {
  OpenAISTT: OpenAISTT,
  HamsaSTT: HamsaSTT,
  GoogleCloudSTT: GoogleCloudSTT,
  DeepgramSTT: DeepgramSTT,
};

export function createSTTProvider(classname: string): ISTTProvider {
  const ProviderClass = STTProviders[classname];
  if (!ProviderClass) {
    throw new Error(`Unknown STT provider: ${classname}`);
  }
  return new ProviderClass();
}

export { OpenAISTT, HamsaSTT, GoogleCloudSTT, DeepgramSTT };
