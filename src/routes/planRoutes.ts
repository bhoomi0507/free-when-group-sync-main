import { Router } from "express";
import {
  createPlanController,
  finalizePlanController,
  getPlanStateController,
  joinPlanController,
  submitAvailabilityController,
} from "../controllers/planController.js";

export const planRoutes = Router();

planRoutes.post("/", createPlanController);
planRoutes.post("/:token/join", joinPlanController);
planRoutes.post("/:token/availability", submitAvailabilityController);
planRoutes.get("/:token/state", getPlanStateController);
planRoutes.post("/:token/finalize", finalizePlanController);
