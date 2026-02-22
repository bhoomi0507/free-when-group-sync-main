import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import { badRequest } from "./errors.js";

dayjs.extend(utc);

export const SLOT_MINUTES = 15;

export const parseUtcIso = (value: string): Date => {
  const parsed = dayjs(value);
  if (!parsed.isValid()) {
    throw badRequest("Invalid timestamp format.", { value });
  }
  return parsed.utc().toDate();
};

export const isSlotAligned = (date: Date): boolean => {
  const d = dayjs.utc(date);
  return d.second() === 0 && d.millisecond() === 0 && d.minute() % SLOT_MINUTES === 0;
};

export const toIso = (date: Date): string => dayjs.utc(date).toISOString();

export const minutesBetween = (start: Date, end: Date): number =>
  dayjs.utc(end).diff(dayjs.utc(start), "minute");

export const addMinutes = (start: Date, minutes: number): Date =>
  dayjs.utc(start).add(minutes, "minute").toDate();

export const buildTimelineSlots = (rangeStart: Date, rangeEnd: Date): Date[] => {
  const totalMinutes = minutesBetween(rangeStart, rangeEnd);
  if (totalMinutes <= 0) {
    return [];
  }

  const slotCount = Math.floor(totalMinutes / SLOT_MINUTES);
  return Array.from({ length: slotCount }, (_, index) => addMinutes(rangeStart, index * SLOT_MINUTES));
};

export const normalizeToSlotBoundaries = (rangeStart: Date, rangeEnd: Date): { rangeStart: Date; rangeEnd: Date } => {
  const start = dayjs.utc(rangeStart).second(0).millisecond(0);
  const end = dayjs.utc(rangeEnd).second(0).millisecond(0);
  const normalizedStart = start.subtract(start.minute() % SLOT_MINUTES, "minute");
  const endRemainder = end.minute() % SLOT_MINUTES;
  const normalizedEnd = endRemainder === 0 ? end : end.add(SLOT_MINUTES - endRemainder, "minute");

  return {
    rangeStart: normalizedStart.toDate(),
    rangeEnd: normalizedEnd.toDate(),
  };
};

export const buildUtcRangeFromDateAndTime = (input: {
  dateStart: string;
  dateEnd: string;
  timeStart: string;
  timeEnd: string;
}): { rangeStart: Date; rangeEnd: Date } => {
  const start = dayjs.utc(`${input.dateStart}T${input.timeStart}:00Z`);
  const end = dayjs.utc(`${input.dateEnd}T${input.timeEnd}:00Z`);

  if (!start.isValid() || !end.isValid()) {
    throw badRequest("Invalid date/time input.");
  }

  const normalized = normalizeToSlotBoundaries(start.toDate(), end.toDate());

  if (minutesBetween(normalized.rangeStart, normalized.rangeEnd) <= 0) {
    throw badRequest("Time range must be greater than zero.");
  }

  return normalized;
};
