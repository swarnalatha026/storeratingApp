const bcrypt = require("bcryptjs");
const mysql = require("mysql2");
const dotenv = require("dotenv");

dotenv.config();

// Create MySQL Connection
const connection = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME,
    port: 3306
});



const adminPassword = "Qwerty";

bcrypt.hash(adminPassword, 10, (err, hashedPassword) => {
  if (err) {
    console.error("Error hashing password:", err);
    return;
  }

  const sql = `INSERT INTO users (id, name, email, password, role, address) VALUES (?, ?, ?, ?, ?, ?)`;
  const values = [
    "admin",
    "Administrator Account",
    "admin@example.com",
    hashedPassword,
    "admin",
    "123 Baker Street, London",
  ];

  connection.query(sql, values, (error, results) => {
    if (error) {
      console.error("Error inserting admin user:", error);
    } else {
      console.log("Admin user inserted successfully.");
    }
    connection.end();
  });
});
