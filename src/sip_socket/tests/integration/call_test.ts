import { deferred, Rhum } from "../deps.ts";

Rhum.testPlan("tests/integration/call_test.ts", () => {
  Rhum.testSuite("Events", async () => {
    Rhum.testCase("Client gets all peer entries when connected", async () => {
      const promise = deferred();
      const client = new WebSocket("ws://socket:1668");
      const extensions = [];
      client.onopen = function () {
        client.send(JSON.stringify({
          connect_to: ["call.get-extensions"],
        }));
        client.send(JSON.stringify({
          send_packet: {
            to: "call.get-extensions",
            message: "",
          },
        }));
      };
      client.onmessage = function (msg) {
        if (msg.data.indexOf("Connected to") === -1) {
          const data = JSON.parse(msg.data);
          Rhum.asserts.assertEquals(data, {
            from: "Server",
            to: "call.get-extensions",
            message: "[6001,6002]",
          });
          client.close();
        }
      };
      client.onclose = function () {
        promise.resolve();
      };
      await promise;
    });
  });
});

Rhum.run();
