import { createClient } from "redis";
export const redis = createClient({
  url: process.env.REDIS_URL,
});
redis.connect()
  .then(() => console.log("✅ Redis connected"))
  .catch(err => console.log("⚠️ Redis:", err.message));
export default redis;
