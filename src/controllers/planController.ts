import { Request, Response, NextFunction } from "express";
import { ZodError } from "zod";
import {
  createPlanSchema,
  joinPlanSchema,
  stateQuerySchema,
  submitAvailabilitySchema,
  tokenParamSchema,
} from "../validation/planSchemas.js";
import { createPlan } from "../services/planService.js";
import { joinPlan } from "../services/participantService.js";
import { replaceAvailability } from "../services/availabilityService.js";
import { computeState } from "../services/stateService.js";
import { finalizePlan } from "../services/finalizeService.js";
import { AppError } from "../utils/errors.js";

const parseOrThrow = <T>(fn: () => T): T => {
  try {
    return fn();
  } catch (error) {
    if (error instanceof ZodError) {
      throw new AppError(400, "VALIDATION_ERROR", "Invalid request payload.", error.flatten());
    }
    throw error;
  }
};

export const createPlanController = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const body = parseOrThrow(() => createPlanSchema.parse(req.body));
    const result = await createPlan(body);

    res.status(201).json({
      planId: result.plan.id,
      token: result.token,
      shareUrl: result.shareUrl,
      ownerKey: result.ownerKey,
    });
  } catch (error) {
    next(error);
  }
};

export const joinPlanController = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { token } = parseOrThrow(() => tokenParamSchema.parse(req.params));
    const body = parseOrThrow(() => joinPlanSchema.parse(req.body));
    const result = await joinPlan(token, body.name);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

export const submitAvailabilityController = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { token } = parseOrThrow(() => tokenParamSchema.parse(req.params));
    const body = parseOrThrow(() => submitAvailabilitySchema.parse(req.body));
    const result = await replaceAvailability(token, body.participantId, body.timestamps);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

export const getPlanStateController = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { token } = parseOrThrow(() => tokenParamSchema.parse(req.params));
    const query = parseOrThrow(() => stateQuerySchema.parse(req.query));
    const state = await computeState(token, query.viewerName);
    res.status(200).json(state);
  } catch (error) {
    next(error);
  }
};

export const finalizePlanController = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { token } = parseOrThrow(() => tokenParamSchema.parse(req.params));
    const ownerKeyHeader = req.header("x-owner-key") ?? "";
    const result = await finalizePlan(token, ownerKeyHeader);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};
