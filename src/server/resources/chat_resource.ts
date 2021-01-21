import { Drash } from "../deps.ts";
import { csrf } from "../middleware/csrf.ts";

export default class ChatResource extends Drash.Http.Resource {
  static paths = ["/chat"];
  @Drash.Http.Middleware({
    before_request: [csrf],
    after_request: [],
  })
  public GET() {
    this.response.body = this.response.render("/chat.dml", {
      title: "Chatsterisk - Chat",
    });
    return this.response;
  }
}
