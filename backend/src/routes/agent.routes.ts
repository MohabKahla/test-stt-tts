import { Router, Request, Response } from 'express';
import multer from 'multer';
import { createSTTProvider } from '../providers/stt';
import { createLLMProvider } from '../providers/llm';
import { createTTSProvider } from '../providers/tts';
import { PROVIDER_CONFIG } from '../config/providers.config';
import { Message } from '../providers/interfaces/ILLMProvider';
import { v4 as uuidv4 } from 'uuid';
import fs from 'fs/promises';
import path from 'path';

const router = Router();

// Configure multer for file upload
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: {
    fileSize: 25 * 1024 * 1024, // 25MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('audio/')) {
      cb(null, true);
    } else {
      cb(new Error('Only audio files are allowed'));
    }
  }
});

// POST /api/agent/conversation - Full conversational pipeline (STT → LLM → TTS)
router.post('/conversation', upload.single('audio'), async (req: Request, res: Response) => {
  try {
    const {
      sttProvider,
      llmProvider,
      llmModel,
      ttsProvider,
      ttsVoice,
      conversationHistory,
      language
    } = req.body;

    const audioFile = req.file;

    // Validate inputs
    if (!sttProvider || !llmProvider || !llmModel || !ttsProvider || !ttsVoice) {
      return res.status(400).json({
        error: 'sttProvider, llmProvider, llmModel, ttsProvider, and ttsVoice are required',
        status: 400
      });
    }

    if (!audioFile) {
      return res.status(400).json({ error: 'Audio file is required', status: 400 });
    }

    // Parse conversation history
    const history: Message[] = conversationHistory ? JSON.parse(conversationHistory) : [];

    // Step 1: Transcribe audio (STT)
    console.log('Step 1: Transcribing audio with language:', language || 'multi (auto-detect)');
    const sttConfig = PROVIDER_CONFIG.stt.find(p => p.id === sttProvider);
    if (!sttConfig || !sttConfig.enabled) {
      return res.status(404).json({ error: 'STT provider not found or disabled', status: 404 });
    }
    const stt = createSTTProvider(sttConfig.class);
    const transcription = await stt.transcribe(audioFile.buffer, { language: language || 'multi' });
    console.log('Transcription:', transcription.text);
    console.log('Detected language:', transcription.language);

    // Step 2: Send to LLM
    console.log('Step 2: Processing with LLM...');
    const llmConfig = PROVIDER_CONFIG.llm.find(p => p.id === llmProvider);
    if (!llmConfig || !llmConfig.enabled) {
      return res.status(404).json({ error: 'LLM provider not found or disabled', status: 404 });
    }
    const llm = createLLMProvider(llmConfig.class);

    // Add system message and user message to history
    const messages: Message[] = [
      { role: 'system', content: 'You are a helpful AI assistant. Always respond in plain text without using any markdown formatting. Do not use headers, bold, italics, lists, code blocks, or any other markdown syntax. Just provide your response as simple, clean text that can be read naturally by text-to-speech.' },
      ...history,
      { role: 'user', content: transcription.text }
    ];

    const llmResult = await llm.chat(messages, { model: llmModel });
    console.log('LLM response:', llmResult.message);

    // Step 3: Synthesize speech (TTS)
    console.log('Step 3: Synthesizing speech...');
    const ttsConfig = PROVIDER_CONFIG.tts.find(p => p.id === ttsProvider);
    if (!ttsConfig || !ttsConfig.enabled) {
      return res.status(404).json({ error: 'TTS provider not found or disabled', status: 404 });
    }
    const tts = createTTSProvider(ttsConfig.class);
    const audioResult = await tts.synthesize(llmResult.message, { voice: ttsVoice });

    // Save audio to temp folder
    const filename = `${uuidv4()}.${audioResult.format}`;
    const tempDir = path.join(process.cwd(), 'temp');
    const filepath = path.join(tempDir, filename);

    await fs.mkdir(tempDir, { recursive: true });
    await fs.writeFile(filepath, audioResult.audio);

    // Return results
    res.json({
      transcription: transcription.text,
      llmResponse: llmResult.message,
      audioUrl: `/audio/${filename}`,
      format: audioResult.format,
      detectedLanguage: transcription.language
    });

  } catch (error: any) {
    console.error('Conversation pipeline error:', error);
    res.status(500).json({ error: error.message, status: 500 });
  }
});

export default router;
