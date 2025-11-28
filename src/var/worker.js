export default async ([srv, ip, args]) =>
  (await import("../ping/" + srv + ".js")).default(ip, ...args);
