import { Drash } from "../deps.ts";
import {csrf} from "../middleware/csrf.ts";

export default class CallResource extends Drash.Http.Resource {
  static paths = ["/call"];
  @Drash.Http.Middleware({
    before_request: [csrf],
    after_request: []
  })
  public GET() {
    this.response.body = this.response.render("/call.dml", {
      title: "Chatsterisk - Call",
    });
    return this.response;
  }
}
