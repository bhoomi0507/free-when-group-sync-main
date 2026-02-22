import { prisma } from "../db/prisma.js";
import { badRequest } from "../utils/errors.js";
import { isSlotAligned, minutesBetween, parseUtcIso } from "../utils/time.js";
import { planStateCacheKey, requireParticipantOnPlan, stateCache } from "./stateService.js";

export const replaceAvailability = async (token: string, participantId: string, timestamps: string[]) => {
  const { plan, participant } = await requireParticipantOnPlan(token, participantId);

  const totalSlotsInRange = Math.floor(minutesBetween(plan.rangeStart, plan.rangeEnd) / 15);
  if (timestamps.length > totalSlotsInRange) {
    throw badRequest("Too many timestamps for this plan range.");
  }

  const uniqueDates = new Map<string, Date>();
  for (const ts of timestamps) {
    const parsed = parseUtcIso(ts);
    if (!isSlotAligned(parsed)) {
      throw badRequest("Each timestamp must align to a 15-minute slot.");
    }
    if (parsed < plan.rangeStart || parsed >= plan.rangeEnd) {
      throw badRequest("Timestamp is outside plan range.", { timestamp: ts });
    }
    uniqueDates.set(parsed.toISOString(), parsed);
  }

  const deduped = [...uniqueDates.values()];
  await prisma.$transaction(async (tx) => {
    await tx.availabilitySlot.deleteMany({
      where: { participantId: participant.id },
    });

    if (deduped.length > 0) {
      await tx.availabilitySlot.createMany({
        data: deduped.map((slotTime) => ({
          participantId: participant.id,
          slotTime,
        })),
        skipDuplicates: true,
      });
    }

    await tx.participant.update({
      where: { id: participant.id },
      data: { lastActiveAt: new Date() },
    });
  });

  stateCache.invalidate(planStateCacheKey(token));
  return { savedCount: deduped.length };
};
