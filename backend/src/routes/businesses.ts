import { Router, Request, Response } from 'express';
import { prisma } from '../prisma';

export const businessesRouter = Router();

businessesRouter.get('/', async (req: Request, res: Response) => {
  try {
    const userEmail = (
      (req.headers['x-user-email'] as string) ||
      (req.query.email as string) ||
      'creator@adanimai.com'
    ).toLowerCase().trim();

    const user = await prisma.user.findUnique({
      where: { email: userEmail },
      include: {
        businesses: {
          include: {
            videoProjects: {
              orderBy: { version: 'desc' },
            },
          },
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!user) {
      return res.json({ success: true, businesses: [] });
    }

    const formattedBusinesses = user.businesses.map((b) => {
      let parsedProducts: string[] = [];
      try {
        parsedProducts = JSON.parse(b.products);
      } catch {
        parsedProducts = [b.products];
      }

      return {
        id: b.id,
        name: b.name,
        category: b.category,
        description: b.description,
        products: parsedProducts,
        tone: b.tone,
        location: b.location,
        sourceType: b.sourceType,
        url: b.url,
        createdAt: b.createdAt,
        videoProjects: b.videoProjects,
      };
    });

    return res.json({
      success: true,
      businesses: formattedBusinesses,
    });
  } catch (error: any) {
    console.error('Error fetching businesses:', error);
    return res.status(500).json({
      success: false,
      errorMessage: 'Failed to fetch business projects.',
    });
  }
});
