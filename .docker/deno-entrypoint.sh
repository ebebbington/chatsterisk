#!/bin/bash
if [ "$USE_DENON" == "true" ]
then
  deno install --allow-read --allow-run --allow-write --allow-net -f -q --unstable https://deno.land/x/denon/denon.ts;
  export PATH="/root/.deno/bin:$PATH";
  if [ "$BUILD" == "true" ]
  then
    denon build
  fi
  echo starting denon
  denon start
else
  deno run --allow-net --allow-run app.ts
fi