import { Router, type IRouter } from "express";
import healthRouter from "./health";
import opportunitiesRouter from "./opportunities";
import adminRouter from "./admin";

const router: IRouter = Router();

router.use(healthRouter);
router.use(opportunitiesRouter);
router.use(adminRouter);

export default router;
