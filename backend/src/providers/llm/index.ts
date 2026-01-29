import { ILLMProvider } from '../interfaces/ILLMProvider';
import { OpenRouterLLM } from './OpenRouterLLM';

export const LLMProviders: Record<string, new () => ILLMProvider> = {
  OpenRouterLLM: OpenRouterLLM,
};

export function createLLMProvider(classname: string): ILLMProvider {
  const ProviderClass = LLMProviders[classname];
  if (!ProviderClass) {
    throw new Error(`Unknown LLM provider: ${classname}`);
  }
  return new ProviderClass();
}

export { OpenRouterLLM };
