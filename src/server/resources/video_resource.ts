import { Drash } from "../deps.ts";
import { csrf } from "../middleware/csrf.ts";
const decoder = new TextDecoder()

export default class VideoResource extends Drash.Http.Resource {
  static paths = ["/video"];
  @Drash.Http.Middleware({
    before_request: [csrf],
    after_request: [],
  })
  public GET() {
    this.response.body = decoder.decode(Deno.readFileSync("./public/views/index.dml"));
    this.response.body = this.response.body.replace(/<% title %>/g, "Chatsterisk - Video")
    return this.response;
  }
}
