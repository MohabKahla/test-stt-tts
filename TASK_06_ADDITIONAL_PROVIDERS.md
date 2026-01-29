# Task 06: Add Additional Providers (Ongoing)

## Objective
Add more STT and TTS providers as needed for testing and comparison. This is an ongoing task - add providers when you want to test them.

## Prerequisites
- Tasks 01-05 completed
- Provider abstraction working
- At least one provider of each type working

## Suggested Providers to Add

### STT Providers
1. **Deepgram** - Fast and accurate
   - API: https://developers.deepgram.com/
   - Features: Real-time streaming, high accuracy
   - Cost: Affordable per-second pricing

2. **AssemblyAI** - Great for features
   - API: https://www.assemblyai.com/docs
   - Features: Speaker diarization, sentiment analysis
   - Cost: Per-minute pricing

3. **Google Speech-to-Text** - Multi-language
   - API: https://cloud.google.com/speech-to-text
   - Features: 125+ languages, automatic punctuation
   - Cost: Google Cloud pricing

4. **Azure Speech Services** - Enterprise
   - API: https://docs.microsoft.com/azure/cognitive-services/speech-service/
   - Features: Custom models, pronunciation assessment
   - Cost: Azure pricing

### TTS Providers
1. **ElevenLabs** - Most realistic voices
   - API: https://docs.elevenlabs.io/
   - Features: Voice cloning, ultra-realistic
   - Cost: Per-character pricing (can be expensive)

2. **Google Text-to-Speech** - Good quality
   - API: https://cloud.google.com/text-to-speech
   - Features: WaveNet voices, SSML support
   - Cost: Google Cloud pricing

3. **Azure Speech Services** - Enterprise TTS
   - API: https://docs.microsoft.com/azure/cognitive-services/speech-service/
   - Features: Neural voices, custom voices
   - Cost: Azure pricing

4. **AWS Polly** - Reliable
   - API: https://docs.aws.amazon.com/polly/
   - Features: Neural and standard voices
   - Cost: AWS pricing

### LLM Models (via OpenRouter)
Just add to `openrouter-models.ts` config - no code needed!

- Cohere Command R+
- Perplexity models
- Together.ai models
- Any model from https://openrouter.ai/models

## Steps to Add a New STT Provider

### Example: Adding Deepgram

1. **Get API Key**
   - [ ] Sign up at https://deepgram.com/
   - [ ] Get API key
   - [ ] Add to `.env`: `DEEPGRAM_API_KEY=your_key`

2. **Create Provider Class**
   - [ ] Create `backend/src/providers/stt/DeepgramSTT.ts`
   ```typescript
   import { ISTTProvider, TranscriptionResult, TranscribeOptions } from '../interfaces/ISTTProvider';

   export class DeepgramSTT implements ISTTProvider {
     name = 'Deepgram';

     async transcribe(audioFile: Buffer, options?: TranscribeOptions): Promise<TranscriptionResult> {
       // Implement Deepgram API call
       // https://developers.deepgram.com/docs/getting-started
       const apiKey = process.env.DEEPGRAM_API_KEY;
       // ... implementation
       return {
         text: 'transcribed text',
         confidence: 0.95,
         language: 'en'
       };
     }

     getSupportedFormats(): string[] {
       return ['mp3', 'wav', 'flac', 'ogg', 'webm'];
     }

     getLanguages(): string[] {
       return ['en', 'es', 'fr', 'de', /* etc */];
     }
   }
   ```

3. **Export from Factory**
   - [ ] Update `backend/src/providers/stt/index.ts`
   ```typescript
   export { OpenAISTT } from './OpenAISTT';
   export { DeepgramSTT } from './DeepgramSTT';
   ```

4. **Add to Configuration**
   - [ ] Update `backend/src/config/providers.config.ts`
   ```typescript
   stt: [
     { id: 'openai-whisper', name: 'OpenAI Whisper', class: 'OpenAISTT', enabled: true, requiresAuth: true },
     { id: 'deepgram', name: 'Deepgram', class: 'DeepgramSTT', enabled: true, requiresAuth: true },
   ]
   ```

5. **Test the Provider**
   - [ ] Restart backend: `docker-compose restart backend`
   - [ ] Check provider appears in dropdown
   - [ ] Test transcription via API:
   ```bash
   curl -X POST http://localhost:3001/api/stt/transcribe \
     -F "provider=deepgram" \
     -F "audio=@test.mp3"
   ```
   - [ ] **Verify real API is called** (check Deepgram dashboard)
   - [ ] **Compare transcription quality** with OpenAI Whisper

## Steps to Add a New TTS Provider

### Example: Adding ElevenLabs

1. **Get API Key**
   - [ ] Sign up at https://elevenlabs.io/
   - [ ] Get API key
   - [ ] Add to `.env`: `ELEVENLABS_API_KEY=your_key`

2. **Create Provider Class**
   - [ ] Create `backend/src/providers/tts/ElevenLabsTTS.ts`
   ```typescript
   import { ITTSProvider, AudioResult, SynthesizeOptions, Voice } from '../interfaces/ITTSProvider';

   export class ElevenLabsTTS implements ITTSProvider {
     name = 'ElevenLabs';

     async synthesize(text: string, options?: SynthesizeOptions): Promise<AudioResult> {
       // Implement ElevenLabs API call
       // https://docs.elevenlabs.io/api-reference/text-to-speech
       const apiKey = process.env.ELEVENLABS_API_KEY;
       // ... implementation
       return {
         audio: audioBuffer,
         format: 'mp3'
       };
     }

     async getVoices(): Promise<Voice[]> {
       // Fetch voices from ElevenLabs API
       return [
         { id: 'voice_id_1', name: 'Rachel', language: 'en', gender: 'female' },
         // ...
       ];
     }

     getSupportedFormats(): string[] {
       return ['mp3'];
     }
   }
   ```

3. **Export from Factory**
   - [ ] Update `backend/src/providers/tts/index.ts`
   ```typescript
   export { OpenAITTS } from './OpenAITTS';
   export { ElevenLabsTTS } from './ElevenLabsTTS';
   ```

4. **Add to Configuration**
   - [ ] Update `backend/src/config/providers.config.ts`
   ```typescript
   tts: [
     { id: 'openai-tts', name: 'OpenAI TTS', class: 'OpenAITTS', enabled: true, requiresAuth: true },
     { id: 'elevenlabs', name: 'ElevenLabs', class: 'ElevenLabsTTS', enabled: true, requiresAuth: true },
   ]
   ```

5. **Test the Provider**
   - [ ] Restart backend: `docker-compose restart backend`
   - [ ] Check provider appears in dropdown
   - [ ] Test synthesis via API:
   ```bash
   curl -X POST http://localhost:3001/api/tts/synthesize \
     -H "Content-Type: application/json" \
     -d '{"provider":"elevenlabs","text":"Hello world","voice":"Rachel"}'
   ```
   - [ ] **Download and listen to audio** - verify quality
   - [ ] **Compare voice quality** with OpenAI TTS
   - [ ] **Verify real API is called** (check ElevenLabs dashboard)

## Steps to Add a New LLM Model

### Super Simple - Just Config!

1. **Find Model on OpenRouter**
   - [ ] Go to https://openrouter.ai/models
   - [ ] Find model you want (e.g., "Cohere Command R+")
   - [ ] Copy model ID (e.g., `cohere/command-r-plus`)

2. **Add to Config**
   - [ ] Update `backend/src/config/openrouter-models.ts`
   ```typescript
   { id: 'cohere/command-r-plus', name: 'Command R+', provider: 'Cohere' },
   ```

3. **Test**
   - [ ] Restart backend (or just refresh frontend if hot reload)
   - [ ] Model appears in dropdown
   - [ ] Test via API:
   ```bash
   curl -X POST http://localhost:3001/api/llm/chat \
     -H "Content-Type: application/json" \
     -d '{"provider":"openrouter","model":"cohere/command-r-plus","messages":[{"role":"user","content":"Hello"}]}'
   ```
   - [ ] **Verify response is from new model**
   - [ ] **Compare response style** with GPT-4 or Claude

## Testing Requirements

**⚠️ For each new provider, must test:**

### STT Provider Testing
1. **API connectivity:**
   - Provider appears in dropdown
   - Can call API successfully
   - Real API is used (not mocked)

2. **Transcription quality:**
   - Test with clear audio - should transcribe correctly
   - Test with noisy audio - compare accuracy with other providers
   - Test with different accents/languages (if supported)

3. **Performance:**
   - Note response time
   - Compare with existing providers

4. **Integration:**
   - Works in Playground tab
   - Works in Chat Agent tab
   - Can switch between providers seamlessly

### TTS Provider Testing
1. **API connectivity:**
   - Provider appears in dropdown
   - Can fetch voices successfully
   - Can synthesize speech successfully
   - Real API is used (not mocked)

2. **Voice quality:**
   - **Listen to generated audio**
   - Compare naturalness with existing providers
   - Test different voices
   - Test different text lengths

3. **Performance:**
   - Note response time
   - Note audio file size

4. **Integration:**
   - Works in Playground tab
   - Works in Chat Agent tab
   - Audio plays correctly in browser

### LLM Model Testing
1. **API connectivity:**
   - Model appears in dropdown
   - Can send chat requests successfully
   - Real OpenRouter API is used

2. **Response quality:**
   - Test with factual question - verify accuracy
   - Test with creative task - compare style with other models
   - Test with conversation - verify context maintenance

3. **Integration:**
   - Works in Chat Agent tab
   - Can switch models mid-conversation

## Acceptance Criteria (Per Provider)
- ✅ Provider class implements correct interface
- ✅ Provider is registered in config
- ✅ API key is loaded from .env
- ✅ Provider appears in UI dropdowns
- ✅ **Real API is called** (verify in provider dashboard)
- ✅ **Output quality is acceptable** (human verification)
- ✅ Works in both Playground and Chat Agent tabs
- ✅ Can switch between providers without errors
- ✅ Error handling works correctly

## Deliverables (Per Provider)
- Provider class implementation
- Config entry
- Environment variable
- Tested with real API calls
- Comparison notes with existing providers

## Notes
- Add providers gradually - test each one thoroughly
- Compare quality between providers for same task
- Note cost differences (if tracking)
- Some providers may need audio format conversion
- Keep API keys secure (never commit to git)
- Document any quirks or special requirements per provider
- For paid providers, be mindful of API usage during testing

## Provider Comparison Checklist

When adding a new provider, compare:
- **Quality**: Accuracy/naturalness compared to existing
- **Speed**: Response time
- **Cost**: Per-request pricing (if available)
- **Features**: Special features (languages, voices, models)
- **Reliability**: Does it consistently work?

Keep notes on what each provider is best for!
