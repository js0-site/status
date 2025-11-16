#!/usr/bin/env bun

import binIp from "@3-/ip/binIp.js";
import ipBin from "@3-/ip/ipBin.js";
import loadYml from "../loadYml.js";
import DB from "../DB.js";

const HOSTNMAE_ID_IP = new Map(
  (await DB.q("SELECT id,hostname,ip FROM vps")).map(([id, hostname, ip]) => {
    return [hostname, [id, binIp(ip)]];
  }),
);

await (async () => {
  const to_insert = [];
  Object.entries(loadYml("host")).forEach(([hostname, ip]) => {
    if (ip != HOSTNMAE_ID_IP.get(hostname)) {
      to_insert.push([hostname, ip]);
    }
  });
  await DB.q(
    "INSERT INTO vps(hostname,ip) VALUES ? ON DUPLICATE KEY UPDATE ip=VALUES(ip)",
    to_insert.map(([hostname, ip]) => [hostname, ipBin(ip)]),
  );
  const hostname_id = new Map(
    await DB.q(
      "SELECT hostname,id FROM vps WHERE hostname IN (?)",
      to_insert.map(([hostname]) => hostname),
    ),
  );
  to_insert.forEach(([hostname, ip]) => {
    HOSTNMAE_ID_IP.set(hostname, [hostname_id.get(hostname), ip]);
  });
})();

export default HOSTNMAE_ID_IP;
