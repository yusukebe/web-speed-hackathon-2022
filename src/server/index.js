import "regenerator-runtime/runtime";
import fastify from "fastify";
import fastifySensible from "fastify-sensible";

import { User } from "../model/index.js";

import { apiRoute } from "./routes/api.js";
//import { appRoute } from "./routes/app.js";
import { spaRoute } from "./routes/spa.js";
import { createConnection } from "./typeorm/connection.js";

const IS_PRODUCTION = process.env.NODE_ENV === "production";

const server = fastify({
  logger: IS_PRODUCTION ? false : {},
});
server.register(fastifySensible);

server.addHook("onRequest", async (req, res) => {
  const repo = (await createConnection()).getRepository(User);

  const userId = req.headers["x-app-userid"];
  if (userId !== undefined) {
    const user = await repo.findOne(userId);
    if (user === undefined) {
      res.unauthorized();
      return;
    }
    req.user = user;
  }
});

server.addHook("onRequest", async (req, res) => {
  res.header("Cache-Control", "no-cache, no-store, no-transform");
  res.header("Connection", "close");
});

//server.register(appRoute);
server.register(apiRoute, { prefix: "/api" });
server.register(spaRoute);

server.listen({ host: "0.0.0.0", port: process.env.PORT || 3000 }, (err) => {
  if (err) {
    fastify.log.error(err);
    process.exit(1);
  }
});
