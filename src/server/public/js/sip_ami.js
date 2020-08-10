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

  // socket.on('get-extensions', function (data) {
  //   console.log('got extensions')
  //   console.log(data)
  //   // todo populate select fields with the options
  // })
  //socket.to('get-extensions')

  document.getElementById('extension-to-call-from').addEventListener('onchange', function () {
    // todo hide the value from the to list but show all others
  })
  document.getElementById('extension-to-call-to').addEventListener('onchange', function (event) {
    // todo hide the value from the from list but show all others
  })
  document.getElementById('initiate-call').addEventListener('click', function (event) {
    const from = document.getElementById('extension-to-call-from').innerText
    const to = document.getElementById('extension-to-call-to').innerText
    socket.to("make-call", {
      channel: "make-call",
      to_extension: Number(to),
      from_extension: Number(from)
    })
  })
})