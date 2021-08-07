FROM debian:stable-slim

ARG DENO_VERSION

RUN apt update -y \
  && apt clean \
  && apt install bash curl unzip -y \
  && apt install make

RUN curl -fsSL https://deno.land/x/install/install.sh | DENO_INSTALL=/usr/local sh -s v${DENO_VERSION}
RUN export DENO_INSTALL="/root/.local"
RUN export PATH="$DENO_INSTALL/bin:$PATH"

COPY ./.docker/deno-entrypoint.sh /deno-entrypoint.sh
RUN chmod +x /deno-entrypoint.sh
ENTRYPOINT ["/deno-entrypoint.sh"]