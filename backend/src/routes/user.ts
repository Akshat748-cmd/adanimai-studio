import { Router, Request, Response } from 'express';
import { getOrCreateUser } from '../services/credits';

export const userRouter = Router();

userRouter.get('/credits', async (req: Request, res: Response) => {
  try {
    const userEmail = (
      (req.headers['x-user-email'] as string) ||
      (req.query.userEmail as string) ||
      'creator@adanimai.com'
    ).toLowerCase().trim();

    const user = await getOrCreateUser(userEmail);

    return res.json({
      success: true,
      credits: user.credits,
      userId: user.id,
      email: user.email,
    });
  } catch (error: any) {
    console.error('Error fetching user credits:', error);
    return res.status(500).json({
      success: false,
      errorMessage: 'Failed to retrieve user credits',
    });
  }
});
