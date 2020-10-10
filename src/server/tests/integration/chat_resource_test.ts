import { Rhum } from "../deps.ts";

Rhum.testPlan("tests/integration/chat_resource_test.ts", () => {
  Rhum.testSuite("GET /chat", () => {
    Rhum.testCase("Responds with a 200 status", async () => {
      const res = await fetch("http://drash_server:1667/chat");
      await res.arrayBuffer();
      Rhum.asserts.assertEquals(res.status, 200);
    });
    Rhum.testCase("Correct data is populated in the view", async () => {
      const res = await fetch("http://drash_server:1667/chat");
      const html = await res.text();
      Rhum.asserts.assertEquals(
        html.indexOf("<title>Chatsterisk - Chat</title>") > -1,
        true,
      );
    });
  });
});

Rhum.run();
