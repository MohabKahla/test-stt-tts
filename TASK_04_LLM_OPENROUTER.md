# Task 04: LLM Integration with OpenRouter

## Objective
Implement the LLM provider using OpenRouter to get access to 100+ models (GPT-4, Claude, Gemini, Llama, etc.) with a single API key.

## Prerequisites
- Task 01 (Foundation Setup) completed
- OpenRouter API key obtained from https://openrouter.ai/keys

## Steps

### 1. Create LLM Provider Interface
- [ ] Create `backend/src/providers/interfaces/ILLMProvider.ts`
  ```typescript
  interface Message {
    role: 'system' | 'user' | 'assistant';
    content: string;
  }

  interface ChatOptions {
    model?: string;
    temperature?: number;
    maxTokens?: number;
  }

  interface ChatResult {
    message: string;
    model: string;
    tokensUsed?: number;
  }

  interface ILLMProvider {
    name: string;
    chat(messages: Message[], options?: ChatOptions): Promise<ChatResult>;
    getModels(): string[];
  }
  ```

### 2. Create OpenRouter Models Configuration
- [ ] Create `backend/src/config/openrouter-models.ts`
  ```typescript
  export const OPENROUTER_MODELS = [
    // OpenAI
    { id: 'openai/gpt-4-turbo', name: 'GPT-4 Turbo', provider: 'OpenAI' },
    { id: 'openai/gpt-3.5-turbo', name: 'GPT-3.5 Turbo', provider: 'OpenAI' },

    // Anthropic
    { id: 'anthropic/claude-3.5-sonnet', name: 'Claude 3.5 Sonnet', provider: 'Anthropic' },
    { id: 'anthropic/claude-3-opus', name: 'Claude 3 Opus', provider: 'Anthropic' },

    // Google
    { id: 'google/gemini-pro-1.5', name: 'Gemini Pro 1.5', provider: 'Google' },

    // Meta
    { id: 'meta-llama/llama-3.1-70b-instruct', name: 'Llama 3.1 70B', provider: 'Meta' },

    // Mistral
    { id: 'mistralai/mistral-large', name: 'Mistral Large', provider: 'Mistral' },

    // Add more models as needed from https://openrouter.ai/models
  ];
  ```

### 3. Implement OpenRouter Provider
- [ ] Create `backend/src/providers/llm/OpenRouterLLM.ts`
  - Implement `ILLMProvider` interface
  - Use OpenRouter API (https://openrouter.ai/api/v1/chat/completions)
  - Support model selection from config
  - Handle conversation history (messages array)
  - Return chat result with response message
  - Add basic error handling
- [ ] Create `backend/src/providers/llm/index.ts` - Factory for creating LLM providers

### 4. Update Provider Configuration
- [ ] Update `backend/src/config/providers.config.ts`
  ```typescript
  import { OPENROUTER_MODELS } from './openrouter-models';

  export const PROVIDER_CONFIG = {
    stt: [ /* existing */ ],
    tts: [ /* existing */ ],
    llm: [
      {
        id: 'openrouter',
        name: 'OpenRouter',
        class: 'OpenRouterLLM',
        enabled: true,
        requiresAuth: true,
        models: OPENROUTER_MODELS
      }
    ]
  };
  ```

### 5. Create LLM API Routes
- [ ] Create `backend/src/routes/llm.routes.ts`
  - `GET /api/llm/providers` - List available LLM providers
  - `GET /api/llm/models/:providerId` - Get models for specific provider
  - `POST /api/llm/chat` - Chat with LLM
    - Accept JSON: `{ provider, model, messages, temperature?, maxTokens? }`
    - Call appropriate provider
    - Return `{ message: "response text", model: "model-id", tokensUsed }`
- [ ] Register routes in `server.ts`

### 6. Add Simple Test UI (Optional - for quick testing)
- [ ] In `frontend/index.html`, add a simple test section (can be in Playground tab):
  ```html
  <section class="llm-test-section" style="margin-top: 20px;">
    <h3>LLM Quick Test</h3>
    <select id="llm-model"></select>
    <textarea id="llm-input" placeholder="Type a message..." rows="3"></textarea>
    <button id="llm-send-btn">Send</button>
    <div id="llm-response"></div>
  </section>
  ```
- [ ] Add basic JS to test LLM:
  - Load models on init
  - Send message to backend
  - Display response

## Testing Requirements

**⚠️ CRITICAL: Must test OpenRouter API before marking complete:**

### Backend Testing
1. **Provider instantiation:**
   ```bash
   curl http://localhost:3001/api/llm/providers
   ```
   Expected: `{ providers: [{ id: 'openrouter', name: 'OpenRouter', ... }] }`

2. **Get models:**
   ```bash
   curl http://localhost:3001/api/llm/models/openrouter
   ```
   Expected: `{ models: [{ id: 'openai/gpt-4-turbo', name: 'GPT-4 Turbo', provider: 'OpenAI' }, ...] }`

3. **OpenRouter API - Test GPT-4:**
   ```bash
   curl -X POST http://localhost:3001/api/llm/chat \
     -H "Content-Type: application/json" \
     -d '{
       "provider": "openrouter",
       "model": "openai/gpt-4-turbo",
       "messages": [
         {"role": "user", "content": "Say hello in one word"}
       ]
     }'
   ```
   - Should return: `{ message: "Hello", model: "openai/gpt-4-turbo", tokensUsed: ... }`
   - **Verify response is from real API** (check it makes sense)

4. **Test Claude:**
   ```bash
   curl -X POST http://localhost:3001/api/llm/chat \
     -H "Content-Type: application/json" \
     -d '{
       "provider": "openrouter",
       "model": "anthropic/claude-3.5-sonnet",
       "messages": [
         {"role": "user", "content": "What is 2+2? Answer with just the number."}
       ]
     }'
   ```
   - Should return: `{ message: "4", ... }`

5. **Test Gemini:**
   ```bash
   curl -X POST http://localhost:3001/api/llm/chat \
     -H "Content-Type: application/json" \
     -d '{
       "provider": "openrouter",
       "model": "google/gemini-pro-1.5",
       "messages": [
         {"role": "user", "content": "Name one color"}
       ]
     }'
   ```
   - Should return a color name

6. **Test conversation history:**
   ```bash
   curl -X POST http://localhost:3001/api/llm/chat \
     -H "Content-Type: application/json" \
     -d '{
       "provider": "openrouter",
       "model": "openai/gpt-4-turbo",
       "messages": [
         {"role": "user", "content": "My name is John"},
         {"role": "assistant", "content": "Nice to meet you, John!"},
         {"role": "user", "content": "What is my name?"}
       ]
     }'
   ```
   - Should return message mentioning "John"

7. **Error handling:**
   - Test with invalid model ID
   - Test with empty messages array
   - Test with missing API key
   - All should return proper error messages

### Frontend Testing (if test UI added)
1. **Model dropdown:**
   - Loads models on page load
   - Shows all models from config (GPT-4, Claude, Gemini, Llama, etc.)

2. **Chat functionality:**
   - Enter message: "Tell me a joke in one sentence"
   - Select model: "GPT-4 Turbo"
   - Click "Send"
   - Should display joke response
   - **Verify response makes sense**

3. **Test multiple models:**
   - Try same prompt with GPT-4, Claude, and Gemini
   - Confirm all return different but valid responses

4. **Model switching:**
   - Switch between models
   - Each should work independently
   - Verify API calls show different model IDs

## Acceptance Criteria
- ✅ OpenRouter provider successfully communicates with API
- ✅ Can call GPT-4, Claude, Gemini, and Llama models
- ✅ Conversation history is maintained correctly
- ✅ Model selection works from config
- ✅ API endpoint returns real responses from real API calls
- ✅ Errors are handled and returned properly
- ✅ Models can be switched without code changes
- ✅ **Responses make sense and are contextually appropriate** (human verification!)
- ✅ Token usage is tracked (if available)

## Deliverables
- Working LLM provider interface and factory
- OpenRouter provider implementation
- OpenRouter models configuration
- LLM API endpoints
- (Optional) Simple test UI
- Tested with multiple models (GPT-4, Claude, Gemini)

## Notes
- **Test with real OpenRouter API** - don't mock it
- **Verify responses make sense** - check if answers are correct
- Test at least 3 different model families (OpenAI, Anthropic, Google)
- Check OpenRouter dashboard for API usage
- Verify API key is loaded from .env correctly
- Test conversation history to ensure context is maintained
- Check Network tab to confirm API calls
- OpenRouter endpoint: `https://openrouter.ai/api/v1/chat/completions`
- Include headers: `Authorization: Bearer ${OPENROUTER_API_KEY}` and `HTTP-Referer: http://localhost:3000`
