// routes/posts.ts
import { type FastifyInstance } from "fastify";
import { pool } from "../bd_postgres/bd.mts";
import path, { join } from "path";
import fs from "fs"; // para createWriteStream
import fsp from "fs/promises"; // para mkdir, readFile etc.

export default async function postsRoutes(app: FastifyInstance) {
  // Criar um post
  app.post("/posts", async (request, reply) => {
    const { title, content, user_id, media: data } = request.body as any;
    console.log(data)
    // const { user_id, title, content } = body;
    let mediaUrl: string | null = null;
    let mediaType: string | null = null;
    let duration: number | null = null;

    if (data) {
      // Diretório de upload
      const { file, filename, mimetype } = data;

      // pasta de upload
      const uploadDir = join(process.cwd(), "public", "uploads");
      await fsp.mkdir(uploadDir, { recursive: true });

      const finalName = Date.now() + "-" + filename;
      const filepath = join(uploadDir, finalName);

      // salvar stream manualmente (garantido)
      const buffer = await data.toBuffer();

      // grava direto no disco
      await fsp.writeFile(filepath, buffer);

      mediaUrl = "/uploads/" + finalName;

      // Detectar tipo MIME
      if (data.mimetype.startsWith("image")) {
        mediaType = "image";
      } else if (data.mimetype.startsWith("video")) {
        mediaType = "video";
      } else {
        mediaType = "none";
      }
    }

    console.log(user_id, content, mediaUrl, duration);
    // Inserir no banco
    const result = await pool.query(
      `INSERT INTO posts (user_id, title, content, media_url, media_type, duration)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *`,
      [user_id.value, title.value, content.value, mediaUrl, mediaType, duration]
    );

    reply.send(result.rows[0]);
  });

  // Listar posts
  app.get("/posts", async (request, reply) => {
    const result = await pool.query(
      `SELECT p.*, u.name AS user_name, u.email AS user_email
      FROM posts p
      JOIN users u ON p.user_id = u.id
      ORDER BY p.created_at DESC`
    );
    console.table(result.rows);
    reply.send(result.rows);
  });

  // Deletar um post
  app.delete("/posts/:id", async (request, reply) => {
    console.table(request.body);
    if (request.body.id.value != 1125) {
      reply.send({ message: "PRO-I-BI-DO" })
      return;
    }

    console.table(request.params);
    const { id } = request.params as { id: string };
    const result = await pool.query(
      "DELETE FROM posts WHERE id = $1 RETURNING *",
      [id]
    );

    console.table(result)
    if (result.rowCount === 0) {
      return reply.status(404).send({ error: "Post não encontrado" });
    }
    reply.send({ message: "Post deletado" });
  });
}
