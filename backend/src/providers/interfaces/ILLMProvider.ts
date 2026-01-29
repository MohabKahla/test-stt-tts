export interface Message {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface ChatOptions {
  model?: string;
  temperature?: number;
  maxTokens?: number;
}

export interface ChatResult {
  message: string;
  model: string;
  tokensUsed?: number;
}

export interface ILLMProvider {
  name: string;
  chat(messages: Message[], options?: ChatOptions): Promise<ChatResult>;
  getModels(): string[];
}
