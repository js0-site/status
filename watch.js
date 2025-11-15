import DB from "./DB.js";
import HOSTNMAE_ID_IP from "./db/HOSTNAME_ID_IP.js";
import TxtId from "@3-/txt_id";
import WATCH from "./var/WATCH.js";
import isoMin from "@3-/time/isoMin.js";
import nowts from "@3-/nowts";
import reset from "@3-/reset";
import run from "./run.js";
import tcpping from "@3-/tcpping";
import log from "@3-/console/log.js";
import ERR from "./var/ERR.js";

const { q } = DB,
  txtId = TxtId(q);

let RUNED = 0;

export default () => {
  log("→ " + isoMin());
  ++RUNED;
  const begin = nowts();
  WATCH.entries().forEach(async ([host, srv_li]) => {
    const [vps_id, ip] = HOSTNMAE_ID_IP.get(host),
      errmap = ERR.default(vps_id, () => new Map()),
      err_li = [];
    await Promise.allSettled(
      run(RUNED, begin, host, vps_id, ip, srv_li, err_li, errmap),
    );
    const err_li_len = err_li.length;
    if (err_li_len) {
      if (err_li_len == srv_li.length && !(await tcpping(ip, 22))) {
        reset(err_li, [[0, "tcp ping ssh port failed"]]);
      }
      await Promise.allSettled(
        err_li.map(async ([srv_id, err, pre_err]) => {
          if (!pre_err || err != pre_err[0]) {
            const txt_id = await txtId(err);
            errmap.set(srv_id, [
              err,
              begin,
              (
                await DB.q(
                  `INSERT INTO errIng(vps_id,srv_id,txt_id,ts) VALUES (${vps_id},${srv_id},${txt_id},${begin}) ON DUPLICATE KEY UPDATE txt_id=VALUES(txt_id)`,
                )
              ).insertId,
              txt_id,
            ]);
          }
        }),
      );
    } else {
      log("  ✅ " + host + " " + (nowts() - begin) + "ms");
    }
  });
};
