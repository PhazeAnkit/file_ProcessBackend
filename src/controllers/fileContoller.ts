import { Request, Response } from "express";
import fs from "fs";
import fileServices from "../services/fileServices";

const fileController = {
  async uploadFiles(req: Request, res: Response) {
    try {
      const file = req.file;

      if (!file) {
        return res.status(413).json({ error: "No file uploaded" });
      }

      const savedPath = await fileServices.uploadFiles(file);

      res.status(200).json({
        message: "Upload successful",
        file: file.originalname,
        path: savedPath,
      });
    } catch (err: any) {
      res.status(413).json({ error: err.message });
    }
  },
  async processFile(req: Request, res: Response) {
    try {
      const { path } = req.body;

      if (!path || typeof path !== "string") {
        return res.status(400).json({ error: "File path is required" });
      }

      if (!fs.existsSync(path)) {
        return res
          .status(404)
          .json({ error: "File does not exist at given path" });
      }

      if (!path.match(/\.(csv|xls|xlsx)$/i)) {
        return res
          .status(400)
          .json({ error: "Invalid file type. Only CSV/XLS/XLSX allowed." });
      }

      const result = await fileServices.prcessFile(path);

      return res.status(200).json({
        message: "File imported successfully",
        insertedCount: result.insertedCount,
        skippedCount: result.skippedCount,
        logFile: result.logFile,
      });
    } catch (err: any) {
      return res
        .status(500)
        .json({ error: err.message || "Failed to process file" });
    }
  },
};

export default fileController;
