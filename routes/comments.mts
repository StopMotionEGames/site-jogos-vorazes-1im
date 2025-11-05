import {type FastifyInstance } from "fastify";
import { pool } from "../bd_postgres/bd.mts";

export default async function commentsRoutes(app: FastifyInstance) {
  // 🟢 Rota para adicionar um comentário a um post
  app.post("/comments", async (request, reply) => {
    const { postId, userId, comment } = request.body as {
      postId: number;
      userId: number;
      comment: string;
    };

    try {
      await pool.query(
        `INSERT INTO comments (post_id, user_id, comment)
         VALUES ($1, $2, $3)`,
        [postId, userId, comment]
      );
      return reply.send({ message: "✅ Comentário adicionado com sucesso." });
    } catch (error) {
      console.error("❌ Erro ao adicionar comentário:", error);
      return reply.status(500).send({ error: "Erro ao adicionar comentário." });
    }
  });

  // 🟡 Rota para obter comentários de um post
  app.get("/comments/:postId", async (request, reply) => {
    const { postId } = request.params as { postId: string };

    try {
      const result = await pool.query(
        `SELECT c.id, c.comment, c.created_at, u.name AS user_name
         FROM comments c
         JOIN users u ON c.user_id = u.id
         WHERE c.post_id = $1
         ORDER BY c.created_at DESC`,
        [postId]
      );
      return reply.send(result.rows);
    } catch (error) {
      console.error("❌ Erro ao obter comentários:", error);
      return reply.status(500).send({ error: "Erro ao obter comentários." });
    }
  });

  // 🔴 Rota para deletar um comentário
  app.delete("/comments/:commentId", async (request, reply) => {
    const { commentId } = request.params as { commentId: string };

    try {
      await pool.query("DELETE FROM comments WHERE id = $1", [commentId]);
      return reply.send({ message: "🗑️ Comentário deletado com sucesso." });
    } catch (error) {
      console.error("❌ Erro ao deletar comentário:", error);
      return reply.status(500).send({ error: "Erro ao deletar comentário." });
    }
  });
}
