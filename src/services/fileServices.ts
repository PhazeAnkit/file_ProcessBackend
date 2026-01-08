import fs from "fs";
import path from "path";

const MAX_SIZE = 5 * 1024 * 1024; // 5MB
const UPLOAD_DIR = path.join(process.cwd(), "uploads");

const ALLOWED_EXT = [".csv", ".xls", ".xlsx"];

const fileServices = {
  async uploadFiles(file: Express.Multer.File) {
    try {
      if (file.size > MAX_SIZE) {
        throw new Error("File exceeds 5MB limit");
      }

      const ext = path.extname(file.originalname).toLowerCase();
      if (!ALLOWED_EXT.includes(ext)) {
        throw new Error("Invalid file type. Only CSV/XLS/XLSX allowed");
      }

      const filePath = path.join(UPLOAD_DIR, file.originalname);
      fs.writeFileSync(filePath, file.buffer);

      return filePath;
    } catch (err: any) {
      throw new Error(`Failed to save file: ${err.message}`);
    }
  },
};

export default fileServices;
