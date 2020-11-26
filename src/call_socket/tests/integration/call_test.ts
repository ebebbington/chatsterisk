import { deferred, Rhum } from "../deps.ts";

async function createWebSocketClient(): Promise<WebSocket> {
  const client = new WebSocket("ws://call_socket:1668");
  const promise = deferred();
  client.onopen = function () {
    promise.resolve();
  };
  await promise;
  return client;
}

// deno-lint-ignore no-explicit-any
async function waitForMessageThenClose(client: WebSocket): Promise<any> {
  const promise1 = deferred();
  // deno-lint-ignore no-explicit-any
  const promise2: any = deferred();
  client.onmessage = function (ev) {
    if (ev.data.indexOf("Connected to") > -1) {
      return;
    }
    client.close();
    promise1.resolve(ev);
  };
  client.onclose = function () {
    promise2.resolve();
  };
  // deno-lint-ignore no-explicit-any
  const msg: any = await promise1;
  await promise2;
  return JSON.parse(JSON.parse(msg.data).message);
}

Rhum.testPlan("tests/integration/call_test.ts", () => {
  Rhum.testSuite("Event Handlers", async () => {
    Rhum.testCase("Client gets all peer entries when connected", async () => {
      const promise = deferred();
      const client = await createWebSocketClient();
      client.send(JSON.stringify({
        connect_to: ["get-extensions"],
      }));
      client.send(JSON.stringify({
        send_packet: {
          to: "get-extensions",
          message: "",
        },
      }));
      const message = await waitForMessageThenClose(client);
      Rhum.asserts.assertEquals(message, [6001, 6002]);
    });
  });
});

Rhum.run();
