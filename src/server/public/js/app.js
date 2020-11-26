function deferred() {
  let methods;
  const promise = new Promise((resolve, reject) => {
    methods = {
      resolve,
      reject,
    };
  });
  return Object.assign(promise, methods);
}
async function createWebSocketClient(options) {
  const prom = deferred();
  const client = new WebSocket("ws://0.0.0.0:1668");
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
function handleGetExtensions(message) {
  const extensions = message;
  const $extensionToCallFrom = document.getElementById(
    "extension-to-call-from",
  );
  const $extensionToCallTo = document.getElementById("extension-to-call-to");
  message.forEach((extension) => {
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
}
async function init() {
  const client = await createWebSocketClient({
    port: 1668,
  });
  client.send(JSON.stringify({
    connect_to: [
      "get-extensions",
      "make-call",
    ],
  }));
  client.onmessage = function (msg) {
    if (msg.data.indexOf("Connected to") > -1) {
      return;
    }
    const data = JSON.parse(msg.data);
    data.message = JSON.parse(data.message);
    if (data.to === "get-extensions") {
      handleGetExtensions(data.message);
    }
  };
  client.send(JSON.stringify({
    send_packet: {
      to: "get-extensions",
      data: "",
    },
  }));
  document.getElementById("extension-to-call-from").addEventListener(
    "change",
    function () {
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
}
const CallPage = {
  init,
};
window.addEventListener("DOMContentLoaded", function () {
  if (window.location.pathname === "/video") {
  }
  if (window.location.pathname === "/call") {
    CallPage.init();
  }
});
