import { Rhum } from "../deps.ts";
import { getToken } from "./utils.ts";

Rhum.testPlan("tests/integration/chat_resource_test.ts", () => {
  Rhum.testSuite("GET /chat", () => {
    Rhum.testCase("Responds with a 200 status", async () => {
      const token = await getToken();
      const res = await fetch("http://drash_server:1667/chat", {
        headers: {
          "Cookie": "X-CSRF-TOKEN=" + token,
        },
        credentials: "same-origin",
      });
      await res.arrayBuffer();
      Rhum.asserts.assertEquals(res.status, 200);
    });
    Rhum.testCase("Correct data is populated in the view", async () => {
      const token = await getToken();
      const res = await fetch("http://drash_server:1667/chat", {
        headers: {
          "Cookie": "X-CSRF-TOKEN=" + token,
        },
        credentials: "same-origin",
      });
      const html = await res.text();
      Rhum.asserts.assertEquals(
        html.indexOf("<title>Chatsterisk - Chat</title>") > -1,
        true,
      );
    });
    Rhum.testCase(
      "Should respond with 400 if no token in request",
      async () => {
        const res = await fetch("http://drash_server:1667/chat");
        await res.text();
        Rhum.asserts.assertEquals(res.status, 400);
      },
    );
  });
});

Rhum.run();
