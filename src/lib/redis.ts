import Redis from "ioredis";

/**
 * Redis client singleton with graceful degradation.
 * Returns null if REDIS_URL is not set or connection fails.
 *
 * Source of Truth: M2 spec Section 10.2 R2-4
 */

let redisClient: Redis | null = null;

export async function closeRedis(): Promise<void> {
  if (redisClient) {
    await redisClient.quit().catch(() => {});
    redisClient = null;
  }
}

export function getRedis(): Redis | null {
  if (!process.env.REDIS_URL) return null;
  if (!redisClient) {
    redisClient = new Redis(process.env.REDIS_URL, {
      maxRetriesPerRequest: 1,
      connectTimeout: 2000,
      lazyConnect: true,
    });
    redisClient.on("error", () => {
      redisClient = null; // graceful degradation
    });
  }
  return redisClient;
}
