// Re-vendors the built shared packages into packages/*/dist:
//   - @gram-academy/protocol  <-  gram-academy-contracts/sdk/dist
//   - @gram-academy/i18n      <-  gram-academy-backend/packages/i18n/dist
// Run after the contract ABIs or the i18n copy change (and the source repo is rebuilt).
//
//   node tools/sync-vendored.mjs [contractsRepoPath] [backendRepoPath]
//
// Defaults assume sibling checkouts next to this repo.
import { cp, rm, readdir } from "node:fs/promises";
import { existsSync } from "node:fs";
import { resolve } from "node:path";

const contractsRepo = process.argv[2] ? resolve(process.argv[2]) : resolve(process.cwd(), "../gram-academy-contracts");
const backendRepo = process.argv[3] ? resolve(process.argv[3]) : resolve(process.cwd(), "../gram-academy-backend");

const jobs = [
  {
    name: "@gram-academy/protocol",
    src: resolve(contractsRepo, "sdk/dist"),
    dest: resolve(process.cwd(), "packages/protocol/dist"),
    build: "npm run sdk:build (in the contracts repo)",
  },
  {
    name: "@gram-academy/i18n",
    src: resolve(backendRepo, "packages/i18n/dist"),
    dest: resolve(process.cwd(), "packages/i18n/dist"),
    build: "npm run build:packages (in the backend repo)",
  },
];

async function stripSourcemaps(dir) {
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const full = resolve(dir, entry.name);
    if (entry.isDirectory()) await stripSourcemaps(full);
    else if (entry.name.endsWith(".map")) await rm(full, { force: true });
  }
}

for (const job of jobs) {
  if (!existsSync(job.src)) {
    console.error(`[sync-vendored] ${job.name}: built dist not found at ${job.src}`);
    console.error(`[sync-vendored] build it first: ${job.build}`);
    process.exit(1);
  }
  await rm(job.dest, { recursive: true, force: true });
  await cp(job.src, job.dest, { recursive: true });
  await stripSourcemaps(job.dest);
  console.log(`[sync-vendored] ${job.name} <- ${job.src}`);
}
