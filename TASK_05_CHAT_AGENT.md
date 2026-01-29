# Task 05: Chat Agent Tab (Voice Conversational Agent)

## Objective
Build the Chat Agent tab where users can have voice conversations with an LLM. This chains: Voice Input → STT → LLM → TTS → Voice Output.

## Prerequisites
- Task 01 (Foundation Setup) completed
- Task 02 (STT Implementation) completed
- Task 03 (TTS Implementation) completed
- Task 04 (LLM OpenRouter) completed

## Steps

### 1. Create Conversational Pipeline Endpoint
- [ ] Create `backend/src/routes/agent.routes.ts`
  - `POST /api/agent/conversation` - Full conversational pipeline
    - Accept: `{ audio: File, sttProvider: string, llmProvider: string, llmModel: string, ttsProvider: string, ttsVoice: string, conversationHistory?: Message[] }`
    - Process:
      1. Transcribe audio using STT provider
      2. Add user message to conversation history
      3. Send to LLM provider
      4. Get LLM response
      5. Synthesize response using TTS provider
      6. Return: `{ transcription: string, llmResponse: string, audioUrl: string }`
    - Add basic error handling for each stage
    - Log which stage is being processed (for debugging)
- [ ] Register routes in `server.ts`

### 2. Build Chat Agent UI
- [ ] In `frontend/index.html`, complete the Chat Agent tab:
  ```html
  <div id="chat-agent-tab" class="tab-content">
    <!-- Provider Selectors -->
    <div class="provider-selectors">
      <div class="provider-row">
        <label>STT Provider:</label>
        <select id="chat-stt-provider"></select>
      </div>
      <div class="provider-row">
        <label>LLM Provider:</label>
        <select id="chat-llm-provider"></select>
        <select id="chat-llm-model"></select>
      </div>
      <div class="provider-row">
        <label>TTS Provider:</label>
        <select id="chat-tts-provider"></select>
        <select id="chat-tts-voice"></select>
      </div>
    </div>

    <!-- Status Indicator -->
    <div id="chat-status" class="status-indicator">Ready</div>

    <!-- Chat History -->
    <div id="chat-history" class="chat-history">
      <!-- Messages will be added here -->
    </div>

    <!-- Voice Controls -->
    <div class="voice-controls">
      <button id="chat-record-btn" class="record-btn">🎤 Push to Talk</button>
      <button id="clear-chat-btn">Clear Chat</button>
    </div>
  </div>
  ```

### 3. Implement Chat History Display
- [ ] In `frontend/js/ui.js`:
  - Add `addUserMessage(text)` - Add user message bubble to chat
  - Add `addAgentMessage(text, audioUrl)` - Add agent message bubble with play button
  - Add `clearChatHistory()` - Clear all messages
  - Style messages differently (user vs agent)
  - Add timestamps

### 4. Implement Conversation State Management
- [ ] In `frontend/js/app.js`:
  - Create `conversationHistory` array to store messages
  - Format: `[{ role: 'user', content: '...' }, { role: 'assistant', content: '...' }]`
  - Keep history in memory (no DB needed)
  - Limit to last 10 messages to avoid context overload

### 5. Connect Frontend to Backend
- [ ] In `frontend/js/api.js`:
  - Add `sendVoiceMessage(audioBlob, sttProvider, llmProvider, llmModel, ttsProvider, ttsVoice, history)` function
- [ ] In `frontend/js/app.js`:
  - Load all providers on init (STT, LLM, TTS)
  - Populate all dropdowns
  - Handle provider/model/voice changes
  - Handle record button click:
    1. Start recording
    2. Update status to "Listening..."
    3. On stop, update status to "Transcribing..."
    4. Send to backend with full conversation history
    5. Update status to "Thinking..." (LLM)
    6. Update status to "Generating speech..." (TTS)
    7. On response:
       - Add user message to chat (transcription)
       - Add agent message to chat (LLM response)
       - Play audio automatically
       - Update conversation history
       - Set status to "Ready"
  - Handle errors at each stage

### 6. Add Pipeline Status Indicators
- [ ] Create visual status indicator that shows:
  - "Ready" (idle, green)
  - "Listening..." (recording, red)
  - "Transcribing..." (STT, yellow)
  - "Thinking..." (LLM, yellow)
  - "Generating speech..." (TTS, yellow)
  - "Error: [message]" (error, red)

### 7. Auto-play Agent Response
- [ ] After agent message is added:
  - Automatically play the audio response
  - Show audio player in message bubble
  - Allow replay

## Testing Requirements

**⚠️ CRITICAL: Must test full pipeline before marking complete:**

### Backend Testing
1. **Pipeline endpoint - test each stage:**
   ```bash
   # Record a short audio file saying "What is 2 plus 2?"
   curl -X POST http://localhost:3001/api/agent/conversation \
     -F "audio=@test_question.mp3" \
     -F "sttProvider=openai-whisper" \
     -F "llmProvider=openrouter" \
     -F "llmModel=openai/gpt-4-turbo" \
     -F "ttsProvider=openai-tts" \
     -F "ttsVoice=alloy" \
     -F "conversationHistory=[]"
   ```
   - Should return:
     ```json
     {
       "transcription": "What is 2 plus 2?",
       "llmResponse": "2 plus 2 equals 4.",
       "audioUrl": "/audio/xxx.mp3"
     }
     ```
   - **Download and play audio** - should say "2 plus 2 equals 4"
   - Verify all 3 APIs were called (STT → LLM → TTS)

2. **Test with conversation history:**
   ```bash
   # First message: "My name is Alice"
   # Then send: "What is my name?"
   curl -X POST http://localhost:3001/api/agent/conversation \
     -F "audio=@test_question2.mp3" \
     -F "sttProvider=openai-whisper" \
     -F "llmProvider=openrouter" \
     -F "llmModel=openai/gpt-4-turbo" \
     -F "ttsProvider=openai-tts" \
     -F "ttsVoice=alloy" \
     -F 'conversationHistory=[{"role":"user","content":"My name is Alice"},{"role":"assistant","content":"Nice to meet you, Alice!"}]'
   ```
   - LLM response should mention "Alice"
   - Verify context is maintained

3. **Error handling:**
   - Test with invalid audio
   - Test with invalid provider
   - Test with missing API key
   - Each stage should fail gracefully with clear error message

### Frontend Testing
1. **Initial load:**
   - All dropdowns populate correctly
   - STT, LLM (with models), TTS (with voices)
   - Status shows "Ready"
   - Chat history is empty

2. **Full conversation flow - Test 1:**
   - Click "Push to Talk"
   - Browser asks for mic permission (first time)
   - Status changes to "Listening..."
   - Say: "Hello, how are you?"
   - Click to stop recording
   - Status changes through: "Transcribing..." → "Thinking..." → "Generating speech..."
   - User message appears: "Hello, how are you?"
   - Agent message appears with response
   - Audio plays automatically
   - **Verify audio says what agent text shows**
   - Status returns to "Ready"

3. **Conversation context - Test 2:**
   - Record: "My favorite color is blue"
   - Wait for response
   - Record: "What is my favorite color?"
   - Agent should respond with "blue"
   - **Verify context is maintained across messages**

4. **Model switching - Test 3:**
   - Have a conversation with GPT-4
   - Switch to Claude
   - Continue conversation
   - Should work seamlessly

5. **Voice switching - Test 4:**
   - Start with voice "Alloy"
   - After one message, switch to "Shimmer"
   - Next response should use new voice
   - **Hear the difference in voice**

6. **Clear chat:**
   - Click "Clear Chat"
   - Chat history should empty
   - Context should reset

7. **Error scenarios:**
   - Test with very short audio (< 1 second)
   - Test without microphone permission
   - Test with invalid provider selection
   - All should show error status

### Integration Testing
**⚠️ Have a real conversation to test everything:**
1. Start with: "Hi, I'm testing this system"
2. Ask: "What's the weather like?" (LLM should respond even without real weather)
3. Say: "Tell me a short joke"
4. Ask: "Can you repeat that joke?"
5. Say: "Thank you, goodbye"

**Verify:**
- Each message transcribes correctly
- LLM maintains context throughout
- Voices sound consistent
- Audio plays for each response
- No errors occur
- Status indicator updates correctly

## Acceptance Criteria
- ✅ Full pipeline works: Voice → STT → LLM → TTS → Voice
- ✅ All three provider types can be selected and switched
- ✅ Conversation history is maintained across messages
- ✅ User and agent messages display in chat
- ✅ Agent responses play automatically
- ✅ Status indicator shows current pipeline stage
- ✅ Errors are caught and displayed
- ✅ Can clear chat and start fresh
- ✅ **Can have a 5+ message conversation** (human verification!)
- ✅ **Audio quality is good and matches text** (human verification!)
- ✅ Context is maintained (agent remembers previous messages)

## Deliverables
- Working conversational pipeline endpoint
- Complete Chat Agent UI
- Conversation history management
- Status indicators for pipeline stages
- Tested multi-turn conversations
- Error handling for all stages

## Notes
- **Test with real conversations** - not just single messages
- **Listen to all audio responses** to verify quality
- Keep conversation history reasonable (10 messages max)
- Status indicator is crucial for UX (user needs to know what's happening)
- Test different provider combinations (e.g., Google STT + Claude + ElevenLabs TTS)
- Verify API calls in Network tab for each stage
- Make sure audio auto-plays (with user permission)
- Test on different browsers if possible
- Record clear audio in a quiet environment for best results
