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
    res.type("text/html").send(getHTML("/assets/images/hero.webp"));
  });

  fastify.get("/:date", async (_req, res) => {
    res.type("text/html").send(getHTML());
  });

  fastify.get("/races/:raceId/race-card", async (req, res) => {
    res.type("text/html").send(getHTML(await getHero(req)));
  });

  fastify.get("/races/:raceId/odds", async (req, res) => {
    res.type("text/html").send(getHTML(await getHero(req)));
  });

  fastify.get("/races/:raceId/result", async (req, res) => {
    res.type("text/html").send(getHTML(await getHero(req)));
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

const getHTML = (hero) => {
  let preload = "";
  if (hero) {
    preload = `<link rel="preload" href="${hero}" as="image" />`;
  }
  return `<!DOCTYPE html>
  <html lang="ja">
    <head>
      <meta charset="UTF-8" />
      <meta http-equiv="X-UA-Compatible" content="IE=edge" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      ${preload}
      <link rel="preload" href="/assets/images/races/400x225/gray.webp" as="image" />
      <title>CyberTicket</title>
    </head>
    <body>
      <div id="root"></div>
      <script src="/assets/js/main.bundle.js"></script>
    </body>
  </html>
  `;
};
