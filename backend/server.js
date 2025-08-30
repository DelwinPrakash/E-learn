import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import bodyParser from "body-parser";
import connectDB from "./config/db.js";
import authRoute from "./routes/authRoute.js";

dotenv.config();

const app = express();

app.use(express.json());
app.use(bodyParser.json());
app.use(cors());

connectDB();

const PORT = process.env.POSTGRES_PORT || 5000;

app.post("/api/auth", authRoute);

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});