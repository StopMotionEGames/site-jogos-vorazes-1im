import { type FastifyInstance } from "fastify"; // ou FastifyInstance
import { pool } from "../bd_postgres/bd.mts";
import bcrypt from "bcrypt";

export default async function registrationRoutes(app: FastifyInstance) {
  // Registrar usuário
  app.post("/register", async (request, reply) => {
    const { name, email, password } = request.body as any;
    if (!name || !email || !password) {
      return reply
        .status(400)
        .send({ error: "Nome, email e senha são obrigatórios." });
    }

    try {
      const hashedPassword = await bcrypt.hash(password, 10);
      const result = await pool.query(
        `INSERT INTO users (name, email, password)
         VALUES ($1, $2, $3)
         RETURNING id, name, email, created_at`,
        [name, email, hashedPassword]
      );

      reply.send(result.rows[0]);
    } catch (error: any) {
      console.error("Erro ao registrar usuário:", error);
      if (error.code === "23505") {
        // email duplicado
        return reply.status(400).send({ error: "Email já cadastrado." });
      }
      reply.status(500).send({ error: "Erro ao registrar usuário." });
    }
  });

  // Rota de login
  app.post("/login", async (request, reply) => {
    const { email, password } = request.body as any;
    console.log(request.body);
    if (!email || !password) {
      return reply
        .status(400)
        .send({ error: "Email e senha são obrigatórios." });
    }

    try {
      const result = await pool.query(`SELECT * FROM users WHERE email = $1`, [
        email,
      ]);
      const user = result.rows[0];

      console.table(result);
      console.table(user);
      if (!user)
        return reply.status(401).send({ error: "Credenciais inválidas." });

      const passwordMatch = password === user.password;
      console.log(!passwordMatch);
      if (!passwordMatch)
        return reply.status(401).send({ error: "Credenciais inválidas." });

      reply.send({ id: user.id, email: user.email });
    } catch (error) {
      console.error("Erro ao fazer login:", error);
      reply.status(500).send({ error: "Erro ao fazer login." });
    }
  });
}
