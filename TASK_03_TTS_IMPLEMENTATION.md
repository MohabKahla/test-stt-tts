# Task 03: TTS (Text-to-Speech) Implementation

## Objective
Implement the TTS provider abstraction and add the first working TTS provider (OpenAI TTS), then build the UI for testing it in the Playground tab.

## Prerequisites
- Task 01 (Foundation Setup) completed
- Task 02 (STT Implementation) completed
- OpenAI API key available

## Steps

### 1. Create TTS Provider Interface
- [ ] Create `backend/src/providers/interfaces/ITTSProvider.ts`
  ```typescript
  interface SynthesizeOptions {
    voice?: string;
    speed?: number;
    model?: string;
  }

  interface Voice {
    id: string;
    name: string;
    language?: string;
    gender?: string;
  }

  interface AudioResult {
    audio: Buffer;
    format: string;
    duration?: number;
  }

  interface ITTSProvider {
    name: string;
    synthesize(text: string, options?: SynthesizeOptions): Promise<AudioResult>;
    getVoices(): Promise<Voice[]>;
    getSupportedFormats(): string[];
  }
  ```

### 2. Implement OpenAI TTS Provider
- [ ] Create `backend/src/providers/tts/OpenAITTS.ts`
  - Implement `ITTSProvider` interface
  - Use OpenAI TTS API to synthesize speech
  - Support multiple voices (alloy, echo, fable, onyx, nova, shimmer)
  - Return audio buffer
  - Add basic error handling
- [ ] Create `backend/src/providers/tts/index.ts` - Factory for creating TTS providers

### 3. Update Provider Configuration
- [ ] Update `backend/src/config/providers.config.ts`
  ```typescript
  export const PROVIDER_CONFIG = {
    stt: [ /* existing */ ],
    tts: [
      {
        id: 'openai-tts',
        name: 'OpenAI TTS',
        class: 'OpenAITTS',
        enabled: true,
        requiresAuth: true
      }
    ],
    llm: []
  };
  ```

### 4. Create TTS API Routes
- [ ] Create `backend/src/routes/tts.routes.ts`
  - `GET /api/tts/providers` - List available TTS providers
  - `GET /api/tts/voices/:providerId` - Get voices for specific provider
  - `POST /api/tts/synthesize` - Synthesize speech from text
    - Accept JSON: `{ provider, text, voice? }`
    - Call appropriate provider
    - Save audio to temp folder with unique filename
    - Return `{ audioUrl: '/audio/[filename]', format: 'mp3', duration }`
- [ ] Add static file serving for `/audio/` path in `server.ts` (serve from temp folder)
- [ ] Register routes in `server.ts`

### 5. Build Frontend TTS UI (Playground Tab)
- [ ] In `frontend/index.html`, add TTS section to Playground tab:
  ```html
  <section class="tts-section">
    <h2>Text-to-Speech</h2>
    <select id="tts-provider"></select>
    <select id="tts-voice"></select>
    <textarea id="tts-text" placeholder="Enter text to synthesize..." rows="4"></textarea>
    <button id="synthesize-btn">🔊 Synthesize</button>
    <audio id="synthesized-audio" controls style="display:none"></audio>
    <div id="tts-status"></div>
  </section>
  ```

### 6. Implement Audio Playback
- [ ] In `frontend/js/audio.js`:
  - Add `playAudio(url)` function
  - Update audio element src and show it

### 7. Connect Frontend to Backend
- [ ] In `frontend/js/api.js`:
  - Add `getTTSProviders()` function
  - Add `getTTSVoices(providerId)` function
  - Add `synthesizeSpeech(provider, text, voice)` function
- [ ] In `frontend/js/app.js`:
  - Load TTS providers on init
  - Populate provider dropdown
  - On provider change, load voices and populate voice dropdown
  - Handle synthesize button click
  - Send text to backend
  - Play returned audio
  - Handle errors

### 8. Add Second TTS Provider (Optional - for testing abstraction)
- [ ] Pick another provider (e.g., ElevenLabs, Google TTS, or Azure TTS)
- [ ] Create provider class implementing `ITTSProvider`
- [ ] Add to `providers.config.ts`
- [ ] Add API key to `.env`

## Testing Requirements

**⚠️ CRITICAL: Must test APIs before marking complete:**

### Backend Testing
1. **Provider instantiation:**
   ```bash
   curl http://localhost:3001/api/tts/providers
   ```
   Expected: `{ providers: [{ id: 'openai-tts', name: 'OpenAI TTS', ... }] }`

2. **Get voices:**
   ```bash
   curl http://localhost:3001/api/tts/voices/openai-tts
   ```
   Expected: `{ voices: [{ id: 'alloy', name: 'Alloy' }, ...] }`

3. **OpenAI TTS API:**
   - Test synthesis via curl or Postman:
     ```bash
     curl -X POST http://localhost:3001/api/tts/synthesize \
       -H "Content-Type: application/json" \
       -d '{"provider":"openai-tts","text":"Hello world","voice":"alloy"}'
     ```
   - Should return: `{ audioUrl: '/audio/xxx.mp3', format: 'mp3' }`
   - Download and play the audio file to verify it says "Hello world"
   - Check API actually gets called (not mocked)
   - Verify audio file is created in temp folder

4. **Error handling:**
   - Test with invalid provider ID
   - Test with empty text
   - Test with missing API key
   - All should return proper error messages

### Frontend Testing
1. **Provider dropdown:**
   - Loads TTS providers on page load
   - Shows "OpenAI TTS" option

2. **Voice selection:**
   - Select "OpenAI TTS" provider
   - Voice dropdown populates with voices
   - Shows: Alloy, Echo, Fable, Onyx, Nova, Shimmer

3. **Full TTS flow:**
   - Enter text: "Hello, this is a test"
   - Select voice: "Alloy"
   - Click "Synthesize"
   - Should show "Synthesizing..." status
   - Audio player appears
   - Audio plays automatically or on click
   - **Verify audio actually says the text**
   - Verify actual API call happened (check Network tab)

4. **Different voices:**
   - Test multiple voices
   - Confirm they sound different

5. **Error scenarios:**
   - Test with empty text
   - Test with very long text
   - Should show error messages in UI

## Acceptance Criteria
- ✅ OpenAI TTS provider successfully synthesizes speech
- ✅ API endpoint returns audio URL from real API call
- ✅ Generated audio file is accessible and playable
- ✅ Frontend can play synthesized audio
- ✅ Voice selection works and affects output
- ✅ Provider and voice dropdowns populate from config
- ✅ Errors are handled and shown in UI
- ✅ Audio files are saved to temp folder correctly
- ✅ (Optional) Second provider works and can be switched
- ✅ **Audio actually says what you typed** (human verification!)

## Deliverables
- Working TTS provider interface and factory
- OpenAI TTS provider implementation
- TTS API endpoints
- Frontend text input and audio playback
- Complete TTS testing UI in Playground tab
- Tested with real text and real API calls

## Notes
- **Test with real OpenAI API** - don't mock it
- **Listen to the audio** to verify it's correct
- Test different voices to ensure they work
- Check Network tab to confirm API calls
- Verify audio format is compatible with browser
- Keep test text short for faster testing
- Make sure audio files are served correctly via static path
- Consider adding a download button for audio files (bonus)
