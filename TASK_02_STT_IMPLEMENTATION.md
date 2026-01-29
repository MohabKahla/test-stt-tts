# Task 02: STT (Speech-to-Text) Implementation

## Objective
Implement the STT provider abstraction and add the first working STT provider (OpenAI Whisper), then build the UI for testing it in the Playground tab.

## Prerequisites
- Task 01 (Foundation Setup) completed
- Docker environment running
- OpenAI API key obtained

## Steps

### 1. Create STT Provider Interface
- [ ] Create `backend/src/providers/interfaces/ISTTProvider.ts`
  ```typescript
  interface TranscribeOptions {
    language?: string;
    model?: string;
  }

  interface TranscriptionResult {
    text: string;
    confidence?: number;
    language?: string;
    duration?: number;
  }

  interface ISTTProvider {
    name: string;
    transcribe(audioFile: Buffer, options?: TranscribeOptions): Promise<TranscriptionResult>;
    getSupportedFormats(): string[];
    getLanguages(): string[];
  }
  ```

### 2. Implement OpenAI Whisper Provider
- [ ] Create `backend/src/providers/stt/OpenAISTT.ts`
  - Implement `ISTTProvider` interface
  - Use OpenAI API to transcribe audio
  - Handle audio file upload to OpenAI
  - Parse response and return `TranscriptionResult`
  - Add basic error handling
- [ ] Create `backend/src/providers/stt/index.ts` - Factory for creating STT providers

### 3. Create Provider Configuration
- [ ] Create `backend/src/config/providers.config.ts`
  ```typescript
  export const PROVIDER_CONFIG = {
    stt: [
      {
        id: 'openai-whisper',
        name: 'OpenAI Whisper',
        class: 'OpenAISTT',
        enabled: true,
        requiresAuth: true
      }
    ],
    tts: [], // For later
    llm: []  // For later
  };
  ```

### 4. Create STT API Routes
- [ ] Create `backend/src/routes/stt.routes.ts`
  - `GET /api/stt/providers` - List available STT providers
  - `POST /api/stt/transcribe` - Transcribe audio file
    - Accept multipart/form-data (audio file + provider ID)
    - Use multer for file upload
    - Call appropriate provider
    - Return transcription result
    - Clean up temp file after processing
- [ ] Register routes in `server.ts`

### 5. Build Frontend STT UI (Playground Tab)
- [ ] In `frontend/index.html`, add STT section to Playground tab:
  ```html
  <section class="stt-section">
    <h2>Speech-to-Text</h2>
    <select id="stt-provider"></select>
    <button id="record-btn">🎤 Record</button>
    <audio id="recorded-audio" controls style="display:none"></audio>
    <div id="transcription-output"></div>
    <div id="stt-status"></div>
  </section>
  ```

### 6. Implement Audio Recording
- [ ] In `frontend/js/audio.js`:
  - Add `startRecording()` function (use MediaRecorder API)
  - Add `stopRecording()` function (return audio Blob)
  - Add visual feedback during recording

### 7. Connect Frontend to Backend
- [ ] In `frontend/js/api.js`:
  - Add `getSTTProviders()` function
  - Add `transcribeAudio(provider, audioBlob)` function
- [ ] In `frontend/js/app.js`:
  - Load STT providers on init
  - Populate dropdown
  - Handle record button click (start/stop)
  - Send audio to backend
  - Display transcription result
  - Handle errors

### 8. Add Second STT Provider (Optional - for testing abstraction)
- [ ] Pick another provider (e.g., Deepgram, AssemblyAI, or Google)
- [ ] Create provider class implementing `ISTTProvider`
- [ ] Add to `providers.config.ts`
- [ ] Add API key to `.env`

## Testing Requirements

**⚠️ CRITICAL: Must test APIs before marking complete:**

### Backend Testing
1. **Provider instantiation:**
   ```bash
   # Should create provider without errors
   curl http://localhost:3001/api/stt/providers
   ```
   Expected: `{ providers: [{ id: 'openai-whisper', name: 'OpenAI Whisper', ... }] }`

2. **OpenAI Whisper API:**
   - Record a short audio clip (or use test file)
   - Test transcription via curl or Postman:
     ```bash
     curl -X POST http://localhost:3001/api/stt/transcribe \
       -F "provider=openai-whisper" \
       -F "audio=@test.mp3"
     ```
   - Should return: `{ text: "transcribed text here", ... }`
   - Check API actually gets called (not mocked)
   - Verify temp file is cleaned up

3. **Error handling:**
   - Test with invalid provider ID
   - Test with invalid audio file
   - Test with missing API key
   - All should return proper error messages

### Frontend Testing
1. **Provider dropdown:**
   - Loads providers on page load
   - Shows "OpenAI Whisper" option

2. **Audio recording:**
   - Click record button
   - Browser asks for microphone permission
   - Recording indicator shows
   - Click stop
   - Audio player appears with recording

3. **Full STT flow:**
   - Record audio saying "Hello world"
   - Click stop
   - Should show "Transcribing..." status
   - Should display transcription: "Hello world"
   - Verify actual API call happened (check Network tab)

4. **Error scenarios:**
   - Test without microphone permission
   - Test with very short audio
   - Should show error messages in UI

## Acceptance Criteria
- ✅ OpenAI Whisper provider successfully transcribes audio
- ✅ API endpoint returns correct transcription from real API call
- ✅ Frontend can record audio from microphone
- ✅ Recorded audio is sent to backend and transcribed
- ✅ Transcription displays in UI
- ✅ Provider dropdown populates from config
- ✅ Errors are handled and shown in UI
- ✅ Temp files are cleaned up after processing
- ✅ (Optional) Second provider works and can be switched

## Deliverables
- Working STT provider interface and factory
- OpenAI Whisper provider implementation
- STT API endpoints
- Frontend audio recording
- Complete STT testing UI in Playground tab
- Tested with real audio and real API calls

## Notes
- **Test with real OpenAI API** - don't mock it
- Record actual audio and verify transcription accuracy
- Check Network tab to confirm API calls
- Make sure microphone permissions work
- Keep audio recordings short (5-10 seconds) for testing
- Verify API key is loaded from .env correctly
