import { Router } from "express";
import dataController from "../controllers/dataController";

const router = Router();

router.get("/", dataController.getData);



export default router;
