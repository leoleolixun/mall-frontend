const fs = require("fs");
const path = require("path");

const root = __dirname;
const codePath = path.join(root, "code.js");
const readmePath = path.join(root, "README.md");
const manifestPath = path.join(root, "manifest.json");

const code = fs.readFileSync(codePath, "utf8");
const readme = fs.readFileSync(readmePath, "utf8");
const manifest = JSON.parse(fs.readFileSync(manifestPath, "utf8"));

const namesMatch = code.match(/const mobilePageNames = \[([\s\S]*?)\];/);
const groupTitles = code.match(/title:\s*"[0-9]{2} /g) || [];
const usesUnifiedPageNames = code.includes('const generatedPageNames = mobilePageNames.map((name) => "移动端 / " + name);');
const keepsLegacyCleanup = code.includes("legacyGeneratedNames");
const removesLegacyPrefixes = code.includes('node.name.indexOf("H5 / ") === 0') && code.includes('node.name.indexOf("小程序 / ") === 0');

if (!namesMatch) {
  throw new Error("Cannot find mobilePageNames in code.js");
}

const generatedPages = namesMatch[1].match(/"[^"]+"/g) || [];

const checks = [
  ["manifest name", manifest.name === "Mall Mobile Unified Pages Builder"],
  ["manifest main", manifest.main === "code.js"],
  ["generated page count is 25", generatedPages.length === 25],
  ["uses unified mobile page names", usesUnifiedPageNames],
  ["keeps legacy H5/miniprogram cleanup", keepsLegacyCleanup],
  ["removes legacy H5/miniprogram prefixes", removesLegacyPrefixes],
  ["group count is 7", groupTitles.length === 7],
  ["README mentions 25 pages", readme.includes("25 个移动端页面")]
];

const failed = checks.filter(([, ok]) => !ok);

for (const [label, ok] of checks) {
  console.log(`${ok ? "PASS" : "FAIL"} ${label}`);
}

if (failed.length > 0) {
  process.exit(1);
}

console.log(`Ready to import: ${manifestPath}`);
