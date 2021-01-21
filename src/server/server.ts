import { config, Drash, Paladin, Tengine } from "./deps.ts";
import HomeResource from "./resources/home_resource.ts";
import CallResource from "./resources/call_resource.ts";
import ChatResource from "./resources/chat_resource.ts";
import VideoResource from "./resources/video_resource.ts";
config();

const paladin = Paladin();
const tengine = Tengine({
  render: (...args: unknown[]): boolean => {
    return false;
  },
  views_path: "./public/views",
});

const server = new Drash.Http.Server({
  directory: ".",
  resources: [
    HomeResource,
    CallResource,
    ChatResource,
    VideoResource,
  ],
  static_paths: ["/public"],
  response_output: "text/html",
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
    after_resource: [
      tengine,
    ],
  },
});

export { server };
