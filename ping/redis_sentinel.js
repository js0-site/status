import Redis from "ioredis";
import pair from "@3-/pair";
import raise from "@3-/raise";
import int from "@3-/int";

export default async (host, { port, password, cluster }, ip_name) => {
  ip_name = new Map(ip_name);
  const s = new Redis({
      port,
      host,
      password,
    }),
    p = s.pipeline(),
    err_li = [],
    addErr = (ip, port, msg) => {
      err_li.push(ip_name.get(ip) + " " + ip + ":" + port + " " + msg);
    };

  cluster.forEach((name) => p.sentinel("slaves", name));
  p.info("sentinel");
  const result = await p.exec(),
    info = result.pop()[1].split("\n");

  cluster = new Set(cluster);

  for (const line of info) {
    if (line.startsWith("master")) {
      const map = new Map(
          line
            .trimEnd()
            .slice(line.indexOf(":") + 1)
            .split(",")
            .map((i) => i.split("=")),
        ),
        name = map.get("name"),
        [ip, port] = map.get("address").split(":"),
        status = map.get("status");
      cluster.delete(name);
      if (status != "ok" || 1) {
        addErr(ip, port, status);
      }
    }
  }
  //
  //     console.log(map);
  //     if (status != "ok") {
  //       genErr(master_ip, status);
  //     } else if (slaves < 2 || 1) {
  //       let err = genErr(master_ip, "从库只有 " + slaves + "个");
  //       (await s.sentinel("slaves", name)).forEach((li) => {
  //         const m = new Map(pair(li)),
  //           ip_port = m.get("ip") + ":" + m.get("port");
  //
  //         if (ip_port == master_address) {
  //           return;
  //         }
  //         if (
  //           m.get("master-host") + ":" + m.get("master-port") ==
  //           master_address
  //         ) {
  //           console.log(ip_port, m);
  //         }
  //       });
  //       err_li.push(err);
  //     } else if (sentinels < 3) {
  //     }
  //   }
  // }
  //
  if (cluster.size) {
    err_li.push("哨兵配置缺少集群: " + [...cluster].join(" & "));
  }
  raise(err_li);
};
