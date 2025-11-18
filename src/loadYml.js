import ymlLoad from "@3-/yml/load.js";
import { join, dirname } from "node:path";

const ROOT = dirname(import.meta.dirname);

export default (path) => ymlLoad(join(ROOT, "conf", path + ".yml"));
