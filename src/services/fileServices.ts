import fs from "fs";
import path from "path";
import csv from "csv-parser";
import { prisma } from "../db/prisma";

type csvRow = {
  id: string;
  name: string;
  age: string;
  education: string;
};

type InputRow = {
  id: string;
  name: string;
  age: number;
  education: string;
};

const MAX_SIZE = 5 * 1024 * 1024; // 5MB
const UPLOAD_DIR = path.join(process.cwd(), "uploads");
const batchSize = 250;

const timestamp = Date.now();

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
  async prcessFile(filePath: string) {
    const batch: InputRow[] = [];
    const skipped: { row: InputRow; reason: string }[] = [];
    const insertedIds: string[] = [];

    const timestamp = Date.now();
    const logFile = path.join("logs", `skipped-${timestamp}.log`);

    await fs.promises.mkdir("logs", { recursive: true });

    return new Promise<{
      insertedCount: number;
      skippedCount: number;
      insertedIds: string[];
      logFile: string | null;
    }>((resolve, reject) => {
      const stream = fs
        .createReadStream(filePath)
        .pipe(csv(["id", "name", "age", "education"]));

      stream.on("data", (row: csvRow) => {
        const age = Number(row.age);

        if (
          !row.id ||
          !row.name ||
          Number.isNaN(age) ||
          age <= 0 ||
          !row.education
        ) {
          skipped.push({
            row: {
              id: row.id ?? "",
              name: row.name ?? "",
              age: age || 0,
              education: row.education ?? "",
            },
            reason: "validation failed",
          });
          return;
        }

        batch.push({
          id: row.id,
          name: row.name,
          age,
          education: row.education,
        });

        if (batch.length === batchSize) {
          stream.pause();
          processBatch(batch.splice(0), skipped, insertedIds)
            .then(() => stream.resume())
            .catch(reject);
        }
      });

      stream.on("end", async () => {
        try {
          if (batch.length > 0) {
            await processBatch(batch.splice(0), skipped, insertedIds);
          }

          if (skipped.length > 0) {
            const logContents = skipped
              .map((s) => JSON.stringify(s.row) + ` | reason=${s.reason}`)
              .join("\n");

            await fs.promises.writeFile(logFile, logContents, "utf8");
          }

          resolve({
            insertedCount: insertedIds.length,
            skippedCount: skipped.length,
            insertedIds,
            logFile: skipped.length ? logFile : null,
          });
        } catch (err) {
          reject(err);
        }
      });

      stream.on("error", reject);
    });
  },
};

export default fileServices;

async function processBatch(
  rows: InputRow[],
  skipped: { row: InputRow; reason: string }[],
  insertedIds: string[]
) {
  try {
    const created = await prisma.user.createManyAndReturn({
      data: rows,
      skipDuplicates: true,
    });

    created.forEach((u) => insertedIds.push(u.id));

    const createdIdSet = new Set(created.map((u) => u.id));
    rows.forEach((r) => {
      if (!createdIdSet.has(r.id)) {
        skipped.push({ row: r, reason: "duplicate/conflict" });
      }
    });
  } catch {
    rows.forEach((r) => skipped.push({ row: r, reason: "DB error" }));
  }
}
