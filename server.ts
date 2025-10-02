import fastify, { type FastifyRequest } from "fastify";
import path, { join } from "path";
import { fileURLToPath } from "url";
import fs from "fs/promises";
import fastifyStatic from "@fastify/static";
import middie from "@fastify/middie";
import fastifyCompress from "@fastify/compress";

import webSocket from "@fastify/websocket";

let __filename: string = fileURLToPath(import.meta.url);
let __dirname: string = path.dirname(__filename);

let port: number = 8443;
let requisition: number = 0;

const app = fastify({
  logger: false,
  //   http2: true,
  //   https: {
  //     key: await fs.readFile(join(__dirname, "config", "ssl", "code.key")),
  //     cert: await fs.readFile(join(__dirname, "config", "ssl", "code.crt")),
  //     ca: await fs.readFile(join(__dirname, "config", "ssl", "code.csr")),
  //   },
});
// await app.register(fastifyCompress, {
//   global: true,
//   encodings: ["gzip", "deflate", "br"],
// });

await app.register(webSocket);
await app.register(middie);
await app.register(fastifyStatic, {
  root: join(__dirname, "public"),
  prefix: "/",
  decorateReply: true,
});

app
  .listen({ port: port, host: "::" })
  .then(() => {
    console.log("listening on:", app.server.address());
    console.log("You can access the site by the following links:");
    console.log("http://localhost:" + port);
    console.log("http://127.0.0.1:" + port);
    console.log("http://[::]:" + port);
  })
  .catch((err) => {
    console.error(err);
    process.exit(-1);
  });

app.use((request: FastifyRequest, reply, next) => {
  console.log("\nRequisição:", requisition++);
  console.log(request.ip);
  console.log(request.url);
  console.log(reply.statusCode);
  next();
});
app.get("/", async (request, reply) => {
  const html = (
    await fs.readFile(join(__dirname, "public", "home.html"))
  ).toString();
  reply.header("content-type", "text/html");
  reply.send(html);
});

// websocket vai ser colocado aqui para deixar em tempo real!
// código de example
app.get("/ws", { websocket: true }, function wsHandler(socket, req) {
  // Handle incoming messages from the client
  socket.on("message", (message) => {
    console.log(`Received message: ${message}`);
    let a = 0;
    // Send a response back to the client
    setInterval(() => {
      a++;
      socket.send(`enviando mensagem ${a}`);
    }, 1000);
  });

  // Handle connection close event
  socket.on("close", () => {
    console.log("Client disconnected");
  });

  // Handle errors
  socket.on("error", (error) => {
    console.error("WebSocket error:", error);
  });
});
