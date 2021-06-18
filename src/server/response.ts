import { Drash } from "./deps.ts";

export default class Response extends Drash.Http.Response {
  public generateResponse(): string {
    const acceptHeaders = this.request.headers.get("accept")!.split(";")[0];
    const wantsJson = acceptHeaders.indexOf("application/json") > -1;
    const wantsXml = acceptHeaders.indexOf("application/xml") > -1 ||
      acceptHeaders.indexOf("text/xml") > -1;
    const wantsPlain = acceptHeaders.indexOf("text/plain") > -1;
    const wantsHtml = acceptHeaders.indexOf("text/html") > -1;
    const wantsAny = acceptHeaders.indexOf("*/*") > -1;
    const wantsCss = acceptHeaders.indexOf("text/css") > -1;
    const wantsJs = acceptHeaders.indexOf("text/javascript") > -1 ||
      acceptHeaders.indexOf("application/javascript") > -1;
    if (wantsJson) {
      if (typeof this.body !== "string") {
        throw new Error("The body isn't a string, what are you doing?");
      }
      const schema: {
        success: boolean;
        statusCode: number;
        statusText: string | null;
        data: { [key: string]: string | number | { [key: string]: string } };
        message: string;
        Accept: string;
        request: { method: string; uri: string };
      } = {
        success: JSON.parse(this.body).success || false,
        statusCode: this.status_code,
        statusText: this.getStatusMessage(),
        data: JSON.parse(this.body).data,
        message: JSON.parse(this.body).message,
        Accept: acceptHeaders,
        request: {
          method: this.request.method.toUpperCase(),
          uri: this.request.url,
        },
      };
      return JSON.stringify(schema);
    }
    if (wantsXml) {
      console.log("you want xml");
    }
    if (wantsHtml || wantsJs || wantsCss || wantsPlain || wantsAny) {
      const pattern = new RegExp("([4-5][0-9][0-9])");
      if (pattern.test(this.status_code.toString())) {
        const decoder = new TextDecoder();
        const view = decoder.decode(
          Deno.readFileSync("./public/views/error.html"),
        );
        const _errorMessage = "URI " + this.request.url + " doesn't exist";
        this.body = view
          .replace(/\{\{ statusCode \}\}/g, this.status_code.toString())
          .replace(/\{\{ uri \}\}/g, this.request.url)
          .replace(/\{\{ title \}\}/g, this.status_code.toString());
      }
      if (typeof this.body !== "string") {
        this.body = "";
        return this.body;
      }
      return this.body;
    }
    throw new Error("Content type request is not supported");
  }
}
