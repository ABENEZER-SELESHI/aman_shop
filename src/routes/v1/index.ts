import { Router } from "express";
import { health, live, ready } from "../../controllers/health.controller.js";
import { asyncHandler } from "../../utils/asyncHandler.js";
import { authRouter } from "./auth.routes.js";
import { ordersRouter } from "./orders.routes.js";
import { productsRouter, sellerProductsRouter } from "./products.routes.js";
import { studioRouter } from "./studio.routes.js";
import { uploadsRouter } from "./uploads.routes.js";
import { categoriesRouter, sellerCategoriesRouter } from "./categories.routes.js";

export const v1Router = Router();

v1Router.get("/health", health);
v1Router.get("/live", live);
v1Router.get("/ready", asyncHandler(ready));
v1Router.use("/categories", categoriesRouter);
v1Router.use("/products", productsRouter);
v1Router.use("/seller/products", sellerProductsRouter);
v1Router.use("/seller/categories", sellerCategoriesRouter);
v1Router.use("/seller/uploads", uploadsRouter);
v1Router.use("/studio", studioRouter);
v1Router.use("/orders", ordersRouter);
v1Router.use("/auth", authRouter);
