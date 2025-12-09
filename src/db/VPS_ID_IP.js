#!/usr/bin/env bun

import binIp from "@3-/ip/binIp.js";
import ipBin from "@3-/ip/ipBin.js";
import VPS_IP from "./VPS_IP.js";
import DB from "../DB.js";

const VPS_ID_IP = new Map(
  (await DB.q("SELECT id,hostname,ip FROM vps")).map(([id, hostname, ip]) => {
    return [hostname, [id, binIp(ip)]];
  }),
);

await (async () => {
  const to_insert = [];
  Object.entries(VPS_IP).forEach(([hostname, ip]) => {
    if (ip.v4 != VPS_ID_IP.get(hostname)) {
      to_insert.push([hostname, ip.v4]);
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
    VPS_ID_IP.set(hostname, [hostname_id.get(hostname), ip]);
  });
})();

export default VPS_ID_IP;
