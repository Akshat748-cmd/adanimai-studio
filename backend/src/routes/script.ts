import { Router, Request, Response } from 'express';
import { generateAdScriptWithLLM } from '../services/llm';

export const scriptRouter = Router();

scriptRouter.post('/generate', async (req: Request, res: Response) => {
  try {
    const { business, languageCode = 'en', customTone } = req.body;

    if (!business || !business.name) {
      return res.status(400).json({
        success: false,
        errorMessage: 'Business details are required to generate an ad script.',
      });
    }

    const businessProfile = {
      name: business.name,
      category: business.category || 'Retail',
      description: business.description || '',
      products: Array.isArray(business.products) ? business.products : [business.products || 'Offerings'],
      tone: business.tone || 'Energetic',
      location: business.location || '',
      sourceType: business.sourceType || 'manual',
    };

    const promptText = await generateAdScriptWithLLM(
      businessProfile,
      languageCode,
      customTone
    );

    return res.json({
      success: true,
      promptText,
    });
  } catch (error: any) {
    console.error('Error in /api/script/generate:', error);
    return res.status(500).json({
      success: false,
      errorMessage: 'Failed to generate ad script. Please try again or write your own.',
    });
  }
});
