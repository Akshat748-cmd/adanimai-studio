import { prisma } from '../prisma';

export async function getCreditBalance(userId: string): Promise<number> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { credits: true },
  });

  if (!user) {
    // If user record doesn't exist yet, create or default to 500
    return 500;
  }

  return user.credits;
}

export async function getOrCreateUser(email: string): Promise<{ id: string; email: string; credits: number }> {
  const normalizedEmail = email.toLowerCase().trim();
  let user = await prisma.user.findUnique({
    where: { email: normalizedEmail },
  });

  if (!user) {
    user = await prisma.user.create({
      data: {
        email: normalizedEmail,
        authProvider: 'email',
        credits: 500,
      },
    });
  }

  return {
    id: user.id,
    email: user.email,
    credits: user.credits,
  };
}

export async function deductCredits(
  userId: string,
  amount: number
): Promise<{ success: boolean; newBalance: number; error?: string }> {
  if (amount <= 0) {
    const current = await getCreditBalance(userId);
    return { success: true, newBalance: current };
  }

  return await prisma.$transaction(async (tx) => {
    const user = await tx.user.findUnique({
      where: { id: userId },
      select: { id: true, credits: true },
    });

    if (!user) {
      throw new Error('User not found');
    }

    if (user.credits < amount) {
      return {
        success: false,
        newBalance: user.credits,
        error: `Insufficient credits. This video requires ${amount} credits, but your current balance is ${user.credits} credits.`,
      };
    }

    const updatedUser = await tx.user.update({
      where: { id: userId },
      data: {
        credits: {
          decrement: amount,
        },
      },
      select: { credits: true },
    });

    return {
      success: true,
      newBalance: updatedUser.credits,
    };
  });
}
