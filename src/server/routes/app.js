/**
 * @type {import('fastify').FastifyPluginCallback}
 */
export const appRoute = async (fastify) => {
  fastify.get("/", async (req, res) => {
    res.send("foo");
  });
};
