#!/usr/bin/env bun
// 不要用 node， node 下 fetch 没有 proxy 参数

import VPS_ID_IP from "./db/VPS_ID_IP.js";
import "@3-/default";
import loadYml from "./loadYml.js";
import ping from "./ping.js";
import isoMin from "@3-/time/isoMin.js";
import srvId from "./db/srvId.js";

let RAN = 0;

const TASK = new Map(),
  watch = () => {
    console.log("→", isoMin());
    ++RAN;
    TASK.forEach(async (li, srv) => {
      li.forEach(([srv_id, tag, vps, ...args]) => {
        ping(RAN, srv, tag, srv_id, vps, args);
      });
    });
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
        push([tag, vps, args, vps.map((vps) => [VPS_ID_IP.get(vps)[1], vps])]);
        break;
    }
  }),
);

watch();
setInterval(watch, 6e4 / 3);
