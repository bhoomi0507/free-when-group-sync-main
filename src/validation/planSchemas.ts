import { z } from "zod";

export const tokenParamSchema = z.object({
  token: z.string().regex(/^[A-Za-z0-9]{8}$/, "Invalid token format."),
});

const shortText = (field: string) =>
  z.string().trim().min(1, `${field} is required.`).max(100, `${field} is too long.`);

export const createPlanSchema = z.object({
  title: shortText("title"),
  ownerName: shortText("ownerName"),
  dateStart: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "dateStart must be YYYY-MM-DD."),
  dateEnd: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "dateEnd must be YYYY-MM-DD."),
  timeStart: z.string().regex(/^\d{2}:\d{2}$/, "timeStart must be HH:mm."),
  timeEnd: z.string().regex(/^\d{2}:\d{2}$/, "timeEnd must be HH:mm."),
  durationMinutes: z.number().int().positive().multipleOf(15),
});

export const joinPlanSchema = z.object({
  name: shortText("name"),
});

export const submitAvailabilitySchema = z.object({
  participantId: z.string().uuid("participantId must be a valid UUID."),
  timestamps: z.array(z.string().datetime({ offset: true })).max(4000),
});

export const stateQuerySchema = z.object({
  viewerName: z.string().trim().min(1).max(100).optional(),
});
