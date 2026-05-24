import { createClient } from "redis";
export const redis = createClient({
  url: process.env.REDIS_URL,
});
redis.on("error", (err) => console.log("⚠️ Redis error:", err.message));
redis.connect()
  .then(() => console.log("✅ Redis connected"))
  .catch(err => console.log("⚠️ Redis failed:", err.message));
export default redis;
