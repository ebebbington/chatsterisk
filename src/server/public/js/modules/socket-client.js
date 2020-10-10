export const client = new WebSocket("ws://0.0.0.0:1668");
client.onclose = function () {
  console.log("clint ws conn closed");
};
client.onerror = function () {
  console.log("client ws conn errored");
};