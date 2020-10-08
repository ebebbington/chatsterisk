import { deferred, Rhum } from "../deps.ts";

Rhum.testPlan("tests/integration/socket_test.ts", () => {
  Rhum.testSuite("Connecting", () => {
    // Needs to be deno v1.4.0, but denon doesnt work currently with 1.4.0
    Rhum.testCase("Client can connect to socket server", async () => {
      const promise = deferred()
      const client = new WebSocket("ws://ami_socket:1668")
      let connected = false
      client.onopen = function () {
        connected = true
        client.close()
      }
      client.onclose = function () {
        Rhum.asserts.assertEquals(connected, true)
        promise.resolve()
      }
      await promise;
    })
  });
  Rhum.testSuite("Events", async () => {
    Rhum.testCase("Client gets all peer entries when connected", async () => {
      const promise = deferred()
      const client = new WebSocket("ws://ami_socket:1668")
      let extensions = []
      client.onopen = function () {
        client.send(JSON.stringify({
          connect_to: ["get-extensions"]
        }))
        client.send(JSON.stringify({
          send_packet: {
            to: "get-extensions",
            message: "",
          },
        }));
      }
      client.onmessage = function (msg) {
        if (msg.data.indexOf("Connected to") === -1) {
          const data = JSON.parse(msg.data)
          Rhum.asserts.assertEquals(data, {
            from: "Server",
            to: "get-extensions",
            message: "[6001,6002]"
          })
          client.close()
        }
      }
      client.onclose = function () {
        promise.resolve()
      }
      await promise;
    });
  });
});

Rhum.run();
