const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const bodyParser = require("body-parser");
const connectDB = require("./config/db");

dotenv.config();

const app = express();

app.use(express.json());
app.use(bodyParser.json());
app.use(cors());

connectDB();

const PORT = process.env.POSTGRES_PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});