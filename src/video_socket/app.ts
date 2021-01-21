import { Video } from "./src/video.ts";

const server = new Video();
await server.start();

console.log("Web socket server started");
