import { Pool } from "pg";
import dotenv from "dotenv";

dotenv.config();

const pool = new Pool({
    host: process.env.POSTGRES_HOST,
    port: process.env.POSTGRES_PORT,
    database: process.env.POSTGRES_NAME,
    user: process.env.POSTGRES_USER,
    password: process.env.POSTGRES_PASSWORD,
});

const connectDB = async () => {
    try{
        await pool.connect();
        console.log("Connected to PostgreSQL database");
    }catch(error){
        console.error("Database connection error:", error);
    }
}

export { pool, connectDB };