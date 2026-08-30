import { rename, writeFile } from "node:fs/promises";
import { join } from "node:path";

const serverDir = join(process.cwd(), "dist", "server");
const entryPath = join(serverDir, "index.js");
const vinextPath = join(serverDir, "vinext.js");

await rename(entryPath, vinextPath);
await writeFile(
  entryPath,
  `import handleRequest from "./vinext.js";\n\nexport default {\n  fetch(request, env, ctx) {\n    return handleRequest(request, env, ctx);\n  },\n};\n`,
  "utf8",
);
