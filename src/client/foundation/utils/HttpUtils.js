export const jsonFetcher = async (/** @type {string} */ url) => {
  const res = await fetch(url);
  const data = await res.json();
  return data;
};

/**
 * @param {string} url
 * @param {string} userId
 */
export const authorizedJsonFetcher = async (url, userId) => {
  const req = new Request(url, {
    headers: {
      "x-app-userid": userId,
    },
  });
  const res = await fetch(req);
  const data = await res.json();
  return data;
};
