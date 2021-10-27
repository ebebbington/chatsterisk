import { CSRF } from "../deps.ts";
export const csrf = new CSRF({
  cookie: true,
});
