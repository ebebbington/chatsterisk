export interface SSHClientConfig {
  host: string,
  user?: string,
  password?: string
  is_docker_container: boolean
}

export class SSHClient {
  private readonly config: SSHClientConfig;

  constructor(config: SSHClientConfig) {
    this.config = config
  }

  public async execute (command: string) {
    let cmd = []
    // Exec into the local docker container and run command
    if (this.config.is_docker_container) {
      cmd = ["docker", "exec", `${this.config.host}`, `'${command}'`]
    } else { // Ssh
      const address = this.config.user ?
          `${this.config.user}@${this.config.host}`
          :
          `${this.config.host}`;
      // use password and execute command
      if (this.config.password) {
        cmd = ["sshpass", `'${this.config.password}'`, "ssh", "-t", `${address}`, `'${command}'`]
      } else { // dont use password and execute command
        cmd = ["ssh", "-t", `${address}`, `'${command}'`]
      }
    }
    console.log("Running ssh command with the following data:");
    console.log({
      user: this.config.user,
      password: this.config.password,
      host: this.config.host,
      is_docker_container: this.config.is_docker_container,
      cmd: cmd.join(" ")
    });
    const p = await Deno.run({ cmd: cmd, stdout: "piped", stderr: "piped" })
    const status = await p.status()
    console.log('Ssh status:')
    console.log(status)
    const stdout = new TextDecoder().decode(await p.output())
    const stderr = new TextDecoder().decode(await p.stderrOutput())
  }
}