import { config, Drash, Paladin } from "./deps.ts";
import HomeResource from "./resources/home_resource.ts";
import PagesResource from "./resources/pages_resource.ts";
config();
const paladin = new Paladin();

class FilesResource extends Drash.Resource {
  paths = ["/public/:dir/:filename"];
  public GET(request: Drash.Request, response: Drash.Response) {
    const dir = request.pathParam("dir");
    const filename = request.pathParam("filename");
    const path = `./public/${dir}/${filename}`;
    return response.file(path);
  }
}

const server = new Drash.Server({
  resources: [
    HomeResource,
    PagesResource,
    FilesResource,
  ],
  services: [
    paladin,
  ],
  hostname: config().SERVER_HOSTNAME,
  port: Number(config().SERVER_PORT),
  protocol: "http",
});

export { server };
