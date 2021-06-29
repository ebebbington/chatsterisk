// transpile.ts
import { Crumpets } from "https://deno.land/x/crumpets@v2.0.1/mod.ts";
const crumpet = new Crumpets({
  rootFile: "./public/components/App.ts",
  compilerOptions: {
    "lib": ["dom", "es2018"],
    declaration: false,
  },
});
await crumpet.run();
