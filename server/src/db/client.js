import { MongoClient } from "mongodb";
import { env } from "../config/env.js";

// One client per process, kept on globalThis so it survives module reloads
// (node --watch) and is reused across requests on a warm Vercel instance —
// a client per request would exhaust Atlas's connection limit.
const cache = (globalThis.__portfolioMongo ??= { client: null, promise: null });

function serviceUnavailable(message) {
  const error = new Error(message);
  error.status = 503;
  return error;
}

export function isDatabaseConfigured() {
  return Boolean(env.mongodbUri);
}

/** @returns {Promise<import("mongodb").Db>} */
export async function getDb() {
  if (!isDatabaseConfigured()) {
    throw serviceUnavailable("Content database is not configured.");
  }
  if (!cache.promise) {
    const client = new MongoClient(env.mongodbUri, {
      appName: "jahid-portfolio",
      maxPoolSize: 5,
      serverSelectionTimeoutMS: 5000,
    });
    cache.promise = client.connect().then(() => {
      cache.client = client;
      return client;
    });
    // Let the next request retry instead of caching a failed connection.
    cache.promise.catch(() => {
      cache.promise = null;
    });
  }
  try {
    const client = await cache.promise;
    return client.db(env.mongodbDb);
  } catch {
    throw serviceUnavailable("Content database is unavailable.");
  }
}

export async function closeDb() {
  const client = cache.client;
  cache.client = null;
  cache.promise = null;
  await client?.close();
}
