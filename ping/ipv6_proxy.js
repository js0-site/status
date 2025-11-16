import GOOGLE_TRAN from "../conf/GOOGLE_TRAN.js";
import assert from "node:assert/strict";
import fetch from "node-fetch";
import { HttpsProxyAgent } from "https-proxy-agent";

const URL = "https://translate-pa.googleapis.com/v1/translateHtml";

export default async (ip, { user, port, password }) => {
  const traned = await fetch(URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json+protobuf",
      "X-Goog-API-Key": GOOGLE_TRAN,
    },
    agent: new HttpsProxyAgent(`http://${user}:${password}@` + ip + ":" + port),
    body: JSON.stringify([[["I"], "en", "zh-CN"], "te_lib"]),
  });
  assert.deepEqual(await traned.json(), [["我"]]);
};
