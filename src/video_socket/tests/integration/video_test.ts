import { deferred, Rhum } from "../deps.ts";

async function createWebSocketClient(): Promise<WebSocket> {
  const client = new WebSocket("ws://video_socket:1669");
  const promise = deferred();
  client.onopen = function () {
    promise.resolve();
  };
  await promise;
  return client;
}

async function waitForConnectedToChannelEvent(
  client: WebSocket,
): Promise<void> {
  const promise = deferred();
  client.onmessage = function (ev) {
    if (ev.data.indexOf("Connected to") > -1) {
      promise.resolve();
    }
  };
  await promise;
}

async function waitForMessage(
  client: WebSocket,
  thenClose?: boolean,
  // deno-lint-ignore no-explicit-any
): Promise<any> {
  const promise1 = deferred();
  // deno-lint-ignore no-explicit-any
  const promise2: any = deferred();
  client.onmessage = function (ev) {
    if (ev.data.indexOf("Connected to") > -1) {
      return;
    }
    if (thenClose) {
      client.close();
    }
    promise1.resolve(ev);
  };
  client.onclose = function () {
    promise2.resolve();
  };
  // deno-lint-ignore no-explicit-any
  const msg: any = await promise1;
  if (thenClose) {
    await promise2;
  }
  try {
    return JSON.parse(JSON.parse(msg.data).message);
  } catch (err) {
    return JSON.parse(msg.data).message;
  }
}

async function closeClient(client: WebSocket): Promise<void> {
  const promise = deferred();
  client.onclose = function () {
    promise.resolve();
  };
  client.close();
  await promise;
}

Rhum.testPlan("tests/integration/video_test.ts", () => {
  Rhum.testSuite("Room event", () => {
    Rhum.testCase("Sends the room the user is in when requested", async () => {
      // needs two sockets connected
      const client = await createWebSocketClient();
      const client2 = await createWebSocketClient();
      client.send(JSON.stringify({
        connect_to: ["room"],
      }));
      await waitForConnectedToChannelEvent(client);
      client2.send(JSON.stringify({
        connect_to: ["room"],
      }));
      await waitForConnectedToChannelEvent(client2);
      client.send(JSON.stringify({
        send_packet: {
          to: "room",
          message: "",
        },
      }));
      const message = await waitForMessage(client, true) as {
        myId: number;
        users: [number];
        name: string;
      };
      const message2 = await waitForMessage(client2, true) as {
        myId: number;
        users: [number];
        name: string;
      };
      Rhum.asserts.assert(!!message.name);
      Rhum.asserts.assert(!!message.myId);
      Rhum.asserts.assert(message.users.length === 1);
      Rhum.asserts.assert(message.myId !== message.users[0]);
      Rhum.asserts.assert(message.myId === message2.users[0]);
      Rhum.asserts.assert(!!message2.name);
      Rhum.asserts.assert(!!message2.myId);
      Rhum.asserts.assert(message2.users.length === 1);
      Rhum.asserts.assert(message2.myId !== message2.users[0]);
      Rhum.asserts.assert(message2.myId === message.users[0]);
    });
    Rhum.testCase(
      "Client gets event when the other user in the room leaves",
      async () => {
        const client = await createWebSocketClient();
        const client2 = await createWebSocketClient();
        client.send(JSON.stringify({
          connect_to: ["room"],
        }));
        await waitForConnectedToChannelEvent(client);
        client2.send(JSON.stringify({
          connect_to: ["room"],
        }));
        await waitForConnectedToChannelEvent(client2);
        await closeClient(client);
        const message = await waitForMessage(client2, true);
        console.log(message); // TODO :: Hangs because wocket doesnt send a disconnect event to the server
      },
    );
  });
  Rhum.testSuite("Call User Event", () => {
    Rhum.testCase(
      "When sending event, other client in the room should get an call-made event",
      async () => {
        const client = await createWebSocketClient();
        const client2 = await createWebSocketClient();
        client.send(JSON.stringify({
          connect_to: ["call-user", "room"],
        }));
        await waitForConnectedToChannelEvent(client);
        client2.send(JSON.stringify({
          connect_to: ["call-user", "call-made"],
        }));
        await waitForConnectedToChannelEvent(client2);
        // get client 1's id
        client.send(JSON.stringify({
          send_packet: {
            to: "room",
            message: "",
          },
        }));
        const roomRes = await waitForMessage(client);
        const client1Id = roomRes.myId;
        const client2Id = roomRes.users[0];
        client.send(JSON.stringify({
          send_packet: {
            to: "call-user",
            message: {
              to: client2Id,
              offer: "My offer :)",
            },
          },
        }));
        const msg = await waitForMessage(client2);
        await closeClient(client);
        await closeClient(client2);
        Rhum.asserts.assertEquals(msg, {
          offer: "My offer :)",
          socket: client1Id,
        });
      },
    );
  });
  Rhum.testSuite("Make Answer Event", () => {
    Rhum.testCase(
      "When sending the event, other client should receive a answer-made event",
      async () => {
        const client = await createWebSocketClient();
        const client2 = await createWebSocketClient();
        client.send(JSON.stringify({
          connect_to: ["make-answer"],
        }));
        await waitForConnectedToChannelEvent(client);
        client2.send(JSON.stringify({
          connect_to: ["make-answer", "answer-made"],
        }));
        await waitForConnectedToChannelEvent(client2);
        // get client 1's id
        client.send(JSON.stringify({
          send_packet: {
            to: "room",
            message: "",
          },
        }));
        const roomRes = await waitForMessage(client);
        const client1Id = roomRes.myId;
        const client2Id = roomRes.users[0];
        client.send(JSON.stringify({
          send_packet: {
            to: "make-answer",
            message: {
              to: client2Id,
              offer: "My answer :)",
            },
          },
        }));
        const msg = await waitForMessage(client2);
        await closeClient(client);
        await closeClient(client2);
        Rhum.asserts.assertEquals(msg, {
          offer: "My answer :)",
          socket: client1Id,
        });
      },
    );
  });
});

Rhum.run();

//import "mocha";
// const chai = require('chai')
// const expect = chai.expect
// const sinon = require('sinon')
// chai.should()
// import SocketIO from "socket.io-client"
//
// describe('Socket Server', () => {
//
//     describe('Methods', () => {
//
//         describe('`handle`', function () {
//
//             it('Should join a room on connection', (done) => {
//                 const client1 = SocketIO('http://127.0.0.1:9009')
//                 client1.on('connect', () => {
//                     expect(client1.connected).to.equal(true)
//                     client1.disconnect();
//                     done();
//                 })
//             })
//
//             it('Should emit the room when requested', (done) => {
//                 const client1 = SocketIO('http://127.0.0.1:9009')
//                 client1.on('room', (data: { myId: string, users: string[], name: string }) => {
//                     //console.log(client)
//                     expect(data.myId).to.exist
//                     expect(data.users).to.exist
//                     expect(data.users.length).to.equal(0)
//                     expect(data.name).to.exist
//                     client1.disconnect()
//                     done()
//                 })
//                 client1.emit('room')
//             })
//
//             it('Should emit the room when disconnected', async function () {
//                 this.timeout(10000)
//                 const client1 = SocketIO('http://127.0.0.1:9009', {multiplex: false})
//                 const client2 = SocketIO('http://127.0.0.1:9009', {multiplex: false})
//                 setTimeout(() => {
//                     client2.disconnect()
//                 }, 1000)
//                 await client1.on('room', (data: any) => {
//                     expect(data).to.exist
//                     client1.disconnect()
//                 })
//             })
//
//             it('Should send an offer to the other user on `call-user`', async () => {
//                 const client1 = SocketIO('http://127.0.0.1:9009', {multiplex: false})
//                 const client2 = SocketIO('http://127.0.0.1:9009', {multiplex: false})
//                 const client1Id = client1.id
//                 const offer = { test: 'test' }
//                 setTimeout(() => {
//                     client1.emit('call-user', { to: client2.id, offer: offer })
//                 }, 1000)
//                 await client2.on('call-made', (data: any) => {
//                     expect(data.id).to.equal(client1Id)
//                     expect(data.offer.test).to.equal(offer.test)
//                     client1.disconnect()
//                     client2.disconnect()
//                 })
//             })
//
//             it('Should send an answer and a `make-answer` was made', async () => {
//                 const client1 = SocketIO('http://127.0.0.1:9009', {multiplex: false})
//                 const client2 = SocketIO('http://127.0.0.1:9009', {multiplex: false})
//                 const client2Id = client2.id
//                 const answer = { test: 'test' }
//                 setTimeout(() => {
//                     client2.emit('make-answer', { to: client1.id, answer: answer })
//                 }, 1000)
//                 await client1.on('answer-made', (data: any) => {
//                     expect(data.id).to.equal(client2Id)
//                     expect(data.answer.test).to.equal(answer.test)
//                     client1.disconnect()
//                     client2.disconnect()
//                 })
//             })
//
//         })
//
//     })
//
// })
