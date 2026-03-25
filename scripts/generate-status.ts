#!/usr/bin/env tsx

import fs from "node:fs";
import path from "node:path";

const PROJECT_ROOT = path.resolve(import.meta.dirname, "..");
const TODO_MD_PATH = path.join(PROJECT_ROOT, "TODO.md");
const OUTPUT_DIR = path.join(PROJECT_ROOT, "src", "generated");
const JSON_OUTPUT_PATH = path.join(OUTPUT_DIR, "status-data.json");
const DTS_OUTPUT_PATH = path.join(OUTPUT_DIR, "status-data.d.ts");

interface TableData {
  headers: string[];
  rows: string[][];
}

interface Section {
  badgeVariant: "primary" | "success" | "neutral" | "warning" | "danger";
  content: string;
  id: string;
  tables: TableData[];
  title: string;
  type: "info" | "bug" | "task" | "note" | "warning";
}

interface StatusData {
  lastUpdated: string;
  projectName: string;
  sections: Section[];
  technology: string;
  version: string; // e.g., "1.2.3-dev", "1.3.0-preprod", "2.0.0-prod"
}

type StatusType = Section["type"];
type BadgeVariant = Section["badgeVariant"];

type IncrementType = "patch" | "minor" | "major";
type VersionContext = "manual" | "preprod" | "prod";

interface VersionResult {
  baseVersion: string;
  displayVersion: string;
  incrementType: IncrementType;
}

const H1_REGEX = /^#\s+(.+)$/m;
const TECH_REGEX = /\*\*Technologie\*\*\s*:\s*(.+)/i;
const STACK_REGEX = /\*\*Stack\*\*\s*:\s*(.+)/i;
const SECTION_REGEX = /^##\s+(.+)$/gm;
const TABLE_BLOCK_REGEX = /(\|[^\n]+\|\n\|[-:\s|]+\|\n(?:\|[^\n]+\|\n?)+)/g;
const SECTION_TITLE_REGEX = /^##\s+.+$/m;

function ensureDir(dirPath: string): void {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
}

function extractProjectName(content: string): string {
  const h1Match = content.match(H1_REGEX);
  return h1Match ? h1Match[1].trim() : "Unknown Project";
}

function extractTechnology(content: string): string {
  const techMatch = content.match(TECH_REGEX);
  if (techMatch) {
    return techMatch[1].trim();
  }

  const stackMatch = content.match(STACK_REGEX);
  if (stackMatch) {
    return stackMatch[1].trim();
  }

  return "Not specified";
}

function determineStatusType(title: string): StatusType {
  const lowerTitle = title.toLowerCase();

  if (
    lowerTitle.includes("problème") ||
    lowerTitle.includes("bug") ||
    lowerTitle.includes("issue")
  ) {
    return "bug";
  }
  if (
    lowerTitle.includes("prochaine") ||
    lowerTitle.includes("todo") ||
    lowerTitle.includes("piste") ||
    lowerTitle.includes("feature")
  ) {
    return "task";
  }
  if (lowerTitle.includes("contexte") || lowerTitle.includes("architecture")) {
    return "info";
  }
  if (lowerTitle.includes("note") || lowerTitle.includes("commande")) {
    return "note";
  }
  if (lowerTitle.includes("warning") || lowerTitle.includes("attention")) {
    return "warning";
  }
  return "info";
}

function determineBadgeVariant(type: StatusType): BadgeVariant {
  const mapping: Record<StatusType, BadgeVariant> = {
    info: "primary",
    bug: "danger",
    task: "neutral",
    note: "success",
    warning: "warning",
  };
  return mapping[type];
}

function generateId(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

function parseVersion(versionString: string): {
  major: number;
  minor: number;
  patch: number;
} {
  const parts = versionString.split(".").map(Number);
  return {
    major: parts[0] ?? 0,
    minor: parts[1] ?? 0,
    patch: parts[2] ?? 0,
  };
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
    default: {
      const _exhaustiveCheck: never = incrementType;
      return _exhaustiveCheck;
    }
  }
}

function getVersionContext(): VersionContext {
  const envContext = process.env.VERSION_CONTEXT;
  if (envContext === "preprod") {
    return "preprod";
  }
  if (envContext === "prod") {
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

function validateIncrementArg(arg: string | undefined): IncrementType {
  if (arg === undefined) {
    return "patch";
  }
  if (arg !== "major" && arg !== "minor" && arg !== "patch") {
    console.error(
      `Error: Invalid version increment '${arg}'. Expected: patch, minor, or major.`
    );
    process.exit(1);
  }
  return arg as IncrementType;
}

function readPackageVersion(): string {
  const packageJsonPath = path.join(PROJECT_ROOT, "package.json");
  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, "utf-8"));
  return packageJson.version ?? "0.0.0";
}

function processVersion(incrementType: IncrementType): VersionResult {
  const context = getVersionContext();
  const baseVersion = readPackageVersion();
  const newBaseVersion = incrementVersion(baseVersion, incrementType);
  const suffix = getVersionSuffix(context);

  return {
    baseVersion: newBaseVersion,
    displayVersion: `${newBaseVersion}${suffix}`,
    incrementType,
  };
}

function parseTable(tableBlock: string): TableData | null {
  const lines = tableBlock
    .trim()
    .split("\n")
    .filter((line) => line.trim());

  if (lines.length < 2) {
    return null;
  }

  const headerLine = lines[0];
  const rowLines = lines.slice(2);

  if (!(headerLine.includes("|") && rowLines[0]?.includes("|"))) {
    return null;
  }

  const parseRow = (line: string): string[] => {
    return line
      .split("|")
      .slice(1, -1)
      .map((cell) => cell.trim());
  };

  const headers = parseRow(headerLine);
  const rows = rowLines.map(parseRow);

  return { headers, rows };
}

function parseSections(content: string): Section[] {
  const sections: Section[] = [];
  const matchIndexes: Array<{ index: number; title: string }> = [];

  let match = SECTION_REGEX.exec(content);
  while (match !== null) {
    matchIndexes.push({ index: match.index, title: match[1] });
    match = SECTION_REGEX.exec(content);
  }

  for (let i = 0; i < matchIndexes.length; i++) {
    const currentMatch = matchIndexes[i];
    const nextMatch = matchIndexes[i + 1];

    const sectionContent = content.slice(currentMatch.index, nextMatch?.index);
    const title = currentMatch.title;

    const tables: TableData[] = [];

    let tableMatch = TABLE_BLOCK_REGEX.exec(sectionContent);
    while (tableMatch !== null) {
      const table = parseTable(tableMatch[0]);
      if (table) {
        tables.push(table);
      }
      tableMatch = TABLE_BLOCK_REGEX.exec(sectionContent);
    }

    const cleanedContent = sectionContent
      .replace(TABLE_BLOCK_REGEX, "<!-- TABLE -->")
      .replace(SECTION_TITLE_REGEX, "")
      .replace(/<!-- TABLE -->/g, "")
      .replace(/\n{3,}/g, "\n\n")
      .trim();

    const type = determineStatusType(title);

    sections.push({
      id: generateId(title),
      title,
      content: cleanedContent,
      type,
      badgeVariant: determineBadgeVariant(type),
      tables,
    });
  }

  return sections;
}

function generateJsonOutput(data: StatusData): string {
  return JSON.stringify(data, null, 2);
}

function generateDtsOutput(_data: StatusData): string {
  return `declare const statusData: {
  lastUpdated: string;
  projectName: string;
  technology: string;
  version: string;
  sections: Array<{
    id: string;
    title: string;
    content: string;
    type: 'info' | 'bug' | 'task' | 'note' | 'warning';
    badgeVariant: 'primary' | 'success' | 'neutral' | 'warning' | 'danger';
    tables?: Array<{
      headers: string[];
      rows: string[][];
    }>;
  }>;
};

export default statusData;
`;
}

function generateStatusData(incrementType: IncrementType): StatusData {
  const versionResult = processVersion(incrementType);

  const baseData: StatusData = {
    lastUpdated: new Date().toISOString(),
    projectName: "Unknown Project",
    technology: "Not specified",
    sections: [],
    version: versionResult.displayVersion,
  };

  if (!fs.existsSync(TODO_MD_PATH)) {
    baseData.projectName = "Error: TODO.md not found";
    baseData.technology = "N/A";
    baseData.sections = [
      {
        id: "error",
        title: "Error",
        content: "TODO.md file was not found at project root.",
        type: "warning",
        badgeVariant: "warning",
        tables: [],
      },
    ];
    return baseData;
  }

  const content = fs.readFileSync(TODO_MD_PATH, "utf-8");

  try {
    baseData.projectName = extractProjectName(content);
    baseData.technology = extractTechnology(content);
    baseData.sections = parseSections(content);
  } catch (error) {
    baseData.sections = [
      {
        id: "parse-error",
        title: "Parse Error",
        content: `Failed to parse TODO.md: ${error instanceof Error ? error.message : "Unknown error"}`,
        type: "warning",
        badgeVariant: "warning",
        tables: [],
      },
    ];
  }

  return baseData;
}

function main(): void {
  const incrementArg = process.argv[2];
  const incrementType = validateIncrementArg(incrementArg);
  const versionResult = processVersion(incrementType);

  ensureDir(OUTPUT_DIR);

  const data = generateStatusData(incrementType);

  const jsonOutput = generateJsonOutput(data);
  fs.writeFileSync(JSON_OUTPUT_PATH, jsonOutput, "utf-8");

  const dtsOutput = generateDtsOutput(data);
  fs.writeFileSync(DTS_OUTPUT_PATH, dtsOutput, "utf-8");

  const packageJsonPath = path.join(PROJECT_ROOT, "package.json");
  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, "utf-8"));
  packageJson.version = versionResult.baseVersion;
  fs.writeFileSync(
    packageJsonPath,
    `${JSON.stringify(packageJson, null, 2)}\n`,
    "utf-8"
  );

  console.log("Generated:");
  console.log(`  - ${JSON_OUTPUT_PATH}`);
  console.log(`  - ${DTS_OUTPUT_PATH}`);
  console.log(
    `Version: ${versionResult.displayVersion} (${versionResult.incrementType})`
  );
}

main();
