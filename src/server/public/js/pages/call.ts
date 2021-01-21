//import { c } from "../modules/socket-client.ts";

import { createWebSocketClient } from "../modules/socket-client.ts";

function handleGetExtensions(message: string[]) {
  const extensions = message;
  const $extensionToCallFrom = document.getElementById(
    "extension-to-call-from",
  );
  const $extensionToCallTo = document.getElementById("extension-to-call-to");
  extensions.forEach((extension: any) => {
    let $option;

    $option = document.createElement("option");
    $option.value = extension;
    $option.innerText = extension;
    $extensionToCallFrom!.appendChild($option);

    $option = document.createElement("option");
    $option.value = extension;
    $option.innerText = extension;
    $extensionToCallTo!.appendChild($option);
  });
}

async function init() {
  const client = await createWebSocketClient({ port: 1668 });

  client.send(JSON.stringify({
    connect_to: ["get-extensions", "make-call"],
  }));

  client.onmessage = function (msg) {
    if (msg.data.indexOf("Connected to") > -1) {
      return;
    }
    const data = JSON.parse(msg.data); // { from, to, message }
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

  //const client = new WebSocket("ws://0.0.0.0:1668");
  //   client.onopen = function () {
  //     console.log("client ws conn opened");
  //     client.send(JSON.stringify({
  //       connect_to: ["call.get-extensions", "call.make-call"],
  //     }));
  //     client.send(JSON.stringify({
  //       send_packet: {
  //         to: "call.get-extensions",
  //         message: "",
  //       },
  //     }));
  //   };
  //   client.onmessage = function (event) {
  //     console.log("client ws conn got  msg");
  //     if (event.data.indexOf("Connected to") > -1) {
  //       // connected
  //       console.log(event.data);
  //     } else {
  //       // msg event
  //       console.log(event);
  //       const data = JSON.parse(event.data); // { from, to, message }
  //       data.message = JSON.parse(data.message);
  //       socketListeners[ data.to as string ](data);
  //     }
  //   };

  document.getElementById("extension-to-call-from")!.addEventListener(
    "change",
    function () {
      const chosenExtension =
        // @ts-ignore
        document.getElementById("extension-to-call-from")!.value;
      const $options = document.querySelectorAll(
        "select#extension-to-call-to option",
      );
      $options.forEach(($option: any) => {
        if ($option.value === chosenExtension) {
          $option.classList.add("hide");
        } else {
          $option.classList.remove("hide");
        }
      });
    },
  );

  document.getElementById("extension-to-call-to")!.addEventListener(
    "change",
    function (event) {
      const chosenExtension =
        // @ts-ignore
        document.getElementById("extension-to-call-to").value;
      const $options: any = document.querySelectorAll(
        "select#extension-to-call-from option",
      );
      $options.forEach(($option: any) => {
        if ($option.value === chosenExtension) {
          $option.classList.add("hide");
        } else {
          $option.classList.remove("hide");
        }
      });
    },
  );

  document.getElementById("initiate-call")!.addEventListener(
    "click",
    function (event) {
      // @ts-ignore
      const from: any = document.getElementById("extension-to-call-from").value;
      // @ts-ignore
      const to: any = document.getElementById("extension-to-call-to")!.value;
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

export const CallPage = {
  init,
};
