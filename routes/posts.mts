// routes/posts.ts
import { type FastifyInstance } from "fastify";
import { pool } from "../bd_postgres/bd.mts";
import path, { join } from "path";
import fs from "fs"; // para createWriteStream
import fsp from "fs/promises"; // para mkdir, readFile etc.

export default async function postsRoutes(app: FastifyInstance) {
  // Criar um post
  app.post("/posts", async (request, reply) => {
    // Pega arquivo do upload (fastify-multipart)
    const data = await request.file?.();

    const { user_id, content } = request.body as any;

    // const { user_id, title, content } = body;
    let mediaUrl: string | null = null;
    let mediaType: string | null = null;
    let duration: number | null = null;

    if (data) {
      // Diretório de upload
      const uploadDir = join(process.cwd(), "public", "uploads");
      await fsp.mkdir(uploadDir, { recursive: true });

      const filename = Date.now() + "-" + data.filename;
      const filepath = join(uploadDir, filename);

      // Salvar arquivo fisicamente
      const stream = fs.createWriteStream(filepath);
      data.file.pipe(stream);

      mediaUrl = "/uploads/" + filename;

      // Detectar tipo MIME
      if (data.mimetype.startsWith("image")) {
        mediaType = "image";
      } else if (data.mimetype.startsWith("video")) {
        mediaType = "video";
      } else {
        mediaType = "none";
      }
    }

    // Inserir no banco
    const result = await pool.query(
      `INSERT INTO posts (user_id, content, media_url, media_type, duration)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [user_id, content, mediaUrl, mediaType, duration]
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
    reply.send(result.rows);
  });

  // Deletar um post
  app.delete("/posts/:id", async (request, reply) => {
    const { id } = request.params as { id: string };
    const result = await pool.query(
      "DELETE FROM posts WHERE id = $1 RETURNING *",
      [id]
    );

    if (result.rowCount === 0) {
      return reply.status(404).send({ error: "Post não encontrado" });
    }

    reply.send({ message: "Post deletado", post: result.rows[0] });
  });
}
