import { Drash } from "../deps.ts";
import { csrf } from "../middleware/csrf.ts";

export default class VideoResource extends Drash.Http.Resource {
  static paths = ["/video"];
  @Drash.Http.Middleware({
    before_request: [csrf],
    after_request: [],
  })
  public GET() {
    this.response.body = this.response.render("/video.dml", {
      title: "Chatsterisk - Video",
    });
    return this.response;
  }
}
