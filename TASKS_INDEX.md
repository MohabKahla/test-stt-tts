# STT/TTS/LLM Playground - Tasks Index

## Overview
This project is broken down into 6 main tasks. Complete them in order for a working playground.

**Important:** Each task requires testing with real APIs before marking complete. No mocking!

---

## Task 01: Foundation Setup
**File:** `TASK_01_FOUNDATION_SETUP.md`

**What:** Set up Docker environment, basic Express server, vanilla JS frontend

**Deliverables:**
- Docker Compose with frontend (nginx) and backend (Node.js)
- Basic Express server with health check endpoint
- HTML/CSS/JS frontend with tab navigation
- Frontend-backend communication working

**Time Estimate:** 2-3 hours

**Test:** `docker-compose up` → Frontend loads → Backend responds → No errors

---

## Task 02: STT Implementation
**File:** `TASK_02_STT_IMPLEMENTATION.md`

**What:** Implement Speech-to-Text with OpenAI Whisper, build Playground STT UI

**Deliverables:**
- STT provider interface
- OpenAI Whisper provider implementation
- STT API endpoints
- Audio recording in frontend
- Working transcription in Playground tab

**Time Estimate:** 3-4 hours

**Test:** Record voice → Transcribes correctly → **Real OpenAI API called**

---

## Task 03: TTS Implementation
**File:** `TASK_03_TTS_IMPLEMENTATION.md`

**What:** Implement Text-to-Speech with OpenAI TTS, build Playground TTS UI

**Deliverables:**
- TTS provider interface
- OpenAI TTS provider implementation
- TTS API endpoints
- Audio playback in frontend
- Working synthesis in Playground tab

**Time Estimate:** 3-4 hours

**Test:** Type text → Generates speech → **Listen to audio** → Real OpenAI API called

---

## Task 04: LLM with OpenRouter
**File:** `TASK_04_LLM_OPENROUTER.md`

**What:** Integrate OpenRouter for 100+ LLM models (GPT-4, Claude, Gemini, Llama, etc.)

**Deliverables:**
- LLM provider interface
- OpenRouter provider implementation
- OpenRouter models configuration
- LLM API endpoints
- (Optional) Simple test UI

**Time Estimate:** 2-3 hours

**Test:** Send message → **Get real response** from GPT-4/Claude/Gemini → Verify context works

---

## Task 05: Chat Agent Tab
**File:** `TASK_05_CHAT_AGENT.md`

**What:** Build voice conversational agent (Voice → STT → LLM → TTS → Voice)

**Deliverables:**
- Conversational pipeline endpoint (chains all 3 services)
- Chat Agent UI with history
- Provider selectors (STT, LLM, TTS)
- Status indicators
- Auto-play audio responses

**Time Estimate:** 4-5 hours

**Test:** **Have a real 5+ message voice conversation** → Verify context maintained → Audio quality good

---

## Task 06: Additional Providers (Ongoing)
**File:** `TASK_06_ADDITIONAL_PROVIDERS.md`

**What:** Add more STT/TTS providers as needed (Deepgram, ElevenLabs, Google, Azure, etc.)

**Deliverables:**
- Additional provider implementations
- Config updates
- Comparison testing

**Time Estimate:** 2-3 hours per provider

**Test:** **Real API calls** → Compare quality → Works in both tabs

---

## Quick Start After Completion

```bash
# 1. Setup environment
cp .env.example .env
# Edit .env and add your API keys

# 2. Start everything
docker-compose up

# 3. Open browser
open http://localhost:3000

# 4. Test Playground tab
# - Record audio → See transcription
# - Type text → Hear speech

# 5. Test Chat Agent tab
# - Select providers
# - Talk to the agent
# - Have a conversation
```

---

## Minimum Required API Keys

To complete all tasks, you need:

1. **OpenAI API Key** (for STT + TTS)
   - Get from: https://platform.openai.com/api-keys
   - Used for: Whisper (STT) + TTS

2. **OpenRouter API Key** (for LLMs)
   - Get from: https://openrouter.ai/keys
   - Used for: GPT-4, Claude, Gemini, Llama, and 100+ other models

**Optional for Task 06:**
- Deepgram API key (STT)
- ElevenLabs API key (TTS)
- Google Cloud API key (STT/TTS)
- Azure Speech key (STT/TTS)
- AWS credentials (TTS - Polly)

---

## Success Criteria for Full Project

### Playground Tab
- ✅ Can record audio and see transcription
- ✅ Can type text and hear speech
- ✅ Can switch STT providers
- ✅ Can switch TTS providers
- ✅ Can switch TTS voices

### Chat Agent Tab
- ✅ Can have voice conversations with LLM
- ✅ Context is maintained across messages
- ✅ Can select STT, LLM, and TTS providers independently
- ✅ Can switch LLM models (GPT-4 → Claude → Gemini)
- ✅ Audio responses play automatically
- ✅ Status indicator shows pipeline progress

### Technical
- ✅ All providers use real APIs (no mocking)
- ✅ Clean provider abstraction (easy to add more)
- ✅ Docker setup works with one command
- ✅ No frontend build step (vanilla JS)
- ✅ Adding LLM model = 1 line of config

---

## Testing Philosophy

**⚠️ CRITICAL RULE FOR ALL TASKS:**

**You must test with real APIs before marking a task complete!**

- Don't mock API responses
- Don't skip testing
- Don't assume it works
- Actually record audio and listen to results
- Actually read transcriptions and verify accuracy
- Actually have conversations and check context
- Check Network tab to confirm API calls
- Check provider dashboards for usage

**Why?** Because this is a playground for testing real providers. Mocking defeats the purpose!

---

## File Structure After Completion

```
test-stt-tts/
├── IMPLEMENTATION_PLAN.md           # Overall plan
├── TASKS_INDEX.md                   # This file
├── TASK_01_FOUNDATION_SETUP.md      # Task details
├── TASK_02_STT_IMPLEMENTATION.md
├── TASK_03_TTS_IMPLEMENTATION.md
├── TASK_04_LLM_OPENROUTER.md
├── TASK_05_CHAT_AGENT.md
├── TASK_06_ADDITIONAL_PROVIDERS.md
├── docker-compose.yml
├── .env
├── .env.example
├── .gitignore
├── frontend/
│   ├── Dockerfile
│   ├── nginx.conf
│   ├── index.html
│   ├── css/
│   │   └── styles.css
│   └── js/
│       ├── app.js
│       ├── api.js
│       ├── audio.js
│       └── ui.js
└── backend/
    ├── Dockerfile
    ├── package.json
    ├── tsconfig.json
    └── src/
        ├── server.ts
        ├── routes/
        │   ├── stt.routes.ts
        │   ├── tts.routes.ts
        │   ├── llm.routes.ts
        │   └── agent.routes.ts
        ├── providers/
        │   ├── interfaces/
        │   │   ├── ISTTProvider.ts
        │   │   ├── ITTSProvider.ts
        │   │   └── ILLMProvider.ts
        │   ├── stt/
        │   │   ├── OpenAISTT.ts
        │   │   └── index.ts
        │   ├── tts/
        │   │   ├── OpenAITTS.ts
        │   │   └── index.ts
        │   └── llm/
        │       ├── OpenRouterLLM.ts
        │       └── index.ts
        ├── config/
        │   ├── providers.config.ts
        │   └── openrouter-models.ts
        └── temp/
```

**Total Files:** ~25-30 files for a complete working playground

---

## Tips for Implementation

1. **Do tasks in order** - each builds on the previous
2. **Test frequently** - don't wait until the end
3. **Use real APIs** - that's the whole point
4. **Keep it simple** - resist adding features not in tasks
5. **Check dashboards** - verify API usage after tests
6. **Listen to audio** - don't just trust JSON responses
7. **Have conversations** - test Chat Agent thoroughly
8. **Compare providers** - note quality differences
9. **Document quirks** - some APIs behave differently
10. **Commit often** - save progress after each task

---

## Getting Help

If stuck:
1. Check provider API documentation
2. Verify API keys in .env
3. Check docker logs: `docker-compose logs backend`
4. Check browser console for frontend errors
5. Test backend endpoints with curl
6. Verify Network tab shows API calls

---

## Next Steps After Completion

Once all tasks are done:
1. Test different provider combinations
2. Compare quality (transcription accuracy, voice naturalness, LLM responses)
3. Add more providers from Task 06
4. Take notes on which providers work best for what
5. Consider adding features like:
   - Side-by-side provider comparison
   - Export conversation history
   - Cost tracking per provider
   - Performance metrics

But remember: **keep it simple!** This is a playground, not a production app.
