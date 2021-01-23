// import SocketClient from "https://cdn.jsdelivr.net/gh/drashland/sockets-client@latest/client.js";

export interface Deferred<T> extends Promise<T> {
  resolve: (value?: T | PromiseLike<T>) => void;
  // deno-lint-ignore no-explicit-any
  reject: (reason?: any) => void;
}

export function deferred<T>(): Deferred<T> {
  let methods;
  const promise = new Promise<T>((resolve, reject): void => {
    methods = { resolve, reject };
  });
  return Object.assign(promise, methods) as Deferred<T>;
}
//
// export function createSocketClient (webSocketType: "chat" | "sip" | "rtc"): SocketClient {
//   const client = new SocketClient({
//     hostname: "0.0.0.0",
//     port: sockets[webSocketType]
//   })
//   return client
// }

export async function createWebSocketClient(options: { port: number }) {
  const prom = deferred();
  const client = new WebSocket("ws://0.0.0.0:" + options.port);
  client.onopen = function () {
    prom.resolve();
  };
  client.onerror = function (e) {
    console.log("client got error");
    console.log(e);
  };
  await prom;
  console.log("ws client connected");
  return client;
}
// client.onclose = function () {
//   console.log("clint ws conn closed");
// };
// client.onerror = function () {
//   console.log("client ws conn errored");
// };
