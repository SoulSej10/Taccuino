import "dotenv/config";
import express from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import { errorHandler } from "./middleware/errorHandler.js";
import noteRoutes from "./routes/notes.js";
import notebookRoutes from "./routes/notebooks.js";
import tagRoutes from "./routes/tags.js";
import settingsRoutes from "./routes/settings.js";
import searchRoutes from "./routes/search.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/notes", noteRoutes);
app.use("/api/notebooks", notebookRoutes);
app.use("/api/tags", tagRoutes);
app.use("/api/settings", settingsRoutes);
app.use("/api/search", searchRoutes);

if (process.env.NODE_ENV === "production") {
  app.use(express.static(path.join(__dirname, "../dist")));
  app.get("/{*path}", (_req, res) => {
    res.sendFile(path.join(__dirname, "../dist/index.html"));
  });
}

app.use(errorHandler);

export default app;
