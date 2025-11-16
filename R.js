import REDIS from "./conf/REDIS.js";
import Redis from "ioredis";
export default new Redis(REDIS);
