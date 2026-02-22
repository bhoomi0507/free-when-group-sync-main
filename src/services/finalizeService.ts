import { prisma } from "../db/prisma.js";
import { findBestTime } from "../algorithm/findBestTime.js";
import { conflict, unauthorized } from "../utils/errors.js";
import { buildTimelineSlots, toIso } from "../utils/time.js";
import { getPlanByTokenOrThrow, verifyOwnerKey } from "./planService.js";
import { planStateCacheKey, stateCache } from "./stateService.js";

const participantIdsForWindow = (windowStart: Date, windowEnd: Date, slotsByParticipant: Map<string, Date[]>) => {
  const required = new Set(buildTimelineSlots(windowStart, windowEnd).map((slot) => slot.toISOString()));
  const participantIds: string[] = [];

  for (const [participantId, slots] of slotsByParticipant.entries()) {
    const slotSet = new Set(slots.map((slot) => slot.toISOString()));
    let allPresent = true;
    for (const req of required) {
      if (!slotSet.has(req)) {
        allPresent = false;
        break;
      }
    }
    if (allPresent) {
      participantIds.push(participantId);
    }
  }

  return participantIds;
};

export const finalizePlan = async (token: string, ownerKey: string) => {
  const plan = await getPlanByTokenOrThrow(token);

  if (!ownerKey || !verifyOwnerKey(plan, ownerKey)) {
    throw unauthorized("Invalid owner key.");
  }

  const participants = await prisma.participant.findMany({
    where: { planId: plan.id },
    include: { availabilitySlots: true },
  });

  const slotsByParticipant = new Map<string, Date[]>();
  for (const participant of participants) {
    slotsByParticipant.set(
      participant.id,
      participant.availabilitySlots.map((slot) => slot.slotTime),
    );
  }

  if (plan.finalizedStart && plan.finalizedEnd && plan.finalizedAt) {
    const participantIds = participantIdsForWindow(plan.finalizedStart, plan.finalizedEnd, slotsByParticipant);
    stateCache.invalidate(planStateCacheKey(token));
    return {
      finalizedStart: toIso(plan.finalizedStart),
      finalizedEnd: toIso(plan.finalizedEnd),
      participantIds,
      count: participantIds.length,
    };
  }

  const best = findBestTime({
    rangeStart: plan.rangeStart,
    rangeEnd: plan.rangeEnd,
    durationMinutes: plan.durationMinutes,
    participants: participants.map((p) => ({ id: p.id })),
    slotsByParticipant,
  });

  if (!best) {
    throw conflict("Cannot finalize because no valid overlap exists.");
  }

  const now = new Date();
  await prisma.plan.update({
    where: { id: plan.id },
    data: {
      finalizedStart: best.startTime,
      finalizedEnd: best.endTime,
      finalizedAt: now,
    },
  });

  stateCache.invalidate(planStateCacheKey(token));

  return {
    finalizedStart: toIso(best.startTime),
    finalizedEnd: toIso(best.endTime),
    participantIds: best.participantIds,
    count: best.count,
  };
};
