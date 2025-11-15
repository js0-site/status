#!/usr/bin/env bun

let COUNT = 0;
export default async ([srv, ip, args]) => {
  // setInterval(() => {
  //   console.log("watch", host);
  // }, 1e3);
  // await new Promise(() => {});
  if (++COUNT % 2) {
    throw new Error("test");
  }
};
