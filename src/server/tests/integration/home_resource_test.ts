import { Rhum } from "../deps.ts";

Rhum.testPlan("tests/integration/home_resource_test.ts", () => {
  Rhum.testSuite("GET /", () => {
    Rhum.testCase("Responds with a 200 status", async () => {
      const res = await fetch("http://drash_server:1667");
      await res.arrayBuffer();
      Rhum.asserts.assertEquals(res.status, 200);
    });
    Rhum.testCase("Correct data is populated in the view", async () => {
      const res = await fetch("http://drash_server:1667");
      const html = await res.text();
      console.log(html);
      Rhum.asserts.assertEquals(
        html.indexOf("<title>Chatsterisk - Home</title>") > -1,
        true,
      );
    });
  });
  Rhum.testSuite("GET /home", () => {
    Rhum.testCase("Responds with a 200 status", async () => {
      const res = await fetch("http://drash_server:1667/home");
      await res.arrayBuffer();
      Rhum.asserts.assertEquals(res.status, 200);
    });
  });
});

Rhum.run();
