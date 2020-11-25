import { Drash } from "../deps.ts";

export default class CallResource extends Drash.Http.Resource {
  static paths = ["/call"];
  public GET() {
    this.response.body = this.response.render("/call.dml", {
      title: "Chatsterisk - Call",
    });


    return this.response;
  }
}