import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import bodyParser from "body-parser";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";
import "./models/index.js";
import apiRoute from "./routes/index.js";
import { connectDB, sequelize } from "./config/db.js";
import { createServer } from "http";
import { setupSocket } from "./socket/quizHandler.js";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Ensure upload directories exist on startup
fs.mkdirSync(path.join(__dirname, "uploads/notes"), { recursive: true });

const app = express();
const httpServer = createServer(app);

app.use(express.json());
app.use(bodyParser.json());
app.use(cors());

// Serve uploaded files statically
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

connectDB().then(() => {
    sequelize.sync({ alter: true })
        .then(() => console.log("Database & tables synced"))
        .catch(err => console.error("Error syncing database:", err));
});

const PORT = process.env.PORT || 3000;

app.use("/api", apiRoute);

setupSocket(httpServer);

httpServer.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});