import { Redis } from "@upstash/redis";

const redisUrl = process.env.UPSTASH_REDIS_REST_URL;
const redisToken = process.env.UPSTASH_REDIS_REST_TOKEN;
const redis = redisUrl && redisToken ? new Redis({ url: redisUrl, token: redisToken }) : null;

const PROVIDER_CACHE_PREFIX = "user:providers:";

export const ALL_PROVIDERS = [
  "4kHDHub",
  "HDHub4u",
  "Movies4u",
  "Drive",
  "Vega",
  "ZeeFliz",
  "ZinkMovies",
  "DesireMovies",
  "NetMirror",
  "AnimeSalt",
  "KMMovies",
  "UhdMovies",
  "Moviesmod",
  "Adult",
] as const;

export type ProviderName = typeof ALL_PROVIDERS[number];

export async function getUserEnabledProviders(userId: string): Promise<ProviderName[]> {
  const cacheKey = `${PROVIDER_CACHE_PREFIX}${userId}`;

  if (!redis) {
    return getDefaultProviders();
  }
  
  try {
    const cached = await redis.get<ProviderName[]>(cacheKey);
    if (cached) {
      return cached;
    }
  } catch (error) {
    console.error("Cache read error:", error);
  }

  return getDefaultProviders();
}

export async function isProviderEnabled(
  userId: string,
  provider: string
): Promise<boolean> {
  const enabledProviders = await getUserEnabledProviders(userId);
  return enabledProviders.includes(provider as ProviderName);
}

export async function updateUserProviders(
  userId: string,
  providers: ProviderName[]
): Promise<void> {
  const cacheKey = `${PROVIDER_CACHE_PREFIX}${userId}`;

  if (!redis) {
    return;
  }
  
  try {
    // Cache persists until user explicitly changes their provider settings
    await redis.set(cacheKey, JSON.stringify(providers));
  } catch (error) {
    console.error("Cache write error:", error);
  }
}

export async function invalidateUserProviderCache(userId: string): Promise<void> {
  const cacheKey = `${PROVIDER_CACHE_PREFIX}${userId}`;

  if (!redis) {
    return;
  }
  
  try {
    await redis.del(cacheKey);
  } catch (error) {
    console.error("Cache delete error:", error);
  }
}

export async function getDefaultProviders(): Promise<ProviderName[]> {
  return [...ALL_PROVIDERS.filter(p => p !== "Adult")];
}
