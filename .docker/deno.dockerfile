FROM debian:stable-slim

ARG DENO_VERSION

RUN apt update -y \
  && apt clean \
  && apt install bash curl unzip -y
  #&& apt install -y --no-install-recommends nodejs \
  #&& apt install -y --no-install-recommends npm \
  #&& npm install -g npm@latest

RUN echo ${DENO_VERSION}
RUN curl -fsSL https://deno.land/x/install/install.sh | DENO_INSTALL=/usr/local sh -s v${DENO_VERSION}
RUN export DENO_INSTALL="/root/.local"
RUN export PATH="$DENO_INSTALL/bin:$PATH"
RUN if [ "$DENO_VERSION" = "1.2.3" ]; then deno install --allow-read --allow-run --allow-write --allow-net -f -q --unstable https://deno.land/x/denon@2.3.2/denon.ts denon; fi