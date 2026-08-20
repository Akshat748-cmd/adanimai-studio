import { Router, Request, Response } from 'express';
import { processAllPendingVideoJobs } from '../queue/videoQueue';

export const cronRouter = Router();

cronRouter.all('/process-videos', async (req: Request, res: Response) => {
  try {
    const cronSecret = process.env.CRON_SECRET;
    const authHeader = req.headers['authorization'];
    const querySecret = req.query.key || req.query.secret;

    if (cronSecret && cronSecret.trim() !== '') {
      const isAuthorized =
        authHeader === `Bearer ${cronSecret.trim()}` ||
        querySecret === cronSecret.trim();

      if (!isAuthorized) {
        return res.status(401).json({ success: false, errorMessage: 'Unauthorized. Invalid CRON_SECRET.' });
      }
    }

    const summary = await processAllPendingVideoJobs();

    return res.json({
      success: true,
      timestamp: new Date().toISOString(),
      summary,
    });
  } catch (error: any) {
    console.error('Error in /api/cron/process-videos:', error);
    return res.status(500).json({
      success: false,
      errorMessage: error.message || 'Worker batch execution failed.',
    });
  }
});
