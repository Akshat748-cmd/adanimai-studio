import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';

// Load root .env configuration
dotenv.config({ path: path.resolve(__dirname, '../../.env') });
dotenv.config({ path: path.resolve(process.cwd(), '../.env') });
dotenv.config({ path: path.resolve(process.cwd(), '.env') });
dotenv.config();

import { scrapeRouter } from './routes/scrape';
import { scriptRouter } from './routes/script';
import { videoRouter } from './routes/video';
import { businessesRouter } from './routes/businesses';
import { cronRouter } from './routes/cron';
import { userRouter } from './routes/user';
import { startDevWorker } from './queue/devWorker';

const app = express();
const PORT = process.env.PORT || 5000;

// Middlewares
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Health Check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'AdAnimAI Backend API',
    timestamp: new Date().toISOString(),
  });
});

// API Routes
app.use('/api/scrape', scrapeRouter);
app.use('/api/script', scriptRouter);
app.use('/api/video', videoRouter);
app.use('/api/businesses', businessesRouter);
app.use('/api/cron', cronRouter);
app.use('/api/user', userRouter);

// Start background queue worker
startDevWorker();

// Start HTTP server
app.listen(PORT, () => {
  console.log('\n======================================================');
  console.log(` 🚀 AdAnimAI Backend API Server running on port ${PORT}`);
  console.log(` 🔗 Health check: http://localhost:${PORT}/api/health`);
  console.log('======================================================\n');
});

export default app;
