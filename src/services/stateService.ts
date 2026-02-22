import { prisma } from "../db/prisma.js";
import { findBestTime, BestTimeResult } from "../algorithm/findBestTime.js";
import { addMinutes, buildTimelineSlots, SLOT_MINUTES, toIso } from "../utils/time.js";
import { InMemoryTtlCache } from "../utils/cache.js";
import { getPlanByTokenOrThrow } from "./planService.js";
import { notFound } from "../utils/errors.js";

export type PlanStateResponse = {
  plan: {
    title: string;
    durationMinutes: number;
    rangeStart: string;
    rangeEnd: string;
    finalizedStart: string | null;
    finalizedEnd: string | null;
    finalizedAt: string | null;
  };
  participants: Array<{
    id: string;
    name: string;
    joinedAt: string;
    lastActiveAt: string;
    responded: boolean;
  }>;
  responseCount: number;
  totalParticipants: number;
  bestTime: {
    startTime: string;
    endTime: string;
    participantIds: string[];
    count: number;
  } | null;
  heatmapData: Array<{ slotTime: string; count: number }>;
  isOwner: boolean;
};

export const planStateCacheKey = (token: string): string => `plan-state:${token}`;
type CachedPlanState = Omit<PlanStateResponse, "isOwner"> & { ownerName: string };
export const stateCache = new InMemoryTtlCache<CachedPlanState>(3000);

const serializeBestTime = (result: BestTimeResult | null): PlanStateResponse["bestTime"] => {
  if (!result) {
    return null;
  }
  return {
    startTime: toIso(result.startTime),
    endTime: toIso(result.endTime),
    participantIds: result.participantIds,
    count: result.count,
  };
};

const getParticipantIdsForWindow = (
  windowStart: Date,
  windowEnd: Date,
  participantIds: string[],
  slotsByParticipant: Map<string, Date[]>,
) => {
  const requiredSlots = buildTimelineSlots(windowStart, windowEnd);
  const requiredKeySet = new Set(requiredSlots.map((slot) => slot.toISOString()));
  const fullyAvailableIds: string[] = [];

  for (const participantId of participantIds) {
    const slotSet = new Set((slotsByParticipant.get(participantId) ?? []).map((slot) => slot.toISOString()));
    let canMakeIt = true;
    for (const required of requiredKeySet) {
      if (!slotSet.has(required)) {
        canMakeIt = false;
        break;
      }
    }
    if (canMakeIt) {
      fullyAvailableIds.push(participantId);
    }
  }

  return fullyAvailableIds;
};

export const computeState = async (token: string, viewerName?: string): Promise<PlanStateResponse> => {
  const cached = stateCache.get(planStateCacheKey(token));
  if (cached) {
    const { ownerName, ...cachedState } = cached;
    return {
      ...cachedState,
      isOwner: Boolean(viewerName && viewerName === ownerName),
    };
  }

  const plan = await getPlanByTokenOrThrow(token);
  const participants = await prisma.participant.findMany({
    where: { planId: plan.id },
    orderBy: { joinedAt: "asc" },
    include: { availabilitySlots: true },
  });

  const slotsByParticipant = new Map<string, Date[]>();
  for (const participant of participants) {
    slotsByParticipant.set(
      participant.id,
      participant.availabilitySlots.map((slot) => slot.slotTime),
    );
  }

  const timeline = buildTimelineSlots(plan.rangeStart, plan.rangeEnd);
  const heatCounts = new Array<number>(timeline.length).fill(0);
  const slotIndex = new Map(timeline.map((slot, index) => [slot.toISOString(), index]));

  for (const participant of participants) {
    for (const slot of participant.availabilitySlots) {
      const idx = slotIndex.get(slot.slotTime.toISOString());
      if (idx !== undefined) {
        heatCounts[idx] += 1;
      }
    }
  }

  const heatmapData = timeline.map((slot, index) => ({
    slotTime: toIso(slot),
    count: heatCounts[index],
  }));

  const responseCount = participants.filter((p) => p.availabilitySlots.length > 0).length;
  const totalParticipants = participants.length;
  const participantSummaries = participants.map((p) => ({
    id: p.id,
    name: p.name,
    joinedAt: toIso(p.joinedAt),
    lastActiveAt: toIso(p.lastActiveAt),
    responded: p.availabilitySlots.length > 0,
  }));

  let best: BestTimeResult | null = null;
  if (plan.finalizedStart && plan.finalizedEnd) {
    const ids = getParticipantIdsForWindow(
      plan.finalizedStart,
      plan.finalizedEnd,
      participants.map((p) => p.id),
      slotsByParticipant,
    );
    best = {
      startTime: plan.finalizedStart,
      endTime: plan.finalizedEnd,
      participantIds: ids,
      count: ids.length,
    };
  } else {
    best = findBestTime({
      rangeStart: plan.rangeStart,
      rangeEnd: plan.rangeEnd,
      durationMinutes: plan.durationMinutes,
      participants: participants.map((p) => ({ id: p.id })),
      slotsByParticipant,
    });
  }

  const payload: CachedPlanState = {
    ownerName: plan.ownerName,
    plan: {
      title: plan.title,
      durationMinutes: plan.durationMinutes,
      rangeStart: toIso(plan.rangeStart),
      rangeEnd: toIso(plan.rangeEnd),
      finalizedStart: plan.finalizedStart ? toIso(plan.finalizedStart) : null,
      finalizedEnd: plan.finalizedEnd ? toIso(plan.finalizedEnd) : null,
      finalizedAt: plan.finalizedAt ? toIso(plan.finalizedAt) : null,
    },
    participants: participantSummaries,
    responseCount,
    totalParticipants,
    bestTime: serializeBestTime(best),
    heatmapData,
  };

  stateCache.set(planStateCacheKey(token), payload);
  const { ownerName: _ownerName, ...responsePayload } = payload;
  return {
    ...responsePayload,
    isOwner: Boolean(viewerName && viewerName === plan.ownerName),
  };
};

export const requireParticipantOnPlan = async (token: string, participantId: string) => {
  const plan = await getPlanByTokenOrThrow(token);
  const participant = await prisma.participant.findFirst({
    where: {
      id: participantId,
      planId: plan.id,
    },
  });

  if (!participant) {
    throw notFound("Participant not found in this plan.");
  }

  return { plan, participant };
};

export const isTimeAlignedToSlot = (date: Date): boolean =>
  date.getUTCSeconds() === 0 &&
  date.getUTCMilliseconds() === 0 &&
  date.getUTCMinutes() % SLOT_MINUTES === 0;

export const getWindowEndByDuration = (start: Date, durationMinutes: number) => addMinutes(start, durationMinutes);
