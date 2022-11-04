import { join } from "path";

import fastifyStatic from "@fastify/static";

import { Race } from "../../model/index.js";
import { createConnection } from "../typeorm/connection.js";

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
    return res.view("index", { hero: "/assets/images/hero.webp" });
  });

  fastify.get("/:date", async (_req, res) => {
    return res.view("index", { text: "text" });
  });
  fastify.get("/races/:raceId/race-card", async (req, res) => {
    const imageURL = await getHero(req);
    return res.view("index", { hero: imageURL });
  });

  fastify.get("/races/:raceId/odds", async (req, res) => {
    const imageURL = await getHero(req);
    return res.view("index", { hero: imageURL });
  });

  fastify.get("/races/:raceId/result", async (req, res) => {
    const imageURL = await getHero(req);
    return res.view("index", { hero: imageURL });
  });
};

const getHero = async (req) => {
  const repo = (await createConnection()).getRepository(Race);
  const race = await repo.findOne(req.params.raceId);
  let imageURL = "";
  if (race) {
    const match = race.image.match(/([0-9]+)\.jpg$/);
    imageURL = `/assets/images/races/400x225/${match[1]}.webp`;
  }
  return imageURL;
};
