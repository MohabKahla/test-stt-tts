export interface OpenRouterModel {
  id: string;
  name: string;
  provider: string;
}

export const OPENROUTER_MODELS: OpenRouterModel[] = [
  // GLM (Z.ai)
  { id: 'z-ai/glm-4.5-air', name: 'GLM 4.5 Air', provider: 'Z.ai' },

  // Grok (xAI)
  { id: 'x-ai/grok-4.1-fast', name: 'Grok 4.1 Fast', provider: 'xAI' },
];
