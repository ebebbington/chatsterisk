import { Rhum } from "../../server/tests/deps.ts";

Rhum.testPlan("tests/app_test.ts", () => {
  Rhum.testSuite("Socket", () => {
    Rhum.testCase("Returns the extension list when asked", () => {
      // Do socket.on(get-extensions)
      // do socket.to(get-extensions)
    });
  });
});

Rhum.run();
