// transpile.ts
import { Crumpets } from "./deps.ts";
const crumpet = new Crumpets({
  rootFile: "./public/components/App.ts",
  compilerOptions: {
    "lib": ["dom", "es2018"],
    declaration: false,
  },
});
await crumpet.run();
