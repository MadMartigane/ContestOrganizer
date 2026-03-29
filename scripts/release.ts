#!/usr/bin/env tsx

import { execSync } from "node:child_process";
import { readFileSync, writeFileSync } from "node:fs";
import { join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = fileURLToPath(new URL(".", import.meta.url));
const PROJECT_ROOT = resolve(__dirname, "..");

type IncrementType = "patch" | "minor" | "major";
type VersionContext = "manual" | "preprod" | "prod";

interface VersionResult {
  baseVersion: string;
  displayVersion: string;
  incrementType: IncrementType;
}

// === Version Logic ===

function parseVersion(versionString: string): {
  major: number;
  minor: number;
  patch: number;
} {
  const parts = versionString.split(".").map(Number);
  return { major: parts[0] ?? 0, minor: parts[1] ?? 0, patch: parts[2] ?? 0 };
}

function incrementVersion(
  version: string,
  incrementType: IncrementType
): string {
  const { major, minor, patch } = parseVersion(version);
  switch (incrementType) {
    case "major":
      return `${major + 1}.0.0`;
    case "minor":
      return `${major}.${minor + 1}.0`;
    case "patch":
      return `${major}.${minor}.${patch + 1}`;
    default:
      throw new Error(
        `Unknown increment type: ${incrementType satisfies never}`
      );
  }
}

function getVersionContext(): VersionContext {
  const ctx = process.env.VERSION_CONTEXT;
  if (ctx === "preprod") {
    return "preprod";
  }
  if (ctx === "prod") {
    return "prod";
  }
  return "manual";
}

function getVersionSuffix(context: VersionContext): string {
  switch (context) {
    case "preprod":
      return "-preprod";
    case "prod":
      return "-prod";
    default:
      return "-dev";
  }
}

function readPackageVersion(): string {
  const pkg = JSON.parse(
    readFileSync(join(PROJECT_ROOT, "package.json"), "utf-8")
  );
  return pkg.version ?? "0.0.0";
}

function processVersion(incrementType: IncrementType): VersionResult {
  const context = getVersionContext();
  const baseVersion = readPackageVersion();
  const newBaseVersion = incrementVersion(baseVersion, incrementType);
  return {
    baseVersion: newBaseVersion,
    displayVersion: `${newBaseVersion}${getVersionSuffix(context)}`,
    incrementType,
  };
}

// === Git Operations ===

function gitAdd(files: string[]): void {
  execSync(`git add ${files.join(" ")}`, {
    cwd: PROJECT_ROOT,
    stdio: "inherit",
  });
}

function gitCommit(message: string): void {
  execSync(`git commit -m "${message}"`, {
    cwd: PROJECT_ROOT,
    stdio: "inherit",
  });
}

function gitTag(tagName: string): void {
  execSync(`git tag "${tagName}"`, { cwd: PROJECT_ROOT, stdio: "inherit" });
}

function gitPush(remote: string, branch: string, tags: boolean): void {
  const tagFlag = tags ? "--tags" : "";
  execSync(`git push ${remote} ${branch} ${tagFlag}`, {
    cwd: PROJECT_ROOT,
    stdio: "inherit",
  });
}

function getCurrentBranch(): string {
  return execSync("git rev-parse --abbrev-ref HEAD", { cwd: PROJECT_ROOT })
    .toString()
    .trim();
}

// === Status Data Generation ===

function generateStatusData(): void {
  execSync("pnpm exec tsx scripts/generate-status.ts --skip-version", {
    cwd: PROJECT_ROOT,
    stdio: "inherit",
  });
}

// === Main ===

function validateIncrement(arg: string | undefined): IncrementType {
  if (!(arg && ["patch", "minor", "major"].includes(arg))) {
    console.error(
      `Error: Invalid increment '${arg}'. Expected: patch, minor, major`
    );
    process.exit(1);
  }
  return arg as IncrementType;
}

function main(): void {
  const args = process.argv.slice(2);
  const skipGit = args.includes("--skip-git");
  const skipPush = args.includes("--skip-push");
  const increment = validateIncrement(
    args.find((a) => ["patch", "minor", "major"].includes(a))
  );

  console.log(`🚀 Starting release (${increment})...`);

  // 1. Process version
  const versionResult = processVersion(increment);
  console.log(`   Version: ${versionResult.displayVersion}`);

  // 2. Generate status data files (using generate-status.ts which parses TODO.md)
  generateStatusData();
  console.log("   Status data generated");

  // 3. Update package.json version (base version only)
  const pkgPath = join(PROJECT_ROOT, "package.json");
  const pkg = JSON.parse(readFileSync(pkgPath, "utf-8"));
  pkg.version = versionResult.baseVersion;
  writeFileSync(pkgPath, `${JSON.stringify(pkg, null, 2)}\n`, "utf-8");
  console.log(`   package.json updated to ${versionResult.baseVersion}`);

  if (skipGit) {
    console.log("   [SKIP] Git operations skipped");
    return;
  }

  // 4. Git add
  gitAdd([
    "package.json",
    "src/generated/status-data.json",
    "src/generated/status-data.d.ts",
  ]);

  // 5. Git commit
  const commitMessage = `release: v${versionResult.baseVersion} (${versionResult.incrementType})`;
  gitCommit(commitMessage);
  console.log(`   Committed: ${commitMessage}`);

  // 6. Git tag
  const tagName = `v${versionResult.baseVersion}`;
  gitTag(tagName);
  console.log(`   Tagged: ${tagName}`);

  if (skipPush) {
    console.log("   [SKIP] Push skipped");
    return;
  }

  // 7. Git push (commit + tags)
  const branch = getCurrentBranch();
  gitPush("origin", branch, true);
  console.log(`   Pushed to origin/${branch} (including tags)`);

  console.log(`\n✅ Release v${versionResult.baseVersion} complete!`);
}

main();
