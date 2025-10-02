import {pool} from "./bd";
async function main() {
    try {
 await pool.query(`
 CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(100) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
 `);
 await pool.query(`INSERT INTO users (name, email, password) VALUES
 ('Admin', '
 console.log("Tabla 'users' creada o ya existente.");
 const result = await pool.query('SELECT * FROM users');
    } catch (error) {
        console.error("Error creando la tabla 'users':", error);
    }
}