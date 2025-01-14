import "regenerator-runtime/runtime";
import * as fs from "fs";

import fastify from "fastify";
import fastifySensible from "fastify-sensible";

import { User } from "../model/index.js";

import { apiRoute } from "./routes/api.js";
import { appRoute } from "./routes/app.jsx";
import { createConnection } from "./typeorm/connection.js";

export const IS_PRODUCTION = process.env.NODE_ENV === "production";

let server = fastify({ logger: true });

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

server.addHook("onRequest", async (_, res) => {
  res.header("Connection", "close");
});

server.register(appRoute);
server.register(apiRoute, { prefix: "/api" });

server.listen({ host: "0.0.0.0", port: process.env.PORT || 3000 }, (err) => {
  if (err) {
    console.log(err);
    process.exit(1);
  }
});
