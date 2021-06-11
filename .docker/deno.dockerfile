FROM debian:stable-slim

ARG DENO_VERSION

RUN apt update -y \
  && apt clean \
  && apt install bash curl unzip -y \
  && apt install make
  #&& apt install -y --no-install-recommends nodejs \
  #&& apt install -y --no-install-recommends npm \
  #&& npm install -g npm@latest

RUN curl -fsSL https://deno.land/x/install/install.sh | DENO_INSTALL=/usr/local sh -s v${DENO_VERSION}
RUN export DENO_INSTALL="/root/.local"
RUN export PATH="$DENO_INSTALL/bin:$PATH"

FROM debian:stable-slim

# Install chrome driver
RUN apt update -y && apt clean -y
RUN apt install gnupg -y
ENV CHROME_VERSION "google-chrome-stable"
RUN sed -i -- 's&deb http://deb.debian.org/debian jessie-updates main&#deb http://deb.debian.org/debian jessie-updates main&g' /etc/apt/sources.list \
  && apt-get update && apt-get install wget -y
RUN wget -q -O - https://dl-ssl.google.com/linux/linux_signing_key.pub | apt-key add - \
  && echo "deb http://dl.google.com/linux/chrome/deb/ stable main" >> /etc/apt/sources.list \
  && apt-get update && apt-get -qqy install ${CHROME_VERSION:-google-chrome-stable}

COPY ./.docker/deno-entrypoint.sh /deno-entrypoint.sh
RUN chmod +x /deno-entrypoint.sh
ENTRYPOINT ["/deno-entrypoint.sh"]