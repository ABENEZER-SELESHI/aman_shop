import { Router } from "express";
import { health } from "../../controllers/health.controller.js";
import { authRouter } from "./auth.routes.js";
import { ordersRouter } from "./orders.routes.js";

export const v1Router = Router();

v1Router.get("/health", health);
v1Router.use("/orders", ordersRouter);
v1Router.use("/auth", authRouter);
