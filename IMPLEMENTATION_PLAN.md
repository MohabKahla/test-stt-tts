# STT/TTS/LLM Testing Playground - Implementation Plan

## Overview
A simple dockerized playground for testing and comparing multiple Speech-to-Text (STT), Text-to-Speech (TTS), and Large Language Model (LLM) providers. Two tabs: one for isolated STT/TTS testing, one for voice-based chat with an LLM.

**This is a PROTOTYPE/PLAYGROUND - intentionally minimal:**
- ❌ No rate limiting (it's just you testing)
- ❌ No caching (test fresh results every time)
- ❌ No complex memory management (short chat sessions)
- ❌ No analytics/tracking (just quick testing)
- ❌ No file cleanup jobs (clean manually if needed)
- ❌ No authentication (local use only)
- ❌ No tests (it's a prototype)
- ✅ Just the basics: test providers, see results, compare outputs

## Quick Architecture Summary

```
┌─────────────────────────────────────────────────────────────┐
│                      FRONTEND (Vanilla JS)                  │
│  ┌──────────────┐              ┌────────────────────┐      │
│  │  Playground  │              │   Chat Agent       │      │
│  │  - STT Test  │              │   - Voice → Text   │      │
│  │  - TTS Test  │              │   - LLM Response   │      │
│  └──────────────┘              │   - Text → Voice   │      │
│                                 └────────────────────┘      │
│  No framework! Just HTML/CSS/JS in nginx container         │
└─────────────────────────────────────────────────────────────┘
                            ↕ REST API
┌─────────────────────────────────────────────────────────────┐
│                   BACKEND (Node.js + Express)               │
│                                                              │
│  ┌──────────────┐  ┌──────────────┐  ┌─────────────────┐  │
│  │  STT Router  │  │  TTS Router  │  │   LLM Router    │  │
│  └──────┬───────┘  └──────┬───────┘  └────────┬────────┘  │
│         │                  │                   │            │
│  ┌──────▼──────────────────▼───────────────────▼────────┐  │
│  │          Provider Factory (Strategy Pattern)         │  │
│  └──────┬──────────────────┬───────────────────┬────────┘  │
│         │                  │                   │            │
│  ┌──────▼───────┐  ┌───────▼──────┐  ┌────────▼─────────┐ │
│  │ STT Provider │  │ TTS Provider │  │  OpenRouter      │ │
│  │ - OpenAI     │  │ - OpenAI     │  │  - GPT-4         │ │
│  │ - Deepgram   │  │ - ElevenLabs │  │  - Claude        │ │
│  │ - Google     │  │ - Google     │  │  - Gemini        │ │
│  │ - Azure      │  │ - Azure      │  │  - Llama         │ │
│  │ (Add more!)  │  │ (Add more!)  │  │  - 100+ more!    │ │
│  └──────────────┘  └──────────────┘  └──────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

**Key Design Decisions:**
- ✅ **Vanilla JS Frontend**: No React/Vue/Angular - just keep it simple
- ✅ **OpenRouter for LLMs**: One API key → 100+ models (GPT, Claude, Gemini, Llama, etc.)
- ✅ **Provider Abstraction**: Each STT/TTS provider is a pluggable class
- ✅ **Config-Driven**: Add new providers/models via config files, not code rewrites
- ✅ **Docker Everything**: One command to run the entire stack

## Architecture Philosophy

### Simplicity & Maintainability
- **Provider Abstraction Pattern**: Each provider type (STT, TTS, LLM) has a common interface
- **Configuration-Driven**: New providers added via configuration files
- **Keep It Simple**: No caching, no rate limiting, no complex optimizations - just test providers

## Technology Stack

### Frontend
- **Framework**: Vanilla JavaScript (no framework needed!)
- **UI Library**: Plain CSS or Tailwind via CDN (optional)
- **Audio Handling**: Web Audio API for recording, HTML5 Audio for playback
- **HTTP Client**: Fetch API
- **Routing**: Simple CSS tab switching (show/hide divs)

### Backend
- **Framework**: Node.js + Express (or FastAPI if Python preferred)
- **Language**: TypeScript (Node) or Python
- **Audio Processing**:
  - Node: fluent-ffmpeg for format conversion
  - Python: pydub or soundfile
- **File Storage**: Temporary file system storage with cleanup
- **Environment**: dotenv for configuration management

### Infrastructure
- **Containerization**: Docker + Docker Compose
- **Frontend Container**: nginx serving static files
- **Backend Container**: Node.js + Express runtime
- **Networking**: Internal docker network for frontend-backend communication
- **Volumes**: For persistent configuration and temporary audio files

## Directory Structure

```
test-stt-tts/
├── docker-compose.yml
├── .env.example
├── .env
├── frontend/
│   ├── Dockerfile
│   ├── nginx.conf
│   ├── index.html
│   ├── css/
│   │   └── styles.css
│   └── js/
│       ├── app.js (main application logic)
│       ├── api.js (fetch wrapper for backend calls)
│       ├── audio.js (recording & playback utilities)
│       └── ui.js (DOM manipulation helpers)
└── backend/
    ├── Dockerfile
    ├── package.json (or requirements.txt)
    ├── src/
    │   ├── server.ts (or app.py)
    │   ├── routes/
    │   │   ├── stt.routes.ts
    │   │   ├── tts.routes.ts
    │   │   └── llm.routes.ts
    │   ├── providers/
    │   │   ├── interfaces/
    │   │   │   ├── ISTTProvider.ts
    │   │   │   ├── ITTSProvider.ts
    │   │   │   └── ILLMProvider.ts
    │   │   ├── stt/
    │   │   │   ├── OpenAISTT.ts
    │   │   │   ├── GoogleSTT.ts
    │   │   │   ├── AzureSTT.ts
    │   │   │   └── index.ts (factory)
    │   │   ├── tts/
    │   │   │   ├── OpenAITTS.ts
    │   │   │   ├── GoogleTTS.ts
    │   │   │   ├── AzureTTS.ts
    │   │   │   ├── ElevenLabsTTS.ts
    │   │   │   └── index.ts (factory)
    │   │   └── llm/
    │   │       ├── OpenRouterLLM.ts (unified provider for all models)
    │   │       ├── OpenAILLM.ts (direct OpenAI if needed)
    │   │       └── index.ts (factory)
    │   ├── config/
    │   │   ├── providers.config.ts
    │   │   └── openrouter-models.ts
    │   └── utils/
    │       └── audioConverter.ts (if needed)
    └── temp/ (for temporary audio files)
```

## Core Abstractions

### STT Provider Interface
```typescript
interface ISTTProvider {
  name: string;
  transcribe(audioFile: Buffer, options?: TranscribeOptions): Promise<TranscriptionResult>;
  getSupportedFormats(): string[];
  getLanguages(): string[];
}

interface TranscriptionResult {
  text: string;
  confidence?: number;
  language?: string;
  duration?: number;
}
```

### TTS Provider Interface
```typescript
interface ITTSProvider {
  name: string;
  synthesize(text: string, options?: SynthesizeOptions): Promise<AudioResult>;
  getVoices(): Promise<Voice[]>;
  getSupportedFormats(): string[];
}

interface AudioResult {
  audio: Buffer;
  format: string;
  duration?: number;
}
```

### LLM Provider Interface
```typescript
interface ILLMProvider {
  name: string;
  chat(messages: Message[], options?: ChatOptions): Promise<ChatResult>;
  getModels(): string[];
}

interface ChatResult {
  message: string;
  model: string;
  tokensUsed?: number;
}
```

### OpenRouter Integration Strategy

**Why OpenRouter?**
- **Single API for 100+ LLM models**: OpenAI, Anthropic, Google, Meta, Cohere, Mistral, and more
- **Unified interface**: No need to implement separate provider classes for each LLM
- **Consistent authentication**: One API key instead of managing multiple
- **Model switching**: Change providers by just changing the model name (e.g., `openai/gpt-4` → `anthropic/claude-3.5-sonnet`)
- **Cost tracking**: Built-in usage tracking across all models
- **No rate limits**: OpenRouter handles failover and routing

**Implementation Approach:**
Instead of creating individual LLM provider classes, we'll use OpenRouter as the primary LLM provider with a configuration file listing available models:

```typescript
// config/openrouter-models.ts
export const OPENROUTER_MODELS = [
  { id: 'openai/gpt-4-turbo', name: 'GPT-4 Turbo', provider: 'OpenAI' },
  { id: 'openai/gpt-3.5-turbo', name: 'GPT-3.5 Turbo', provider: 'OpenAI' },
  { id: 'anthropic/claude-3.5-sonnet', name: 'Claude 3.5 Sonnet', provider: 'Anthropic' },
  { id: 'anthropic/claude-3-opus', name: 'Claude 3 Opus', provider: 'Anthropic' },
  { id: 'google/gemini-pro-1.5', name: 'Gemini Pro 1.5', provider: 'Google' },
  { id: 'meta-llama/llama-3.1-70b-instruct', name: 'Llama 3.1 70B', provider: 'Meta' },
  { id: 'mistralai/mistral-large', name: 'Mistral Large', provider: 'Mistral' },
  // Easy to add any model from OpenRouter's catalog
];
```

**Adding a new LLM model:** Just add one line to the config. No new provider class needed!

**Fallback for direct APIs:** Keep the option to use direct OpenAI/Anthropic APIs if specific features are needed (like streaming, function calling with specific implementations, etc.)

## Provider Registration System

### Configuration File (providers.config.ts)
```typescript
export const PROVIDER_CONFIG = {
  stt: [
    {
      id: 'openai-whisper',
      name: 'OpenAI Whisper',
      class: 'OpenAISTT',
      enabled: true,
      requiresAuth: true
    },
    {
      id: 'google-speech',
      name: 'Google Speech-to-Text',
      class: 'GoogleSTT',
      enabled: true,
      requiresAuth: true
    },
    // Easy to add more...
  ],
  tts: [
    {
      id: 'openai-tts',
      name: 'OpenAI TTS',
      class: 'OpenAITTS',
      enabled: true,
      requiresAuth: true
    },
    // ...
  ],
  llm: [
    {
      id: 'openrouter',
      name: 'OpenRouter (Multi-provider)',
      class: 'OpenRouterLLM',
      enabled: true,
      requiresAuth: true,
      models: OPENROUTER_MODELS // Import from openrouter-models.ts
    },
    // Optional: Direct providers if needed
    {
      id: 'openai-direct',
      name: 'OpenAI Direct',
      class: 'OpenAILLM',
      enabled: false,
      requiresAuth: true
    }
  ]
};
```

### Provider Factory
```typescript
class ProviderFactory {
  static createSTTProvider(providerId: string): ISTTProvider {
    const config = PROVIDER_CONFIG.stt.find(p => p.id === providerId);
    if (!config || !config.enabled) {
      throw new Error(`Provider ${providerId} not found or disabled`);
    }
    // Dynamic instantiation based on class name
    return new STTProviders[config.class]();
  }
  // Similar for TTS and LLM
}
```

## API Endpoints

### STT Endpoints
- `POST /api/stt/transcribe`
  - Body: `{ provider: string, audio: File, language?: string }`
  - Response: `{ text: string, confidence?: number, duration: number }`

- `GET /api/stt/providers`
  - Response: `{ providers: [{ id, name, languages, formats }] }`

### TTS Endpoints
- `POST /api/tts/synthesize`
  - Body: `{ provider: string, text: string, voice?: string }`
  - Response: `{ audioUrl: string, format: string, duration: number }`

- `GET /api/tts/providers`
  - Response: `{ providers: [{ id, name, voices }] }`

- `GET /api/tts/voices/:providerId`
  - Response: `{ voices: [{ id, name, language, gender }] }`

### LLM Endpoints
- `POST /api/llm/chat`
  - Body: `{ provider: string, messages: Message[], model?: string }`
  - Response: `{ message: string, model: string }`

- `GET /api/llm/providers`
  - Response: `{ providers: [{ id, name, models }] }`

### Conversational Agent Endpoint
- `POST /api/agent/conversation`
  - Body: `{ audio: File, sttProvider: string, llmProvider: string, ttsProvider: string, conversationHistory?: Message[] }`
  - Response: `{ transcription: string, llmResponse: string, audioUrl: string }`
  - This endpoint chains: STT → LLM → TTS
  - Keep conversation history simple (array in frontend, no DB needed)

## Vanilla JavaScript Frontend Structure

### Why No Framework?
- **Simplicity**: Two tabs, a few buttons, dropdowns, and audio elements
- **No Build Step**: Edit HTML/JS and refresh - instant feedback
- **Lightweight**: < 50KB total frontend code
- **Easy to Debug**: No transpilation, no virtual DOM, just browser DevTools
- **Fast**: No framework overhead, direct DOM manipulation

### HTML Structure (index.html)
```html
<!DOCTYPE html>
<html>
<head>
  <title>STT/TTS/LLM Playground</title>
  <link rel="stylesheet" href="css/styles.css">
</head>
<body>
  <!-- Tab Navigation -->
  <div class="tabs">
    <button class="tab-btn active" data-tab="playground">Playground</button>
    <button class="tab-btn" data-tab="chat-agent">Chat Agent</button>
  </div>

  <!-- Tab 1: Playground -->
  <div id="playground-tab" class="tab-content active">
    <!-- STT Section -->
    <section class="stt-section">
      <h2>Speech-to-Text</h2>
      <select id="stt-provider"></select>
      <button id="record-btn">Record</button>
      <audio id="recorded-audio" controls></audio>
      <div id="transcription"></div>
    </section>

    <!-- TTS Section -->
    <section class="tts-section">
      <h2>Text-to-Speech</h2>
      <select id="tts-provider"></select>
      <select id="tts-voice"></select>
      <textarea id="tts-text"></textarea>
      <button id="synthesize-btn">Synthesize</button>
      <audio id="synthesized-audio" controls></audio>
    </section>
  </div>

  <!-- Tab 2: Chat Agent -->
  <div id="chat-agent-tab" class="tab-content">
    <div class="provider-selectors">
      <select id="chat-stt-provider"></select>
      <select id="chat-llm-provider"></select>
      <select id="chat-tts-provider"></select>
    </div>
    <div id="chat-history"></div>
    <div class="voice-controls">
      <button id="chat-record-btn">Push to Talk</button>
      <span id="status">Ready</span>
    </div>
  </div>

  <script src="js/api.js"></script>
  <script src="js/audio.js"></script>
  <script src="js/ui.js"></script>
  <script src="js/app.js"></script>
</body>
</html>
```

### JavaScript Modules

**api.js** - Backend communication
```javascript
const API_BASE = 'http://localhost:3001/api';

async function getSTTProviders() {
  const res = await fetch(`${API_BASE}/stt/providers`);
  return res.json();
}

async function transcribe(provider, audioBlob) {
  const formData = new FormData();
  formData.append('provider', provider);
  formData.append('audio', audioBlob);
  const res = await fetch(`${API_BASE}/stt/transcribe`, {
    method: 'POST',
    body: formData
  });
  return res.json();
}

// Similar functions for TTS and LLM...
```

**audio.js** - Recording and playback
```javascript
let mediaRecorder;
let audioChunks = [];

async function startRecording() {
  const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
  mediaRecorder = new MediaRecorder(stream);
  audioChunks = [];

  mediaRecorder.ondataavailable = (e) => {
    audioChunks.push(e.data);
  };

  mediaRecorder.start();
}

function stopRecording() {
  return new Promise((resolve) => {
    mediaRecorder.onstop = () => {
      const audioBlob = new Blob(audioChunks, { type: 'audio/webm' });
      resolve(audioBlob);
    };
    mediaRecorder.stop();
  });
}
```

**ui.js** - DOM helpers
```javascript
function showLoading(elementId) {
  document.getElementById(elementId).classList.add('loading');
}

function populateDropdown(selectId, options) {
  const select = document.getElementById(selectId);
  select.innerHTML = options.map(opt =>
    `<option value="${opt.id}">${opt.name}</option>`
  ).join('');
}
```

**app.js** - Main application logic
```javascript
// Tab switching
document.querySelectorAll('.tab-btn').forEach(btn => {
  btn.addEventListener('click', (e) => {
    switchTab(e.target.dataset.tab);
  });
});

// STT Recording
let isRecording = false;
document.getElementById('record-btn').addEventListener('click', async () => {
  if (!isRecording) {
    await startRecording();
    isRecording = true;
    // Update UI...
  } else {
    const audioBlob = await stopRecording();
    isRecording = false;
    // Transcribe...
    const provider = document.getElementById('stt-provider').value;
    const result = await transcribe(provider, audioBlob);
    document.getElementById('transcription').textContent = result.text;
  }
});

// Load providers on startup
async function init() {
  const sttProviders = await getSTTProviders();
  populateDropdown('stt-provider', sttProviders.providers);
  // Load other providers...
}

init();
```

**No bundler, no transpiler, no node_modules in frontend!**

## Frontend Components

### Tab 1: Playground

#### STT Section
- **AudioRecorder Component**
  - Record button (start/stop)
  - Recording indicator (visual feedback)
  - Audio waveform visualization (optional)
  - Recorded audio playback

- **STT Provider Selector**
  - Dropdown populated from `/api/stt/providers`
  - Display provider capabilities (languages, formats)

- **Transcription Display**
  - Loading state during transcription
  - Display transcribed text
  - Show metadata (confidence, duration)
  - Copy to clipboard button

#### TTS Section
- **Text Input**
  - Textarea for text input
  - Character counter
  - Voice selector dropdown (populated per provider)

- **TTS Provider Selector**
  - Dropdown populated from `/api/tts/providers`

- **Audio Player**
  - Play/pause controls
  - Progress bar
  - Download button
  - Loading state during synthesis

### Tab 2: Chat Agent

- **Chat Interface**
  - Chat history display (user messages + agent responses)
  - Visual distinction between user and agent messages
  - Timestamp for each message

- **Voice Input**
  - Push-to-talk button (press and hold) or toggle recording
  - Recording indicator
  - Real-time audio level indicator

- **Provider Selectors**
  - Three dropdowns at the top:
    - STT Provider
    - LLM Provider (with model selection)
    - TTS Provider (with voice selection)

- **Status Indicator**
  - Show current pipeline status:
    - "Listening..." (recording)
    - "Transcribing..." (STT)
    - "Thinking..." (LLM)
    - "Generating speech..." (TTS)
    - "Ready" (idle)

- **Auto-playback**
  - Automatically play agent's voice response
  - Option to replay

## Implementation Phases

### Phase 1: Foundation Setup
1. Initialize Docker environment
   - Create docker-compose.yml
   - Setup nginx for frontend (just serve static files)
   - Setup backend Dockerfile
   - Configure networking and volumes

2. Backend skeleton
   - Setup Express server with TypeScript
   - Create provider interfaces
   - Implement provider factory pattern
   - Setup configuration system

3. Frontend skeleton (Vanilla JS)
   - Create index.html with two-tab structure
   - Create basic CSS for layout
   - Create app.js with tab switching logic
   - Create api.js for fetch calls to backend

### Phase 2: Playground Tab - STT
1. Implement first STT provider (e.g., OpenAI Whisper)
   - Create OpenAISTT class implementing ISTTProvider
   - Handle audio file upload and processing
   - Return transcription results

2. Build STT UI components
   - Audio recorder with Web Audio API
   - Provider selector dropdown
   - Transcription display

3. Connect frontend to backend
   - Audio upload
   - Provider selection
   - Display results

4. Add second STT provider (e.g., Google Speech-to-Text)
   - Verify abstraction works
   - Test provider switching

### Phase 3: Playground Tab - TTS
1. Implement first TTS provider (e.g., OpenAI TTS)
   - Create OpenAITTS class implementing ITTSProvider
   - Handle text-to-speech conversion
   - Return audio file

2. Build TTS UI components
   - Text input area
   - Provider selector with voice options
   - Audio player

3. Connect frontend to backend
   - Text submission
   - Audio playback
   - Download functionality

4. Add second TTS provider (e.g., ElevenLabs)
   - Test voice selection per provider
   - Verify audio format handling

### Phase 4: LLM Integration with OpenRouter
1. Implement OpenRouter provider
   - Create OpenRouterLLM class implementing ILLMProvider
   - Handle chat conversation with OpenRouter API
   - Support model selection from config
   - Manage message history

2. Add multiple models through config
   - GPT-4, Claude, Gemini, Llama from single provider
   - Test model switching (no code changes needed!)
   - Verify conversation context handling across models

### Phase 5: Chat Agent Tab
1. Build conversational pipeline endpoint
   - Chain STT → LLM → TTS
   - Basic error handling (show errors in response)
   - Keep conversation history in array (no DB)

2. Build chat UI
   - Voice recording interface
   - Chat history display
   - Three provider selectors
   - Status indicator (Listening/Transcribing/Thinking/Speaking)

3. Basic feedback
   - Show current pipeline stage
   - Display errors in chat
   - Auto-playback agent's voice response

### Phase 6: Add More Providers (As Needed)
1. Add more STT/TTS providers as you test
   - Azure Cognitive Services (STT/TTS)
   - AWS Polly (TTS)
   - Deepgram (STT)
   - AssemblyAI (STT)

2. Add more LLM models via OpenRouter
   - Just update config file with new model IDs
   - No code changes needed!

3. Basic polish
   - Show errors in the UI
   - Add loading spinners
   - Maybe add audio format conversion if needed

## Environment Variables

```bash
# .env.example
NODE_ENV=development

# LLM API Keys
OPENROUTER_API_KEY=           # Primary - Provides access to 100+ models
OPENAI_API_KEY=               # Optional - For direct OpenAI API access

# STT API Keys
OPENAI_API_KEY=               # For Whisper
DEEPGRAM_API_KEY=
GOOGLE_CLOUD_API_KEY=
AZURE_SPEECH_KEY=
AZURE_SPEECH_REGION=

# TTS API Keys
OPENAI_API_KEY=               # For OpenAI TTS
ELEVENLABS_API_KEY=
GOOGLE_CLOUD_API_KEY=
AZURE_SPEECH_KEY=
AWS_ACCESS_KEY_ID=
AWS_SECRET_ACCESS_KEY=
AWS_REGION=

# Application Config
BACKEND_PORT=3001
FRONTEND_PORT=3000
```

## Docker Configuration

### Frontend nginx.conf
```nginx
events {
  worker_connections 1024;
}

http {
  include /etc/nginx/mime.types;
  default_type application/octet-stream;

  server {
    listen 80;
    root /usr/share/nginx/html;
    index index.html;

    # Serve static files
    location / {
      try_files $uri $uri/ /index.html;
    }

    # Proxy API requests to backend
    location /api/ {
      proxy_pass http://backend:3001;
      proxy_http_version 1.1;
      proxy_set_header Upgrade $http_upgrade;
      proxy_set_header Connection 'upgrade';
      proxy_set_header Host $host;
      proxy_cache_bypass $http_upgrade;
    }
  }
}
```

### docker-compose.yml
```yaml
version: '3.8'

services:
  frontend:
    image: nginx:alpine
    ports:
      - "3000:80"
    volumes:
      - ./frontend:/usr/share/nginx/html:ro
      - ./frontend/nginx.conf:/etc/nginx/nginx.conf:ro
    depends_on:
      - backend

  backend:
    build: ./backend
    ports:
      - "3001:3001"
    env_file:
      - .env
    volumes:
      - ./backend:/app
      - /app/node_modules
      - ./backend/temp:/app/temp
    environment:
      - NODE_ENV=development
```

## Adding New Models/Providers - Step by Step

### Adding a New LLM Model (via OpenRouter)

**Super Easy - Just One Config Line!**

1. Go to [openrouter.ai/models](https://openrouter.ai/models) and find the model ID
2. Add to `backend/src/config/openrouter-models.ts`:
   ```typescript
   { id: 'cohere/command-r-plus', name: 'Command R+', provider: 'Cohere' }
   ```
3. Restart backend
4. **Done!** Model appears in dropdown automatically

No code changes, no new files, no API key needed (uses same OPENROUTER_API_KEY).

### Adding a New STT/TTS Provider (e.g., Azure STT)

To add a new STT/TTS provider (e.g., Azure STT):

1. **Create provider class** (`backend/src/providers/stt/AzureSTT.ts`)
   ```typescript
   export class AzureSTT implements ISTTProvider {
     name = 'Azure Speech-to-Text';

     async transcribe(audioFile: Buffer): Promise<TranscriptionResult> {
       // Azure-specific implementation
     }

     getSupportedFormats(): string[] {
       return ['wav', 'mp3', 'ogg'];
     }

     getLanguages(): string[] {
       return ['en-US', 'es-ES', ...];
     }
   }
   ```

2. **Register in configuration** (`backend/src/config/providers.config.ts`)
   ```typescript
   {
     id: 'azure-speech',
     name: 'Azure Speech-to-Text',
     class: 'AzureSTT',
     enabled: true,
     requiresAuth: true
   }
   ```

3. **Export from factory** (`backend/src/providers/stt/index.ts`)
   ```typescript
   export { AzureSTT } from './AzureSTT';
   ```

4. **Add environment variables** (`.env`)
   ```bash
   AZURE_SPEECH_KEY=your_key
   AZURE_SPEECH_REGION=eastus
   ```

5. **Test** - Provider automatically appears in dropdown

## Future Enhancements (Maybe Later)

1. **Comparison Mode**: Run same input through multiple providers side-by-side
2. **Cost Tracking**: Show approximate costs per request
3. **Export History**: Download chat/test results
4. **Streaming**: Real-time transcription instead of waiting for full audio

## Success Metrics (Keep It Simple!)

- Can add new STT/TTS provider in ~30 minutes
- Can add new LLM model in ~1 minute (just config)
- Errors show up in the UI
- Works with `docker-compose up`
- No build step for frontend (instant refresh)

## Minimal File Count

After implementation, you'll have approximately:

**Frontend (4 files):**
- index.html
- styles.css
- 3-4 .js files (app, api, audio, ui)

**Backend (~15-20 files):**
- server.ts
- 3 route files (stt, tts, llm)
- 2-3 provider interface files
- 3-5 provider implementation files (per type)
- 2 config files (providers, openrouter models)

**Config (2 files):**
- docker-compose.yml
- .env

**Total: ~25 files max** for a fully working playground with multiple providers!

## Getting Started (After Implementation)

1. **Clone/setup the project**
   ```bash
   cd test-stt-tts
   ```

2. **Add your API keys to .env**
   ```bash
   cp .env.example .env
   # Edit .env and add your keys
   ```

3. **Start everything**
   ```bash
   docker-compose up
   ```

4. **Open browser**
   ```
   http://localhost:3000
   ```

5. **Test providers**
   - Switch providers in dropdowns
   - Record audio, see transcription
   - Type text, hear speech
   - Chat with voice + LLM

That's it! No npm install, no build, no complex setup.

## Key Benefits of This Architecture

### 1. Minimal Frontend Complexity
- **No framework = No framework updates, no dependency hell**
- Edit and refresh - see changes instantly
- Total frontend size: < 50KB (vs React app ~500KB+)
- Easy for anyone to understand and modify

### 2. OpenRouter Simplifies LLM Integration
- **100+ models with one API key**
- Add new model: 1 line of config (vs writing entire provider class)
- Compare GPT-4 vs Claude vs Gemini without managing 3 different APIs
- Switch between models instantly to compare results

### 3. Scalable Provider Architecture
- Adding STT/TTS provider: ~30 min (one class file)
- Adding LLM model: ~30 seconds (one config line)
- Clear separation of concerns
- Each provider is isolated - bugs don't cascade

### 4. Perfect for Quick Testing
- Spin up: `docker-compose up`
- Test a provider in seconds
- No complex setup or build process
- Just a simple playground to compare providers
