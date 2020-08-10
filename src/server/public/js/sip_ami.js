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

let extensions = []

window.addEventListener("DOMContentLoaded", function () {

  socket.on("test", () => {
    console.log('tets got message')
  })
  setInterval(() => {
    socket.to("test", {
      channel: "test"
    })
  }, 5000)

  socket.on('get-extensions', (data) => {
    console.log('got extensions')
    const json = JSON.parse(data.text)
    extensions = json.data
    const $extensionToCallFrom = document.getElementById('extension-to-call-from')
    const $extensionToCallTo = document.getElementById('extension-to-call-to')
    extensions.forEach(extension => {
      let $option

      $option = document.createElement('option')
      $option.value = extension
      $option.innerText = extension
      $extensionToCallFrom.appendChild($option)

      $option = document.createElement('option')
      $option.value = extension
      $option.innerText = extension
      $extensionToCallTo.appendChild($option)
    })
  })
  socket.to("get-extensions", {
    channel: "get-extensions"
  })

  document.getElementById('extension-to-call-from').addEventListener('change', function () {
    console.log('changed ext to call from')
    const chosenExtension = document.getElementById('extension-to-call-from').value
    const $options = document.querySelectorAll('select#extension-to-call-to option')
    $options.forEach($option => {
      if ($option.value === chosenExtension) {
        $option.classList.add('hide')
      } else {
        $option.classList.remove('hide')
      }
    })
  })
  document.getElementById('extension-to-call-to').addEventListener('change', function (event) {
    console.log('changed ext to  call to')
    const chosenExtension = document.getElementById('extension-to-call-to').value
    const $options = document.querySelectorAll('select#extension-to-call-from option')
    $options.forEach($option => {
      if ($option.value === chosenExtension) {
        $option.classList.add('hide')
      } else {
        $option.classList.remove('hide')
      }
    })
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