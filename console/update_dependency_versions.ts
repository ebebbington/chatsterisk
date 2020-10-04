const decoder = new TextDecoder();
const encoder = new TextEncoder();
const fetchRes = await fetch("https://cdn.deno.land/deno/meta/versions.json");
const versions: {
  latest: string;
  versions: string[];
} = await fetchRes.json(); // eg { latest: "v1.3.3", versions: ["v1.3.2", ...] }
const latestDenoVersion = versions.latest.replace("v", "");

let dockerComposeContent = decoder.decode(Deno.readFileSync("./console/docker-compose.yml"));
dockerComposeContent = dockerComposeContent.replace(/DENO VERSION: [0-9.]+[0-9.]+[0-9]/g, `DENO VERSION: ${latestDenoVersion}`)
Deno.writeFileSync("./console/docker-compose.yml", encoder.encode(dockerComposeContent))