import express from "express";
import fileRoutes from "./routes/fileRoutes";
const app = express();

const time = Date.now();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/files", fileRoutes);
// app.use("/data");
app.use("/", (_req, res) => {
  return res.status(200).json({
    message: "Server is Running",
    uptime: Math.floor((Date.now() - time) / 1000),
  });
});
export default app;
