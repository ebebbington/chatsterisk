import { Drash, Paladin, config } from "./deps.ts"

config();
const paladin = Paladin();

class HomeResource extends Drash.Http.Resource {
  static paths = ["/", "/home"];
  public GET () {
    this.response.body = this.response.render("/index.html", {
      title: "Chatsterisk - Home"
    });
    return this.response
  }
}

const server = new Drash.Http.Server({
  directory: ".",
  resources: [
      HomeResource
  ],
  static_paths: ["/public"],
  views_path: "./public/views",
  template_engine: true,
  response_output: "text/html",
  logger: new Drash.CoreLoggers.ConsoleLogger({
    enabled: true,
    level: "all",
    tag_string: "{datetime} | {level} |",
    tag_string_fns: {
      datetime() {
        return new Date().toISOString().replace("T", " ");
      }
    }
  }),
  middleware: {
    before_request: [
        paladin
    ]
  }
});

await server.run({
  hostname: config().SERVER_HOSTNAME,
  port: Number(config().SERVER_PORT)
});

console.log(`Server running on ${server.hostname}:${server.port}`);

// @ts-ignore
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