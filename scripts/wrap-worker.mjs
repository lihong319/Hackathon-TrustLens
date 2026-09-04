import { readdir, readFile, rename, writeFile } from "node:fs/promises";
import { join } from "node:path";

const serverDir = join(process.cwd(), "dist", "server");
const chunkDir = join(serverDir, "_next");
const entryPath = join(serverDir, "index.js");
const vinextPath = join(serverDir, "vinext.js");

await rename(entryPath, vinextPath);

const builtFiles = await readdir(chunkDir, { recursive: true });
for (const file of builtFiles) {
  if (!file.endsWith(".js")) continue;
  const filePath = join(chunkDir, file);
  const source = await readFile(filePath, "utf8");
  const fixed = source.replaceAll("../../index.js", "../../vinext.js");
  if (fixed !== source) await writeFile(filePath, fixed, "utf8");
}

await writeFile(
  entryPath,
  `import handleRequest from "./vinext.js";\n\nexport default {\n  fetch(request, env, ctx) {\n    return handleRequest(request, env, ctx);\n  },\n};\n`,
  "utf8",
);
