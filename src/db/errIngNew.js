import DB from "../DB.js";
import txtId from "./txtId.js";
import send from "../send.js";

export default async (now, errmap, err, name, srv_id, vps_id) => {
  const pre_err = errmap.get(vps_id);

  if (pre_err && err == pre_err[0]) {
    return;
  }

  const txt_id = await txtId(err),
    [r] = await Promise.all([
      DB.q(
        `INSERT INTO errIng(vps_id,srv_id,txt_id,ts) VALUES (${vps_id},${srv_id},${txt_id},${now}) ON DUPLICATE KEY UPDATE txt_id=VALUES(txt_id)`,
      ),
      send("❌ " + name, err),
    ]);
  errmap.set(vps_id, [err, now, r.insertId, txt_id]);
};
