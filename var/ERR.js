import DB from "../DB.js";

// vps_id : srv_id : [err, ts, errIng_id, txt_id]

const ERR = new Map();

await (async () => {
  const err_ing = await DB.q("SELECT vps_id,srv_id,txt_id,ts,id FROM errIng"),
    id_txt = new Map(
      await DB.q(
        "SELECT id,val FROM txt WHERE id IN (?)",
        err_ing.map((li) => li[2]),
      ),
    );

  return Promise.all(
    err_ing.map(([vps_id, srv_id, txt_id, ts, id]) => {
      ERR.default(vps_id, () => new Map()).set(srv_id, [
        id_txt.get(txt_id),
        ts,
        id,
        txt_id,
      ]);
    }),
  );
})();

export default ERR;
