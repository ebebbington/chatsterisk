import { Rhum, buildFor } from "../deps.ts";

Rhum.testPlan("tests/browser/home_page_test.ts", () => {
    Rhum.testSuite("Navigation links", () => {
        Rhum.testCase("Call link should dislay and work", async () => {
            const Sinco = await buildFor("chrome");
            await Sinco.goTo("http://drash_server:1667");
            await Sinco.assertSee(`<a href="/call">`)
            await Sinco.click('a[href="/call"]');
            await Sinco.waitForPageChange();
            await Sinco.assertUrlIs("http://drash_server:1667/call");
            await Sinco.done();
        })
        Rhum.testCase("Chat link should display and work", async () => {
            const Sinco = await buildFor("chrome");
            await Sinco.goTo("http://drash_server:1667");
            await Sinco.assertSee(`<a href="/chat">`)
            await Sinco.click('a[href="/chat"]');
            await Sinco.waitForPageChange();
            await Sinco.assertUrlIs("http://drash_server:1667/chat");
            await Sinco.done();
        })
        Rhum.testCase("Video link should display and work", async () => {
            const Sinco = await buildFor("chrome");
            await Sinco.goTo("http://drash_server:1667");
            await Sinco.assertSee(`<a href="/video">`)
            await Sinco.click('a[href="/video"]');
            await Sinco.waitForPageChange();
            await Sinco.assertUrlIs("http://drash_server:16677/video");
            await Sinco.done();
        })
    })
})

Rhum.run()