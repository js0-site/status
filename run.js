import THREAD_POOL from "./var/THREAD_POOL.js";
import valId from "./var/valId.js";
import log from "@3-/console/log.js";
import DB from "./DB.js";

const srvId = await valId("srv");

export default (runed, nowts, host, vps_id, ip, srv_li, err_li, errmap) =>
  srv_li.map(async ([srv, args]) => {
    const ac = new AbortController(),
      srv_id = await srvId(srv),
      timer = setTimeout(() => {
        ac.abort();
      }, 3e4),
      pre_err = errmap.get(srv_id);

    try {
      await THREAD_POOL.run([srv, ip, args], { signal: ac.signal });
      clearTimeout(timer);
      if (pre_err) {
        errmap.delete(srv_id);
        const [_, begin, errIng_id, txt_id] = pre_err,
          cost = nowts - begin;
        log(
          "  " + host + " " + srv + " 恢复耗时",
          Math.floor(cost / 60) + " 分钟",
        );
        await Promise.allSettled([
          DB.q("DELETE FROM errIng WHERE id=" + errIng_id),
          DB.q(
            `INSERT INTO errFixed(id,vps_id,srv_id,txt_id,begin,duration) VALUES (${errIng_id},${vps_id},${srv_id},${txt_id},${begin},${cost < 0 ? 0 : cost}) ON DUPLICATE KEY UPDATE duration=VALUES(duration)`,
          ),
        ]);
      }
    } catch (err) {
      if (err.name == "AbortError") {
        err = "timeout";
      } else {
        err = err.toString();
        if (err.startsWith("Error: ")) {
          err = err.slice(7);
        }
      }
      console.error("  " + host, srv, err);
      err_li.push([srv_id, err, pre_err]);
    }
  });
