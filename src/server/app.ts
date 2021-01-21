import { server } from "./server.ts";
import { config } from "./deps.ts";
await server.run({
  hostname: config().SERVER_HOSTNAME,
  port: Number(config().SERVER_PORT),
});

console.log(`Server running on ${server.hostname}:${server.port}`);

// const require = createRequire(import.meta.url);
// const AmiClient = require('asterisk-ami-client');
//
// let client = new AmiClient({
//   reconnect: true,
//   keepAlive: true
// });
//
// client.connect('user', 'secret', {host: 'localhost', port: 5038})
//     .then(() => {
//
//       client
//           .on('event', (event: any) => console.log(event))
//           .on('response', (response: any) => {
//             console.log(response);
//             client.disconnect();
//           })
//           .on('internalError', (error: any) => console.log(error));
//
//       client.action({Action: 'Ping'});
//
//     })
//     .catch((error: any) => console.log(error));
