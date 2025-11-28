#!/usr/bin/env bun

import * as SEND from "../conf/SEND.js";
import Send from "@8v/send";

const send = Send(SEND);

export default (title, body) => {
  console.log(title, body);
  return send(title, body);
};
