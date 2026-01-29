import axios from 'axios';
import { ILLMProvider, Message, ChatOptions, ChatResult } from '../interfaces/ILLMProvider';
import { OPENROUTER_MODELS } from '../../config/openrouter-models';

export class OpenRouterLLM implements ILLMProvider {
  name = 'OpenRouter';
  private apiKey: string;
  private baseUrl = 'https://openrouter.ai/api/v1';

  constructor() {
    this.apiKey = process.env.OPENROUTER_API_KEY || '';
    if (!this.apiKey) {
      throw new Error('OPENROUTER_API_KEY environment variable is not set');
    }
  }

  async chat(messages: Message[], options?: ChatOptions): Promise<ChatResult> {
    try {
      const model = options?.model || 'openai/gpt-4o-mini';

      const response = await axios.post(
        `${this.baseUrl}/chat/completions`,
        {
          model,
          messages,
          temperature: options?.temperature || 0.7,
          max_tokens: options?.maxTokens || 1000,
        },
        {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json',
            'HTTP-Referer': 'http://localhost:3000',
          },
          timeout: 120000, // 2 minute timeout
        }
      );

      const assistantMessage = response.data.choices[0]?.message?.content || '';
      const tokensUsed = response.data.usage?.total_tokens;

      return {
        message: assistantMessage,
        model,
        tokensUsed,
      };
    } catch (error: any) {
      console.error('OpenRouter API error:', error.response?.data || error.message);
      if (error.code === 'ECONNABORTED') {
        throw new Error('LLM request timed out. The model is taking too long to respond.');
      }
      throw new Error(`LLM request failed: ${error.response?.data?.error?.message || error.message}`);
    }
  }

  getModels(): string[] {
    return OPENROUTER_MODELS.map(m => m.id);
  }
}
