import crypto from "node:crypto";
import { Plan } from "@prisma/client";
import { prisma } from "../db/prisma.js";
import { generateOwnerKey, generatePlanToken } from "../utils/token.js";
import { buildUtcRangeFromDateAndTime, minutesBetween } from "../utils/time.js";
import { badRequest, notFound } from "../utils/errors.js";

export type CreatePlanInput = {
  title: string;
  ownerName: string;
  dateStart: string;
  dateEnd: string;
  timeStart: string;
  timeEnd: string;
  durationMinutes: number;
};

const hashOwnerKey = (ownerKey: string): string => {
  const salt = process.env.OWNER_KEY_SALT;
  if (!salt) {
    throw new Error("OWNER_KEY_SALT is required.");
  }
  return crypto.createHash("sha256").update(`${salt}:${ownerKey}`).digest("hex");
};

const createUniqueToken = async (): Promise<string> => {
  for (let attempt = 0; attempt < 10; attempt += 1) {
    const token = generatePlanToken();
    const existing = await prisma.plan.findUnique({ where: { token }, select: { id: true } });
    if (!existing) {
      return token;
    }
  }
  throw new Error("Unable to generate unique plan token.");
};

export const createPlan = async (input: CreatePlanInput) => {
  const { rangeStart, rangeEnd } = buildUtcRangeFromDateAndTime(input);
  const rangeMinutes = minutesBetween(rangeStart, rangeEnd);

  if (input.durationMinutes > rangeMinutes) {
    throw badRequest("durationMinutes cannot be longer than the available range.");
  }

  const token = await createUniqueToken();
  const ownerKey = generateOwnerKey();
  const ownerKeyHash = hashOwnerKey(ownerKey);

  const plan = await prisma.plan.create({
    data: {
      title: input.title.trim(),
      ownerName: input.ownerName.trim(),
      ownerKeyHash,
      token,
      durationMinutes: input.durationMinutes,
      rangeStart,
      rangeEnd,
    },
  });

  const baseUrl = process.env.APP_BASE_URL ?? "http://localhost:4000";
  return {
    plan,
    token,
    ownerKey,
    shareUrl: `${baseUrl}/p/${token}`,
  };
};

export const getPlanByTokenOrThrow = async (token: string): Promise<Plan> => {
  const plan = await prisma.plan.findUnique({ where: { token } });
  if (!plan) {
    throw notFound("Plan not found.");
  }
  return plan;
};

export const verifyOwnerKey = (plan: Plan, ownerKey: string): boolean => {
  if (!ownerKey) {
    return false;
  }
  const hash = hashOwnerKey(ownerKey);
  return crypto.timingSafeEqual(Buffer.from(plan.ownerKeyHash), Buffer.from(hash));
};
