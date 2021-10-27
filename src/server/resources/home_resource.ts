import { csrf } from "../middleware/csrf.ts";
import { Drash, tengine } from "../deps.ts";

export default class HomeResource extends Drash.Resource {
  paths = ["/", "/home"];
  public services = {
    "GET": [tengine],
  };
  public GET(_request: Drash.Request, response: Drash.Response) {
    response.setCookie({
      name: "X-CSRF-TOKEN",
      value: csrf.token,
    });
    return response.render("index.dml", {
      title: "Chatsterisk - Home",
    });
  }
}
