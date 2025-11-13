#!/usr/bin/env bun

import ymlLoad from "@3-/yml/load.js";
import { join } from "node:path";

const ROOT = import.meta.dirname,
  load = (path) => ymlLoad(join(ROOT, "conf/status", path + ".yml")),
  HOST = load("host"),
  WATCH = load("watch"),
  watch = (host, args) => {
    console.log(host, args);
  };

await Promise.allSettled(
  WATCH.map(async ([host_li, ...args]) => {
    await Promise.allSettled(
      host_li.split(" ").map((host) => watch(host, args)),
    );
  }),
);
