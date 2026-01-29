import { Router, Request, Response } from 'express';
import { createTTSProvider } from '../providers/tts';
import { PROVIDER_CONFIG } from '../config/providers.config';
import { v4 as uuidv4 } from 'uuid';
import fs from 'fs/promises';
import path from 'path';

const router = Router();

// GET /api/tts/providers - List available TTS providers
router.get('/providers', (req: Request, res: Response) => {
  try {
    const providers = PROVIDER_CONFIG.tts
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

// GET /api/tts/voices/:providerId - Get voices for specific provider
router.get('/voices/:providerId', async (req: Request, res: Response) => {
  try {
    const { providerId } = req.params;

    const providerConfig = PROVIDER_CONFIG.tts.find(p => p.id === providerId);
    if (!providerConfig || !providerConfig.enabled) {
      return res.status(404).json({ error: 'Provider not found or disabled', status: 404 });
    }

    const ttsProvider = createTTSProvider(providerConfig.class);
    const voices = await ttsProvider.getVoices();

    res.json({ voices });
  } catch (error: any) {
    console.error('Get voices error:', error);
    res.status(500).json({ error: error.message, status: 500 });
  }
});

// POST /api/tts/synthesize - Synthesize speech from text
router.post('/synthesize', async (req: Request, res: Response) => {
  try {
    const { provider, text, voice } = req.body;

    if (!provider || !text) {
      return res.status(400).json({ error: 'Provider and text are required', status: 400 });
    }

    const providerConfig = PROVIDER_CONFIG.tts.find(p => p.id === provider);
    if (!providerConfig || !providerConfig.enabled) {
      return res.status(404).json({ error: 'Provider not found or disabled', status: 404 });
    }

    const ttsProvider = createTTSProvider(providerConfig.class);
    const result = await ttsProvider.synthesize(text, { voice });

    // Save audio to temp folder
    const filename = `${uuidv4()}.${result.format}`;
    const tempDir = path.join(process.cwd(), 'temp');
    const filepath = path.join(tempDir, filename);

    await fs.mkdir(tempDir, { recursive: true });
    await fs.writeFile(filepath, result.audio);

    res.json({
      audioUrl: `/audio/${filename}`,
      format: result.format,
      duration: result.duration
    });
  } catch (error: any) {
    console.error('Synthesis error:', error);
    res.status(500).json({ error: error.message, status: 500 });
  }
});

export default router;
