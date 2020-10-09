import {Drash} from "../deps.ts";

export default class ChatResource extends Drash.Http.Resource {
  static paths = ["/chat"];
  public GET() {
    this.response.body = this.response.render("/chat.dml", {
      title: "Chatsterisk - Chat",
    });
    return this.response;
  }
}