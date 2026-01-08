import { Router } from "express";
import multer from "multer";
import fileController from "../controllers/fileContoller";

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024, // extra safety; 5MB
  },
});

const router = Router();
router.post("/upload", upload.single("file"), fileController.uploadFiles);
router.post("/process-file", fileController.processFile);

export default router;
