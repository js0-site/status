#!/usr/bin/env bun
// 不要用 node， node 下 fetch 没有 proxy 参数

import "@3-/default";
import loadYml from "./loadYml.js";
import watch from "./watch.js";
import WATCH from "./var/WATCH.js";

await Promise.all(
  loadYml("watch").map(async ([host_li, li]) =>
    Promise.all(
      host_li.split(" ").map((host) =>
        Promise.all(
          Object.entries(li).map(async ([srv, args]) => {
            WATCH.default(host, () => []).push([srv, args]);
          }),
        ),
      ),
    ),
  ),
);

watch();
setInterval(watch, 6e4);
