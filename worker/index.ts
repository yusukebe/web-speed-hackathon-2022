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

const queryReg = new RegExp(/\?.+=.+/);

const app = new Hono<{ Bindings: Bindings }>();

const cacheHandler: Handler<{ Bindings: Bindings }> = async (c) => {
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

  const headers = response.headers;
  const kv: Record<string, string> = {};
  for (const [k, v] of headers.entries()) {
    if (k === "cache-control") {
      kv[k] = `max-age=${maxAge}`;
    } else {
      kv[k] = v;
    }
  }
  const newResponse = new Response(response.body, {
    headers: {
      ...kv,
    },
  });
  return newResponse;
};

app.get("*", cacheHandler);
app.get("/assets/*", cacheHandler);
app.get(
  "/api/*",
  async (c, next) => {
    await next();
    const path = getPathFromURL(c.req.url);
    c.executionCtx.waitUntil(
      c.env.CACHE_KEY_KV.put(`${prefix}${path}`, "true", {
        metadata: { path: path },
      }),
    );
  },

  cacheHandler,
);

const purgeHandler: Handler<{ Bindings: Bindings }> = async (c) => {
  const { keys } = await c.env.CACHE_KEY_KV.list<{ path: string }>({ prefix });

  console.log(keys);

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

  console.log(data);

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

app.post("/api/*", purgeHandler);
app.put("/api/*", purgeHandler);
app.delete("/api/*", purgeHandler);

export default app;
