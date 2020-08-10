#!/bin/bash
if [ "$USE_DENON" == "true" ]
then
  deno install --allow-read --allow-run --allow-write --allow-net -f -q --unstable https://deno.land/x/denon@2.3.2/denon.ts;
  export PATH="/root/.deno/bin:$PATH"
  denon start
else
  deno run --allow-net app.ts
fi