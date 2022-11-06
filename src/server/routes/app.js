import { join } from "path";

import fastifyStatic from "@fastify/static";

import { Race } from "../../model/index.js";
import { IS_PRODUCTION } from "../index.js";
import { createConnection } from "../typeorm/connection.js";

/**
 * @type {import('fastify').FastifyPluginCallback}
 */
export const appRoute = async (fastify) => {
  if (!IS_PRODUCTION) {
    fastify.register(import("@fastify/compress"), {
      encodings: ["gzip"],
    });
  }

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
    res.header("Link", '</assets/images/hero-small.webp>; rel="preload"');
    res.type("text/html").send(getHTML("/assets/images/hero-small.webp"));
  });

  fastify.get("/:date", async (_req, res) => {
    res.type("text/html").send(getHTML());
  });

  fastify.get("/races/:raceId/race-card", async (req, res) => {
    const hero = await getHero(req);
    res.header("Link", `<${hero}>; rel="preload"`);
    res.type("text/html").send(getHTML(hero, true));
  });

  fastify.get("/races/:raceId/odds", async (req, res) => {
    const hero = await getHero(req);
    res.header("Link", `<${hero}>; rel="preload"`);
    res.type("text/html").send(getHTML(hero, true));
  });

  fastify.get("/races/:raceId/result", async (req, res) => {
    const hero = await getHero(req);
    res.header("Link", `<${hero}>; rel="preload"`);
    res.type("text/html").send(getHTML(hero, true));
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

const getHTML = (hero, gray) => {
  console.log(gray);
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
      ${
        gray
          ? '<link rel="preload" href="/assets/images/races/400x225/gray.webp" as="image" />'
          : ""
      }
      ${preload}
      <title>CyberTicket</title>
      <style>${getCSS()}</style>
    </head>
    <body>
      <div id="root"></div>
      <script src="/assets/js/main.bundle.js"></script>
    </body>
  </html>
  `;
};

const getCSS = () => {
  return (
    '*,*::before,*::after{box-sizing:border-box}body,h1,h2,h3,h4,p,figure,blockquote,dl,dd{margin:0}ul[role="list"],ol[role="list"]{list-style:none}html:focus-within{scroll-behavior:smooth}body{min-height:100vh;text-rendering:optimizeSpeed;line-height:1.5}a:not([class]){text-decoration-skip-ink:auto}img,picture{max-width:100%;display:block}input,button,textarea,select{font:inherit}@media(prefers-reduced-motion:reduce){html:focus-within{scroll-behavior:auto}*,*::before,*::after{animation-duration:.01ms !important;animation-iteration-count:1 !important;transition-duration:.01ms !important;scroll-behavior:auto !important}}' +
    `body{color:#1c1917;background:#f5f5f4;font-family:sans-serif}a{color:inherit;text-decoration:none}ol,ul{padding:0;list-style:none;margin:0}@font-face{font-family:Senobi-Gothic;font-weight:400;font-display:block;src:url("/assets/fonts/MODI_Senobi-Gothic_2017_0702/Senobi-Gothic-Regular.woff") format("woff")}@font-face{font-family:Senobi-Gothic;font-weight:700;font-display:block;src:url("/assets/fonts/MODI_Senobi-Gothic_2017_0702/Senobi-Gothic-Bold.woff") format("woff")}`
  );
};
