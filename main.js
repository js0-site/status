#!/usr/bin/env bun

import TxtId from "@3-/txt_id";
import DB from "./DB.js";
import loadYml from "./loadYml.js";

const WATCH = loadYml("watch"),
  watch = (host, ip, args) => {
    console.log(host, ip, args);
  },
  txtId = TxtId(DB.pool),
  VPS_IP = new Map(await DB.q("SELECT hostname,ip FROM vps"));

console.log(VPS_IP);

await Promise.allSettled(
  WATCH.map(async ([host_li, ...args]) => {
    await Promise.allSettled(
      host_li.split(" ").map((host) => watch(txtId, host, HOST[host], args)),
    );
  }),
);

process.exit();
