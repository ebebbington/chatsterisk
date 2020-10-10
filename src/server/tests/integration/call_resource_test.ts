import { Rhum } from "../deps.ts";

Rhum.testPlan("tests/integration/call_resource_test.ts", () => {
  Rhum.testSuite("GET /call", () => {
    Rhum.testCase("Responds with a 200 status", async () => {
      const res = await fetch("http://drash_server:1667/call");
      await res.arrayBuffer();
      Rhum.asserts.assertEquals(res.status, 200);
    });
    Rhum.testCase("Correct data is populated in the view", async () => {
      const res = await fetch("http://drash_server:1667/call")
      const html = await res.text()
      Rhum.asserts.assertEquals(html.indexOf("<title>Chatsterisk - Call</title>") > -1, true)
    })
  });
});

Rhum.run();