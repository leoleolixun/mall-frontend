const fs = require("fs");
const path = require("path");

const root = __dirname;
const codePath = path.join(root, "code.js");
const readmePath = path.join(root, "README.md");
const manifestPath = path.join(root, "manifest.json");

const code = fs.readFileSync(codePath, "utf8");
const readme = fs.existsSync(readmePath) ? fs.readFileSync(readmePath, "utf8") : "";
const manifest = JSON.parse(fs.readFileSync(manifestPath, "utf8"));

const pageNames = code.match(/name:\s*"[^"]+"/g) || [];
const groupTitles = code.match(/title:\s*"[0-9]{2} /g) || [];
const usesGeneratedPageNames = code.includes('const generatedPageNames = pageDefs.map((def) => "Admin PC / " + def.name);');
const hasSecondLevelMenu = code.includes("const menuChildren = {") && code.includes("Sidebar subitem / ");
const hasMenuStates = code.includes("colors.sidebarHover") && code.includes("colors.sidebarChildActive");
const hasContextualParents = code.includes("const contextualMenuParent = {") && code.includes("商品编辑: \"商品列表\"");
const hasCleanSidebar = !code.includes("\"导航菜单\"") && !code.includes("shortName");
const hasSemanticIcons = code.includes("function drawSidebarIcon") && code.includes("Icon package body") && code.includes("Icon wallet body") && code.includes("Icon settings core");
const hasStoreManagement = code.includes("name: \"门店列表\"") && code.includes("编辑 / 停用") && code.includes("编辑 / 删除");
const hasMerchantManagementName = code.includes("\"商户管理\"") && readme.includes("`07 商户管理`") && !code.includes("商户权限") && !readme.includes("商户权限");

const checks = [
  ["manifest name", manifest.name === "Mall Admin PC Pages Builder"],
  ["manifest main", manifest.main === "code.js"],
  ["page definition count is 39", pageNames.length === 39],
  ["generated page names derive from definitions", usesGeneratedPageNames],
  ["group count is 9", groupTitles.length === 9],
  ["sidebar has second-level menu", hasSecondLevelMenu],
  ["sidebar has hover and selected states", hasMenuStates],
  ["context pages map to parent menu", hasContextualParents],
  ["sidebar removes redundant label and abbreviations", hasCleanSidebar],
  ["sidebar uses semantic module icons", hasSemanticIcons],
  ["merchant module has store management", hasStoreManagement],
  ["merchant module is named 商户管理", hasMerchantManagementName],
  ["README mentions 39 pages", readme.includes("39 个后台 PC 页面")]
];

const failed = checks.filter(([, ok]) => !ok);

for (const [label, ok] of checks) {
  console.log(`${ok ? "PASS" : "FAIL"} ${label}`);
}

if (failed.length > 0) {
  process.exit(1);
}

console.log(`Ready to import: ${manifestPath}`);
