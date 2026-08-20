import { Router, Request, Response } from 'express';
import { prisma } from '../prisma';
import { createAndDispatchVideoJob, syncVideoJobStatus } from '../queue/videoQueue';
import { getOrCreateUser, deductCredits } from '../services/credits';
import { VIDEO_LENGTH_COSTS, VideoLength, VoiceStyle } from '@adanimai/shared';

export const videoRouter = Router();

videoRouter.post('/generate', async (req: Request, res: Response) => {
  try {
    const userEmail = (
      (req.headers['x-user-email'] as string) ||
      req.body.userEmail ||
      'creator@adanimai.com'
    ).toLowerCase().trim();

    const {
      businessId,
      businessData,
      promptText,
      language = 'hi',
      characterId = 'char_cartoon_maya',
      voiceStyle = 'professional',
      videoLength = 30,
    } = req.body;

    if (!promptText || typeof promptText !== 'string' || promptText.trim() === '') {
      return res.status(400).json({ success: false, errorMessage: 'Prompt script text cannot be empty.' });
    }

    const user = await getOrCreateUser(userEmail);

    const validLength: VideoLength = ([30, 45, 60].includes(Number(videoLength)) ? Number(videoLength) : 30) as VideoLength;
    const requiredCredits = VIDEO_LENGTH_COSTS[validLength] || 100;
    const validVoiceStyle: VoiceStyle = voiceStyle === 'local' ? 'local' : 'professional';

    // 1. Atomically check and deduct credits BEFORE dispatching the video job
    const deduction = await deductCredits(user.id, requiredCredits);

    if (!deduction.success) {
      return res.status(402).json({
        success: false,
        errorMessage: deduction.error || `Insufficient credits. You need ${requiredCredits} credits, but have ${deduction.newBalance}.`,
        currentBalance: deduction.newBalance,
        requiredCredits,
      });
    }

    let targetBusinessId = businessId;

    if (!targetBusinessId) {
      if (!businessData || !businessData.name) {
        return res.status(400).json({ success: false, errorMessage: 'Business details are required.' });
      }

      const newBusiness = await prisma.business.create({
        data: {
          userId: user.id,
          name: businessData.name,
          category: businessData.category || 'Retail',
          description: businessData.description || '',
          products: JSON.stringify(businessData.products || []),
          tone: businessData.tone || 'Energetic',
          location: businessData.location || '',
          sourceType: businessData.sourceType || 'manual',
          url: businessData.url || null,
        },
      });
      targetBusinessId = newBusiness.id;
    }

    const previousProjects = await prisma.videoProject.findMany({
      where: { businessId: targetBusinessId },
      orderBy: { version: 'desc' },
      take: 1,
    });

    const nextVersion = previousProjects.length > 0 ? previousProjects[0].version + 1 : 1;

    const videoProject = await prisma.videoProject.create({
      data: {
        businessId: targetBusinessId,
        promptText: promptText.trim(),
        language,
        characterId,
        voiceStyle: validVoiceStyle,
        videoLength: validLength,
        creditsCost: requiredCredits,
        status: 'queued',
        version: nextVersion,
      },
    });

    try {
      await createAndDispatchVideoJob(videoProject.id);
    } catch (err: any) {
      console.error('Initial video dispatch warning:', err);
    }

    return res.json({
      success: true,
      projectId: videoProject.id,
      businessId: targetBusinessId,
      version: videoProject.version,
      creditsCost: requiredCredits,
      remainingCredits: deduction.newBalance,
    });
  } catch (error: any) {
    console.error('Error in /api/video/generate:', error);
    return res.status(500).json({
      success: false,
      errorMessage: error.message || 'Failed to initiate video generation job. Please try again.',
    });
  }
});

videoRouter.get('/status/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({ success: false, errorMessage: 'Project ID is required' });
    }

    let project = await prisma.videoProject.findUnique({
      where: { id },
      include: {
        business: true,
      },
    });

    if (!project) {
      return res.status(404).json({ success: false, errorMessage: 'Video project not found' });
    }

    if (project.status !== 'completed' && project.status !== 'failed') {
      const synced = await syncVideoJobStatus(id);
      if (synced) {
        project = {
          ...project,
          status: synced.status,
          errorMessage: synced.errorMessage,
          videoUrl: synced.videoUrl,
        };
      }
    }

    return res.json({
      success: true,
      project: {
        id: project.id,
        businessId: project.businessId,
        businessName: project.business.name,
        promptText: project.promptText,
        language: project.language,
        characterId: project.characterId,
        voiceStyle: project.voiceStyle,
        videoLength: project.videoLength,
        creditsCost: project.creditsCost,
        status: project.status,
        errorMessage: project.errorMessage,
        videoUrl: project.videoUrl,
        version: project.version,
        createdAt: project.createdAt,
      },
    });
  } catch (error: any) {
    console.error('Error fetching video status:', error);
    return res.status(500).json({ success: false, errorMessage: 'Internal server error' });
  }
});

videoRouter.get('/poll/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({ success: false, errorMessage: 'Project ID is required' });
    }

    const synced = await syncVideoJobStatus(id);

    if (!synced) {
      return res.status(404).json({ success: false, errorMessage: 'Video project not found' });
    }

    return res.json({
      success: true,
      status: synced.status,
      videoUrl: synced.videoUrl,
      errorMessage: synced.errorMessage,
      updatedAt: synced.updatedAt,
    });
  } catch (error: any) {
    console.error('Error in /api/video/poll/:id:', error);
    return res.status(500).json({ success: false, errorMessage: 'Failed to poll video job' });
  }
});
