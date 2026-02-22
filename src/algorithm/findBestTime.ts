import { addMinutes, buildTimelineSlots, minutesBetween, SLOT_MINUTES } from "../utils/time.js";
import { badRequest } from "../utils/errors.js";

type FindBestTimeInput = {
  rangeStart: Date;
  rangeEnd: Date;
  durationMinutes: number;
  participants: Array<{ id: string }>;
  slotsByParticipant: Map<string, Date[]>;
};

export type BestTimeResult = {
  startTime: Date;
  endTime: Date;
  participantIds: string[];
  count: number;
};

const toSlotKey = (date: Date): string => date.toISOString();

export const findBestTime = (input: FindBestTimeInput): BestTimeResult | null => {
  if (input.durationMinutes % SLOT_MINUTES !== 0) {
    throw badRequest("durationMinutes must be a multiple of 15.");
  }

  const timeline = buildTimelineSlots(input.rangeStart, input.rangeEnd);
  const totalWindowMinutes = minutesBetween(input.rangeStart, input.rangeEnd);
  if (input.durationMinutes > totalWindowMinutes) {
    return null;
  }

  const windowSlots = input.durationMinutes / SLOT_MINUTES;
  if (windowSlots <= 0 || timeline.length === 0 || windowSlots > timeline.length) {
    return null;
  }

  const slotIndex = new Map<string, number>();
  timeline.forEach((slot, index) => slotIndex.set(toSlotKey(slot), index));

  const prefixByParticipant = new Map<string, number[]>();
  for (const participant of input.participants) {
    const availability = new Array<number>(timeline.length).fill(0);
    const slots = input.slotsByParticipant.get(participant.id) ?? [];
    for (const slot of slots) {
      const idx = slotIndex.get(toSlotKey(slot));
      if (idx !== undefined) {
        availability[idx] = 1;
      }
    }

    const prefix = new Array<number>(timeline.length + 1).fill(0);
    for (let i = 0; i < timeline.length; i += 1) {
      prefix[i + 1] = prefix[i] + availability[i];
    }
    prefixByParticipant.set(participant.id, prefix);
  }

  let bestStartIndex = -1;
  let bestCount = 0;
  let bestParticipantIds: string[] = [];

  for (let startIndex = 0; startIndex <= timeline.length - windowSlots; startIndex += 1) {
    const endIndexExclusive = startIndex + windowSlots;
    const participantIds: string[] = [];

    for (const participant of input.participants) {
      const prefix = prefixByParticipant.get(participant.id)!;
      const availableSlots = prefix[endIndexExclusive] - prefix[startIndex];
      if (availableSlots === windowSlots) {
        participantIds.push(participant.id);
      }
    }

    if (participantIds.length > bestCount) {
      bestCount = participantIds.length;
      bestStartIndex = startIndex;
      bestParticipantIds = participantIds;
    }
  }

  if (bestCount === 0 || bestStartIndex < 0) {
    return null;
  }

  const startTime = timeline[bestStartIndex];
  return {
    startTime,
    endTime: addMinutes(startTime, input.durationMinutes),
    participantIds: bestParticipantIds,
    count: bestCount,
  };
};
