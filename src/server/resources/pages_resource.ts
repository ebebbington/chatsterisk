import { Drash, tengine } from "../deps.ts";
import { csrf } from "../middleware/csrf.ts";

export default class PagesResource extends Drash.Resource {
  paths = ["/call", "/video", "/chat"];

  public services = {
    "GET": [csrf, tengine],
  };

  public GET(request: Drash.Request, response: Drash.Response) {
    const pathSplit = request.url.split("/");
    const path = pathSplit[pathSplit.length - 1];
    return response.render("index.dml", {
      title: `Chatsterisk - ${path[0].toUpperCase}${path.slice(1)}`,
    });
  }
}
