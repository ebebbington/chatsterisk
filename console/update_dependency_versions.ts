const decoder = new TextDecoder();
const encoder = new TextEncoder();
const fetchRes = await fetch("https://cdn.deno.land/deno/meta/versions.json");
const versions: {
  latest: string;
  versions: string[];
} = await fetchRes.json(); // eg { latest: "v1.3.3", versions: ["v1.3.2", ...] }
const latestDenoVersion = versions.latest.replace("v", "");

let dockerComposeContent = decoder.decode(
  Deno.readFileSync("./docker-compose.yml"),
);
dockerComposeContent = dockerComposeContent.replace(
  /DENO_VERSION: [0-9.]+[0-9.]+[0-9]/g,
  `DENO_VERSION: ${latestDenoVersion}`,
);
Deno.writeFileSync(
  "./docker-compose.yml",
  encoder.encode(dockerComposeContent),
);
const destinyRes = await fetch(
  "https://api.github.com/repos/0kku/destiny/tags",
);
const destinyJson = await destinyRes.json();
const latestTag = destinyJson[0];
const latestVersion = latestTag.name;
let componentDepsFile = new TextDecoder().decode(
  Deno.readFileSync("./src/server/public/components/deps.ts"),
);
componentDepsFile = componentDepsFile.replace(
  /v[0-9].[0-9].[0-9]/,
  latestVersion,
);
Deno.writeFileSync(
  "./src/server/public/components/deps.ts",
  new TextEncoder().encode(componentDepsFile),
);
