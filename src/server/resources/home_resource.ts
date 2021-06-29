import { csrf } from "../middleware/csrf.ts";
import { Drash } from "../deps.ts";
const decoder = new TextDecoder()

export default class HomeResource extends Drash.Http.Resource {
  static paths = ["/", "/home"];
  public GET() {
    this.response.body = decoder.decode(Deno.readFileSync("./public/views/index.dml"));
    this.response.body = this.response.body.replace(/<% title %>/g, "Home")
    this.response.setCookie({
      name: "X-CSRF-TOKEN",
      value: csrf.token,
    });
    return this.response;
  }
}
