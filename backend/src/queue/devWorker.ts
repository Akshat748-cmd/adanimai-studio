import { processAllPendingVideoJobs } from './videoQueue';

declare global {
  // eslint-disable-next-line no-var
  var __adanimai_dev_worker_started: boolean | undefined;
}

export function startDevWorker() {
  if (global.__adanimai_dev_worker_started) return;
  global.__adanimai_dev_worker_started = true;

  console.log('[Worker] Background video queue worker initialized.');

  setInterval(async () => {
    try {
      await processAllPendingVideoJobs();
    } catch (e) {
      // Ignore background loop errors
    }
  }, 2500);
}
