import { deferred, Rhum } from "../deps.ts";

// todo add tests then convert to destiny is another ticket

async function createWebSocketClient(): Promise<WebSocket> {
  const client = new WebSocket("ws://chat_socket:1670");
  const promise = deferred();
  client.onopen = function () {
    promise.resolve();
  };
  await promise;
  return client;
}

// deno-lint-ignore no-explicit-any
async function waitForMessageThenClose(
  client: WebSocket,
  close = true,
): Promise<any> {
  const promise1 = deferred();
  // deno-lint-ignore no-explicit-any
  const promise2: any = deferred();
  client.onmessage = function (ev) {
    if (ev.data.indexOf("Connected to") > -1) {
      return;
    }
    if (close === true) {
      client.close();
    }
    promise1.resolve(ev);
  };
  client.onclose = function () {
    promise2.resolve();
  };
  // deno-lint-ignore no-explicit-any
  const msg: any = await promise1;
  if (close) {
    await promise2;
  }
  return JSON.parse(JSON.parse(msg.data).message);
}

Rhum.testPlan("tests/integration/chat_test.ts", () => {
  Rhum.testSuite("Event Handlers", () => {
    Rhum.testCase("Send message to 'user-message' listener", async () => {
      const client = await createWebSocketClient();
      client.send(JSON.stringify({
        connect_to: ["chat-message"],
      }));
      client.send(JSON.stringify({
        send_packet: {
          to: "chat-message",
          message: {
            username: "Edward :)",
            message: "Hello from test",
          },
        },
      }));
      const message = await waitForMessageThenClose(client);
      Rhum.asserts.assertEquals(message, {
        message: "Hello from test",
        username: "Edward :)",
      });
    });
    Rhum.testCase("Send message to 'user-joined' listener", async () => {
      const client1 = await createWebSocketClient();
      client1.send(JSON.stringify({
        connect_to: ["user-joined", "chat-message", "users-online"],
      }));
      client1.send(JSON.stringify({
        send_packet: {
          to: "user-joined",
          message: {
            username: "Simon",
          },
        },
      }));
      const message1 = await waitForMessageThenClose(client1, false);
      Rhum.asserts.assertEquals(message1, {
        username: "Simon",
        message: "has joined",
      });
      const message2 = await waitForMessageThenClose(client1, false);
      Rhum.asserts.assertEquals(message2, {
        usersOnline: ["Simon"],
      });
      const client2 = await createWebSocketClient();
      client2.send(JSON.stringify({
        connect_to: ["user-joined", "chat-message", "users-online"],
      }));
      client2.send(JSON.stringify({
        send_packet: {
          to: "user-joined",
          message: {
            username: "Harry",
          },
        },
      }));
      const message3 = await waitForMessageThenClose(client2, false);
      Rhum.asserts.assertEquals(message3, {
        username: "Harry",
        message: "has joined",
      });
      const message4 = await waitForMessageThenClose(client2, false);
      Rhum.asserts.assertEquals(message4, {
        usersOnline: ["Simon", "Harry"],
      });
      const [p1, p2] = [deferred(), deferred()];
      client1.onclose = () => {
        p1.resolve();
      };
      client2.onclose = () => {
        p2.resolve();
      };
      client1.close();
      client2.close();
      await p1;
      await p2;
    });
    Rhum.testCase("Send message to 'user-left' listener", async () => {
      const client1 = await createWebSocketClient();
      client1.send(JSON.stringify({
        connect_to: [
          "user-joined",
          "chat-message",
          "users-online",
          "user-left",
        ],
      }));
      client1.send(JSON.stringify({
        send_packet: {
          to: "user-joined",
          message: {
            username: "Simon",
          },
        },
      }));
      const message1 = await waitForMessageThenClose(client1, false);
      Rhum.asserts.assertEquals(message1, {
        username: "Simon",
        message: "has joined",
      });
      const message2 = await waitForMessageThenClose(client1, false);
      Rhum.asserts.assertEquals(message2, {
        usersOnline: ["Simon"],
      });
      const client2 = await createWebSocketClient();
      client2.send(JSON.stringify({
        connect_to: [
          "user-joined",
          "chat-message",
          "users-online",
          "user-left",
        ],
      }));
      client2.send(JSON.stringify({
        send_packet: {
          to: "user-joined",
          message: {
            username: "Harry",
          },
        },
      }));
      const message3 = await waitForMessageThenClose(client2, false);
      Rhum.asserts.assertEquals(message3, {
        username: "Harry",
        message: "has joined",
      });
      const message4 = await waitForMessageThenClose(client2, false);
      Rhum.asserts.assertEquals(message4, {
        usersOnline: ["Simon", "Harry"],
      });
      client2.send(JSON.stringify({
        send_packet: {
          to: "user-left",
          message: {
            username: "Harry",
          },
        },
      }));
      const message5 = await waitForMessageThenClose(client1);
      Rhum.asserts.assertEquals(message5, {
        message: "has left",
        username: "Harry",
      });
      const [p2] = [deferred()];
      client2.onclose = () => {
        p2.resolve();
      };
      client2.close();
      await p2;
    });
  });
});

Rhum.run();
