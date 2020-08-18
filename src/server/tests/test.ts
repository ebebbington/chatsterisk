import { Rhum } from "./deps.ts";

Rhum.testPlan("server/tests/test.ts", () => {
  Rhum.testSuite("GET /", () => {
    Rhum.testCase("Responds with a 200 status", async () => {
      const res = await fetch("http://drash_server:1667");
      await res.arrayBuffer();
      Rhum.asserts.assertEquals(res.status, 200);
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
