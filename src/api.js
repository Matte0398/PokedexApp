const BASE = "https://pokeapi.co/api/v2/";
const cache = new Map();
const pending = new Map();
const MAX_AGE = 24 * 60 * 60 * 1000;

export async function getResource(path) {
  const url = path.startsWith("https://") ? path : `${BASE}${path}`;

  if (cache.has(url)) return cache.get(url);

  try {
    const saved = JSON.parse(sessionStorage.getItem(`pokedex:${url}`));

    if (saved && Date.now() - saved.time < MAX_AGE) {
      cache.set(url, saved.data);

      return saved.data;
    }
  } catch {
    /* Storage may be disabled or full. */
  }

  if (pending.has(url)) return pending.get(url);

  const request = (async () => {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 15000);

    try {
      const response = await fetch(url, { signal: controller.signal });

      if (!response.ok) throw new Error(`HTTP ${response.status}`);

      const data = await response.json();
      cache.set(url, data);

      try {
        sessionStorage.setItem(
          `pokedex:${url}`,
          JSON.stringify({ time: Date.now(), data }),
        );
      } catch {
        /* In-memory cache remains available. */
      }

      return data;
    } catch (error) {
      const reason = error.name === "AbortError" ? "timeout" : "network";
      throw new Error(reason);
    } finally {
      clearTimeout(timer);
      pending.delete(url);
    }
  })();

  pending.set(url, request);
  return request;
}

export async function mapConcurrent(items, callback, concurrency = 6) {
  const output = new Array(items.length);
  let cursor = 0;

  await Promise.all(
    Array.from({ length: Math.min(concurrency, items.length) }, async () => {
      while (cursor < items.length) {
        const index = cursor++;
        output[index] = await callback(items[index]);
      }
    }),
  );

  return output;
}
