# STT/TTS/LLM Testing Playground

A comprehensive web-based testing platform for Speech-to-Text (STT), Text-to-Speech (TTS), and Large Language Model (LLM) providers. Features a conversational AI agent with voice interactions and multi-language support including Arabic.

## Features

- **Multi-Provider Support:**
  - **STT:** OpenAI Whisper, Hamsa AI, Deepgram Nova-3
  - **TTS:** OpenAI TTS, Hamsa AI, Deepgram Aura, ElevenLabs (29 languages)
  - **LLM:** OpenRouter (GLM 4.5 Air, Grok 4.1 Fast)

- **Conversational AI Agent:** Full voice pipeline (STT → LLM → TTS)
- **Arabic Language Support:** Auto-detection and multilingual TTS
- **Plain Text Output Mode:** Optimized for text-to-speech applications
- **Two Interfaces:** Chat Agent (conversational) and Playground (individual testing)

## Quick Start

### Prerequisites

- Docker and Docker Compose installed on your machine
- API keys for the providers you want to use

### Setup

1. **Clone the repository:**
   ```bash
   git clone https://github.com/MohabKahla/test-stt-tts.git
   cd test-stt-tts
   ```

2. **Create environment file:**
   ```bash
   cp .env.example .env
   ```

3. **Add your API keys** to the `.env` file:
   ```env
   # Required
   OPENROUTER_API_KEY=your_openrouter_api_key_here
   OPENAI_API_KEY=your_openai_api_key_here

   # Optional - Add only the providers you want to use
   HAMSA_API_KEY=your_hamsa_api_key_here
   HAMSA_DEFAULT_VOICE_ID=your_hamsa_voice_uuid_here
   DEEPGRAM_API_KEY=your_deepgram_api_key_here
   ELEVENLABS_API_KEY=your_elevenlabs_api_key_here
   ```

4. **Start the application:**
   ```bash
   docker-compose up -d
   ```

5. **Access the application:**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:3001
   - Health Check: http://localhost:3001/api/health

## Usage

### Chat Agent (Default Tab)

1. Select your providers:
   - **STT Provider:** Hamsa AI (recommended for Arabic)
   - **LLM Model:** GLM 4.5 Air (fast, supports Arabic)
   - **TTS Provider:** ElevenLabs or Hamsa AI
   - **TTS Voice:** Choose a voice (Eman for Arabic on Hamsa, or any multilingual voice on ElevenLabs)

2. Click "🎤 Push to Talk" to start recording
3. Speak your message
4. Click "⏹️ Stop" to process
5. The agent will transcribe, think, and respond with voice

### Playground Tab

Test each component individually:

- **Speech-to-Text:** Record audio and see transcription
- **LLM Quick Test:** Send text messages to the LLM
- **Text-to-Speech:** Synthesize text to speech

## API Key Setup

### OpenRouter (Required for LLM)
1. Go to https://openrouter.ai/
2. Sign up and get your API key
3. Add to `.env`: `OPENROUTER_API_KEY=sk-or-v1-...`

### OpenAI (Required for basic functionality)
1. Go to https://platform.openai.com/api-keys
2. Create an API key
3. Add to `.env`: `OPENAI_API_KEY=sk-proj-...`

### Hamsa AI (Recommended for Arabic)
1. Go to https://tryhamsa.com/
2. Sign up and get your API key
3. Get voice ID from https://cloud.tryhamsa.com/voices
4. Add to `.env`:
   ```
   HAMSA_API_KEY=your_api_key
   HAMSA_DEFAULT_VOICE_ID=your_voice_uuid
   ```

### Deepgram (Optional)
1. Go to https://deepgram.com/
2. Sign up and get your API key
3. Add to `.env`: `DEEPGRAM_API_KEY=your_api_key`

### ElevenLabs (Optional, 29 languages including Arabic)
1. Go to https://elevenlabs.io/
2. Sign up and get your API key
3. Add to `.env`:
   ```
   ELEVENLABS_API_KEY=your_api_key
   ELEVENLABS_DEFAULT_VOICE_ID=21m00Tcm4TlvDq8ikWAM  # Rachel (default)
   ELEVENLABS_DEFAULT_MODEL=eleven_multilingual_v2
   ```

## Configuration

### Default Providers

The Chat Agent comes pre-configured with sensible defaults:
- **STT:** Hamsa AI (best for Arabic)
- **LLM:** GLM 4.5 Air (fast, multilingual)
- **TTS:** Hamsa AI with Eman voice (Arabic female voice)

You can change these defaults in `frontend/js/app.js` in the `loadProviders()` function.

### Supported Languages

- **Arabic:** Full support with auto-detection and native TTS voices
- **English:** Full support with all providers
- **29 Languages:** Via ElevenLabs multilingual v2 model

## Docker Containers

The application runs in two Docker containers:

- **Frontend:** nginx:alpine (serves static files, proxies API requests)
- **Backend:** Node.js with TypeScript (handles all API logic)

Both containers are automatically built and started with `docker-compose up`.

## Troubleshooting

### Port Already in Use
If ports 3000 or 3001 are already in use, modify them in `docker-compose.yml`:
```yaml
services:
  frontend:
    ports:
      - "NEW_PORT:80"
  backend:
    ports:
      - "NEW_BACKEND_PORT:3001"
```

### Container Not Starting
Check logs:
```bash
docker-compose logs backend
docker-compose logs frontend
```

### API Key Errors
- Verify your API keys are correct in `.env`
- Ensure the keys have the required permissions
- Check that the keys are active and have credits available

### LLM Timeout
The application has a 2-minute timeout for LLM requests. If you're experiencing timeouts:
- Check the backend logs: `docker-compose logs backend`
- Try using a faster model (GLM 4.5 Air is recommended)
- Reduce conversation history length

## Project Structure

```
test-stt-tts/
├── backend/
│   ├── src/
│   │   ├── config/          # Provider configurations
│   │   ├── providers/       # STT, TTS, LLM implementations
│   │   ├── routes/          # API routes
│   │   └── server.ts        # Express server
│   ├── Dockerfile
│   └── package.json
├── frontend/
│   ├── css/
│   │   └── styles.css       # Application styles
│   ├── js/
│   │   ├── app.js           # Main application logic
│   │   ├── api.js           # API calls
│   │   ├── audio.js         # Audio recording/playback
│   │   └── ui.js            # UI helpers
│   ├── index.html           # Main HTML
│   └── nginx.conf           # nginx configuration
├── docker-compose.yml       # Docker orchestration
├── .env.example             # Environment variables template
└── .gitignore               # Git ignore rules
```

## API Endpoints

### Health Check
- `GET /api/health` - Check if backend is running

### STT Endpoints
- `GET /api/stt/providers` - List STT providers
- `POST /api/stt/transcribe` - Transcribe audio file

### TTS Endpoints
- `GET /api/tts/providers` - List TTS providers
- `GET /api/tts/voices/:providerId` - Get voices for a provider
- `POST /api/tts/synthesize` - Synthesize text to speech

### LLM Endpoints
- `GET /api/llm/providers` - List LLM providers
- `GET /api/llm/models/:providerId` - Get models for a provider
- `POST /api/llm/chat` - Send message to LLM

### Agent Endpoint
- `POST /api/agent/conversation` - Full conversational pipeline (STT → LLM → TTS)

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is open source and available under the MIT License.

## Acknowledgments

Built with:
- OpenAI Whisper & GPT
- Hamsa AI (Arabic STT/TTS)
- Deepgram Nova-3 & Aura
- ElevenLabs Multilingual v2
- OpenRouter
- Docker & nginx
- Express.js & TypeScript
