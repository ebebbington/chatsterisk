<p align="center">
  <h1 align="center">Chatsterisk</h1>
</p>

---

VoIP application ran using: Drash and Asterisk, to make and demonstrate voice calls using asterisk. Also acts as a training project for Deno and Drash

## Directory Structure

* `.docker` - Holds docker-related files, such as  dockerfiles, and  asterisk configuration files

* `.github` - Holds our workflows

* `src/server` - Our drash application that acts as the server for this project, to serve a client on the web

    * `middleware` - Direcotry to hold our custom middleware to pipe into Drash
    * `public` - Our client assets
    * `.env` - Our env file
    * `app.ts` - Our entrypoint file to start the server
    * `denon.json` - Similar to PM2, we use denon to start and watch our server (`app.ts`)
    * `deps.ts` - Holds our dependencies
    * `response.ts` - A  unique way to override the Drash response so we can customise how  the server responds to a client  (NOT IN USE)

## Deno Information

### Best Practices / Consistencies

* Packages
  * For importing packages, a `deps.ts` file will hold all imports for the whole project, and all those will then be exported. Should a file require any package or module, they will use the `deps.ts` file to do so.
* Use `mod.ts` to export your module
* Use `app.ts` as your entry point file (eg web apps)
* Use `deno fmt`

### Built-in Deno Utilities

See [here](https://deno.land/std/manual.md#built-in-deno-utilities--commands)

### Tools Used

* [Deno](https://deno.land/) - Runtime environment
* [Drash](https://drash.land/drash) - HTTP Microframework
* [Drash's Template Engine](https://drash.land/drash)
* [Asterisk](https://asterisk.com) - PBX System
* [Denon](https://github.com/denosaurs/denon) - File watcher and server starter
* [Paladin](https://github.com/deno-drash-middleware/paladdin) - Better secure our responses
* [Docker](https://docker.com)


### Resources

* [Deno's Website](https://deno.land/)
* [Deno's GitHub](https://github.com/denoland/deno)
* [Drash's Docs](https://drash.land)

## Help

# Help

* Resolving `.ts` extensions

    * As Typescript doesn't have a native way to resolve these due to how Deno is built, a different fix has been implemented. See [here](https://medium.com/@kitsonk/develop-with-deno-and-visual-studio-code-225ce7c5b1ba) for some more information and the related commit [here](https://github.com/ebebbington/todo/commit/9fba0d8fb66c00198a65b68b5177ee3d1d6eb63b)
