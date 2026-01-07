import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import bodyParser from "body-parser";
import { connectDB } from "./config/db.js";
import apiRoute from "./routes/index.js";
import { createServer } from "http";
import { setupSocket } from "./socket/quizHandler.js";

dotenv.config();

const app = express();
const httpServer = createServer(app);

app.use(express.json());
app.use(bodyParser.json());
app.use(cors());

connectDB();

const PORT = process.env.PORT || 3000;

app.use("/api", apiRoute);

setupSocket(httpServer);

httpServer.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});