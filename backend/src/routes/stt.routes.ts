import { Router, Request, Response } from 'express';
import multer from 'multer';
import { createSTTProvider } from '../providers/stt';
import { PROVIDER_CONFIG } from '../config/providers.config';

const router = Router();

// Configure multer for file upload
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: {
    fileSize: 25 * 1024 * 1024, // 25MB limit
  },
  fileFilter: (req, file, cb) => {
    // Accept audio files
    if (file.mimetype.startsWith('audio/')) {
      cb(null, true);
    } else {
      cb(new Error('Only audio files are allowed'));
    }
  }
});

// GET /api/stt/providers - List available STT providers
router.get('/providers', (req: Request, res: Response) => {
  try {
    const providers = PROVIDER_CONFIG.stt
      .filter(p => p.enabled)
      .map(p => ({
        id: p.id,
        name: p.name,
        requiresAuth: p.requiresAuth
      }));

    res.json({ providers });
  } catch (error: any) {
    res.status(500).json({ error: error.message, status: 500 });
  }
});

// POST /api/stt/transcribe - Transcribe audio file
router.post('/transcribe', upload.single('audio'), async (req: Request, res: Response) => {
  try {
    const { provider, language, model } = req.body;
    const audioFile = req.file;

    if (!provider) {
      return res.status(400).json({ error: 'Provider is required', status: 400 });
    }

    if (!audioFile) {
      return res.status(400).json({ error: 'Audio file is required', status: 400 });
    }

    // Log audio file info for debugging
    console.log('[STT Route] Audio file size:', audioFile.size, 'bytes');
    console.log('[STT Route] Audio mimetype:', audioFile.mimetype);
    console.log('[STT Route] Provider:', provider);
    console.log('[STT Route] Language:', language);

    // Get provider config
    const providerConfig = PROVIDER_CONFIG.stt.find(p => p.id === provider);
    if (!providerConfig || !providerConfig.enabled) {
      return res.status(404).json({ error: 'Provider not found or disabled', status: 404 });
    }

    // Create provider instance
    const sttProvider = createSTTProvider(providerConfig.class);

    // Transcribe audio with options
    const result = await sttProvider.transcribe(audioFile.buffer, { language, model });

    res.json(result);
  } catch (error: any) {
    console.error('Transcription error:', error);
    res.status(500).json({ error: error.message, status: 500 });
  }
});

export default router;
