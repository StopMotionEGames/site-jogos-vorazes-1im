import { type FastifyInstance } from "fastify";
import { pool } from "../bd_postgres/bd.mts";

export default async function likesRoutes(app: FastifyInstance) {
  // 🟢 Rota para curtir ou descurtir um post
  app.post("/likes", async (request, reply) => {
    const { postId, userId, like } = request.body as {
      postId: number;
      userId: number;
      like: boolean;
    };

    try {
      if (like) {
        await pool.query(
          `INSERT INTO likes (post_id, user_id)
           VALUES ($1, $2)
           ON CONFLICT DO NOTHING`,
          [postId, userId]
        );
        return reply.send({ message: "❤️ Post curtido com sucesso." });
      } else {
        await pool.query(
          `DELETE FROM likes WHERE post_id = $1 AND user_id = $2`,
          [postId, userId]
        );
        return reply.send({ message: "👍 Curtida removida com sucesso." });
      }
    } catch (error) {
      console.error("❌ Erro ao processar curtida:", error);
      return reply.status(500).send({ error: "Erro ao processar curtida." });
    }
  });

  // 🟡 Rota para obter o número de curtidas de um post
  app.get("/likes/:postId", async (request, reply) => {
    const { postId } = request.params as { postId: string };
    try {
      const result = await pool.query(
        `SELECT COUNT(*) AS like_count FROM likes WHERE post_id = $1`,
        [postId]
      );
      const likeCount = parseInt(result.rows[0].like_count, 10);
      return reply.send({ postId, likeCount });
    } catch (error) {
      console.error("❌ Erro ao obter número de curtidas:", error);
      return reply
        .status(500)
        .send({ error: "Erro ao obter número de curtidas." });
    }
  });

  // 🔍 Rota para verificar se um usuário curtiu um post
  app.get("/likes/:postId/user/:userId", async (request, reply) => {
    const { postId, userId } = request.params as {
      postId: string;
      userId: string;
    };
    try {
      const result = await pool.query(
        `SELECT COUNT(*) AS is_liked FROM likes WHERE post_id = $1 AND user_id = $2`,
        [postId, userId]
      );
      const isLiked = parseInt(result.rows[0].is_liked, 10) > 0;
      return reply.send({ postId, userId, isLiked });
    } catch (error) {
      console.error("❌ Erro ao verificar curtida do usuário:", error);
      return reply
        .status(500)
        .send({ error: "Erro ao verificar curtida do usuário." });
    }
  });

  // 🏆 Rota para obter posts mais curtidos
  app.get("/posts/most-liked", async (request, reply) => {
    try {
      const result = await pool.query(
        `SELECT p.*, COUNT(l.post_id) AS like_count
         FROM posts p
         LEFT JOIN likes l ON p.id = l.post_id
         GROUP BY p.id
         ORDER BY like_count DESC`
      );
      return reply.send(result.rows);
    } catch (error) {
      console.error("❌ Erro ao obter posts mais curtidos:", error);
      return reply
        .status(500)
        .send({ error: "Erro ao obter posts mais curtidos." });
    }
  });

  // 💗 Rota para obter posts curtidos por um usuário específico
  app.get("/users/:userId/liked-posts", async (request, reply) => {
    const { userId } = request.params as { userId: string };
    try {
      const result = await pool.query(
        `SELECT p.*
         FROM posts p
         JOIN likes l ON p.id = l.post_id
         WHERE l.user_id = $1`,
        [userId]
      );
      return reply.send(result.rows);
    } catch (error) {
      console.error("❌ Erro ao obter posts curtidos pelo usuário:", error);
      return reply
        .status(500)
        .send({ error: "Erro ao obter posts curtidos pelo usuário." });
    }
  });

  // 🔢 Rota para obter total de curtidas feitas por um usuário
  app.get("/users/:userId/like-count", async (request, reply) => {
    const { userId } = request.params as { userId: string };
    try {
      const result = await pool.query(
        `SELECT COUNT(*) AS total_likes FROM likes WHERE user_id = $1`,
        [userId]
      );
      const totalLikes = parseInt(result.rows[0].total_likes, 10);
      return reply.send({ userId, totalLikes });
    } catch (error) {
      console.error("❌ Erro ao obter total de curtidas do usuário:", error);
      return reply
        .status(500)
        .send({ error: "Erro ao obter total de curtidas do usuário." });
    }
  });

  // 🗑️ Rota para deletar todas as curtidas de um post
  app.delete("/posts/:postId/likes", async (request, reply) => {
    const { postId } = request.params as { postId: string };
    try {
      await pool.query(`DELETE FROM likes WHERE post_id = $1`, [postId]);
      return reply.send({
        message: "🗑️ Todas as curtidas do post foram deletadas.",
      });
    } catch (error) {
      console.error("❌ Erro ao deletar curtidas do post:", error);
      return reply
        .status(500)
        .send({ error: "Erro ao deletar curtidas do post." });
    }
  });

  // 🚫 Rota para impedir que o usuário curta seu próprio post
  app.post("/likes/no-self-like", async (request, reply) => {
    const { postId, userId } = request.body as {
      postId: number;
      userId: number;
    };
    try {
      const postResult = await pool.query(
        `SELECT user_id FROM posts WHERE id = $1`,
        [postId]
      );

      if (postResult.rows.length === 0) {
        return reply.status(404).send({ error: "Post não encontrado." });
      }

      const postOwnerId = postResult.rows[0].user_id;
      if (postOwnerId === userId) {
        return reply
          .status(400)
          .send({ error: "Usuário não pode curtir seu próprio post." });
      }

      await pool.query(
        `INSERT INTO likes (post_id, user_id)
         VALUES ($1, $2)
         ON CONFLICT DO NOTHING`,
        [postId, userId]
      );

      return reply.send({ message: "❤️ Post curtido com sucesso." });
    } catch (error) {
      console.error("❌ Erro ao processar curtida:", error);
      return reply.status(500).send({ error: "Erro ao processar curtida." });
    }
  });
}
