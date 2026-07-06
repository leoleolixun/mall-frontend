const TARGET_PAGE_NAME = "02 前台三端原型";
const FONT_FAMILY = "Inter";
const SCREEN_W = 375;
const SCREEN_H = 812;

const colors = {
  white: "#FFFFFF",
  soft: "#F8FAFC",
  line: "#E4E7EC",
  ink: "#172033",
  muted: "#687386",
  brand: "#E5484D",
  warm: "#FFF1F0",
  image: "#FBE5E6",
  border: "#D0D5DD",
  placeholder: "#98A2B3"
};

const mobilePageNames = [
  "首页",
  "分类",
  "搜索列表",
  "商品详情",
  "购物车",
  "确认订单",
  "支付结果",
  "订单列表",
  "订单详情",
  "物流跟踪",
  "售后列表",
  "售后申请",
  "售后详情",
  "我的",
  "登录授权",
  "个人资料",
  "地址管理",
  "优惠券中心",
  "收藏夹",
  "消息中心",
  "账号安全",
  "客服工单",
  "发票管理",
  "帮助中心",
  "搜索空结果"
];

const legacyGeneratedNames = mobilePageNames
  .map((name) => "H5 / " + name)
  .concat(mobilePageNames.map((name) => "小程序 / " + name));
const generatedPageNames = mobilePageNames.map((name) => "移动端 / " + name);
const generatedNames = ["Mobile main pages note"].concat(generatedPageNames, legacyGeneratedNames);

function rgb(hex) {
  const value = parseInt(hex.slice(1), 16);
  return {
    r: ((value >> 16) & 255) / 255,
    g: ((value >> 8) & 255) / 255,
    b: (value & 255) / 255
  };
}

function paint(hex) {
  return { type: "SOLID", color: rgb(hex) };
}

async function loadFonts() {
  await Promise.all(
    ["Regular", "Medium", "Semi Bold", "Bold"].map((style) =>
      figma.loadFontAsync({ family: FONT_FAMILY, style })
    )
  );
}

function append(parent, node, ids) {
  parent.appendChild(node);
  ids.push(node.id);
  return node;
}

function frame(parent, name, x, y, width, height, fill, radius, ids) {
  const node = figma.createFrame();
  node.name = name;
  node.x = x;
  node.y = y;
  node.resize(width, height);
  node.fills = [paint(fill || colors.white)];
  node.cornerRadius = radius === undefined ? 8 : radius;
  node.clipsContent = true;
  return append(parent, node, ids);
}

function box(parent, name, x, y, width, height, fill, radius, ids) {
  const node = frame(parent, name, x, y, width, height, fill || colors.white, radius, ids);
  node.strokes = [paint(colors.line)];
  node.strokeWeight = 1;
  return node;
}

function text(parent, value, x, y, width, size, style, fill, ids) {
  const node = figma.createText();
  node.name = "Text / " + value.slice(0, 24);
  node.fontName = { family: FONT_FAMILY, style: style || "Regular" };
  node.characters = value;
  node.fontSize = size || 14;
  node.lineHeight = { unit: "PIXELS", value: Math.round((size || 14) * 1.35) };
  node.letterSpacing = { unit: "PERCENT", value: 0 };
  node.fills = [paint(fill || colors.ink)];
  node.textAutoResize = "HEIGHT";
  node.resize(width, Math.max(20, (size || 14) * 1.5));
  node.x = x;
  node.y = y;
  return append(parent, node, ids);
}

function button(parent, label, x, y, width, isPrimary, ids) {
  const node = frame(parent, "Button / " + label, x, y, width, 36, isPrimary ? colors.brand : colors.white, 18, ids);
  if (!isPrimary) {
    node.strokes = [paint(colors.line)];
    node.strokeWeight = 1;
  }
  const labelNode = text(node, label, 10, 9, width - 20, 13, "Semi Bold", isPrimary ? colors.white : colors.ink, ids);
  labelNode.textAlignHorizontal = "CENTER";
  return node;
}

function chip(parent, label, x, y, width, isActive, ids) {
  const node = frame(parent, "Chip / " + label, x, y, width, 28, isActive ? colors.brand : colors.soft, 14, ids);
  const labelNode = text(node, label, 8, 6, width - 16, 12, "Medium", isActive ? colors.white : colors.ink, ids);
  labelNode.textAlignHorizontal = "CENTER";
  return node;
}

function input(parent, placeholder, x, y, width, ids) {
  const node = box(parent, "Input / " + placeholder, x, y, width, 36, colors.white, 18, ids);
  text(node, placeholder, 14, 10, width - 28, 12, "Regular", colors.placeholder, ids);
  return node;
}

function phoneScreen(page, name, x, y, ids, isMiniProgram) {
  const screen = frame(page, name, x, y, SCREEN_W, SCREEN_H, colors.white, 28, ids);
  screen.strokes = [paint(colors.border)];
  screen.strokeWeight = 1;
  frame(screen, "Status bar", 0, 0, SCREEN_W, 24, colors.white, 0, ids);
  if (isMiniProgram) {
    text(screen, "9:41", 16, 6, 60, 12, "Semi Bold", colors.ink, ids);
    const capsule = box(screen, "Mini program capsule", 278, 7, 76, 22, colors.white, 11, ids);
    text(capsule, "...", 12, 2, 24, 12, "Bold", colors.ink, ids);
    text(capsule, "o", 48, 4, 14, 10, "Bold", colors.ink, ids);
  } else {
    text(screen, "9:41", 16, 6, 60, 12, "Semi Bold", colors.ink, ids);
    text(screen, "5G  100%", 296, 6, 64, 12, "Medium", colors.ink, ids);
  }
  return screen;
}

function topBar(parent, title, ids, withBack) {
  const bar = frame(parent, "Top bar / " + title, 0, 24, SCREEN_W, 48, colors.white, 0, ids);
  bar.strokes = [paint(colors.line)];
  bar.strokeWeight = 1;
  if (withBack) text(bar, "<", 16, 14, 24, 18, "Bold", colors.ink, ids);
  text(bar, title, withBack ? 52 : 16, 14, 220, 16, "Bold", colors.ink, ids);
  return bar;
}

function tabBar(parent, active, ids, isMiniProgram) {
  const bar = frame(parent, "Bottom tab bar", 0, 748, SCREEN_W, 64, colors.white, 0, ids);
  bar.strokes = [paint(colors.line)];
  bar.strokeWeight = 1;
  const labels = isMiniProgram ? ["首页", "分类", "购物车", "订单", "我的"] : ["首页", "分类", "购物车", "订单", "我的"];
  labels.forEach((label, index) => {
    const x = index * 75;
    frame(bar, "Tab icon / " + label, x + 28, 10, 18, 18, label === active ? colors.brand : colors.line, 9, ids);
    const t = text(bar, label, x + 14, 34, 48, 11, "Medium", label === active ? colors.brand : colors.muted, ids);
    t.textAlignHorizontal = "CENTER";
  });
  return bar;
}

function productCard(parent, name, price, x, y, width, ids) {
  const card = box(parent, "Product card / " + name, x, y, width, 190, colors.white, 10, ids);
  frame(card, "Product image", 10, 10, width - 20, 104, colors.image, 8, ids);
  text(card, name, 10, 126, width - 20, 13, "Semi Bold", colors.ink, ids);
  text(card, price, 10, 160, 70, 16, "Bold", colors.brand, ids);
  return card;
}

function orderRow(parent, title, status, y, ids) {
  const row = box(parent, "Order row / " + title, 12, y, 351, 110, colors.white, 10, ids);
  text(row, title, 14, 14, 170, 14, "Semi Bold", colors.ink, ids);
  chip(row, status, 262, 10, 70, status === "待支付", ids);
  frame(row, "Goods image", 14, 46, 48, 48, colors.image, 6, ids);
  text(row, "蓝牙耳机 Pro 等 2 件商品", 76, 48, 180, 13, "Regular", colors.muted, ids);
  text(row, "¥525", 280, 62, 56, 16, "Bold", colors.brand, ids);
  return row;
}

async function getTargetPage() {
  if (typeof figma.loadAllPagesAsync === "function") {
    await figma.loadAllPagesAsync();
  }
  const namedPage = figma.root.children.find((page) => page.name === TARGET_PAGE_NAME);
  const targetPage = namedPage || figma.currentPage;
  if (typeof figma.setCurrentPageAsync === "function") {
    await figma.setCurrentPageAsync(targetPage);
  } else {
    figma.currentPage = targetPage;
  }
  return targetPage;
}

function cleanupGenerated(page) {
  page.findAll((node) =>
    generatedNames.indexOf(node.name) !== -1 ||
    node.name.indexOf("Mobile group / ") === 0 ||
    node.name.indexOf("H5 / ") === 0 ||
    node.name.indexOf("小程序 / ") === 0 ||
    node.name.indexOf("移动端 / ") === 0
  ).forEach((node) => node.remove());
}

function getStartY(page) {
  let maxY = 0;
  page.children.forEach((child) => {
    maxY = Math.max(maxY, child.y + child.height);
  });
  return Math.max(2200, Math.ceil(maxY + 120));
}

function groupHeader(page, title, subtitle, x, y, width, ids) {
  const header = box(page, "Mobile group / " + title, x, y, width, 64, colors.warm, 12, ids);
  text(header, title, 18, 16, 180, 22, "Bold", colors.brand, ids);
  text(header, subtitle, 206, 21, width - 240, 14, "Regular", colors.muted, ids);
  return header;
}

function buildH5Home(page, x, y, ids) {
  const s = phoneScreen(page, "H5 / 首页", x, y, ids, false);
  topBar(s, "商城首页", ids, false);
  input(s, "搜索商品 / 品牌", 16, 86, 343, ids);
  const hero = frame(s, "Home hero", 16, 136, 343, 128, colors.warm, 14, ids);
  text(hero, "夏季焕新", 20, 20, 160, 28, "Bold", colors.brand, ids);
  text(hero, "领券下单更划算", 22, 66, 180, 14, "Regular", colors.ink, ids);
  button(hero, "立即选购", 222, 76, 96, true, ids);
  ["美妆", "数码", "服饰", "母婴", "食品"].forEach((label, index) => {
    frame(s, "Category icon / " + label, 20 + index * 70, 288, 42, 42, colors.soft, 21, ids);
    text(s, label, 16 + index * 70, 338, 50, 12, "Medium", colors.ink, ids);
  });
  text(s, "为你推荐", 16, 376, 120, 18, "Bold", colors.ink, ids);
  productCard(s, "蓝牙耳机 Pro", "¥299", 16, 412, 164, ids);
  productCard(s, "智能台灯", "¥159", 195, 412, 164, ids);
  tabBar(s, "首页", ids, false);
  return s;
}

function buildH5Category(page, x, y, ids) {
  const s = phoneScreen(page, "H5 / 分类", x, y, ids, false);
  topBar(s, "商品分类", ids, false);
  input(s, "搜索分类或商品", 16, 86, 343, ids);
  const side = frame(s, "Category sidebar", 0, 138, 94, 610, colors.soft, 0, ids);
  ["推荐", "美妆", "数码", "服饰", "母婴", "家居", "食品"].forEach((label, index) => {
    const active = index === 2;
    frame(side, "Side item / " + label, 0, index * 48, 94, 48, active ? colors.white : colors.soft, 0, ids);
    text(side, label, 22, index * 48 + 15, 50, 13, active ? "Semi Bold" : "Regular", active ? colors.brand : colors.ink, ids);
  });
  text(s, "数码家电", 116, 154, 120, 18, "Bold", colors.ink, ids);
  ["手机通讯", "影音娱乐", "智能穿戴", "生活电器", "电脑办公", "配件耗材"].forEach((label, index) => {
    const x0 = 116 + (index % 2) * 116;
    const y0 = 198 + Math.floor(index / 2) * 118;
    frame(s, "Sub category image / " + label, x0, y0, 80, 70, colors.image, 10, ids);
    text(s, label, x0 - 2, y0 + 82, 84, 12, "Medium", colors.ink, ids);
  });
  tabBar(s, "分类", ids, false);
  return s;
}

function buildH5List(page, x, y, ids) {
  const s = phoneScreen(page, "H5 / 搜索列表", x, y, ids, false);
  topBar(s, "搜索结果", ids, true);
  input(s, "蓝牙耳机", 54, 86, 305, ids);
  ["综合", "销量", "新品", "价格"].forEach((label, index) => chip(s, label, 16 + index * 86, 136, 70, index === 0, ids));
  productCard(s, "蓝牙耳机 Pro", "¥299", 16, 184, 164, ids);
  productCard(s, "降噪耳机 Air", "¥349", 195, 184, 164, ids);
  productCard(s, "智能音箱 Max", "¥399", 16, 394, 164, ids);
  productCard(s, "快充套装", "¥89", 195, 394, 164, ids);
  return s;
}

function buildH5Detail(page, x, y, ids) {
  const s = phoneScreen(page, "H5 / 商品详情", x, y, ids, false);
  topBar(s, "商品详情", ids, true);
  frame(s, "Product gallery", 0, 72, 375, 310, colors.image, 0, ids);
  text(s, "蓝牙耳机 Pro 主动降噪", 16, 404, 260, 20, "Bold", colors.ink, ids);
  text(s, "¥299", 16, 438, 100, 28, "Bold", colors.brand, ids);
  text(s, "高解析音质 · 30 小时续航 · 30 天无忧退换", 16, 480, 300, 13, "Regular", colors.muted, ids);
  const sku = box(s, "Sku selector", 16, 528, 343, 96, colors.white, 12, ids);
  text(sku, "规格", 14, 14, 60, 14, "Semi Bold", colors.ink, ids);
  ["曜石黑", "珍珠白", "海盐蓝"].forEach((label, index) => chip(sku, label, 14 + index * 86, 48, 74, index === 0, ids));
  const actions = frame(s, "Detail actions", 0, 748, 375, 64, colors.white, 0, ids);
  actions.strokes = [paint(colors.line)];
  actions.strokeWeight = 1;
  button(actions, "加入购物车", 108, 14, 116, false, ids);
  button(actions, "立即购买", 236, 14, 116, true, ids);
  text(actions, "客服", 24, 24, 36, 12, "Medium", colors.muted, ids);
  return s;
}

function buildH5Cart(page, x, y, ids) {
  const s = phoneScreen(page, "H5 / 购物车", x, y, ids, false);
  topBar(s, "购物车", ids, false);
  [["蓝牙耳机 Pro", "曜石黑", "¥299"], ["氨基酸洁面乳", "套装", "¥128"], ["儿童保温杯", "粉色", "¥89"]].forEach(([name, sku, price], index) => {
    const row = box(s, "Cart item / " + name, 16, 92 + index * 118, 343, 100, colors.white, 12, ids);
    frame(row, "Product image", 12, 14, 70, 70, colors.image, 8, ids);
    text(row, name, 96, 14, 160, 14, "Semi Bold", colors.ink, ids);
    text(row, sku, 96, 40, 120, 12, "Regular", colors.muted, ids);
    text(row, price, 96, 68, 70, 16, "Bold", colors.brand, ids);
    text(row, "-  1  +", 254, 68, 64, 13, "Medium", colors.ink, ids);
  });
  const bar = frame(s, "Cart settle bar", 0, 748, 375, 64, colors.white, 0, ids);
  bar.strokes = [paint(colors.line)];
  bar.strokeWeight = 1;
  text(bar, "合计 ¥604", 16, 22, 120, 18, "Bold", colors.brand, ids);
  button(bar, "去结算", 248, 14, 104, true, ids);
  return s;
}

function buildH5Checkout(page, x, y, ids) {
  const s = phoneScreen(page, "H5 / 确认订单", x, y, ids, false);
  topBar(s, "确认订单", ids, true);
  const addr = box(s, "Address card", 16, 92, 343, 92, colors.warm, 12, ids);
  text(addr, "李先生 138****8888", 14, 16, 180, 14, "Semi Bold", colors.ink, ids);
  text(addr, "上海市浦东新区 XX 路 88 号", 14, 44, 260, 13, "Regular", colors.muted, ids);
  const goods = box(s, "Order goods", 16, 204, 343, 210, colors.white, 12, ids);
  text(goods, "商品清单", 14, 14, 100, 16, "Bold", colors.ink, ids);
  compactGoods(goods, "蓝牙耳机 Pro", "¥299", 14, 52, ids);
  compactGoods(goods, "氨基酸洁面乳", "¥128 x2", 14, 116, ids);
  const pay = box(s, "Pay method", 16, 434, 343, 116, colors.white, 12, ids);
  text(pay, "支付方式", 14, 14, 100, 16, "Bold", colors.ink, ids);
  ["微信支付", "支付宝"].forEach((label, index) => chip(pay, label, 14 + index * 92, 56, 82, index === 0, ids));
  const bar = frame(s, "Checkout bar", 0, 748, 375, 64, colors.white, 0, ids);
  bar.strokes = [paint(colors.line)];
  bar.strokeWeight = 1;
  text(bar, "应付 ¥604", 16, 22, 120, 18, "Bold", colors.brand, ids);
  button(bar, "提交订单", 234, 14, 118, true, ids);
  return s;
}

function compactGoods(parent, name, price, x, y, ids) {
  frame(parent, "Goods thumb / " + name, x, y, 48, 48, colors.image, 6, ids);
  text(parent, name, x + 62, y + 2, 150, 13, "Semi Bold", colors.ink, ids);
  text(parent, price, x + 226, y + 16, 70, 14, "Bold", colors.brand, ids);
}

function buildH5PayResult(page, x, y, ids) {
  const s = phoneScreen(page, "H5 / 支付结果", x, y, ids, false);
  topBar(s, "支付结果", ids, true);
  frame(s, "Success icon", 148, 150, 80, 80, colors.warm, 40, ids);
  text(s, "支付成功", 136, 254, 120, 26, "Bold", colors.brand, ids);
  text(s, "订单已提交，商家将尽快发货。", 88, 300, 210, 14, "Regular", colors.muted, ids);
  text(s, "订单号：202607040001", 96, 346, 200, 13, "Medium", colors.ink, ids);
  button(s, "查看订单", 76, 414, 106, true, ids);
  button(s, "继续购物", 196, 414, 106, false, ids);
  return s;
}

function buildH5Orders(page, x, y, ids) {
  const s = phoneScreen(page, "H5 / 订单列表", x, y, ids, false);
  topBar(s, "我的订单", ids, false);
  ["全部", "待付款", "待发货", "待收货"].forEach((label, index) => chip(s, label, 16 + index * 86, 92, 70, index === 0, ids));
  orderRow(s, "订单 202607040001", "待发货", 142, ids);
  orderRow(s, "订单 202607030012", "待支付", 270, ids);
  orderRow(s, "订单 202607020030", "已完成", 398, ids);
  tabBar(s, "订单", ids, false);
  return s;
}

function buildH5Mine(page, x, y, ids) {
  const s = phoneScreen(page, "H5 / 我的", x, y, ids, false);
  topBar(s, "我的", ids, false);
  const profile = frame(s, "Mine profile", 16, 92, 343, 128, colors.warm, 16, ids);
  frame(profile, "Avatar", 18, 28, 64, 64, colors.white, 32, ids);
  text(profile, "李先生", 100, 34, 100, 20, "Bold", colors.ink, ids);
  text(profile, "积分 1280 · 普通会员", 100, 70, 160, 13, "Regular", colors.muted, ids);
  const stats = box(s, "Mine stats", 16, 240, 343, 80, colors.white, 12, ids);
  ["待付款", "待发货", "待收货", "售后"].forEach((label, index) => {
    text(stats, String(index + 1), 36 + index * 82, 18, 40, 18, "Bold", colors.brand, ids);
    text(stats, label, 24 + index * 82, 48, 60, 12, "Regular", colors.muted, ids);
  });
  ["地址管理", "优惠券", "收藏商品", "客服工单", "账号安全"].forEach((label, index) => {
    const row = box(s, "Mine menu / " + label, 16, 344 + index * 54, 343, 44, colors.white, 10, ids);
    text(row, label, 16, 14, 140, 13, "Medium", colors.ink, ids);
    text(row, ">", 314, 14, 20, 13, "Bold", colors.muted, ids);
  });
  tabBar(s, "我的", ids, false);
  return s;
}

function buildMiniHome(page, x, y, ids) {
  const s = phoneScreen(page, "小程序 / 首页", x, y, ids, true);
  topBar(s, "商城", ids, false);
  input(s, "搜索商品", 16, 86, 343, ids);
  const hero = frame(s, "Mini home hero", 16, 136, 343, 118, colors.warm, 14, ids);
  text(hero, "小程序商城", 20, 20, 160, 26, "Bold", colors.brand, ids);
  text(hero, "精选好物，极速下单", 22, 62, 180, 14, "Regular", colors.ink, ids);
  ["分类", "秒杀", "新品", "领券"].forEach((label, index) => {
    frame(s, "Quick entry / " + label, 24 + index * 86, 282, 42, 42, colors.soft, 21, ids);
    text(s, label, 20 + index * 86, 332, 50, 12, "Medium", colors.ink, ids);
  });
  text(s, "热门推荐", 16, 372, 120, 18, "Bold", colors.ink, ids);
  productCard(s, "蓝牙耳机 Pro", "¥299", 16, 408, 164, ids);
  productCard(s, "智能台灯", "¥159", 195, 408, 164, ids);
  tabBar(s, "首页", ids, true);
  return s;
}

function buildMiniCategory(page, x, y, ids) {
  const s = phoneScreen(page, "小程序 / 分类", x, y, ids, true);
  topBar(s, "分类", ids, false);
  input(s, "搜索商品", 16, 86, 343, ids);
  const side = frame(s, "Mini category sidebar", 0, 138, 94, 610, colors.soft, 0, ids);
  ["推荐", "美妆", "数码", "服饰", "母婴", "食品"].forEach((label, index) => {
    text(side, label, 24, 18 + index * 50, 50, 13, index === 2 ? "Semi Bold" : "Regular", index === 2 ? colors.brand : colors.ink, ids);
  });
  text(s, "数码家电", 116, 154, 120, 18, "Bold", colors.ink, ids);
  ["耳机", "音箱", "台灯", "快充", "键盘", "鼠标"].forEach((label, index) => {
    const x0 = 116 + (index % 2) * 116;
    const y0 = 198 + Math.floor(index / 2) * 118;
    frame(s, "Mini sub category / " + label, x0, y0, 80, 70, colors.image, 10, ids);
    text(s, label, x0 + 8, y0 + 82, 60, 12, "Medium", colors.ink, ids);
  });
  tabBar(s, "分类", ids, true);
  return s;
}

function buildMiniList(page, x, y, ids) {
  const s = phoneScreen(page, "小程序 / 搜索列表", x, y, ids, true);
  topBar(s, "商品列表", ids, true);
  input(s, "蓝牙耳机", 54, 86, 305, ids);
  ["综合", "销量", "价格"].forEach((label, index) => chip(s, label, 16 + index * 92, 136, 74, index === 0, ids));
  productCard(s, "蓝牙耳机 Pro", "¥299", 16, 184, 164, ids);
  productCard(s, "降噪耳机 Air", "¥349", 195, 184, 164, ids);
  productCard(s, "智能音箱 Max", "¥399", 16, 394, 164, ids);
  productCard(s, "快充套装", "¥89", 195, 394, 164, ids);
  return s;
}

function buildMiniDetail(page, x, y, ids) {
  const s = phoneScreen(page, "小程序 / 商品详情", x, y, ids, true);
  topBar(s, "商品详情", ids, true);
  frame(s, "Mini product image", 0, 72, 375, 300, colors.image, 0, ids);
  text(s, "蓝牙耳机 Pro 主动降噪", 16, 394, 260, 20, "Bold", colors.ink, ids);
  text(s, "¥299", 16, 430, 100, 28, "Bold", colors.brand, ids);
  text(s, "30 小时续航 · 支持小程序客服", 16, 474, 260, 13, "Regular", colors.muted, ids);
  const service = box(s, "Mini service card", 16, 522, 343, 80, colors.white, 12, ids);
  text(service, "服务", 14, 14, 60, 14, "Semi Bold", colors.ink, ids);
  text(service, "官方正品 · 7 天无理由 · 极速发货", 68, 14, 230, 13, "Regular", colors.muted, ids);
  const actions = frame(s, "Mini detail actions", 0, 748, 375, 64, colors.white, 0, ids);
  actions.strokes = [paint(colors.line)];
  actions.strokeWeight = 1;
  button(actions, "加入购物车", 108, 14, 116, false, ids);
  button(actions, "立即购买", 236, 14, 116, true, ids);
  text(actions, "客服", 24, 24, 36, 12, "Medium", colors.muted, ids);
  return s;
}

function buildMiniCart(page, x, y, ids) {
  const s = phoneScreen(page, "小程序 / 购物车", x, y, ids, true);
  topBar(s, "购物车", ids, false);
  [["蓝牙耳机 Pro", "曜石黑", "¥299"], ["氨基酸洁面乳", "套装", "¥128"]].forEach(([name, sku, price], index) => {
    const row = box(s, "Mini cart item / " + name, 16, 92 + index * 118, 343, 100, colors.white, 12, ids);
    frame(row, "Product image", 12, 14, 70, 70, colors.image, 8, ids);
    text(row, name, 96, 14, 160, 14, "Semi Bold", colors.ink, ids);
    text(row, sku, 96, 40, 120, 12, "Regular", colors.muted, ids);
    text(row, price, 96, 68, 70, 16, "Bold", colors.brand, ids);
    text(row, "-  1  +", 254, 68, 64, 13, "Medium", colors.ink, ids);
  });
  const bar = frame(s, "Mini cart bar", 0, 748, 375, 64, colors.white, 0, ids);
  bar.strokes = [paint(colors.line)];
  bar.strokeWeight = 1;
  text(bar, "合计 ¥555", 16, 22, 120, 18, "Bold", colors.brand, ids);
  button(bar, "去结算", 248, 14, 104, true, ids);
  tabBar(s, "购物车", ids, true);
  return s;
}

function buildMiniCheckout(page, x, y, ids) {
  const s = phoneScreen(page, "小程序 / 确认订单", x, y, ids, true);
  topBar(s, "确认订单", ids, true);
  const addr = box(s, "Mini address card", 16, 92, 343, 92, colors.warm, 12, ids);
  text(addr, "李先生 138****8888", 14, 16, 180, 14, "Semi Bold", colors.ink, ids);
  text(addr, "上海市浦东新区 XX 路 88 号", 14, 44, 260, 13, "Regular", colors.muted, ids);
  const goods = box(s, "Mini order goods", 16, 204, 343, 190, colors.white, 12, ids);
  text(goods, "商品清单", 14, 14, 100, 16, "Bold", colors.ink, ids);
  compactGoods(goods, "蓝牙耳机 Pro", "¥299", 14, 52, ids);
  compactGoods(goods, "氨基酸洁面乳", "¥128 x2", 14, 116, ids);
  const bar = frame(s, "Mini checkout bar", 0, 748, 375, 64, colors.white, 0, ids);
  bar.strokes = [paint(colors.line)];
  bar.strokeWeight = 1;
  text(bar, "应付 ¥555", 16, 22, 120, 18, "Bold", colors.brand, ids);
  button(bar, "微信支付", 234, 14, 118, true, ids);
  return s;
}

function buildMiniOrders(page, x, y, ids) {
  const s = phoneScreen(page, "小程序 / 订单列表", x, y, ids, true);
  topBar(s, "我的订单", ids, false);
  ["全部", "待付款", "待发货", "待收货"].forEach((label, index) => chip(s, label, 16 + index * 86, 92, 70, index === 0, ids));
  orderRow(s, "订单 202607040001", "待发货", 142, ids);
  orderRow(s, "订单 202607030012", "待支付", 270, ids);
  orderRow(s, "订单 202607020030", "已完成", 398, ids);
  tabBar(s, "订单", ids, true);
  return s;
}

function buildMiniMine(page, x, y, ids) {
  const s = phoneScreen(page, "小程序 / 我的", x, y, ids, true);
  topBar(s, "我的", ids, false);
  const profile = frame(s, "Mini mine profile", 16, 92, 343, 128, colors.warm, 16, ids);
  frame(profile, "Avatar", 18, 28, 64, 64, colors.white, 32, ids);
  text(profile, "微信用户", 100, 34, 120, 20, "Bold", colors.ink, ids);
  text(profile, "积分 1280 · 已授权手机号", 100, 70, 180, 13, "Regular", colors.muted, ids);
  const stats = box(s, "Mini mine stats", 16, 240, 343, 80, colors.white, 12, ids);
  ["待付款", "待发货", "待收货", "售后"].forEach((label, index) => {
    text(stats, String(index + 1), 36 + index * 82, 18, 40, 18, "Bold", colors.brand, ids);
    text(stats, label, 24 + index * 82, 48, 60, 12, "Regular", colors.muted, ids);
  });
  ["收货地址", "优惠券", "收藏商品", "联系客服", "设置"].forEach((label, index) => {
    const row = box(s, "Mini mine menu / " + label, 16, 344 + index * 54, 343, 44, colors.white, 10, ids);
    text(row, label, 16, 14, 140, 13, "Medium", colors.ink, ids);
    text(row, ">", 314, 14, 20, 13, "Bold", colors.muted, ids);
  });
  tabBar(s, "我的", ids, true);
  return s;
}

function mobileName(platform, pageName) {
  return platform + " / " + pageName;
}

function buildMobilePayResult(page, x, y, ids, platform, isMiniProgram) {
  const s = phoneScreen(page, mobileName(platform, "支付结果"), x, y, ids, isMiniProgram);
  topBar(s, "支付结果", ids, true);
  frame(s, "Success icon", 148, 150, 80, 80, colors.warm, 40, ids);
  text(s, "支付成功", 136, 254, 120, 26, "Bold", colors.brand, ids);
  text(s, isMiniProgram ? "微信支付已完成，订单进入商家处理。" : "订单已提交，商家将尽快发货。", 70, 300, 250, 14, "Regular", colors.muted, ids);
  text(s, "订单号：202607040001", 96, 346, 200, 13, "Medium", colors.ink, ids);
  button(s, "查看订单", 76, 414, 106, true, ids);
  button(s, "继续购物", 196, 414, 106, false, ids);
  return s;
}

function buildMiniPayResult(page, x, y, ids) {
  return buildMobilePayResult(page, x, y, ids, "小程序", true);
}

function buildMobileAuth(page, x, y, ids, platform, isMiniProgram) {
  const s = phoneScreen(page, mobileName(platform, "登录授权"), x, y, ids, isMiniProgram);
  topBar(s, isMiniProgram ? "授权登录" : "登录 / 注册", ids, true);
  frame(s, "Login brand mark", 136, 118, 104, 104, colors.warm, 52, ids);
  text(s, isMiniProgram ? "微信快捷授权" : "欢迎登录商城", 96, 252, 210, 26, "Bold", colors.ink, ids);
  text(s, isMiniProgram ? "授权手机号后可同步订单、地址和优惠券。" : "手机号验证码登录，支持注册新账号。", 66, 296, 260, 14, "Regular", colors.muted, ids);
  input(s, isMiniProgram ? "微信手机号" : "请输入手机号", 32, 360, 311, ids);
  input(s, "验证码", 32, 414, 190, ids);
  button(s, "获取验证码", 236, 414, 106, false, ids);
  button(s, isMiniProgram ? "授权并登录" : "登录", 32, 486, 311, true, ids);
  text(s, "登录即代表同意用户协议与隐私政策", 76, 544, 230, 12, "Regular", colors.placeholder, ids);
  return s;
}

function buildMobileOrderDetail(page, x, y, ids, platform, isMiniProgram) {
  const s = phoneScreen(page, mobileName(platform, "订单详情"), x, y, ids, isMiniProgram);
  topBar(s, "订单详情", ids, true);
  const status = frame(s, "Order status hero", 0, 72, 375, 112, colors.warm, 0, ids);
  text(status, "待发货", 24, 24, 100, 24, "Bold", colors.brand, ids);
  text(status, "商家正在准备商品，请留意物流更新。", 24, 62, 250, 13, "Regular", colors.ink, ids);
  const addr = box(s, "Order address", 16, 204, 343, 86, colors.white, 12, ids);
  text(addr, "李先生 138****8888", 14, 14, 180, 14, "Semi Bold", colors.ink, ids);
  text(addr, "上海市浦东新区 XX 路 88 号", 14, 42, 260, 13, "Regular", colors.muted, ids);
  const goods = box(s, "Order detail goods", 16, 310, 343, 154, colors.white, 12, ids);
  text(goods, "商品信息", 14, 14, 100, 16, "Bold", colors.ink, ids);
  compactGoods(goods, "蓝牙耳机 Pro", "¥299", 14, 52, ids);
  compactGoods(goods, "氨基酸洁面乳", "¥128 x2", 14, 104, ids);
  const summary = box(s, "Order amount summary", 16, 484, 343, 120, colors.white, 12, ids);
  [["商品金额", "¥555"], ["运费", "¥0"], ["实付", "¥555"]].forEach(([label, value], index) => {
    text(summary, label, 14, 16 + index * 32, 90, 13, index === 2 ? "Semi Bold" : "Regular", colors.muted, ids);
    text(summary, value, 260, 16 + index * 32, 60, 13, "Bold", index === 2 ? colors.brand : colors.ink, ids);
  });
  button(s, "联系商家", 88, 650, 96, false, ids);
  button(s, "查看物流", 200, 650, 96, true, ids);
  return s;
}

function buildMobileLogistics(page, x, y, ids, platform, isMiniProgram) {
  const s = phoneScreen(page, mobileName(platform, "物流跟踪"), x, y, ids, isMiniProgram);
  topBar(s, "物流跟踪", ids, true);
  const card = box(s, "Logistics summary", 16, 92, 343, 108, colors.white, 12, ids);
  frame(card, "Package thumb", 14, 18, 64, 64, colors.image, 8, ids);
  text(card, "顺丰速运 SF1234567890", 96, 20, 180, 14, "Semi Bold", colors.ink, ids);
  text(card, "预计明日 18:00 前送达", 96, 50, 180, 13, "Regular", colors.muted, ids);
  button(card, "复制单号", 242, 58, 82, false, ids);
  const timeline = box(s, "Logistics timeline", 16, 224, 343, 420, colors.white, 12, ids);
  text(timeline, "物流轨迹", 14, 14, 100, 16, "Bold", colors.ink, ids);
  [["运输中", "快件已到达上海浦东集散中心"], ["已揽收", "商家已交付快递"], ["已出库", "仓库完成拣货并出库"]].forEach(([title, desc], index) => {
    frame(timeline, "Timeline dot / " + title, 20, 62 + index * 108, 12, 12, index === 0 ? colors.brand : colors.line, 6, ids);
    text(timeline, title, 48, 54 + index * 108, 90, 14, "Semi Bold", index === 0 ? colors.brand : colors.ink, ids);
    text(timeline, desc, 48, 82 + index * 108, 230, 13, "Regular", colors.muted, ids);
    text(timeline, "2026-07-05 09:20", 48, 110 + index * 108, 160, 12, "Regular", colors.placeholder, ids);
  });
  return s;
}

function buildMobileAfterSaleList(page, x, y, ids, platform, isMiniProgram) {
  const s = phoneScreen(page, mobileName(platform, "售后列表"), x, y, ids, isMiniProgram);
  topBar(s, "售后服务", ids, true);
  ["全部", "处理中", "待寄回", "已完成"].forEach((label, index) => chip(s, label, 16 + index * 86, 92, 70, index === 0, ids));
  [["AS202607040001", "待寄回"], ["AS202607020018", "处理中"], ["AS202606280033", "已完成"]].forEach(([code, status], index) => {
    const row = box(s, "After sale row / " + code, 16, 142 + index * 126, 343, 106, colors.white, 12, ids);
    text(row, code, 14, 14, 160, 14, "Semi Bold", colors.ink, ids);
    chip(row, status, 252, 10, 72, status === "待寄回", ids);
    frame(row, "After sale goods", 14, 48, 48, 48, colors.image, 6, ids);
    text(row, "蓝牙耳机 Pro · 退款退货", 76, 50, 180, 13, "Regular", colors.muted, ids);
    text(row, "¥299", 280, 64, 52, 15, "Bold", colors.brand, ids);
  });
  return s;
}

function buildMobileAfterSaleApply(page, x, y, ids, platform, isMiniProgram) {
  const s = phoneScreen(page, mobileName(platform, "售后申请"), x, y, ids, isMiniProgram);
  topBar(s, "申请售后", ids, true);
  const goods = box(s, "Apply goods", 16, 92, 343, 88, colors.white, 12, ids);
  frame(goods, "Product image", 14, 14, 58, 58, colors.image, 8, ids);
  text(goods, "蓝牙耳机 Pro", 88, 18, 160, 14, "Semi Bold", colors.ink, ids);
  text(goods, "可申请退款 / 退货退款", 88, 46, 190, 13, "Regular", colors.muted, ids);
  const form = box(s, "After sale form", 16, 200, 343, 360, colors.white, 12, ids);
  text(form, "服务类型", 14, 16, 100, 16, "Bold", colors.ink, ids);
  ["仅退款", "退货退款", "换货"].forEach((label, index) => chip(form, label, 14 + index * 92, 54, 78, index === 1, ids));
  text(form, "退款原因", 14, 108, 100, 16, "Bold", colors.ink, ids);
  ["商品破损", "错发漏发", "不想要了"].forEach((label, index) => chip(form, label, 14 + index * 96, 146, 84, index === 0, ids));
  input(form, "退款说明", 14, 206, 315, ids);
  frame(form, "Upload proof", 14, 268, 72, 72, colors.soft, 8, ids);
  text(form, "上传凭证", 102, 292, 80, 13, "Regular", colors.muted, ids);
  button(s, "提交申请", 32, 620, 311, true, ids);
  return s;
}

function buildMobileAfterSaleDetail(page, x, y, ids, platform, isMiniProgram) {
  const s = phoneScreen(page, mobileName(platform, "售后详情"), x, y, ids, isMiniProgram);
  topBar(s, "售后详情", ids, true);
  const state = frame(s, "After sale state", 0, 72, 375, 112, colors.warm, 0, ids);
  text(state, "待寄回商品", 24, 24, 160, 24, "Bold", colors.brand, ids);
  text(state, "请在 7 天内填写退货物流信息。", 24, 62, 230, 13, "Regular", colors.ink, ids);
  const progress = box(s, "After sale progress", 16, 204, 343, 208, colors.white, 12, ids);
  [["申请提交", "已完成"], ["商家审核", "已通过"], ["买家寄回", "待处理"]].forEach(([title, status], index) => {
    frame(progress, "Progress dot / " + title, 20, 30 + index * 58, 12, 12, index < 2 ? colors.brand : colors.line, 6, ids);
    text(progress, title, 48, 22 + index * 58, 90, 14, "Semi Bold", colors.ink, ids);
    text(progress, status, 246, 22 + index * 58, 70, 13, "Regular", index < 2 ? colors.brand : colors.muted, ids);
  });
  const info = box(s, "After sale info", 16, 432, 343, 142, colors.white, 12, ids);
  text(info, "服务单号 AS202607040001", 14, 18, 220, 14, "Semi Bold", colors.ink, ids);
  text(info, "退款金额：¥299", 14, 54, 160, 13, "Regular", colors.muted, ids);
  text(info, "退货地址：上海市浦东新区售后仓", 14, 86, 240, 13, "Regular", colors.muted, ids);
  button(s, "填写物流", 224, 628, 104, true, ids);
  return s;
}

function buildMobileProfile(page, x, y, ids, platform, isMiniProgram) {
  const s = phoneScreen(page, mobileName(platform, "个人资料"), x, y, ids, isMiniProgram);
  topBar(s, "个人资料", ids, true);
  const profile = box(s, "Profile form", 16, 92, 343, 390, colors.white, 12, ids);
  frame(profile, "Avatar", 138, 28, 68, 68, colors.image, 34, ids);
  [["昵称", isMiniProgram ? "微信用户" : "李先生"], ["手机号", "138****8888"], ["生日", "1995-01-01"], ["性别", "男"], ["地区", "上海市"]].forEach(([label, value], index) => {
    const y0 = 126 + index * 48;
    text(profile, label, 16, y0, 70, 13, "Regular", colors.muted, ids);
    text(profile, value, 120, y0, 150, 13, "Medium", colors.ink, ids);
    text(profile, ">", 306, y0, 18, 13, "Bold", colors.placeholder, ids);
  });
  button(s, "保存资料", 32, 528, 311, true, ids);
  return s;
}

function buildMobileAddress(page, x, y, ids, platform, isMiniProgram) {
  const s = phoneScreen(page, mobileName(platform, "地址管理"), x, y, ids, isMiniProgram);
  topBar(s, "地址管理", ids, true);
  [["李先生 138****8888", "上海市浦东新区 XX 路 88 号", "默认"], ["王女士 139****6666", "杭州市西湖区 XX 路 20 号", "家"]].forEach(([name, addr, tag], index) => {
    const card = box(s, "Address item / " + tag, 16, 92 + index * 126, 343, 106, colors.white, 12, ids);
    text(card, name, 14, 16, 180, 14, "Semi Bold", colors.ink, ids);
    chip(card, tag, 254, 12, 58, tag === "默认", ids);
    text(card, addr, 14, 48, 260, 13, "Regular", colors.muted, ids);
    text(card, "编辑", 282, 76, 40, 13, "Medium", colors.brand, ids);
  });
  button(s, "新增收货地址", 32, 390, 311, true, ids);
  return s;
}

function buildMobileCoupon(page, x, y, ids, platform, isMiniProgram) {
  const s = phoneScreen(page, mobileName(platform, "优惠券中心"), x, y, ids, isMiniProgram);
  topBar(s, "优惠券", ids, true);
  ["可用", "已使用", "已过期"].forEach((label, index) => chip(s, label, 16 + index * 86, 92, 70, index === 0, ids));
  [["满 299 减 30", "全品类可用"], ["满 99 减 10", "美妆个护可用"], ["新人专享 8 折", "指定商品可用"]].forEach(([title, desc], index) => {
    const card = box(s, "Coupon / " + title, 16, 144 + index * 124, 343, 104, colors.warm, 12, ids);
    text(card, title, 18, 18, 150, 22, "Bold", colors.brand, ids);
    text(card, desc, 18, 58, 160, 13, "Regular", colors.ink, ids);
    button(card, "去使用", 236, 34, 82, true, ids);
  });
  return s;
}

function buildMobileFavorites(page, x, y, ids, platform, isMiniProgram) {
  const s = phoneScreen(page, mobileName(platform, "收藏夹"), x, y, ids, isMiniProgram);
  topBar(s, "收藏夹", ids, true);
  ["商品", "店铺"].forEach((label, index) => chip(s, label, 16 + index * 86, 92, 70, index === 0, ids));
  productCard(s, "蓝牙耳机 Pro", "¥299", 16, 144, 164, ids);
  productCard(s, "智能台灯", "¥159", 195, 144, 164, ids);
  productCard(s, "儿童保温杯", "¥89", 16, 354, 164, ids);
  productCard(s, "氨基酸洁面乳", "¥128", 195, 354, 164, ids);
  return s;
}

function buildMobileMessages(page, x, y, ids, platform, isMiniProgram) {
  const s = phoneScreen(page, mobileName(platform, "消息中心"), x, y, ids, isMiniProgram);
  topBar(s, "消息中心", ids, true);
  [["交易物流", "你的订单已从上海发出"], ["优惠活动", "你有一张优惠券即将过期"], ["账户通知", "登录设备发生变化"]].forEach(([title, desc], index) => {
    const row = box(s, "Message row / " + title, 16, 92 + index * 104, 343, 84, colors.white, 12, ids);
    frame(row, "Message icon", 14, 18, 48, 48, colors.warm, 24, ids);
    text(row, title, 78, 18, 120, 14, "Semi Bold", colors.ink, ids);
    text(row, desc, 78, 46, 200, 13, "Regular", colors.muted, ids);
    frame(row, "Unread dot", 304, 22, 8, 8, colors.brand, 4, ids);
  });
  return s;
}

function buildMobileSecurity(page, x, y, ids, platform, isMiniProgram) {
  const s = phoneScreen(page, mobileName(platform, "账号安全"), x, y, ids, isMiniProgram);
  topBar(s, "账号安全", ids, true);
  const score = frame(s, "Security score", 16, 92, 343, 126, colors.warm, 16, ids);
  text(score, "安全等级 高", 20, 22, 150, 22, "Bold", colors.brand, ids);
  text(score, "已绑定手机号，建议开启支付密码。", 20, 62, 230, 13, "Regular", colors.ink, ids);
  ["绑定手机", "实名认证", "支付密码", "隐私设置", "注销账号"].forEach((label, index) => {
    const row = box(s, "Security item / " + label, 16, 246 + index * 58, 343, 46, colors.white, 10, ids);
    text(row, label, 16, 16, 120, 13, "Medium", colors.ink, ids);
    text(row, index < 2 ? "已完成" : "去设置", 258, 16, 60, 13, "Regular", index < 2 ? colors.muted : colors.brand, ids);
  });
  return s;
}

function buildMobileSupport(page, x, y, ids, platform, isMiniProgram) {
  const s = phoneScreen(page, mobileName(platform, "客服工单"), x, y, ids, isMiniProgram);
  topBar(s, "客服工单", ids, true);
  const quick = box(s, "Support quick actions", 16, 92, 343, 112, colors.white, 12, ids);
  [["订单问题", "售后问题", "发票问题"]].flat().forEach((label, index) => chip(quick, label, 14 + index * 98, 42, 86, index === 0, ids));
  [["TK202607050001", "待客服回复"], ["TK202607030006", "已解决"]].forEach(([code, status], index) => {
    const row = box(s, "Ticket row / " + code, 16, 230 + index * 118, 343, 96, colors.white, 12, ids);
    text(row, code, 14, 16, 170, 14, "Semi Bold", colors.ink, ids);
    chip(row, status, 232, 12, 92, status !== "已解决", ids);
    text(row, "关于订单配送时效的咨询", 14, 50, 210, 13, "Regular", colors.muted, ids);
  });
  button(s, "新建工单", 32, 520, 311, true, ids);
  return s;
}

function buildMobileInvoice(page, x, y, ids, platform, isMiniProgram) {
  const s = phoneScreen(page, mobileName(platform, "发票管理"), x, y, ids, isMiniProgram);
  topBar(s, "发票管理", ids, true);
  const apply = frame(s, "Invoice apply banner", 16, 92, 343, 112, colors.warm, 16, ids);
  text(apply, "可开发票订单", 20, 22, 160, 22, "Bold", colors.brand, ids);
  text(apply, "选择已完成订单，提交抬头信息。", 20, 60, 220, 13, "Regular", colors.ink, ids);
  button(apply, "申请发票", 234, 42, 88, true, ids);
  [["蓝牙耳机 Pro 订单", "电子普通发票"], ["智能台灯订单", "待开票"]].forEach(([name, status], index) => {
    const row = box(s, "Invoice row / " + name, 16, 230 + index * 108, 343, 88, colors.white, 12, ids);
    text(row, name, 14, 16, 170, 14, "Semi Bold", colors.ink, ids);
    text(row, status, 14, 48, 120, 13, "Regular", colors.muted, ids);
    text(row, "¥299", 266, 32, 50, 16, "Bold", colors.brand, ids);
  });
  return s;
}

function buildMobileHelp(page, x, y, ids, platform, isMiniProgram) {
  const s = phoneScreen(page, mobileName(platform, "帮助中心"), x, y, ids, isMiniProgram);
  topBar(s, "帮助中心", ids, true);
  input(s, "搜索帮助问题", 16, 92, 343, ids);
  const hot = box(s, "Help hot questions", 16, 146, 343, 250, colors.white, 12, ids);
  text(hot, "热门问题", 14, 16, 100, 16, "Bold", colors.ink, ids);
  ["如何修改收货地址", "订单多久发货", "如何申请退款", "发票在哪里下载"].forEach((label, index) => {
    text(hot, label, 16, 58 + index * 42, 220, 13, "Medium", colors.ink, ids);
    text(hot, ">", 304, 58 + index * 42, 18, 13, "Bold", colors.placeholder, ids);
  });
  const contact = frame(s, "Help contact", 16, 426, 343, 116, colors.warm, 16, ids);
  text(contact, "仍需帮助？", 20, 22, 120, 20, "Bold", colors.brand, ids);
  text(contact, "联系在线客服或提交工单。", 20, 58, 180, 13, "Regular", colors.ink, ids);
  button(contact, "联系客服", 222, 40, 92, true, ids);
  return s;
}

function buildMobileSearchEmpty(page, x, y, ids, platform, isMiniProgram) {
  const s = phoneScreen(page, mobileName(platform, "搜索空结果"), x, y, ids, isMiniProgram);
  topBar(s, "搜索结果", ids, true);
  input(s, "不存在的商品", 54, 86, 305, ids);
  frame(s, "Empty illustration", 126, 190, 124, 124, colors.soft, 62, ids);
  text(s, "没有找到相关商品", 106, 342, 180, 22, "Bold", colors.ink, ids);
  text(s, "换个关键词试试，或看看推荐商品。", 78, 380, 230, 14, "Regular", colors.muted, ids);
  button(s, "重新搜索", 78, 438, 106, false, ids);
  button(s, "返回首页", 198, 438, 106, true, ids);
  text(s, "猜你喜欢", 16, 540, 120, 18, "Bold", colors.ink, ids);
  productCard(s, "智能台灯", "¥159", 16, 576, 164, ids);
  productCard(s, "快充套装", "¥89", 195, 576, 164, ids);
  return s;
}

function asMobilePage(name, builder) {
  return (page, x, y, ids) => {
    const screen = builder(page, x, y, ids);
    screen.name = "移动端 / " + name;
    return screen;
  };
}

async function run() {
  const createdIds = [];
  await loadFonts();
  const page = await getTargetPage();
  cleanupGenerated(page);

  const startY = getStartY(page);
  const note = box(page, "Mobile main pages note", 40, startY, 2550, 84, colors.white, 8, createdIds);
  text(note, "移动端页面补充", 24, 20, 220, 24, "Bold", colors.ink, createdIds);
  text(note, "H5 和小程序共用一套移动端原型，按业务模块分组，每个分组横向排成一排。", 276, 26, 760, 15, "Regular", colors.muted, createdIds);

  const screenGapX = 60;
  const groupHeaderH = 64;
  const groupTopGap = 30;
  const groupBottomGap = 84;
  let cursorY = startY + 130;
  const generatedScreens = [];

  const groups = [
    {
      title: "01 购物入口",
      subtitle: "首页、分类、搜索列表、商品详情。",
      pages: [
        ["首页", asMobilePage("首页", buildH5Home)],
        ["分类", asMobilePage("分类", buildH5Category)],
        ["搜索列表", asMobilePage("搜索列表", buildH5List)],
        ["商品详情", asMobilePage("商品详情", buildH5Detail)]
      ]
    },
    {
      title: "02 交易支付",
      subtitle: "购物车、确认订单、支付结果。",
      pages: [
        ["购物车", asMobilePage("购物车", buildH5Cart)],
        ["确认订单", asMobilePage("确认订单", buildH5Checkout)],
        ["支付结果", asMobilePage("支付结果", buildH5PayResult)]
      ]
    },
    {
      title: "03 订单履约",
      subtitle: "订单列表、订单详情、物流跟踪。",
      pages: [
        ["订单列表", asMobilePage("订单列表", buildH5Orders)],
        ["订单详情", (targetPage, screenX, screenY, ids) => buildMobileOrderDetail(targetPage, screenX, screenY, ids, "移动端", false)],
        ["物流跟踪", (targetPage, screenX, screenY, ids) => buildMobileLogistics(targetPage, screenX, screenY, ids, "移动端", false)]
      ]
    },
    {
      title: "04 售后服务",
      subtitle: "售后列表、售后申请、售后详情。",
      pages: [
        ["售后列表", (targetPage, screenX, screenY, ids) => buildMobileAfterSaleList(targetPage, screenX, screenY, ids, "移动端", false)],
        ["售后申请", (targetPage, screenX, screenY, ids) => buildMobileAfterSaleApply(targetPage, screenX, screenY, ids, "移动端", false)],
        ["售后详情", (targetPage, screenX, screenY, ids) => buildMobileAfterSaleDetail(targetPage, screenX, screenY, ids, "移动端", false)]
      ]
    },
    {
      title: "05 会员中心",
      subtitle: "我的、登录、资料、地址、优惠券、收藏。",
      pages: [
        ["我的", asMobilePage("我的", buildH5Mine)],
        ["登录授权", (targetPage, screenX, screenY, ids) => buildMobileAuth(targetPage, screenX, screenY, ids, "移动端", false)],
        ["个人资料", (targetPage, screenX, screenY, ids) => buildMobileProfile(targetPage, screenX, screenY, ids, "移动端", false)],
        ["地址管理", (targetPage, screenX, screenY, ids) => buildMobileAddress(targetPage, screenX, screenY, ids, "移动端", false)],
        ["优惠券中心", (targetPage, screenX, screenY, ids) => buildMobileCoupon(targetPage, screenX, screenY, ids, "移动端", false)],
        ["收藏夹", (targetPage, screenX, screenY, ids) => buildMobileFavorites(targetPage, screenX, screenY, ids, "移动端", false)]
      ]
    },
    {
      title: "06 消息账户",
      subtitle: "消息中心、账号安全。",
      pages: [
        ["消息中心", (targetPage, screenX, screenY, ids) => buildMobileMessages(targetPage, screenX, screenY, ids, "移动端", false)],
        ["账号安全", (targetPage, screenX, screenY, ids) => buildMobileSecurity(targetPage, screenX, screenY, ids, "移动端", false)]
      ]
    },
    {
      title: "07 服务支持",
      subtitle: "客服工单、发票管理、帮助中心、搜索空结果。",
      pages: [
        ["客服工单", (targetPage, screenX, screenY, ids) => buildMobileSupport(targetPage, screenX, screenY, ids, "移动端", false)],
        ["发票管理", (targetPage, screenX, screenY, ids) => buildMobileInvoice(targetPage, screenX, screenY, ids, "移动端", false)],
        ["帮助中心", (targetPage, screenX, screenY, ids) => buildMobileHelp(targetPage, screenX, screenY, ids, "移动端", false)],
        ["搜索空结果", (targetPage, screenX, screenY, ids) => buildMobileSearchEmpty(targetPage, screenX, screenY, ids, "移动端", false)]
      ]
    }
  ];

  groups.forEach((group) => {
    const groupWidth = Math.max(855, group.pages.length * SCREEN_W + (group.pages.length - 1) * screenGapX);
    groupHeader(page, group.title, group.subtitle, 40, cursorY, groupWidth, createdIds);
    const firstRowY = cursorY + groupHeaderH + groupTopGap;
    group.pages.forEach(([, builder], index) => {
      const x = 40 + index * (SCREEN_W + screenGapX);
      generatedScreens.push(builder(page, x, firstRowY, createdIds));
    });
    cursorY = firstRowY + SCREEN_H + groupBottomGap;
  });

  figma.viewport.scrollAndZoomIntoView(generatedScreens);
  figma.notify("移动端页面已添加到 02 前台三端原型");
  figma.closePlugin("Created " + createdIds.length + " nodes on " + page.name + ".");
}

run().catch((error) => {
  figma.closePlugin("生成失败：" + (error && error.message ? error.message : String(error)));
});
