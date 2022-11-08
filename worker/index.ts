import { Hono } from "hono";
import type { Handler } from "hono";
import { getPathFromURL } from "hono/utils/url";

const maxAge = 60 * 60 * 24 * 30;
const prefix = "cacheKey:";

type Bindings = {
  ZONE_ID: string;
  API_TOKEN: string;
  CACHE_KEY_KV: KVNamespace;
};

type Variables = {
  path: string;
};

type Env = { Bindings: Bindings; Variables: Variables };

const queryReg = new RegExp(/\?.+=.+/);

const app = new Hono<Env>();

const cacheHandler: Handler<Env> = async (c) => {
  if (queryReg.test(c.req.url)) {
    const response = await fetch(c.req);
    return new Response(response.body);
  }

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

app.get("*", cacheHandler);
app.all("/api/*", async (c) => {
  const response = await fetch(c.req);
  const newResponse = new Response(response.body, response);
  return newResponse;
});

const purgeHandler: Handler<{ Bindings: Bindings }> = async (c) => {
  const { keys } = await c.env.CACHE_KEY_KV.list<{ path: string }>({ prefix });

  const files: string[] = [];
  keys.map((k) => {
    const path = k.metadata?.path || "";
    const url = new URL(c.req.url);
    files.push(`https://${url.hostname}${path}`);
    c.env.CACHE_KEY_KV.delete(k.name);
  });

  if (!files.length) return c.json({ result: { message: "not files" } });

  const apiURL = `https://api.cloudflare.com/client/v4/zones/${c.env.ZONE_ID}/purge_cache`;
  const data = {
    files: files,
  };

  const fetchResponse = await fetch(apiURL, {
    body: JSON.stringify(data),
    headers: {
      Authorization: `Bearer ${c.env.API_TOKEN}`,
      "Content-Type": "application/json",
    },
    method: "POST",
  });

  return c.json({
    result: {
      status: fetchResponse.status,
      statusText: fetchResponse.statusText,
    },
  });
};

app.onError((err, c) => {
  console.log(err);
  return c.text("internal server error", 500);
});

export default app;
