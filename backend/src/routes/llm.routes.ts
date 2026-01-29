import { Router, Request, Response } from 'express';
import { createLLMProvider } from '../providers/llm';
import { PROVIDER_CONFIG } from '../config/providers.config';

const router = Router();

// GET /api/llm/providers - List available LLM providers
router.get('/providers', (req: Request, res: Response) => {
  try {
    const providers = PROVIDER_CONFIG.llm
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

// GET /api/llm/models/:providerId - Get models for specific provider
router.get('/models/:providerId', (req: Request, res: Response) => {
  try {
    const { providerId } = req.params;

    const providerConfig = PROVIDER_CONFIG.llm.find(p => p.id === providerId);
    if (!providerConfig || !providerConfig.enabled) {
      return res.status(404).json({ error: 'Provider not found or disabled', status: 404 });
    }

    res.json({ models: providerConfig.models || [] });
  } catch (error: any) {
    console.error('Get models error:', error);
    res.status(500).json({ error: error.message, status: 500 });
  }
});

// POST /api/llm/chat - Chat with LLM
router.post('/chat', async (req: Request, res: Response) => {
  try {
    const { provider, model, messages, temperature, maxTokens } = req.body;

    if (!provider || !model || !messages || !Array.isArray(messages)) {
      return res.status(400).json({ error: 'Provider, model, and messages array are required', status: 400 });
    }

    const providerConfig = PROVIDER_CONFIG.llm.find(p => p.id === provider);
    if (!providerConfig || !providerConfig.enabled) {
      return res.status(404).json({ error: 'Provider not found or disabled', status: 404 });
    }

    const llmProvider = createLLMProvider(providerConfig.class);
    const result = await llmProvider.chat(messages, { model, temperature, maxTokens });

    res.json(result);
  } catch (error: any) {
    console.error('Chat error:', error);
    res.status(500).json({ error: error.message, status: 500 });
  }
});

export default router;
