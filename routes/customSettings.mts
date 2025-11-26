import fastify from "fastify";
import  {type FastifyInstance,type FastifyRequest,type FastifyReply } from "fastify";
import { pool } from "../bd_postgres/bd.mts";

interface ThemeBody {
  user_id: number;
  theme: "light" | "dark";
}

export default async function (app: FastifyInstance) {
  // Rota para atualizar o tema do usuário
  app.post(
    "/settings/theme",
    async (
      request: FastifyRequest<{ Body: ThemeBody }>,
      reply: FastifyReply
    ) => {
      const { user_id, theme } = request.body;

      if (!user_id || !theme) {
        return reply
          .status(400)
          .send({ error: "user_id e theme são obrigatórios." });
      }

      if (theme !== "light" && theme !== "dark") {
        return reply
          .status(400)
          .send({ error: "theme deve ser 'light' ou 'dark'." });
      }

      try {
        const result = await pool.query(
          `INSERT INTO user_settings (user_id, theme)
           VALUES ($1, $2)
           ON CONFLICT (user_id)
           DO UPDATE SET theme = EXCLUDED.theme, updated_at = CURRENT_TIMESTAMP
           RETURNING *;`,
          [user_id, theme]
        );

        return reply.status(200).send({
          message: "Tema atualizado com sucesso.",
          settings: result.rows[0],
        });
      } catch (error) {
        console.error("Erro ao atualizar tema:", error);
        return reply.status(500).send({ error: "Erro ao atualizar tema." });
      }
    }
  );

  // Rota para obter o tema do usuário
  app.get(
    "/settings/theme/:user_id",
    async (
      request: FastifyRequest<{ Params: { user_id: string } }>,
      reply: FastifyReply
    ) => {
      const user_id = parseInt(request.params.user_id, 10);

      if (isNaN(user_id)) {
        return reply.status(400).send({ error: "user_id inválido." });
      }

      try {
        const result = await pool.query(
          `SELECT theme FROM user_settings WHERE user_id = $1;`,
          [user_id]
        );

        if (result.rows.length === 0) {
          return reply
            .status(404)
            .send({ error: "Configurações do usuário não encontradas." });
        }

        return reply.status(200).send({ theme: result.rows[0].theme });
      } catch (error) {
        console.error("Erro ao obter tema:", error);
        return reply.status(500).send({ error: "Erro ao obter tema." });
      }
    }
  );
}
