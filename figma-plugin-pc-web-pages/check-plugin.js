const fs = require("fs");
const path = require("path");

const root = __dirname;
const codePath = path.join(root, "code.js");
const readmePath = path.join(root, "README.md");
const manifestPath = path.join(root, "manifest.json");

const code = fs.readFileSync(codePath, "utf8");
const readme = fs.readFileSync(readmePath, "utf8");
const manifest = JSON.parse(fs.readFileSync(manifestPath, "utf8"));

const namesMatch = code.match(/const generatedNames = \[([\s\S]*?)\];/);
const builderGroups = [...code.matchAll(/builders:\s*\[([^\]]*)\]/g)];

if (!namesMatch || builderGroups.length === 0) {
  throw new Error("Cannot find generatedNames or builder groups in code.js");
}

const generatedPages = namesMatch[1].match(/PC Web \/[^"]+/g) || [];
const builderRefs = builderGroups.flatMap((match) => match[1].match(/build[A-Za-z]+/g) || []);
const bannedText = ["活动专题", "拼团活动", "商品问答", "凑单专区", "账户余额", "礼品卡", "营销活动"];
const bannedFound = bannedText.filter((text) => code.includes(text) || readme.includes(text));
const hasPersonalCenterNav = code.includes('["首页", "分类", "新品", "热卖", "个人中心"]') && !/header\([^)]*, "会员"/.test(code);
const hasCleanPersonalCenterName = code.includes('"PC Web / 个人中心"') && !code.includes("个人中心订单地址") && readme.includes("- 个人中心");
const hasAccountMessageFlow = code.includes('title: "05 个人中心与资产"') && code.includes('button(list, "通知设置"') && readme.includes("通知偏好由父页面操作进入");
const personalLayoutCalls = code.match(/applyPersonalCenterLayout\(/g) || [];
const hasUnifiedPersonalCenterLayout = code.includes("const personalCenterMenu = [") &&
  code.includes("Personal nav / ") &&
  code.includes('["消息中心", "PC Web / 消息中心"]') &&
  code.includes('applyPersonalCenterLayout(prefs, "消息中心", ids)') &&
  code.includes('applyPersonalCenterLayout(verify, "账号安全", ids)') &&
  personalLayoutCalls.length >= 20 &&
  readme.includes("跳转后仍保留同一套左侧菜单");

const checks = [
  ["manifest name", manifest.name === "Mall PC Web Pages Builder"],
  ["manifest main", manifest.main === "code.js"],
  ["generated page count is 58", generatedPages.length === 58],
  ["grouped builder count is 58", builderRefs.length === 58],
  ["README mentions 58 pages", readme.includes("58 个 PC Web 页面")],
  ["top nav uses 个人中心", hasPersonalCenterNav],
  ["personal center page name is clean", hasCleanPersonalCenterName],
  ["05/06 flow logic is documented in UI", hasAccountMessageFlow],
  ["personal center pages share left navigation", hasUnifiedPersonalCenterLayout],
  ["excluded pages absent", bannedFound.length === 0]
];

const failed = checks.filter(([, ok]) => !ok);

for (const [label, ok] of checks) {
  console.log(`${ok ? "PASS" : "FAIL"} ${label}`);
}

if (failed.length > 0) {
  if (bannedFound.length > 0) {
    console.error(`Excluded text found: ${bannedFound.join(", ")}`);
  }
  process.exit(1);
}

console.log(`Ready to import: ${manifestPath}`);
