// import { Pool } from "pg";
import { Sequelize } from "sequelize";
import dotenv from "dotenv";

dotenv.config();

// const pool = new Pool({
//     host: process.env.POSTGRES_HOST,
//     port: process.env.POSTGRES_PORT,
//     database: process.env.POSTGRES_NAME,
//     user: process.env.POSTGRES_USER,
//     password: process.env.POSTGRES_PASSWORD,
// });

const sequelize = new Sequelize(process.env.POSTGRES_NAME, process.env.POSTGRES_USER, process.env.POSTGRES_PASSWORD, {
    host: process.env.POSTGRES_HOST,
    port: process.env.POSTGRES_PORT,
    dialect: 'postgres',
    logging: true,
})

const connectDB = async () => {
    // try{
    //     await pool.connect();
    //     console.log("Connected to PostgreSQL database");
    // }catch(error){
    //     console.error("Database connection error:", error);
    // }

    try{
        await sequelize.authenticate();
        console.log("Sequelize connected to PostgreSQL database");
    }catch(error){
        console.error("Sequelize connection error:", error);
    }
}

// export { pool, connectDB };
export { sequelize, connectDB };