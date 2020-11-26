//import  { VideoPage } from "./pages/video.ts";
import { CallPage } from "./pages/call.ts";

window.addEventListener("DOMContentLoaded", function () {
  if (window.location.pathname === "/video") {
    //VideoPage.init()
  }

  if (window.location.pathname === "/call") {
    CallPage.init();
  }
});
