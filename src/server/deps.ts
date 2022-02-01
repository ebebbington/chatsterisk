export * as Drash from "https://deno.land/x/drash@v2.5.1/mod.ts";
export { PaladinService as Paladin } from "https://deno.land/x/drash@v2.5.1/src/services/paladin/paladin.ts";
export { config } from "https://deno.land/x/dotenv@v3.1.0/mod.ts";
export { CSRFService as CSRF } from "https://deno.land/x/drash@v2.5.1/src/services/csrf/csrf.ts";
import { TengineService as Tengine } from "https://deno.land/x/drash@v2.5.1/src/services/tengine/tengine.ts";
export const tengine = new Tengine({
  views_path: "./public/views",
  render: (..._args: unknown[]) => false,
});
