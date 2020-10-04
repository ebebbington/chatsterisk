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

// const socket = new SocketClient({
//   hostname: "0.0.0.0",
//   port: 1668,
// });

const socketListeners = {
  "get-extensions": function (data) {
    console.log(data);
    const extensions = data.message;
    const $extensionToCallFrom = document.getElementById(
      "extension-to-call-from",
    );
    const $extensionToCallTo = document.getElementById("extension-to-call-to");
    extensions.forEach((extension) => {
      let $option;

      $option = document.createElement("option");
      $option.value = extension;
      $option.innerText = extension;
      $extensionToCallFrom.appendChild($option);

      $option = document.createElement("option");
      $option.value = extension;
      $option.innerText = extension;
      $extensionToCallTo.appendChild($option);
    });
  },
};

const client = new WebSocket("ws://0.0.0.0:1668");
client.onclose = function () {
  console.log("clint ws conn closed");
};
client.onopen = function () {
  console.log("client ws conn opened");
  client.send(JSON.stringify({
    connect_to: ["get-extensions", "make-call"],
  }));
  client.send(JSON.stringify({
    send_packet: {
      to: "get-extensions",
      message: "",
    },
  }));
};
client.onmessage = function (event) {
  console.log("client ws conn got  msg");
  if (event.data.indexOf("Connected to") > -1) {
    // connected
    console.log(event.data);
  } else {
    // msg event
    const data = JSON.parse(event.data); // { from, to, message }
    data.message = JSON.parse(data.message);
    socketListeners[data.to](data);
  }
};
client.onerror = function () {
  console.log("client ws conn errored");
};

window.addEventListener("DOMContentLoaded", function () {
  document.getElementById("extension-to-call-from").addEventListener(
    "change",
    function () {
      console.log("changed ext to call from");
      const chosenExtension =
        document.getElementById("extension-to-call-from").value;
      const $options = document.querySelectorAll(
        "select#extension-to-call-to option",
      );
      $options.forEach(($option) => {
        if ($option.value === chosenExtension) {
          $option.classList.add("hide");
        } else {
          $option.classList.remove("hide");
        }
      });
    },
  );

  document.getElementById("extension-to-call-to").addEventListener(
    "change",
    function (event) {
      console.log("changed ext to  call to");
      const chosenExtension =
        document.getElementById("extension-to-call-to").value;
      const $options = document.querySelectorAll(
        "select#extension-to-call-from option",
      );
      $options.forEach(($option) => {
        if ($option.value === chosenExtension) {
          $option.classList.add("hide");
        } else {
          $option.classList.remove("hide");
        }
      });
    },
  );

  document.getElementById("initiate-call").addEventListener(
    "click",
    function (event) {
      const from = document.getElementById("extension-to-call-from").value;
      const to = document.getElementById("extension-to-call-to").value;
      client.send(JSON.stringify({
        send_packet: {
          to: "make-call",
          message: {
            to_extension: Number(to),
            from_extension: Number(from),
          },
        },
      }));
    },
  );
});
