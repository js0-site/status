#!/usr/bin/env bun

import TIDB from "../conf/TIDB.js";
import mysql from "@8v/mysql";

export default mysql(TIDB);
