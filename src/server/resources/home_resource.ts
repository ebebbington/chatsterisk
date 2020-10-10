import { Drash } from "../deps.ts";

export default class HomeResource extends Drash.Http.Resource {
  static paths = ["/", "/home"];
  public GET() {
    this.response.body = this.response.render("/index.dml", {
      title: "Chatsterisk - Home",
    });
    return this.response;
  }
}
