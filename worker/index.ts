import { Hono } from "hono";
import type { Handler } from "hono";

const maxAge = 60 * 60 * 24 * 3;

const app = new Hono();

const passHandler: Handler = async (c) => {
  const response = await fetch(c.req);
  const newResponse = new Response(response.body, response);
  newResponse.headers.delete("cache-control");
  return newResponse;
};

const cacheHandler: Handler = async (c) => {
  const response = await fetch(c.req, {
    cf: {
      cacheEverything: true,
      cacheTtl: maxAge,
    },
  });
  const newResponse = new Response(response.body, response);
  newResponse.headers.delete("cache-control");
  newResponse.headers.append("cache-control", `max-age=${maxAge}`);
  return newResponse;
};

const purgeMiddleware: Handler = async (c, next) => {
  const raceId = c.req.param("raceId");
  const url = new URL(c.req.url);

  const apiURL = `https://api.cloudflare.com/client/v4/zones/${c.env.ZONE_ID}/purge_cache`;
  const data = {
    files: `http://${url.hostname}/api/races/${raceId}`,
  };

  const fetchResponse = await fetch(apiURL, {
    body: JSON.stringify(data),
    headers: {
      Authorization: `Bearer ${c.env.API_TOKEN}`,
      "Content-Type": "application/json",
    },
    method: "POST",
  });
  console.log(await fetchResponse.json());
  await next();
};

app.get("/api/users/me", passHandler);
app.post("/api/users/me/charge", passHandler);
app.get("/api/races", cacheHandler);
app.get("/api/races/:raceId", cacheHandler);
app.get(
  "/api/races/:raceId/betting-tickets",
  async (c, next) => {
    const raceId = c.req.param("raceId");
    await c.env.CACHE_KEY_KV.put(raceId, "cached");
    await next();
  },
  cacheHandler,
);

app.post("/api/races/:raceId/betting-tickets", purgeMiddleware, passHandler);
app.post("/api/initialize", purgeMiddleware, passHandler);

app.get("/", cacheHandler);
app.get("/races/*", cacheHandler);
app.get("/assets/*", cacheHandler);

app.onError((err, c) => {
  console.log(err);
  return c.text("internal server error", 500);
});

export default app;
