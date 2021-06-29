import { config, Drash, Paladin } from "./deps.ts";
import HomeResource from "./resources/home_resource.ts";
import CallResource from "./resources/call_resource.ts";
import ChatResource from "./resources/chat_resource.ts";
import VideoResource from "./resources/video_resource.ts";
config();
const paladin = Paladin();

class FilesResource extends Drash.Http.Resource {
  static paths = ["/public/:dir/:filename"];
  public GET() {
    const dir = this.request.getPathParam("dir");
    const filename = this.request.getPathParam("filename");
    const path = `./public/${dir}/${filename}`;
    const url = this.request.url;
    const mimeType = url.endsWith(".css")
      ? "text/css"
      : "application/javascript";
    try {
      const body = new TextDecoder().decode(Deno.readFileSync(path));
      this.response.body = body;
    } catch (_e) {
      const split = path.split(".");
      const ext = split[split.length - 1];
      split.pop();
      split.push("ts");
      split.push(ext);
      const newPath = split.join(".");
      const body = new TextDecoder().decode(Deno.readFileSync(newPath));
      this.response.body = body;
    }
    this.response.headers.set("Content-Type", mimeType);
    return this.response;
  }
}

const server = new Drash.Http.Server({
  directory: ".",
  resources: [
    HomeResource,
    CallResource,
    ChatResource,
    VideoResource,
    FilesResource,
  ],
  //static_paths: ["/public"],
  logger: new Drash.CoreLoggers.ConsoleLogger({
    enabled: true,
    level: "all",
    tag_string: "{datetime} | {level} |",
    tag_string_fns: {
      datetime() {
        return new Date().toISOString().replace("T", " ");
      },
    },
  }),
  middleware: {
    after_request: [
      paladin,
    ],
    // after_resource: [
    //   tengine,
    // ],
  },
});

export { server };
