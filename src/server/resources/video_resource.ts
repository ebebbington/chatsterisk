import { Drash } from "../deps.ts";

export default class VideoResource extends Drash.Http.Resource {
  static paths = ["/video"];
  public GET() {
    this.response.body = this.response.render("/video.dml", {
      title: "Chatsterisk - Video",
    });
    return this.response;
  }
}
