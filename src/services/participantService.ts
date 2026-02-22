import { prisma } from "../db/prisma.js";
import { getPlanByTokenOrThrow } from "./planService.js";
import { planStateCacheKey, stateCache } from "./stateService.js";

export const joinPlan = async (token: string, name: string) => {
  const plan = await getPlanByTokenOrThrow(token);
  const trimmedName = name.trim();
  const now = new Date();

  const participant = await prisma.participant.upsert({
    where: {
      planId_name: {
        planId: plan.id,
        name: trimmedName,
      },
    },
    update: {
      lastActiveAt: now,
    },
    create: {
      planId: plan.id,
      name: trimmedName,
      lastActiveAt: now,
    },
  });

  stateCache.invalidate(planStateCacheKey(token));

  return {
    participantId: participant.id,
    isOwner: trimmedName === plan.ownerName,
  };
};
