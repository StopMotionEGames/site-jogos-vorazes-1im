// server.ts
import fastify, { type FastifyRequest } from "fastify";
import path, { join } from "path";
import { fileURLToPath } from "url";
import fs from "fs/promises";
import fsSync from "fs"; // para createWriteStream
import fastifyStatic from "@fastify/static";
import middie from "@fastify/middie";
import fastifyCompress from "@fastify/compress";
import webSocket from "@fastify/websocket";
import fastifyMultipart from "@fastify/multipart";

// Import das rotas
import postsRoutes from "./routes/posts.mts";
import authRoutes from "./routes/auth.mts";
import commentsRoutes from "./routes/comments.mts";
import custonSetingsRoutes from "./routes/custonSetings.mts";
import { createTables } from "./bd_postgres/createTableUsers.mts";
import { pool } from "./bd_postgres/bd.mts";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = fastify({ logger: false });
const port = 8443;
let requisition = 0;

// -------------------------
// REGISTRO DE PLUGINS
// -------------------------

// WebSocket
await app.register(webSocket);

// Middie para middleware estilo Express
await app.register(middie);

// Arquivos estáticos (public/)
await app.register(fastifyStatic, {
  root: join(__dirname, "public"),
  prefix: "/",
  decorateReply: true,
});
// Multipart para upload de arquivos
await app.register(fastifyMultipart, {
  limits: { fileSize: 200 * 1024 * 1024 }, // 200 MB
});

// Rotas
await app.register(postsRoutes, { prefix: "/api" });
await app.register(authRoutes, { prefix: "/api" });
await app.register(custonSetingsRoutes, { prefix: "/api" });
await app.register(commentsRoutes, { prefix: "/api" });
// Compress (opcional)
// await app.register(fastifyCompress, { global: true, encodings: ["gzip", "deflate", "br"] });

// -------------------------
// MIDDLEWARE PARA LOG
// -------------------------
app.use((request: FastifyRequest, reply, next) => {
  console.log("\nRequisição:", requisition++);
  console.log("IP:", request.ip);
  console.log("URL:", request.url);
  console.log("StatusCode:", reply.statusCode);
  next();
});

// -------------------------
// ROTA PRINCIPAL
// -------------------------
app.get("/", async (request, reply) => {
  const html = (
    await fs.readFile(join(__dirname, "public", "home.html"))
  ).toString();
  reply.header("content-type", "text/html");
  reply.send(html);
});

// -------------------------
// ROTA WEBSOCKET EXEMPLO
// -------------------------
app.get("/ws", { websocket: true }, (socket) => {
  let a = 0;
  socket.on("message", (message) => {
    console.log("Received message:", message);
  });

  const interval = setInterval(() => {
    a++;
    socket.send(`enviando mensagem ${a}`);
  }, 1000);

  socket.on("close", () => {
    console.log("Client disconnected");
    clearInterval(interval);
  });

  socket.on("error", (error) => console.error("WebSocket error:", error));
});

// -------------------------
// INICIAR SERVIDOR
// -------------------------
app
  .listen({ port, host: "::" })
  .then(() => {
    console.log("Servidor rodando em:");
    console.log("http://localhost:" + port);
    console.log("http://127.0.0.1:" + port);
    console.log("http://[::]:" + port);

    pool
      .connect()
      .then(() => {
        console.log("Conectado ao banco de dados PostgreSQL");
        createTables().then(() => {
          console.log("Tabelas verificadas/criadas");
        });
      })
      .catch((err) => {
        console.error("Erro ao conectar ao banco de dados:", err);
        process.exit(1);
      });
  })
  .catch((err) => {
    console.error("Erro ao iniciar servidor:", err);
    process.exit(1);
  });
