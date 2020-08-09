// const socket = new WebSocket("ws://0.0.0.0:1668")
// socket.onopen = function () {
//   console.log('socket conn opened')
//   socket.send(JSON.stringify({"make-call": "hello"}))
//   socket.send(JSON.stringify({to: "make-call"}))
// }
// socket.onerror = function () {
//   console.log('socket conn errored')
// }
// socket.onclose = function () {
//   console.log('socket closed')
// }
// socket.addEventListener("message", async (data) => {
//   console.log('socket got message')
//   console.log(data)
// })
import SocketClient from "https://cdn.jsdelivr.net/gh/drashland/sockets-client@latest/client.js";

const socket = new SocketClient({
  hostname: "0.0.0.0",
  port: 1668
})

window.addEventListener("DOMContentLoaded", function () {
  socket.on('made-call', function (data) {
    console.log('made call msg recieved')
    console.log(data)
  })
  socket.to("make-call", {
    channel: "make-call",
    to_extension: 6002,
    from_extension: 6001
  })
})