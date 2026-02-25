// import { Pool } from "pg";
import { Sequelize } from "sequelize";
import dotenv from "dotenv";

dotenv.config();

// const pool = new Pool({
//     host: process.env.DBHOST,
//     port: process.env.DBPORT,
//     database: process.env.DBNAME,
//     user: process.env.DBUSER,
//     password: process.env.DBPASSWORD,
// });

const sequelize = new Sequelize(process.env.DB_NAME, process.env.DB_USER, process.env.DB_PASSWORD, {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
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