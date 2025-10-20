import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import bodyParser from "body-parser";
import { connectDB } from "./config/db.js";
import apiRoute from "./routes/index.js";

dotenv.config();

const app = express();

app.use(express.json());
app.use(bodyParser.json());
app.use(cors());

connectDB();

const PORT = process.env.PORT || 3000;

app.use("/api", apiRoute);

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});