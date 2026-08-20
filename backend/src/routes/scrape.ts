import { Router, Request, Response } from 'express';
import { scrapeBusinessUrl } from '../services/scraper';
import { analyzeBusinessWithLLM } from '../services/llm';
import { isValidUrl, formatUrl } from '../utils';

export const scrapeRouter = Router();

scrapeRouter.post('/', async (req: Request, res: Response) => {
  try {
    const rawUrl = req.body?.url;

    if (!rawUrl || typeof rawUrl !== 'string' || rawUrl.trim() === '') {
      return res.status(400).json({ success: false, errorMessage: 'Please enter a valid website URL.' });
    }

    const formatted = formatUrl(rawUrl);
    if (!isValidUrl(formatted)) {
      return res.status(400).json({ success: false, errorMessage: 'Please enter a valid URL like https://example.com' });
    }

    const scrapeResult = await scrapeBusinessUrl(formatted);

    const businessData = await analyzeBusinessWithLLM(
      scrapeResult.content || formatted,
      scrapeResult.url,
      {
        name: scrapeResult.title,
        description: scrapeResult.description,
      }
    );

    const resultBusiness = {
      ...businessData,
      sourceType: 'url',
      url: scrapeResult.url,
    };

    return res.json({
      success: true,
      business: resultBusiness,
      data: resultBusiness,
    });
  } catch (error: any) {
    console.error('Error in /api/scrape:', error);
    return res.status(500).json({
      success: false,
      errorMessage: 'An unexpected error occurred while analyzing the URL. Please enter details manually.',
      autoSwitchToManual: true,
    });
  }
});
