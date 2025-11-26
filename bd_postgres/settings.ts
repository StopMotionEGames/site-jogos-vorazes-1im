import { pool } from "./bd.mts";

export async function createTableUserSettings() {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS user_settings (
        id SERIAL PRIMARY KEY,
        user_id INT NOT NULL UNIQUE,
        theme VARCHAR(10) NOT NULL DEFAULT 'light',
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT fk_user_settings FOREIGN KEY (user_id)
          REFERENCES users(id) ON DELETE CASCADE
      );
    `);

    console.log("✅ Tabela user_settings criada ou já existe.");
  } catch (error) {
    console.error("❌ Erro criando tabela user_settings:", error);
    throw error;
  }
}
