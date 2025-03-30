import mysql from "mysql2";
import dotenv from "dotenv";

dotenv.config();

const pool = mysql.createPool({
    host: process.env.MYSQLHOST,
    user: process.env.MYSQLUSER,
    password: process.env.MYSQLPASSWORD,
    database: process.env.MYSQLDATABASE,
    port: process.env.MYSQLPORT, // Railway might use a custom port
    namedPlaceholders: true,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    connectTimeout: 10000, // 10 seconds timeout
}).promise();

// Test the connection (optional)
pool.getConnection()
    .then((conn) => {
        console.log("Connected to MySQL!");
        conn.release();
    })
    .catch((err) => {
        console.error("Error connecting to MySQL:", err);
    });

export default pool;
