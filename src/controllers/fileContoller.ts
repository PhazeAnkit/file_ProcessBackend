import { Request, Response } from "express";
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
};

export default fileController;
