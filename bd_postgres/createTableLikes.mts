import { pool } from "./bd.mts";
export async function createTableLikes() {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS likes (
        id SERIAL PRIMARY KEY,
        post_id INT NOT NULL,
        user_id INT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT fk_post FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE,
        CONSTRAINT fk_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        UNIQUE (post_id, user_id)
      );
    `);
    console.log("✅ Tabela 'likes' criada ou já existe.");
  } catch (error) {
    console.error("❌ Erro ao criar tabela 'likes':", error);
    throw error;
  }
}
