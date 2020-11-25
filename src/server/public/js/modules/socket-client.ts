import SocketClient from "https://cdn.jsdelivr.net/gh/drashland/sockets-client@latest/client.js";

const sockets = {
  chat: 1667,
  sip: 1668,
  rtc: 1669
}

export function createSocketClient (webSocketType: "chat" | "sip" | "rtc") {
  const client = new SocketClient({
    hostname: "0.0.0.0",
    port: sockets[webSocketType]
  })
  return client
}

// export const client = new WebSocket("ws://0.0.0.0:1668");
// client.onclose = function () {
//   console.log("clint ws conn closed");
// };
// client.onerror = function () {
//   console.log("client ws conn errored");
// };
