import ymlLoad from "@3-/yml/load.js";
import { join } from "node:path";

const ROOT = import.meta.dirname;

export default (path) => ymlLoad(join(ROOT, "conf", path + ".yml"));
