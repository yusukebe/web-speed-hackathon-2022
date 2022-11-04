import { join } from "path";

import fastifyStatic from "@fastify/static";
/**
 * @type {import('fastify').FastifyPluginCallback}
 */
export const appRoute = async (fastify) => {
  fastify.register(import("@fastify/compress"), {
    encodings: ["gzip"],
  });

  fastify.register(fastifyStatic, {
    prefix: "/assets/",
    root: join(__dirname, "public/assets"),
    wildcard: false,
  });

  fastify.get("/favicon.ico", () => {
    throw fastify.httpErrors.notFound();
  });

  fastify.register(import("@fastify/view"), {
    engine: {
      handlebars: require("handlebars"),
    },
    includeViewExtension: true,
    root: join(__dirname, "templates"),
    viewExt: "html",
  });

  fastify.get("/", async (_req, res) => {
    return res.view("index", { text: "text" });
  });

  fastify.get("/:date", async (_req, res) => {
    return res.view("index", { text: "text" });
  });

  fastify.get("/races/:raceId", async (_req, res) => {
    return res.view("index", { text: "text" });
  });

  fastify.get("/races/:raceId/race-card", async (_req, res) => {
    return res.view("index", { text: "text" });
  });

  fastify.get("/races/:raceId/odds", async (_req, res) => {
    return res.view("index", { text: "text" });
  });

  fastify.get("/races/:raceId/result", async (_req, res) => {
    return res.view("index", { text: "text" });
  });
};
