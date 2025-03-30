import mysql from "mysql2";

const pool = mysql.createPool({
    host: "localhost",
    user: "root",
    password: "idonotknown",
    database: "frozeneveryday",
    namedPlaceholders: true,
    waitForConnections: true,
    connectionLimit: 10, // Set a reasonable limit
    queueLimit: 0,
    connectTimeout: 10000, // 10 seconds timeout
}).promise();

// Test the connection (optional)
pool.getConnection()
    .then((conn) => {
        console.log("Connected to MySQL!");
        conn.release(); // Release the connection back to the pool
    })
    .catch((err) => {
        console.error("Error connecting to MySQL:", err);
    });

export default pool;
