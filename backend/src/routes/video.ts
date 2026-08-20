import { Router, Request, Response } from 'express';
import { prisma } from '../prisma';
import { createAndDispatchVideoJob, syncVideoJobStatus } from '../queue/videoQueue';

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
      language = 'en',
      characterId = 'char_cartoon_maya',
    } = req.body;

    if (!promptText || typeof promptText !== 'string' || promptText.trim() === '') {
      return res.status(400).json({ success: false, errorMessage: 'Prompt script text cannot be empty.' });
    }

    let user = await prisma.user.findUnique({
      where: { email: userEmail },
    });

    if (!user) {
      user = await prisma.user.create({
        data: {
          email: userEmail,
          authProvider: 'system',
        },
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
    });
  } catch (error: any) {
    console.error('Error in /api/video/generate:', error);
    return res.status(500).json({
      success: false,
      errorMessage: 'Failed to initiate video generation job. Please try again.',
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
