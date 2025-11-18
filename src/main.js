#!/usr/bin/env bun
// 不要用 node， node 下 fetch 没有 proxy 参数

import "@3-/default";
import loadYml from "./loadYml.js";
import ping from "./ping.js";
import isoMin from "@3-/time/isoMin.js";
import srvId from "./db/srvId.js";
import VPS_IP_NAME from "./db/VPS_IP_NAME.js";
import VPS_ID_IP from "./db/VPS_ID_IP.js";
import int from "@3-/int";
import R from "./R.js";

const TASK = new Map(),
  watch = async () => {
    let now = new Date();
    console.log("→", isoMin(now));
    now = int(now / 1e3);
    await Promise.all(
      TASK.entries().map(async ([srv, li]) =>
        Promise.all(
          li.map(([srv_id, tag, vps, ...args]) =>
            ping(now, srv, tag, srv_id, vps, args),
          ),
        ),
      ),
    );
    await R.setex("status:ts", 864e3, now);
  };

await Promise.all(
  Object.entries(loadYml("watch")).map(async ([srv_tag, args]) => {
    console.log(srv_tag);
    const srv_id = await srvId(srv_tag),
      [srv, tag] = srv_tag.split("/"),
      task = TASK.default(srv, () => []),
      push = (args) => task.push([srv_id, ...args]);

    switch (srv) {
      case "ipv6_proxy":
        const { auth, port } = args;
        args.vps.map((vps) => {
          push([, vps, auth, port]);
        });
        break;
      case "redis_sentinel":
        const vps = args.vps;
        args.vps = vps.slice(1).map((name) => VPS_ID_IP.get(name)[1]);
        push([tag, vps, args, VPS_IP_NAME]);
        break;
    }
  }),
);

await watch();
setInterval(watch, 6e4);
