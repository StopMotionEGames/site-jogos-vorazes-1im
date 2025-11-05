// createTableUsers.mts
import { pool } from "./bd.mts";

export async function createTables() {
  try {
    // Cria tabela de usuários
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        email VARCHAR(100) UNIQUE NOT NULL,
        password VARCHAR(100) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Cria tabela de posts
    await pool.query(`
      CREATE TABLE IF NOT EXISTS posts (
        id SERIAL PRIMARY KEY,
        user_id INT NOT NULL,
        content TEXT,
        media_url VARCHAR(255),
        media_type VARCHAR(50),
        duration INT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT fk_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      );
    `);

    // Usuário administrador
    await pool.query(
      `INSERT INTO users (name, email, password)
       VALUES ($1, $2, $3)
       ON CONFLICT (email) DO NOTHING;`,
      ["Admin", "admin@email.com", "123456"]
    );

    // Usuário cliente com ID fixo (1125)
    await pool.query(
      `
      INSERT INTO users (id, name, email, password)
      VALUES ($1, $2, $3, $4)
      ON CONFLICT (email) DO NOTHING;
    `,
      [1125, "User", "user@email.com", "654321"]
    );

    // Atualiza a sequência automática para evitar conflito futuro
    await pool.query(`
      SELECT setval(pg_get_serial_sequence('users', 'id'),
      GREATEST((SELECT MAX(id) FROM users), 1));
    `);

    console.log(
      "Tabelas criadas e usuários inseridos (incluindo ID fixo 1125)."
    );
  } catch (error) {
    console.error("Erro criando tabelas:", error);
    throw error;
  }
}
