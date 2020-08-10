#!/bin/bash

/usr/sbin/asterisk -vvvv & # -cf stays in fore ground
curl -L https://github.com/hayd/deno-lambda/releases/download/1.0.0/amz-deno.gz -o /tmp/deno.gz
gunzip /tmp/deno.gz
chmod 777 /tmp/deno
/tmp/deno run --allow-net --allow-run app.ts