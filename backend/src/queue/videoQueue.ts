import { prisma } from '../prisma';
import { createAvatarVideoJob, checkAvatarVideoJobStatus } from '../services/avatar';

const JOB_TIMEOUT_MS = 180 * 1000;

export async function createAndDispatchVideoJob(videoProjectId: string) {
  try {
    const project = await prisma.videoProject.findUnique({
      where: { id: videoProjectId },
      include: { business: true },
    });

    if (!project) {
      throw new Error(`VideoProject ${videoProjectId} not found`);
    }

    await prisma.videoProject.update({
      where: { id: videoProjectId },
      data: { status: 'queued', errorMessage: null },
    });

    const job = await createAvatarVideoJob({
      promptText: project.promptText,
      languageCode: project.language,
      characterId: project.characterId,
      voiceStyle: (project.voiceStyle as any) || 'professional',
    });

    const updated = await prisma.videoProject.update({
      where: { id: videoProjectId },
      data: {
        externalJobId: job.jobId,
        status: job.status || 'queued',
        errorMessage: job.errorMessage || null,
        videoUrl: job.videoUrl || null,
      },
    });

    return updated;
  } catch (error: any) {
    console.error('Error creating video job:', error);
    await prisma.videoProject.update({
      where: { id: videoProjectId },
      data: {
        status: 'failed',
        errorMessage: error.message || 'Failed to initialize video generation job.',
      },
    });
    // TODO: Determine refund policy if job fails at provider level (do NOT auto-refund without explicit policy)
    throw error;
  }
}

export const dispatchVideoJob = createAndDispatchVideoJob;

export async function syncVideoJobStatus(videoProjectId: string) {
  const project = await prisma.videoProject.findUnique({
    where: { id: videoProjectId },
  });

  if (!project) {
    return null;
  }

  if (project.status === 'completed' || project.status === 'failed') {
    return project;
  }

  if (!project.externalJobId) {
    return await createAndDispatchVideoJob(videoProjectId);
  }

  const createdAtMs = new Date(project.createdAt).getTime();
  const elapsed = Date.now() - createdAtMs;
  if (elapsed > JOB_TIMEOUT_MS) {
    return await prisma.videoProject.update({
      where: { id: videoProjectId },
      data: {
        status: 'failed',
        errorMessage: 'Video rendering timed out. Please retry.',
      },
    });
  }

  try {
    const result = await checkAvatarVideoJobStatus(project.externalJobId, project.characterId);

    if (result.status === 'completed' && result.videoUrl) {
      return await prisma.videoProject.update({
        where: { id: videoProjectId },
        data: {
          status: 'completed',
          videoUrl: result.videoUrl,
          errorMessage: null,
        },
      });
    } else if (result.status === 'failed') {
      return await prisma.videoProject.update({
        where: { id: videoProjectId },
        data: {
          status: 'failed',
          errorMessage: result.errorMessage || 'Rendering failed on provider.',
        },
      });
    } else if (result.status !== project.status) {
      return await prisma.videoProject.update({
        where: { id: videoProjectId },
        data: {
          status: result.status,
        },
      });
    }
  } catch (err: any) {
    console.error(`Error checking avatar job status for project ${videoProjectId}:`, err);
  }

  return project;
}

export async function processAllPendingVideoJobs() {
  const pending = await prisma.videoProject.findMany({
    where: {
      status: {
        in: ['queued', 'generating_voice', 'rendering_video'],
      },
    },
    orderBy: { createdAt: 'asc' },
  });

  const summary = {
    totalPending: pending.length,
    processed: 0,
    completed: 0,
    failed: 0,
    inProgress: 0,
  };

  for (const proj of pending) {
    try {
      summary.processed++;
      const updated = await syncVideoJobStatus(proj.id);
      if (updated?.status === 'completed') {
        summary.completed++;
      } else if (updated?.status === 'failed') {
        summary.failed++;
      } else {
        summary.inProgress++;
      }
    } catch (e: any) {
      console.error(`Worker error processing project ${proj.id}:`, e);
      summary.failed++;
    }
  }

  return summary;
}

export const recoverPendingVideoJobs = processAllPendingVideoJobs;
