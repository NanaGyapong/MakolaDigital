import { createClient } from "redis";
export const redis = createClient({
  socket: { host: "localhost", port: 6379 },
  password: "MakolaRedis2024!",
});
redis.connect()
  .then(() => console.log("✅ Redis connected"))
  .catch(err => console.log("⚠️ Redis:", err.message));
export default redis;
