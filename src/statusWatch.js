import R from "./R.js";
import raise from "@3-/raise";
import int from "@3-/int";
import send from "./send.js";

const PREFIX = "cloudflare status-watch ";

const statusWatch = async (now) => {
  const p = R.pipeline(),
    now_minute = int(now / 60);
  p.get("status-watch:ts");
  p.setex("status:ts", 864e3, now_minute);
  const status_watch_minute = (await p.exec())[0][1];
  if (!status_watch_minute) {
    raise(PREFIX + "未运行");
  }
  const diff = now_minute - status_watch_minute;
  if (diff > 10) {
    raise(PREFIX + "失联 " + diff + " 分钟");
  }
};

let STATUS_WATCH_ERR = 0;

export default async (now) => {
  try {
    await statusWatch(now);
    if (STATUS_WATCH_ERR) {
      send(
        "✅" + PREFIX + "恢复正常",
        "耗时 " + (now - STATUS_WATCH_ERR) + " 分钟",
      );
      STATUS_WATCH_ERR = 0;
    }
  } catch (e) {
    STATUS_WATCH_ERR = now;
    throw e;
  }
};
