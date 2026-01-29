// Application State
let sttProviders = [];
let ttsProviders = [];
let llmProviders = [];
let conversationHistory = [];

// Tab Switching
document.querySelectorAll('.tab-btn').forEach(btn => {
  btn.addEventListener('click', (e) => {
    switchTab(e.target.dataset.tab);
  });
});

// Initialize Application
async function init() {
  try {
    console.log('Initializing application...');

    // Test health endpoint
    const health = await healthCheck();
    console.log('Health check:', health);

    // Load providers
    await loadProviders();

    // Setup event listeners
    setupSTTListeners();
    setupTTSListeners();
    setupLLMListeners();
    setupChatListeners();

    console.log('Application initialized successfully');
  } catch (error) {
    console.error('Failed to initialize application:', error);
    showStatus('stt-status', 'Failed to connect to backend. Please ensure the server is running.', 'error');
  }
}

async function loadProviders() {
  try {
    // Load STT providers
    const sttData = await getSTTProviders();
    sttProviders = sttData.providers || [];
    populateDropdown('stt-provider', sttProviders, 'Select STT Provider');
    populateDropdown('chat-stt-provider', sttProviders, 'Select STT Provider');
    // Set default STT to Hamsa for Chat Agent
    setDropdownValue('chat-stt-provider', 'hamsa-stt');

    // Load TTS providers
    const ttsData = await getTTSProviders();
    ttsProviders = ttsData.providers || [];
    populateDropdown('tts-provider', ttsProviders, 'Select TTS Provider');
    populateDropdown('chat-tts-provider', ttsProviders, 'Select TTS Provider');
    // Set default TTS to ElevenLabs for Chat Agent
    setDropdownValue('chat-tts-provider', 'elevenlabs-tts');

    // Load TTS voices for ElevenLabs to set default voice
    try {
      const elevenlabsVoices = await getTTSVoices('elevenlabs-tts');
      populateDropdown('chat-tts-voice', elevenlabsVoices.voices || [], 'Select Voice');
      // Set default voice to Bella
      const bellaVoice = elevenlabsVoices.voices?.find(v => v.name === 'Bella' || v.id === 'EXAVITQu4vr4xnSDxMaL');
      if (bellaVoice) {
        setDropdownValue('chat-tts-voice', bellaVoice.id);
      }
    } catch (error) {
      console.error('Failed to load ElevenLabs voices:', error);
    }

    // Load LLM providers
    const llmData = await getLLMProviders();
    llmProviders = llmData.providers || [];

    if (llmProviders.length > 0) {
      // Load models for the first provider
      const modelsData = await getLLMModels(llmProviders[0].id);
      const models = modelsData.models || [];
      populateDropdown('llm-model', models, 'Select Model');
      populateDropdown('chat-llm-model', models, 'Select LLM Model');
      // Set default LLM to GPT 5 Mini
      setDropdownValue('chat-llm-model', 'openai/gpt-5-mini');
    }
  } catch (error) {
    console.error('Failed to load providers:', error);
  }
}

// STT Event Listeners
function setupSTTListeners() {
  const recordBtn = document.getElementById('record-btn');
  if (recordBtn) {
    recordBtn.addEventListener('click', handleSTTRecording);
  }
}

async function handleSTTRecording() {
  const recordBtn = document.getElementById('record-btn');
  const provider = document.getElementById('stt-provider').value;

  if (!provider) {
    showStatus('stt-status', 'Please select a provider first', 'error');
    return;
  }

  if (!isRecording()) {
    // Start recording
    try {
      await startRecording();
      recordBtn.textContent = '⏹️ Stop Recording';
      recordBtn.classList.add('recording');
      showStatus('stt-status', 'Recording... Click to stop', 'info');
    } catch (error) {
      showStatus('stt-status', 'Failed to start recording: ' + error.message, 'error');
    }
  } else {
    // Stop recording and transcribe
    try {
      recordBtn.disabled = true;
      showStatus('stt-status', 'Processing...', 'info');

      const audioBlob = await stopRecording();
      recordBtn.textContent = '🎤 Record';
      recordBtn.classList.remove('recording');

      // Show recorded audio
      const audioUrl = URL.createObjectURL(audioBlob);
      playAudio(audioUrl, 'recorded-audio');

      // Transcribe with auto-detect language
      const result = await transcribeAudio(provider, audioBlob, 'multi');
      setText('transcription-output', result.text || 'No transcription');
      showStatus('stt-status', 'Transcription complete!', 'success');
    } catch (error) {
      console.error('Transcription error:', error);
      showStatus('stt-status', 'Transcription failed: ' + error.message, 'error');
    } finally {
      recordBtn.disabled = false;
    }
  }
}

// TTS Event Listeners
function setupTTSListeners() {
  const synthesizeBtn = document.getElementById('synthesize-btn');
  if (synthesizeBtn) {
    synthesizeBtn.addEventListener('click', handleTTSSynthesis);
  }

  const ttsProvider = document.getElementById('tts-provider');
  if (ttsProvider) {
    ttsProvider.addEventListener('change', async (e) => {
      const providerId = e.target.value;
      if (providerId) {
        try {
          const data = await getTTSVoices(providerId);
          populateDropdown('tts-voice', data.voices || [], 'Select Voice');
        } catch (error) {
          console.error('Failed to load voices:', error);
        }
      } else {
        clearDropdown('tts-voice', 'Select provider first');
      }
    });
  }
}

async function handleTTSSynthesis() {
  const provider = document.getElementById('tts-provider').value;
  const voice = document.getElementById('tts-voice').value;
  const text = document.getElementById('tts-text').value.trim();

  if (!provider || !voice || !text) {
    showStatus('tts-status', 'Please select provider, voice, and enter text', 'error');
    return;
  }

  try {
    setButtonLoading('synthesize-btn', true);
    showStatus('tts-status', 'Synthesizing...', 'info');

    const result = await synthesizeSpeech(provider, text, voice);
    playAudio(result.audioUrl, 'synthesized-audio');
    showStatus('tts-status', 'Synthesis complete!', 'success');
  } catch (error) {
    console.error('Synthesis error:', error);
    showStatus('tts-status', 'Synthesis failed: ' + error.message, 'error');
  } finally {
    setButtonLoading('synthesize-btn', false, '🔊 Synthesize');
  }
}

// LLM Event Listeners
function setupLLMListeners() {
  const sendBtn = document.getElementById('llm-send-btn');
  if (sendBtn) {
    sendBtn.addEventListener('click', handleLLMChat);
  }
}

async function handleLLMChat() {
  const model = document.getElementById('llm-model').value;
  const input = document.getElementById('llm-input').value.trim();

  if (!model || !input) {
    return;
  }

  try {
    setButtonLoading('llm-send-btn', true);
    setText('llm-response', 'Thinking...');

    const messages = [{ role: 'user', content: input }];
    const result = await sendLLMMessage('openrouter', model, messages);

    setText('llm-response', result.message || 'No response');
  } catch (error) {
    console.error('LLM error:', error);
    setText('llm-response', 'Error: ' + error.message);
  } finally {
    setButtonLoading('llm-send-btn', false, 'Send');
  }
}

// Chat Agent Event Listeners
function setupChatListeners() {
  const recordBtn = document.getElementById('chat-record-btn');
  if (recordBtn) {
    recordBtn.addEventListener('click', handleChatRecording);
  }

  const clearBtn = document.getElementById('clear-chat-btn');
  if (clearBtn) {
    clearBtn.addEventListener('click', () => {
      clearChatHistory();
      conversationHistory = [];
      setChatStatus('ready', 'Ready');
    });
  }

  const ttsProvider = document.getElementById('chat-tts-provider');
  if (ttsProvider) {
    ttsProvider.addEventListener('change', async (e) => {
      const providerId = e.target.value;
      if (providerId) {
        try {
          const data = await getTTSVoices(providerId);
          populateDropdown('chat-tts-voice', data.voices || [], 'Select Voice');
        } catch (error) {
          console.error('Failed to load voices:', error);
        }
      }
    });
  }
}

async function handleChatRecording() {
  const recordBtn = document.getElementById('chat-record-btn');
  const sttProvider = document.getElementById('chat-stt-provider').value;
  const llmModel = document.getElementById('chat-llm-model').value;
  const ttsProvider = document.getElementById('chat-tts-provider').value;
  const ttsVoice = document.getElementById('chat-tts-voice').value;

  if (!sttProvider || !llmModel || !ttsProvider || !ttsVoice) {
    setChatStatus('error', 'Please select all providers and model');
    return;
  }

  if (!isRecording()) {
    // Start recording
    try {
      await startRecording();
      recordBtn.textContent = '⏹️ Stop';
      recordBtn.classList.add('recording');
      setChatStatus('listening', 'Listening... Click to stop');
    } catch (error) {
      setChatStatus('error', 'Failed to start recording: ' + error.message);
    }
  } else {
    // Stop recording and process
    try {
      recordBtn.disabled = true;
      setChatStatus('processing', 'Transcribing...');

      const audioBlob = await stopRecording();
      recordBtn.textContent = '🎤 Push to Talk';
      recordBtn.classList.remove('recording');

      setChatStatus('processing', 'Thinking...');
      const result = await sendVoiceMessage(
        audioBlob,
        sttProvider,
        'openrouter',
        llmModel,
        ttsProvider,
        ttsVoice,
        conversationHistory,
        'multi' // Auto-detect language (Arabic, English, or any supported language)
      );

      // Add messages to history
      addUserMessage(result.transcription);
      addAgentMessage(result.llmResponse, result.audioUrl);

      // Update conversation history
      conversationHistory.push(
        { role: 'user', content: result.transcription },
        { role: 'assistant', content: result.llmResponse }
      );

      // Keep only last 10 messages
      if (conversationHistory.length > 10) {
        conversationHistory = conversationHistory.slice(-10);
      }

      setChatStatus('ready', 'Ready');
    } catch (error) {
      console.error('Chat error:', error);
      setChatStatus('error', 'Error: ' + error.message);
    } finally {
      recordBtn.disabled = false;
    }
  }
}

// Start the application
init();
