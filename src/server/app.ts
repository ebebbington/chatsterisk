import { Drash } from "https://deno.land/x/drash@v1.2.2/mod.ts"
import { Paladin } from "https://deno.land/x/drash_middleware@v0.4.0/paladin/mod.ts";
import { config } from "https://deno.land/x/dotenv@v0.5.0/mod.ts";

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

console.log(`Server running on ${server.hostname}:${server.port}`)