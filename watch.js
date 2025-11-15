import HOSTNMAE_ID_IP from "./db/HOSTNAME_ID_IP.js";
import reset from "@3-/reset";
import tcpping from "@3-/tcpping";
import nowts from "@3-/nowts";
import isoMin from "@3-/time/isoMin.js";
import DB from "./DB.js";
import TxtId from "@3-/txt_id";
import WATCH from "./var/WATCH.js";
import THREAD_POOL from "./var/THREAD_POOL.js";
import valId from "./var/valId.js";

let RUNED = 0;

const ERR = new Map(),
  log = console.log.bind(console),
  { q } = DB,
  txtId = TxtId(q),
  srvId = await valId("srv");

export default () => {
  ++RUNED;
  log("→ " + isoMin());
  const begin = nowts();
  WATCH.entries().forEach(async ([host, srv_li]) => {
    const [vps_id, ip] = HOSTNMAE_ID_IP.get(host),
      errmap = ERR.default(vps_id, () => new Map()),
      err_li = [];
    await Promise.allSettled(
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
            const cost = begin - pre_err[1];
            log(
              "  " + host + " " + srv + " 恢复耗时",
              Math.floor(cost / 60) + " 分钟",
            );
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
      }),
    );
    const err_li_len = err_li.length;
    if (err_li_len) {
      if (err_li_len == srv_li.length && !(await tcpping(ip, 22))) {
        reset(err_li, [[0, "tcp ping ssh port failed"]]);
      }
      err_li.forEach(async ([srv_id, err, pre_err]) => {
        if (!pre_err || err != pre_err[0]) {
          const txt_id = await txtId(err);
          errmap.set(srv_id, [
            err,
            begin,
            (
              await DB.q(
                `INSERT INTO errIng (vps_id,srv_id,txt_id,ts) VALUES (${vps_id},${srv_id},${txt_id},${begin})`,
              )
            ).insertId,
            txt_id,
          ]);
        }
      });
    } else {
      log("  ✅ " + host + " " + (nowts() - begin) + "ms");
    }
  });
};
