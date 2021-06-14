import { buildFor, Rhum } from "../deps.ts";

const selectors = {
  from_ext_select: "#extension-to-call-from",
  to_ext_select: "#extension-to-call-to",
};

Rhum.testPlan("tests/browser/call_page_test.ts", () => {
  Rhum.testSuite("Extension selection", () => {
    Rhum.testCase(
      "Both from and to selects display all extensions",
      async () => {
        const Sinco = await buildFor("chrome");
        await Sinco.goTo("http://drash_server:1667");
        await Sinco.goTo("http://drash_server:1667/call");
        const options = await Sinco.evaluatePage(({ a }) => {
          const fromSelect = document.querySelector("#extension-to-call-from");
          const fromOptions = fromSelect ? fromSelect.options : [1, 2, 3, 4, 5];
          const fromValues = [];
          for (const option of fromOptions) {
            console.log(option.value);
            fromValues.push(option.value);
          }
          const toSelect: HTMLSelectElement | null = document.querySelector(
            "#extension-to-call-to",
          );
          const toOptions = toSelect ? toSelect.options : [];
          const toValues = [];
          for (const option of toOptions) {
            toValues.push(option.value);
          }
          return {
            from: fromValues,
            to: toValues,
          };
        });
        await Sinco.done();
        Rhum.asserts.assertEquals(options, {
          to: ["", "6001", "6002"],
          from: ["", "6001", "6002"],
        });
      },
    );
    Rhum.testCase(
      "Selecting an ext from one list should rm it as an option from the other",
      async () => {
        const Sinco = await buildFor("chrome");
        await Sinco.goTo("http://drash_server:1667/call");
        const options = await Sinco.evaluatePage(() => {
          const fromSelect =
            (document.querySelector(
              "#extension-to-call-from",
            ) as HTMLSelectElement);
          fromSelect.value = "6001";
          fromSelect.dispatchEvent(new Event("change"));
          const fromSelectedExt = fromSelect.value;
          const toSelect: HTMLSelectElement | null = document.querySelector(
            "#extension-to-call-to",
          );
          const toOptions = toSelect ? toSelect.options : [];
          const extsToChooseFromForTo = [];
          for (const option of toOptions) {
            extsToChooseFromForTo.push(option.value);
          }
          return {
            fromSelectedExt,
            extsToChooseFromForTo,
          };
        });
        await Sinco.done();
        Rhum.asserts.assertEquals(options, {
          fromSelectedExt: "6001",
          extsToChooseFromForTo: ["", "6002"],
        });
      },
    );
  });
  Rhum.testSuite("Initiate call", () => {
    Rhum.testCase("Can call  one ext from another", async () => {
      // TODO :: How do we do this?
    });
  });
});

Rhum.run();
