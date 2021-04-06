<p align="center">
  <h1 align="center">Chatsterisk</h1>
</p>
<p align="center">
  <a href="https://github.com/ebebbington/chatsterisk/actions">
    <img src="https://img.shields.io/github/workflow/status/ebebbington/chatsterisk/master?label=ci">
  </a>
  <a href="https://github.com/drashland/chatsterisk/actions">
    <img src="https://img.shields.io/github/workflow/status/ebebbington/chatsterisk/CodeQL?label=CodeQL">
  </a>
  <a href="https://sonarcloud.io/dashboard?id=ebebbington_chatsterisk">
    <img src="https://sonarcloud.io/api/project_badges/measure?project=ebebbington_chatsterisk&metric=alert_status">
  </a>
</p>

---

VoIP application ran using: Drash and Asterisk, to make and demonstrate voice
calls using asterisk. Also acts as a training project for Drash, Sockets and
Asterisk

I've decided to skip the IVR menu because I ddon't think we have a keypad for
softphones int eh Telephone app? See
[here](https://wiki.asterisk.org/wiki/display/AST/Creating+a+Simple+IVR+Menu)

## Tools Used

- Drash - web server
- Wocket - web socket server
- `deno bundlle` - bundling client TS code
- Asterisk
- Rhum - Testing framework
- Dawn - browser testing framework (not yet added)
- Dami - ami client

## Project Flow

1. Docker environment is started

2. `server` bundles client ts, and starts, handling any web requests

3. Asterisk starts, listening for any call requests

4. `ami` starts, listening on any requests to the socket

5. Asterisks AMI is configured to run (see manager.conf), on port 5038. An AMI
   is a part of Asterisk, and we can connect to it using `telnet localhost 5038`
   to issue commands, then when connected, do `Action: Login ^SHIFT ...` (or
   `telnet 0.0.0.0 5038` when inside the container)

## Setup Phones

1. Register 2 phones, for demo-alice (pass = verysecretpassword as seen in
   sip.conf) and demo-bob (pass = anothersecretpassword). Domain is 0.0.0.0
   (because docker). Username is also demo-alice (see sip.conf), or. it's thee extension eg 6001 or 6002
2. Make a call! We can see the dialplans in extensions.conf (note the context
   for our 2 phones are from-internal), so make a call to 6001 (to alice) or
   6002 (to bob)

## Directory Structure

- `.docker` - Holds docker-related files, such as dockerfiles, and asterisk
  configuration files

- `.github` - Holds our workflows

- `src/socket` - Our AMI socket server

- `src/server` - Our drash application that acts as the server for this project,
  to serve a client on the web

  - `middleware` - Direcotry to hold our custom middleware to pipe into Drash
  - `public` - Our client assets
  - `.env` - Our env file
  - `app.ts` - Our entrypoint file to start the server
  - `denon.json` - Similar to PM2, we use denon to start and watch our server
    (`app.ts`)
  - `deps.ts` - Holds our dependencies
  - `response.ts` - A unique way to override the Drash response so we can
    customise how the server responds to a client (NOT IN USE)

## Deno Information

### Best Practices / Consistencies

- Packages
  - For importing packages, a `deps.ts` file will hold all imports for the whole
    project, and all those will then be exported. Should a file require any
    package or module, they will use the `deps.ts` file to do so.
- Use `mod.ts` to export your module
- Use `app.ts` as your entry point file (eg web apps)
- Use `deno fmt`

### Built-in Deno Utilities

See [here](https://deno.land/std/manual.md#built-in-deno-utilities--commands)

### Tools Used

- [Deno](https://deno.land/) - Runtime environment
- [Drash](https://drash.land/drash) - HTTP Microframework
- [Drash's Template Engine](https://drash.land/drash)
- [Asterisk](https://asterisk.com) - PBX System
- [Denon](https://github.com/denosaurs/denon) - File watcher and server starter
- [Paladin](https://github.com/deno-drash-middleware/paladdin) - Better secure
  our responses
- [Docker](https://docker.com)

### Resources

- [Deno's Website](https://deno.land/)
- [Deno's GitHub](https://github.com/denoland/deno)
- [Drash's Docs](https://drash.land)
- [Asterisk Hello World](https://www.informit.com/articles/article.aspx?p=1439183&seqNum=2)
- [Asterisk Docs](https://wiki.asterisk.org/wiki/display/AST/Asterisk+Configuration+Files)

## Help

- Resolving `.ts` extensions

  - As Typescript doesn't have a native way to resolve these due to how Deno is
    built, a different fix has been implemented. See
    [here](https://medium.com/@kitsonk/develop-with-deno-and-visual-studio-code-225ce7c5b1ba)
    for some more information and the related commit
    [here](https://github.com/ebebbington/todo/commit/9fba0d8fb66c00198a65b68b5177ee3d1d6eb63b)

# The Set Up

Most of the steps were following using asterisks main documentation:
https://wiki.asterisk.org/wiki/display/AST/Hello+World

## Public Server

1. Install asterisk

   apt install asterisk

2. Setup the conf files and the step using the link above. It includes the
   sip/pjsip/extensions config files

3. Restart asterisk

   asterisk -rx "core restart now"

4. Start asterisk

   asterisk -cvvvvv

5. Connect using a softphone, where the domain is the IP of the server

6. Make a call to 100

## Docker

1. Docker compose file content:

```
asterisk:
    container_name: asterisk_pbx
    image: hibou/asterisk:14
    ports:
      - "5060:5060/udp"
      - "5060:5060/tcp"
      - "16384-16394:16384-16394/udp"
      - "8088:8088"
      - "8089:8089"
    volumes:
      - "./.docker/config/asterisk/sip.conf:/etc/asterisk/sip.conf"
      - "./.docker/config/asterisk/extensions.conf:/etc/asterisk/extensions.conf"
      - "./.docker/config/asterisk/pjsip.conf:/etc/asterisk/pjsip.conf"
      - "./.docker/config/asterisk/rtp.conf:/etc/asterisk/rtp.conf"
    labels:
      - "traefik.enable=false"
```

2. Dockerfile content:

```
FROM centos:6

# Set up EPEL
RUN curl -L http://download.fedoraproject.org/pub/epel/6/x86_64/epel-release-6-8.noarch.rpm -o /tmp/epel-release-6-8.noarch.rpm && \
 rpm -ivh /tmp/epel-release-6-8.noarch.rpm && \
 rm -f /tmp/epel-release-6-8.noarch.rpm

# Update and install asterisk
RUN yum update -y && yum install -y asterisk

# Set config as a volume
VOLUME /etc/asterisk

# And when the container is started, run asterisk
ENTRYPOINT [ "/usr/sbin/asterisk", "-fcvvvv" ]
```

3. Setup the config files: sip/pjsip/extnesions/rtp. Follow the link above on
   the content needed, and for `rtp.conf`, use:

```
rtpstart=16384
rtpend=16394
```

4 Start docker

        docker-compose up

5. Connect using a softphone, where the domain is 0.0.0.0 for the container
