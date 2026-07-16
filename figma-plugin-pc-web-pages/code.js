const TARGET_PAGE_NAME = "02 前台三端原型";
const FONT_FAMILY = "Inter";

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

const generatedNames = [
  "PC Web expansion note",
  "PC Web / 首页运营",
  "PC Web / 分类频道",
  "PC Web / 店铺首页",
  "PC Web / 店铺全部商品",
  "PC Web / 品牌专区",
  "PC Web / 秒杀活动",
  "PC Web / 新品频道",
  "PC Web / 商品列表搜索",
  "PC Web / 商品详情",
  "PC Web / 商品评价列表",
  "PC Web / 商品对比",
  "PC Web / 预售商品",
  "PC Web / 组合套餐",
  "PC Web / 购物车",
  "PC Web / 购物车空状态",
  "PC Web / 登录注册",
  "PC Web / 订单确认支付",
  "PC Web / 门店自提",
  "PC Web / 支付结果",
  "PC Web / 支付失败",
  "PC Web / 订单列表",
  "PC Web / 订单空状态",
  "PC Web / 订单取消",
  "PC Web / 退款结果",
  "PC Web / 个人中心",
  "PC Web / 个人资料",
  "PC Web / 地址管理",
  "PC Web / 地址空状态",
  "PC Web / 优惠券中心",
  "PC Web / 收藏夹",
  "PC Web / 收藏空状态",
  "PC Web / 浏览足迹",
  "PC Web / 评价晒单",
  "PC Web / 评价成功",
  "PC Web / 会员积分",
  "PC Web / 账号安全",
  "PC Web / 实名认证",
  "PC Web / 设置支付密码",
  "PC Web / 隐私设置",
  "PC Web / 绑定手机",
  "PC Web / 重置密码",
  "PC Web / 消息中心",
  "PC Web / 通知偏好",
  "PC Web / 物流跟踪",
  "PC Web / 订单详情",
  "PC Web / 售后列表",
  "PC Web / 售后申请",
  "PC Web / 售后详情",
  "PC Web / 退货物流填写",
  "PC Web / 客服工单",
  "PC Web / 工单详情",
  "PC Web / 发票管理",
  "PC Web / 发票详情",
  "PC Web / 注销账号",
  "PC Web / 帮助中心",
  "PC Web / 到货提醒",
  "PC Web / 搜索空结果",
  "PC Web / 404 页面"
];

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
  node.lineHeight = { unit: "PIXELS", value: Math.round((size || 14) * 1.38) };
  node.letterSpacing = { unit: "PERCENT", value: 0 };
  node.fills = [paint(fill || colors.ink)];
  node.textAutoResize = "HEIGHT";
  node.resize(width, Math.max(24, (size || 14) * 1.5));
  node.x = x;
  node.y = y;
  return append(parent, node, ids);
}

function button(parent, label, x, y, width, isPrimary, ids) {
  const node = frame(parent, "Button / " + label, x, y, width, 38, isPrimary ? colors.brand : colors.white, 8, ids);
  if (!isPrimary) {
    node.strokes = [paint(colors.line)];
    node.strokeWeight = 1;
  }
  const labelNode = text(node, label, 12, 9, width - 24, 13, "Semi Bold", isPrimary ? colors.white : colors.ink, ids);
  labelNode.textAlignHorizontal = "CENTER";
  return node;
}

function chip(parent, label, x, y, width, isActive, ids) {
  const node = frame(parent, "Chip / " + label, x, y, width, 30, isActive ? colors.brand : colors.soft, 15, ids);
  const labelNode = text(node, label, 8, 5, width - 16, 12, "Medium", isActive ? colors.white : colors.ink, ids);
  labelNode.textAlignHorizontal = "CENTER";
  return node;
}

function input(parent, placeholder, x, y, width, ids) {
  const node = box(parent, "Input / " + placeholder, x, y, width, 40, colors.white, 8, ids);
  text(node, placeholder, 12, 11, width - 24, 13, "Regular", colors.placeholder, ids);
  return node;
}

function header(parent, active, ids) {
  const node = frame(parent, "Header", 0, 0, 1440, 72, colors.white, 0, ids);
  node.strokes = [paint(colors.line)];
  node.strokeWeight = 1;
  text(node, "Mall", 64, 22, 120, 26, "Bold", colors.brand, ids);
  ["首页", "分类", "新品", "热卖", "个人中心"].forEach((item, index) => {
    text(
      node,
      item,
      220 + index * 72,
      26,
      item === "个人中心" ? 84 : 60,
      14,
      item === active ? "Semi Bold" : "Regular",
      item === active ? colors.brand : colors.ink,
      ids
    );
  });
  input(node, "搜索商品 / 品牌 / 分类", 820, 15, 360, ids);
  button(node, "登录", 1210, 18, 74, false, ids);
  button(node, "购物车", 1298, 18, 90, true, ids);
  return node;
}

function screen(page, name, x, y, ids) {
  const node = frame(page, name, x, y, 1440, 1060, colors.white, 16, ids);
  node.strokes = [paint(colors.border)];
  node.strokeWeight = 1;
  return node;
}

function table(parent, name, x, y, width, heads, rows, ids) {
  const node = box(parent, name, x, y, width, 44 + rows.length * 50, colors.white, 8, ids);
  const head = frame(node, "Table header", 0, 0, width, 44, colors.soft, 8, ids);
  const cellWidth = Math.floor(width / heads.length);
  heads.forEach((value, index) => {
    text(head, value, 16 + index * cellWidth, 13, cellWidth - 24, 12, "Semi Bold", colors.muted, ids);
  });
  rows.forEach((row, rowIndex) => {
    row.forEach((value, cellIndex) => {
      text(
        node,
        value,
        16 + cellIndex * cellWidth,
        60 + rowIndex * 50,
        cellWidth - 24,
        13,
        cellIndex === 0 ? "Medium" : "Regular",
        cellIndex === row.length - 1 ? colors.brand : colors.ink,
        ids
      );
    });
  });
  return node;
}

const personalCenterMenu = [
  ["总览", "PC Web / 个人中心"],
  ["我的订单", "PC Web / 订单列表"],
  ["个人资料", "PC Web / 个人资料"],
  ["地址管理", "PC Web / 地址管理"],
  ["优惠券", "PC Web / 优惠券中心"],
  ["收藏商品", "PC Web / 收藏夹"],
  ["浏览足迹", "PC Web / 浏览足迹"],
  ["评价晒单", "PC Web / 评价晒单"],
  ["会员积分", "PC Web / 会员积分"],
  ["账号安全", "PC Web / 账号安全"],
  ["隐私设置", "PC Web / 隐私设置"],
  ["消息中心", "PC Web / 消息中心"],
  ["售后服务", "PC Web / 售后列表"]
];

function personalCenterSidebar(parent, activeLabel, ids) {
  const sidebar = box(parent, "Personal center sidebar", 64, 120, 220, 820, colors.white, 8, ids);
  text(sidebar, "个人中心", 24, 24, 140, 22, "Bold", colors.ink, ids);
  text(sidebar, "我的服务", 24, 56, 120, 13, "Regular", colors.muted, ids);
  personalCenterMenu.forEach(([label, target], index) => {
    const active = label === activeLabel;
    const item = frame(sidebar, "Personal nav / " + label + " -> " + target, 24, 84 + index * 52, 172, 34, active ? colors.brand : colors.soft, 17, ids);
    text(item, label, 16, 8, 110, 13, active ? "Semi Bold" : "Regular", active ? colors.white : colors.ink, ids);
    text(item, "›", 146, 7, 14, 14, "Semi Bold", active ? colors.white : colors.muted, ids);
  });
  return sidebar;
}

function applyPersonalCenterLayout(parent, activeLabel, ids, alreadyOffset) {
  parent.children.slice().forEach((child) => {
    if (child.name === "Header" || child.name === "Personal center sidebar") return;
    if (child.name === "Account sidebar") {
      child.remove();
      return;
    }
    if (!alreadyOffset && child.y >= 100) {
      if (child.x < 700) {
        child.x += 256;
      }
      if (child.x + child.width > 1376) {
        child.resize(Math.max(260, 1376 - child.x), child.height);
      }
    }
  });
  personalCenterSidebar(parent, activeLabel, ids);
}

function miniProduct(parent, name, price, x, y, ids) {
  const card = box(parent, "Product mini / " + name, x, y, 202, 244, colors.white, 8, ids);
  frame(card, "Product image", 12, 12, 178, 132, colors.image, 7, ids);
  text(card, name, 12, 158, 178, 14, "Semi Bold", colors.ink, ids);
  text(card, price, 12, 204, 90, 18, "Bold", colors.brand, ids);
  button(card, "查看", 124, 196, 56, true, ids);
  return card;
}

function compactProduct(parent, name, price, x, y, ids) {
  const card = box(parent, "Product compact / " + name, x, y, 224, 74, colors.white, 8, ids);
  frame(card, "Product thumb", 12, 12, 50, 50, colors.image, 6, ids);
  text(card, name, 76, 14, 120, 13, "Medium", colors.ink, ids);
  text(card, price, 76, 42, 70, 14, "Bold", colors.brand, ids);
  return card;
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
  page.findAll((node) => generatedNames.indexOf(node.name) !== -1 || node.name.indexOf("PC Web group / ") === 0).forEach((node) => node.remove());
}

function getStartY(page) {
  let maxY = 0;
  page.children.forEach((child) => {
    maxY = Math.max(maxY, child.y + child.height);
  });
  return Math.max(2180, Math.ceil(maxY + 120));
}

function groupHeader(page, title, subtitle, x, y, ids) {
  const header = box(page, "PC Web group / " + title, x, y, 2940, 74, colors.warm, 12, ids);
  text(header, title, 28, 18, 360, 26, "Bold", colors.brand, ids);
  text(header, subtitle, 420, 24, 1200, 16, "Regular", colors.muted, ids);
  return header;
}

function buildHome(page, x, y, ids) {
  const home = screen(page, "PC Web / 首页运营", x, y, ids);
  header(home, "首页", ids);

  const hero = frame(home, "Home hero", 64, 112, 1312, 260, colors.warm, 18, ids);
  text(hero, "夏季焕新购物节", 56, 52, 420, 42, "Bold", colors.brand, ids);
  text(hero, "精选美妆、数码、家居、母婴好物，支持满减券、会员积分和极速配送。", 58, 122, 620, 18, "Regular", colors.ink, ids);
  button(hero, "立即选购", 58, 186, 116, true, ids);
  button(hero, "领取优惠券", 190, 186, 124, false, ids);
  frame(hero, "Hero product image", 860, 36, 320, 188, colors.image, 16, ids);

  const categories = box(home, "Category nav", 64, 410, 250, 540, colors.white, 8, ids);
  text(categories, "全部分类", 24, 22, 140, 20, "Bold", colors.ink, ids);
  ["美妆个护", "数码家电", "服饰鞋包", "母婴玩具", "食品生鲜", "家居生活", "运动户外", "图书文具"].forEach((item, index) => {
    chip(categories, item, 24, 70 + index * 52, 156, index === 0, ids);
  });

  const quick = box(home, "Marketing cards", 338, 410, 1038, 154, colors.white, 8, ids);
  [["限时秒杀", "10:00 场"], ["新人礼包", "最高 ¥99"], ["会员专区", "积分抵现"]].forEach(([title, desc], index) => {
    const card = frame(quick, "Marketing card / " + title, 24 + index * 330, 24, 302, 106, index === 0 ? colors.warm : colors.soft, 10, ids);
    text(card, title, 22, 22, 120, 20, "Bold", index === 0 ? colors.brand : colors.ink, ids);
    text(card, desc, 22, 58, 140, 14, "Regular", colors.muted, ids);
  });

  const featured = box(home, "Featured products", 338, 596, 1038, 354, colors.white, 8, ids);
  text(featured, "为你推荐", 24, 22, 160, 20, "Bold", colors.ink, ids);
  [["蓝牙耳机 Pro", "¥299"], ["氨基酸洁面乳", "¥128"], ["智能台灯", "¥159"], ["儿童保温杯", "¥89"]].forEach(([name, price], index) => {
    miniProduct(featured, name, price, 24 + index * 244, 74, ids);
  });

  return home;
}

function buildCategoryChannel(page, x, y, ids) {
  const category = screen(page, "PC Web / 分类频道", x, y, ids);
  header(category, "分类", ids);
  text(category, "分类频道", 64, 118, 220, 30, "Bold", colors.ink, ids);
  text(category, "按一级类目、二级类目和运营专题组织商品入口。", 64, 162, 560, 15, "Regular", colors.muted, ids);

  const side = box(category, "Category tree", 64, 214, 250, 740, colors.white, 8, ids);
  text(side, "全部类目", 24, 22, 140, 20, "Bold", colors.ink, ids);
  ["美妆个护", "数码家电", "服饰鞋包", "母婴玩具", "食品生鲜", "家居生活", "运动户外", "图书文具", "健康护理"].forEach((item, index) => {
    chip(side, item, 24, 70 + index * 48, 156, index === 1, ids);
  });

  const banner = frame(category, "Category banner", 338, 214, 1038, 180, colors.warm, 14, ids);
  text(banner, "数码家电频道", 36, 36, 260, 32, "Bold", colors.brand, ids);
  text(banner, "耳机、台灯、小家电、智能设备限时优惠。", 38, 92, 430, 16, "Regular", colors.ink, ids);
  button(banner, "查看热卖", 38, 126, 112, true, ids);

  const grid = box(category, "Sub category grid", 338, 426, 1038, 528, colors.white, 8, ids);
  text(grid, "二级分类", 24, 22, 160, 20, "Bold", colors.ink, ids);
  ["手机通讯", "影音娱乐", "智能穿戴", "生活电器", "厨房电器", "电脑办公", "摄影摄像", "配件耗材", "健康电器", "车载设备", "游戏设备", "服务保障"].forEach((item, index) => {
    const tile = box(grid, "Sub category / " + item, 24 + (index % 4) * 246, 72 + Math.floor(index / 4) * 136, 214, 104, colors.soft, 8, ids);
    frame(tile, "Category icon", 16, 20, 52, 52, colors.image, 26, ids);
    text(tile, item, 84, 26, 100, 16, "Semi Bold", colors.ink, ids);
    text(tile, "精选好物", 84, 56, 100, 13, "Regular", colors.muted, ids);
  });

  return category;
}

function buildStoreHome(page, x, y, ids) {
  const store = screen(page, "PC Web / 店铺首页", x, y, ids);
  header(store, "首页", ids);

  const top = frame(store, "Store header", 64, 104, 1312, 180, colors.warm, 16, ids);
  frame(top, "Store logo", 36, 38, 84, 84, colors.white, 42, ids);
  text(top, "Mall 数码旗舰店", 148, 42, 260, 28, "Bold", colors.brand, ids);
  text(top, "官方认证 · 粉丝 12.8 万 · 综合评分 4.9", 150, 88, 360, 15, "Regular", colors.ink, ids);
  button(top, "关注店铺", 1050, 64, 112, true, ids);
  button(top, "联系客服", 1184, 64, 112, false, ids);

  const nav = box(store, "Store nav", 64, 316, 1312, 64, colors.white, 8, ids);
  ["首页", "全部商品", "新品", "热销", "店铺活动", "品牌故事"].forEach((item, index) => chip(nav, item, 24 + index * 106, 17, 90, index === 0, ids));
  input(nav, "搜索本店商品", 1010, 12, 240, ids);

  const promo = box(store, "Store promo", 64, 416, 420, 520, colors.white, 8, ids);
  text(promo, "店铺活动", 24, 24, 160, 20, "Bold", colors.ink, ids);
  [["满 599 减 60", "全店通用"], ["买耳机送收纳包", "限时赠品"], ["会员专享价", "关注店铺可见"]].forEach(([title, desc], index) => {
    const card = frame(promo, "Store promo / " + title, 24, 78 + index * 126, 372, 96, index === 0 ? colors.warm : colors.soft, 10, ids);
    text(card, title, 20, 18, 180, 18, "Bold", index === 0 ? colors.brand : colors.ink, ids);
    text(card, desc, 20, 52, 180, 13, "Regular", colors.muted, ids);
    button(card, "去看看", 266, 30, 80, index === 0, ids);
  });

  const products = box(store, "Store hot products", 524, 416, 852, 520, colors.white, 8, ids);
  text(products, "店铺热卖", 24, 24, 160, 20, "Bold", colors.ink, ids);
  [["蓝牙耳机 Pro", "¥299"], ["智能台灯", "¥159"], ["快充套装", "¥89"], ["智能音箱", "¥199"], ["桌面充电站", "¥129"], ["收纳包", "¥29"]].forEach(([name, price], index) => {
    compactProduct(products, name, price, 24 + (index % 3) * 264, 76 + Math.floor(index / 3) * 118, ids);
  });

  return store;
}

function buildStoreProducts(page, x, y, ids) {
  const storeProducts = screen(page, "PC Web / 店铺全部商品", x, y, ids);
  header(storeProducts, "首页", ids);
  text(storeProducts, "店铺全部商品", 64, 118, 260, 30, "Bold", colors.ink, ids);

  const storeBar = box(storeProducts, "Store products header", 64, 180, 1312, 100, colors.warm, 10, ids);
  frame(storeBar, "Store logo", 24, 20, 60, 60, colors.white, 30, ids);
  text(storeBar, "Mall 数码旗舰店", 104, 24, 220, 22, "Bold", colors.brand, ids);
  text(storeBar, "全部商品 286 件 · 综合评分 4.9", 104, 58, 260, 14, "Regular", colors.ink, ids);
  input(storeBar, "搜索本店商品", 890, 30, 260, ids);
  button(storeBar, "搜索", 1170, 30, 82, true, ids);

  const filter = box(storeProducts, "Store product filters", 64, 318, 250, 620, colors.white, 8, ids);
  text(filter, "店内分类", 24, 24, 140, 20, "Bold", colors.ink, ids);
  ["全部", "耳机音箱", "充电配件", "智能设备", "电脑办公", "店铺活动"].forEach((item, index) => chip(filter, item, 24, 76 + index * 52, 156, index === 0, ids));

  const list = box(storeProducts, "Store product list", 338, 318, 1038, 620, colors.white, 8, ids);
  const toolbar = frame(list, "Store sort bar", 24, 24, 990, 50, colors.soft, 8, ids);
  ["综合", "销量", "新品", "价格"].forEach((item, index) => chip(toolbar, item, 18 + index * 74, 10, 58, index === 0, ids));
  [["蓝牙耳机 Pro", "¥299"], ["AI 智能音箱", "¥399"], ["快充套装", "¥89"], ["桌面充电站", "¥129"], ["收纳包", "¥29"], ["智能台灯", "¥159"], ["无线键盘", "¥399"], ["电竞鼠标", "¥229"]].forEach(([name, price], index) => {
    miniProduct(list, name, price, 24 + (index % 4) * 246, 104 + Math.floor(index / 4) * 260, ids);
  });

  return storeProducts;
}

function buildBrandZone(page, x, y, ids) {
  const brand = screen(page, "PC Web / 品牌专区", x, y, ids);
  header(brand, "新品", ids);
  text(brand, "品牌专区", 64, 118, 220, 30, "Bold", colors.ink, ids);

  const hero = frame(brand, "Brand hero", 64, 180, 1312, 220, colors.warm, 18, ids);
  text(hero, "精选品牌馆", 44, 42, 260, 36, "Bold", colors.brand, ids);
  text(hero, "官方授权品牌集合，统一承诺正品保障、售后无忧。", 46, 102, 460, 16, "Regular", colors.ink, ids);
  button(hero, "浏览品牌", 46, 150, 112, true, ids);
  frame(hero, "Brand collage", 880, 38, 320, 144, colors.image, 16, ids);

  const grid = box(brand, "Brand grid", 64, 438, 1312, 506, colors.white, 8, ids);
  text(grid, "热门品牌", 24, 24, 160, 20, "Bold", colors.ink, ids);
  ["Apple", "Dyson", "Nike", "L'Oreal", "Sony", "LEGO", "MUJI", "Xiaomi"].forEach((item, index) => {
    const card = box(grid, "Brand card / " + item, 24 + (index % 4) * 310, 78 + Math.floor(index / 4) * 174, 274, 132, colors.white, 8, ids);
    frame(card, "Brand logo", 20, 22, 72, 72, colors.soft, 36, ids);
    text(card, item, 112, 28, 120, 20, "Bold", colors.ink, ids);
    text(card, "在售商品 " + (80 + index * 16) + " 件", 112, 66, 140, 13, "Regular", colors.muted, ids);
    button(card, "进店", 178, 90, 64, index === 0, ids);
  });

  return brand;
}

function buildFlashSale(page, x, y, ids) {
  const sale = screen(page, "PC Web / 秒杀活动", x, y, ids);
  header(sale, "热卖", ids);
  text(sale, "限时秒杀", 64, 118, 220, 30, "Bold", colors.ink, ids);

  const countdown = frame(sale, "Flash countdown", 64, 180, 1312, 150, colors.warm, 14, ids);
  text(countdown, "10:00 场进行中", 36, 34, 240, 30, "Bold", colors.brand, ids);
  text(countdown, "距离结束 01 : 24 : 36", 38, 88, 260, 18, "Semi Bold", colors.ink, ids);
  ["10:00", "14:00", "20:00", "明日预告"].forEach((item, index) => chip(countdown, item, 860 + index * 100, 60, 82, index === 0, ids));

  const grid = box(sale, "Flash sale grid", 64, 366, 1312, 600, colors.white, 8, ids);
  [["蓝牙耳机 Pro", "¥199", "¥299"], ["快充套装", "¥49", "¥89"], ["智能台灯", "¥99", "¥159"], ["家用吹风机", "¥159", "¥219"], ["收纳包", "¥19", "¥29"], ["儿童保温杯", "¥59", "¥89"], ["洁面乳套装", "¥89", "¥128"], ["四件套", "¥199", "¥269"]].forEach(([name, price, origin], index) => {
    const card = box(grid, "Flash product / " + name, 24 + (index % 4) * 310, 28 + Math.floor(index / 4) * 276, 274, 240, colors.white, 8, ids);
    frame(card, "Product image", 14, 14, 246, 120, colors.image, 8, ids);
    text(card, name, 14, 148, 200, 15, "Semi Bold", colors.ink, ids);
    text(card, price, 14, 184, 80, 22, "Bold", colors.brand, ids);
    text(card, "原价 " + origin, 102, 190, 90, 12, "Regular", colors.muted, ids);
    button(card, "马上抢", 176, 180, 76, true, ids);
  });

  return sale;
}

function buildNewArrivals(page, x, y, ids) {
  const fresh = screen(page, "PC Web / 新品频道", x, y, ids);
  header(fresh, "新品", ids);
  text(fresh, "新品频道", 64, 118, 220, 30, "Bold", colors.ink, ids);

  const trend = box(fresh, "New arrivals trend", 64, 180, 420, 720, colors.white, 8, ids);
  text(trend, "新品趋势", 24, 24, 160, 20, "Bold", colors.ink, ids);
  [["本周上新", "128 件"], ["首发品牌", "16 个"], ["预约新品", "42 件"], ["新品折扣", "低至 7 折"]].forEach(([label, value], index) => {
    const stat = frame(trend, "New stat / " + label, 24, 78 + index * 114, 372, 84, index === 0 ? colors.warm : colors.soft, 10, ids);
    text(stat, label, 20, 18, 120, 15, "Semi Bold", colors.ink, ids);
    text(stat, value, 20, 46, 120, 24, "Bold", index === 0 ? colors.brand : colors.ink, ids);
  });

  const list = box(fresh, "New arrivals list", 524, 180, 852, 720, colors.white, 8, ids);
  text(list, "最新上架", 24, 24, 160, 20, "Bold", colors.ink, ids);
  [["AI 智能音箱", "¥399"], ["便携咖啡机", "¥299"], ["控油洗发水", "¥89"], ["机能双肩包", "¥269"], ["轻量跑鞋", "¥499"], ["露营灯", "¥129"], ["保湿精华", "¥169"], ["儿童积木套装", "¥199"]].forEach(([name, price], index) => {
    compactProduct(list, name, price, 24 + (index % 3) * 264, 76 + Math.floor(index / 3) * 118, ids);
  });

  return fresh;
}

function buildProductList(page, x, y, ids) {
  const list = screen(page, "PC Web / 商品列表搜索", x, y, ids);
  header(list, "分类", ids);
  text(list, "全部商品", 64, 118, 240, 30, "Bold", colors.ink, ids);
  text(list, "分类筛选、排序、商品网格、分页。", 64, 164, 520, 15, "Regular", colors.muted, ids);

  const sidebar = box(list, "Filter sidebar", 64, 214, 250, 728, colors.white, 8, ids);
  text(sidebar, "筛选条件", 20, 20, 160, 18, "Bold", colors.ink, ids);
  ["分类", "品牌", "价格", "配送", "状态"].forEach((group, index) => {
    text(sidebar, group, 20, 66 + index * 118, 180, 14, "Semi Bold", colors.ink, ids);
    ["全部", "美妆", "数码"].forEach((value, chipIndex) => {
      chip(
        sidebar,
        value,
        20 + (chipIndex % 2) * 96,
        94 + index * 118 + Math.floor(chipIndex / 2) * 38,
        84,
        chipIndex === 0,
        ids
      );
    });
  });

  const toolbar = box(list, "List toolbar", 338, 214, 1038, 64, colors.white, 8, ids);
  ["综合", "销量", "新品", "价格"].forEach((item, index) => chip(toolbar, item, 18 + index * 74, 17, 58, index === 0, ids));
  input(toolbar, "在结果中搜索", 720, 12, 220, ids);

  const products = [
    ["洁面乳套装", "¥128"],
    ["蓝牙耳机 Pro", "¥299"],
    ["轻薄羽绒服", "¥499"],
    ["儿童保温杯", "¥89"],
    ["智能台灯", "¥159"],
    ["家用吹风机", "¥219"],
    ["纯棉四件套", "¥269"],
    ["即食燕麦片", "¥49"]
  ];

  products.forEach(([name, price], index) => {
    const card = box(list, "Product card / " + name, 338 + (index % 4) * 260, 310 + Math.floor(index / 4) * 316, 238, 286, colors.white, 8, ids);
    frame(card, "Product image", 12, 12, 214, 176, colors.image, 7, ids);
    text(card, name, 12, 202, 214, 15, "Semi Bold", colors.ink, ids);
    text(card, price, 12, 246, 100, 20, "Bold", colors.brand, ids);
    button(card, "加购", 162, 238, 62, true, ids);
  });

  return list;
}

function buildProductDetail(page, x, y, ids) {
  const detail = screen(page, "PC Web / 商品详情", x, y, ids);
  header(detail, "分类", ids);
  text(detail, "首页 / 数码家电 / 蓝牙耳机 Pro", 64, 104, 420, 14, "Regular", colors.muted, ids);

  const gallery = box(detail, "Product gallery", 64, 144, 560, 600, colors.white, 8, ids);
  frame(gallery, "Main product image", 24, 24, 512, 408, colors.image, 10, ids);
  [0, 1, 2, 3].forEach((item) => {
    frame(gallery, "Thumbnail " + (item + 1), 24 + item * 128, 456, 104, 92, item === 0 ? colors.warm : colors.soft, 8, ids);
  });

  const info = box(detail, "Product purchase panel", 660, 144, 716, 600, colors.white, 8, ids);
  text(info, "蓝牙耳机 Pro 主动降噪长续航", 32, 32, 520, 30, "Bold", colors.ink, ids);
  text(info, "高解析音质、通勤降噪、低延迟游戏模式，支持 30 天无忧退换。", 34, 82, 560, 16, "Regular", colors.muted, ids);
  const price = frame(info, "Price banner", 32, 132, 640, 74, colors.warm, 8, ids);
  text(price, "商城价", 24, 24, 70, 14, "Regular", colors.muted, ids);
  text(price, "¥299", 98, 15, 140, 30, "Bold", colors.brand, ids);
  text(info, "颜色", 32, 238, 70, 14, "Semi Bold", colors.ink, ids);
  ["曜石黑", "珍珠白", "海盐蓝"].forEach((item, index) => chip(info, item, 112 + index * 98, 230, 82, index === 0, ids));
  text(info, "套餐", 32, 296, 70, 14, "Semi Bold", colors.ink, ids);
  ["标准版", "保护套装", "礼盒装"].forEach((item, index) => chip(info, item, 112 + index * 104, 288, 88, index === 0, ids));
  text(info, "数量", 32, 354, 70, 14, "Semi Bold", colors.ink, ids);
  const stepper = box(info, "Quantity stepper", 112, 346, 118, 34, colors.white, 6, ids);
  text(stepper, "-    1    +", 14, 8, 90, 13, "Medium", colors.ink, ids);
  button(info, "加入购物车", 32, 438, 160, true, ids);
  button(info, "立即购买", 212, 438, 160, true, ids);
  button(info, "收藏商品", 392, 438, 120, false, ids);

  const tabs = box(detail, "Detail tabs", 64, 782, 1312, 206, colors.white, 8, ids);
  ["商品详情", "规格参数", "用户评价", "售后保障"].forEach((item, index) => chip(tabs, item, 24 + index * 104, 22, 88, index === 0, ids));
  text(tabs, "详情内容区域：展示商品卖点、核心参数、评价摘要和售后说明。", 24, 82, 780, 16, "Regular", colors.muted, ids);

  return detail;
}

function buildProductReviews(page, x, y, ids) {
  const reviews = screen(page, "PC Web / 商品评价列表", x, y, ids);
  header(reviews, "分类", ids);
  text(reviews, "商品评价", 64, 118, 220, 30, "Bold", colors.ink, ids);

  const summary = box(reviews, "Review summary", 64, 180, 1312, 150, colors.white, 8, ids);
  text(summary, "蓝牙耳机 Pro", 24, 24, 180, 20, "Bold", colors.ink, ids);
  text(summary, "4.9", 24, 64, 80, 42, "Bold", colors.brand, ids);
  text(summary, "★★★★★  好评率 98%", 120, 74, 220, 16, "Semi Bold", colors.ink, ids);
  ["全部 1280", "有图 326", "追评 98", "音质好 520", "物流快 260"].forEach((item, index) => chip(summary, item, 690 + index * 112, 58, 96, index === 0, ids));

  const list = box(reviews, "Review list", 64, 366, 880, 594, colors.white, 8, ids);
  [["音质比预期好，降噪通勤够用。", "李先生", "曜石黑"], ["包装很好，发货速度也很快。", "王女士", "珍珠白"], ["连接稳定，游戏延迟比较低。", "张先生", "海盐蓝"]].forEach(([content, user, sku], index) => {
    const item = box(list, "Review item / " + user, 24, 28 + index * 178, 832, 150, colors.white, 8, ids);
    frame(item, "User avatar", 18, 18, 52, 52, colors.soft, 26, ids);
    text(item, user, 86, 18, 120, 15, "Semi Bold", colors.ink, ids);
    text(item, "★★★★★", 86, 44, 120, 14, "Bold", colors.brand, ids);
    text(item, content, 86, 76, 480, 15, "Regular", colors.ink, ids);
    text(item, sku + " · 2026-07-04", 86, 112, 220, 13, "Regular", colors.muted, ids);
    frame(item, "Review image", 654, 28, 96, 96, colors.image, 8, ids);
  });

  const aside = box(reviews, "Review product aside", 984, 366, 392, 594, colors.white, 8, ids);
  text(aside, "商品信息", 24, 24, 160, 20, "Bold", colors.ink, ids);
  frame(aside, "Product image", 24, 78, 180, 140, colors.image, 8, ids);
  text(aside, "蓝牙耳机 Pro 主动降噪", 24, 244, 260, 18, "Bold", colors.ink, ids);
  text(aside, "¥299", 24, 286, 100, 24, "Bold", colors.brand, ids);
  button(aside, "加入购物车", 24, 348, 140, true, ids);
  button(aside, "返回详情", 184, 348, 120, false, ids);

  return reviews;
}

function buildProductCompare(page, x, y, ids) {
  const compare = screen(page, "PC Web / 商品对比", x, y, ids);
  header(compare, "分类", ids);
  text(compare, "商品对比", 64, 118, 220, 30, "Bold", colors.ink, ids);

  const toolbar = box(compare, "Compare toolbar", 64, 180, 1312, 72, colors.white, 8, ids);
  text(toolbar, "已选择 3 件商品，可继续添加同类商品进行参数对比。", 24, 24, 420, 15, "Regular", colors.muted, ids);
  input(toolbar, "添加商品名称", 840, 16, 260, ids);
  button(toolbar, "添加对比", 1120, 16, 110, true, ids);

  const tableFrame = box(compare, "Compare table", 64, 292, 1312, 640, colors.white, 8, ids);
  const columns = ["参数", "蓝牙耳机 Pro", "智能音箱 Max", "降噪耳机 Air"];
  table(tableFrame, "Compare parameter table", 24, 24, 1264, columns, [
    ["价格", "¥299", "¥399", "¥349"],
    ["核心卖点", "主动降噪", "AI 语音", "轻量佩戴"],
    ["续航", "30 小时", "18 小时", "24 小时"],
    ["保修", "12 个月", "12 个月", "6 个月"],
    ["评分", "4.9", "4.8", "4.7"]
  ], ids);
  ["加入购物车", "查看详情", "移出对比"].forEach((action, index) => {
    button(tableFrame, action, 402 + index * 300, 536, 110, index === 0, ids);
  });

  return compare;
}

function buildPresaleProduct(page, x, y, ids) {
  const presale = screen(page, "PC Web / 预售商品", x, y, ids);
  header(presale, "新品", ids);
  text(presale, "预售商品", 64, 118, 220, 30, "Bold", colors.ink, ids);

  const hero = frame(presale, "Presale hero", 64, 180, 1312, 220, colors.warm, 18, ids);
  text(hero, "AI 智能音箱 Max 预售开启", 44, 42, 420, 36, "Bold", colors.brand, ids);
  text(hero, "支付定金锁定优惠，尾款开始后自动提醒。", 46, 104, 420, 16, "Regular", colors.ink, ids);
  text(hero, "定金 ¥50 抵 ¥100 · 尾款时间 2026-07-20 10:00", 46, 146, 440, 15, "Semi Bold", colors.ink, ids);
  button(hero, "支付定金", 1040, 86, 120, true, ids);
  button(hero, "加入提醒", 1180, 86, 120, false, ids);

  const rules = box(presale, "Presale rules", 64, 440, 560, 430, colors.white, 8, ids);
  text(rules, "预售规则", 24, 24, 160, 20, "Bold", colors.ink, ids);
  ["定金支付后不可直接退款，需按规则申请。", "尾款支付时间开始后将通过短信和站内信提醒。", "未按时支付尾款，定金可能不予退还。", "预售商品预计 2026-07-28 起发货。"].forEach((item, index) => {
    const row = frame(rules, "Presale rule / " + index, 24, 78 + index * 78, 512, 56, colors.soft, 8, ids);
    text(row, item, 18, 16, 430, 14, "Regular", colors.muted, ids);
  });

  const progress = box(presale, "Presale timeline", 664, 440, 712, 430, colors.white, 8, ids);
  text(progress, "预售流程", 24, 24, 160, 20, "Bold", colors.ink, ids);
  ["支付定金", "等待尾款", "支付尾款", "商家发货"].forEach((item, index) => {
    const step = frame(progress, "Presale step / " + item, 36 + index * 160, 120, 120, 72, index === 0 ? colors.warm : colors.soft, 36, ids);
    text(step, item, 24, 24, 76, 14, "Medium", index === 0 ? colors.brand : colors.ink, ids);
  });
  text(progress, "当前阶段：支付定金中", 36, 250, 220, 18, "Bold", colors.brand, ids);

  return presale;
}

function buildBundleDeal(page, x, y, ids) {
  const bundle = screen(page, "PC Web / 组合套餐", x, y, ids);
  header(bundle, "热卖", ids);
  text(bundle, "组合套餐", 64, 118, 220, 30, "Bold", colors.ink, ids);

  const builder = box(bundle, "Bundle builder", 64, 180, 850, 690, colors.white, 8, ids);
  text(builder, "选择套餐商品", 24, 24, 180, 20, "Bold", colors.ink, ids);
  [["蓝牙耳机 Pro", "必选", "¥299"], ["耳机保护套", "可选", "¥39"], ["快充头", "可选", "¥59"], ["收纳包", "可选", "¥29"], ["清洁套装", "可选", "¥19"], ["延保服务", "可选", "¥49"]].forEach(([name, tag, price], index) => {
    const card = box(builder, "Bundle item / " + name, 24 + (index % 2) * 400, 78 + Math.floor(index / 2) * 150, 372, 118, index === 0 ? colors.warm : colors.white, 8, ids);
    frame(card, "Product thumb", 18, 18, 72, 72, colors.image, 8, ids);
    text(card, name, 108, 20, 150, 16, "Semi Bold", colors.ink, ids);
    text(card, tag + " · " + price, 108, 54, 150, 14, "Regular", colors.muted, ids);
    chip(card, index < 4 ? "已选" : "选择", 282, 42, 64, index < 4, ids);
  });

  const summary = box(bundle, "Bundle summary", 954, 180, 422, 690, colors.white, 8, ids);
  text(summary, "套餐价", 24, 24, 160, 20, "Bold", colors.ink, ids);
  text(summary, "¥386", 24, 82, 120, 34, "Bold", colors.brand, ids);
  text(summary, "单买价 ¥426 · 已优惠 ¥40", 24, 132, 220, 14, "Regular", colors.muted, ids);
  text(summary, "已选商品", 24, 198, 120, 16, "Semi Bold", colors.ink, ids);
  ["蓝牙耳机 Pro", "耳机保护套", "快充头", "收纳包"].forEach((item, index) => {
    text(summary, item, 24, 236 + index * 40, 180, 14, "Regular", colors.muted, ids);
  });
  button(summary, "加入购物车", 24, 438, 160, true, ids);
  button(summary, "立即购买", 204, 438, 120, false, ids);

  return bundle;
}

function buildCartEmpty(page, x, y, ids) {
  const cartEmpty = screen(page, "PC Web / 购物车空状态", x, y, ids);
  header(cartEmpty, "首页", ids);
  text(cartEmpty, "购物车", 64, 118, 220, 30, "Bold", colors.ink, ids);

  const state = box(cartEmpty, "Cart empty state", 320, 190, 800, 340, colors.white, 16, ids);
  frame(state, "Cart empty illustration", 340, 50, 120, 120, colors.soft, 60, ids);
  text(state, "购物车还是空的", 308, 198, 220, 28, "Bold", colors.ink, ids);
  text(state, "登录后可同步购物车，或先去看看推荐商品。", 260, 248, 320, 15, "Regular", colors.muted, ids);
  button(state, "去逛逛", 278, 294, 110, true, ids);
  button(state, "登录账号", 410, 294, 110, false, ids);

  const recommend = box(cartEmpty, "Cart empty recommendations", 64, 610, 1312, 330, colors.white, 8, ids);
  text(recommend, "猜你喜欢", 24, 24, 140, 20, "Bold", colors.ink, ids);
  [["蓝牙耳机 Pro", "¥299"], ["氨基酸洁面乳", "¥128"], ["智能台灯", "¥159"], ["儿童保温杯", "¥89"]].forEach(([name, price], index) => {
    miniProduct(recommend, name, price, 24 + index * 310, 68, ids);
  });

  return cartEmpty;
}

function buildCart(page, x, y, ids) {
  const cart = screen(page, "PC Web / 购物车", x, y, ids);
  header(cart, "首页", ids);
  text(cart, "购物车", 64, 118, 220, 30, "Bold", colors.ink, ids);

  const list = box(cart, "Cart goods", 64, 188, 900, 560, colors.white, 8, ids);
  text(list, "已选商品", 24, 22, 160, 20, "Bold", colors.ink, ids);
  table(list, "Cart table", 24, 66, 852, ["商品", "规格", "单价", "数量", "小计"], [
    ["蓝牙耳机 Pro", "曜石黑", "¥299", "- 1 +", "¥299"],
    ["氨基酸洁面乳", "套装", "¥128", "- 2 +", "¥256"],
    ["儿童保温杯", "粉色", "¥89", "- 1 +", "¥89"]
  ], ids);
  const promo = frame(list, "Cart promotion", 24, 292, 852, 78, colors.warm, 8, ids);
  text(promo, "满减活动", 20, 18, 120, 16, "Semi Bold", colors.brand, ids);
  text(promo, "已满足满 599 减 30，可叠加会员积分抵扣。", 20, 46, 480, 13, "Regular", colors.muted, ids);

  const summary = box(cart, "Cart summary", 1000, 188, 376, 560, colors.white, 8, ids);
  text(summary, "结算明细", 24, 22, 160, 20, "Bold", colors.ink, ids);
  [["商品金额", "¥644"], ["运费", "¥0"], ["优惠券", "-¥30"], ["积分抵扣", "-¥10"]].forEach(([label, value], index) => {
    text(summary, label, 24, 80 + index * 52, 120, 14, "Regular", colors.muted, ids);
    text(summary, value, 240, 80 + index * 52, 100, 14, "Medium", colors.ink, ids);
  });
  text(summary, "合计 ¥604", 24, 330, 160, 28, "Bold", colors.brand, ids);
  button(summary, "去结算", 24, 400, 328, true, ids);
  button(summary, "继续购物", 24, 456, 328, false, ids);

  const recommend = box(cart, "Cart recommendations", 64, 790, 1312, 198, colors.white, 8, ids);
  text(recommend, "加购推荐", 24, 22, 140, 20, "Bold", colors.ink, ids);
  [["耳机保护套", "¥39"], ["快充头", "¥59"], ["收纳包", "¥29"], ["清洁套装", "¥19"]].forEach(([name, price], index) => {
    compactProduct(recommend, name, price, 24 + index * 244, 72, ids);
  });

  return cart;
}

function buildAuth(page, x, y, ids) {
  const auth = screen(page, "PC Web / 登录注册", x, y, ids);
  header(auth, "个人中心", ids);

  const visual = frame(auth, "Auth visual", 64, 130, 650, 800, colors.warm, 24, ids);
  text(visual, "欢迎回来", 64, 112, 360, 48, "Bold", colors.brand, ids);
  text(visual, "同步购物车、地址、订单和会员积分。", 66, 190, 460, 18, "Regular", colors.ink, ids);

  const login = box(auth, "Login card", 820, 180, 420, 560, colors.white, 16, ids);
  text(login, "账号登录", 40, 38, 200, 26, "Bold", colors.ink, ids);
  input(login, "请输入手机号", 40, 154, 340, ids);
  input(login, "请输入密码", 40, 246, 340, ids);
  button(login, "登录", 40, 328, 340, true, ids);
  button(login, "验证码登录", 40, 384, 160, false, ids);
  button(login, "微信扫码登录", 220, 384, 160, false, ids);

  const register = box(auth, "Register side card", 1264, 180, 260, 560, colors.soft, 16, ids);
  text(register, "快速注册", 24, 34, 160, 22, "Bold", colors.ink, ids);
  input(register, "手机号码", 24, 114, 212, ids);
  input(register, "6 位验证码", 24, 192, 212, ids);
  input(register, "设置密码", 24, 270, 212, ids);
  button(register, "创建账号", 24, 354, 212, true, ids);

  return auth;
}

function buildCheckout(page, x, y, ids) {
  const checkout = screen(page, "PC Web / 订单确认支付", x, y, ids);
  header(checkout, "首页", ids);
  text(checkout, "确认订单", 64, 118, 240, 30, "Bold", colors.ink, ids);

  const steps = box(checkout, "Checkout steps", 760, 112, 560, 52, colors.white, 26, ids);
  ["购物车", "确认订单", "支付", "完成"].forEach((item, index) => chip(steps, item, 16 + index * 134, 11, 96, index === 1, ids));

  const address = box(checkout, "Address selection", 64, 196, 1312, 150, colors.white, 8, ids);
  text(address, "收货地址", 24, 22, 200, 20, "Bold", colors.ink, ids);
  const defaultAddress = box(address, "默认地址", 24, 64, 360, 58, colors.warm, 10, ids);
  text(defaultAddress, "李先生 138****8888", 16, 12, 220, 13, "Semi Bold", colors.ink, ids);
  text(defaultAddress, "上海市浦东新区 XX 路 88 号", 16, 34, 300, 12, "Regular", colors.muted, ids);
  const newAddress = box(address, "新增地址", 418, 64, 360, 58, colors.soft, 10, ids);
  text(newAddress, "+ 新增收货地址", 16, 20, 180, 13, "Medium", colors.brand, ids);

  const goods = box(checkout, "Order goods", 64, 376, 860, 350, colors.white, 8, ids);
  text(goods, "商品清单", 24, 22, 200, 20, "Bold", colors.ink, ids);
  table(goods, "Goods table", 24, 66, 812, ["商品", "规格", "单价", "数量", "小计"], [
    ["蓝牙耳机 Pro", "曜石黑", "¥399", "1", "¥399"],
    ["氨基酸洁面乳", "套装", "¥128", "2", "¥256"],
    ["儿童保温杯", "粉色", "¥89", "1", "¥89"]
  ], ids);

  const pay = box(checkout, "Payment panel", 960, 376, 416, 350, colors.white, 8, ids);
  text(pay, "支付方式", 24, 22, 180, 20, "Bold", colors.ink, ids);
  ["微信支付", "支付宝", "余额支付"].forEach((item, index) => {
    const payItem = box(pay, item, 24, 66 + index * 58, 368, 44, index === 0 ? colors.warm : colors.white, 8, ids);
    text(payItem, item, 16, 13, 120, 13, "Medium", colors.ink, ids);
  });
  text(pay, "应付 ¥714", 24, 286, 180, 28, "Bold", colors.brand, ids);
  button(pay, "提交并支付", 242, 282, 128, true, ids);

  return checkout;
}

function buildPickupStore(page, x, y, ids) {
  const pickup = screen(page, "PC Web / 门店自提", x, y, ids);
  header(pickup, "首页", ids);
  text(pickup, "选择自提门店", 64, 118, 260, 30, "Bold", colors.ink, ids);

  const map = box(pickup, "Pickup map", 64, 180, 760, 650, colors.soft, 10, ids);
  text(map, "地图区域", 330, 300, 120, 24, "Bold", colors.muted, ids);
  text(map, "展示门店位置、距离和配送范围。", 280, 344, 240, 14, "Regular", colors.muted, ids);

  const panel = box(pickup, "Pickup store panel", 864, 180, 512, 650, colors.white, 8, ids);
  text(panel, "附近门店", 24, 24, 160, 20, "Bold", colors.ink, ids);
  input(panel, "搜索城市 / 门店", 24, 74, 360, ids);
  [["浦东旗舰店", "距你 1.2km · 今日可提"], ["西湖银泰店", "距你 3.8km · 明日可提"], ["朝阳大悦城店", "距你 5.6km · 今日可提"]].forEach(([name, desc], index) => {
    const store = box(panel, "Pickup store / " + name, 24, 142 + index * 128, 464, 100, index === 0 ? colors.warm : colors.white, 8, ids);
    text(store, name, 18, 18, 160, 16, "Semi Bold", colors.ink, ids);
    text(store, desc, 18, 50, 260, 13, "Regular", colors.muted, ids);
    button(store, index === 0 ? "已选择" : "选择", 354, 32, 78, index === 0, ids);
  });
  button(panel, "确认门店", 24, 560, 140, true, ids);

  const goods = box(pickup, "Pickup goods", 64, 870, 1312, 120, colors.white, 8, ids);
  text(goods, "自提商品：蓝牙耳机 Pro、耳机保护套 · 预计备货 2 小时", 24, 38, 520, 16, "Medium", colors.ink, ids);
  text(goods, "自提码将在订单支付后生成，请凭码到店核销。", 760, 40, 360, 14, "Regular", colors.muted, ids);

  return pickup;
}

function buildOrderCancel(page, x, y, ids) {
  const cancel = screen(page, "PC Web / 订单取消", x, y, ids);
  header(cancel, "个人中心", ids);
  text(cancel, "取消订单", 64, 118, 220, 30, "Bold", colors.ink, ids);

  const form = box(cancel, "Cancel order form", 320, 180, 800, 560, colors.white, 12, ids);
  text(form, "确认取消订单？", 40, 38, 220, 28, "Bold", colors.ink, ids);
  text(form, "订单号 202607040001 · 当前状态：待支付", 42, 88, 320, 14, "Regular", colors.muted, ids);
  text(form, "取消原因", 40, 150, 120, 15, "Semi Bold", colors.ink, ids);
  ["不想买了", "信息填写错误", "重复下单", "价格变化", "其他原因"].forEach((item, index) => {
    chip(form, item, 40 + (index % 3) * 142, 188 + Math.floor(index / 3) * 48, 120, index === 0, ids);
  });
  const desc = box(form, "Cancel reason textarea", 40, 300, 520, 110, colors.white, 8, ids);
  text(desc, "补充说明（选填）", 14, 14, 220, 13, "Regular", colors.placeholder, ids);
  button(form, "确认取消", 40, 466, 140, true, ids);
  button(form, "返回订单", 204, 466, 120, false, ids);

  const impact = box(cancel, "Cancel impact", 64, 790, 1312, 170, colors.warm, 10, ids);
  text(impact, "取消影响", 24, 24, 160, 20, "Bold", colors.brand, ids);
  text(impact, "优惠券、积分、库存和活动资格将按平台规则恢复或释放；已支付订单取消后进入退款流程。", 24, 72, 760, 15, "Regular", colors.ink, ids);

  return cancel;
}

function buildRefundResult(page, x, y, ids) {
  const refund = screen(page, "PC Web / 退款结果", x, y, ids);
  header(refund, "个人中心", ids);

  const card = box(refund, "Refund success card", 320, 150, 800, 390, colors.white, 16, ids);
  frame(card, "Refund icon", 360, 48, 80, 80, colors.warm, 40, ids);
  text(card, "退款成功", 326, 154, 180, 34, "Bold", colors.brand, ids);
  text(card, "退款已原路退回，到账时间以支付渠道为准。", 246, 210, 320, 16, "Regular", colors.muted, ids);
  text(card, "退款金额：¥299 · 服务单号 AS202607040001", 226, 258, 360, 14, "Medium", colors.ink, ids);
  button(card, "查看售后", 250, 320, 130, true, ids);
  button(card, "返回首页", 420, 320, 130, false, ids);

  const details = box(refund, "Refund details", 184, 600, 1072, 260, colors.white, 8, ids);
  text(details, "退款明细", 24, 24, 160, 20, "Bold", colors.ink, ids);
  table(details, "Refund details table", 24, 74, 1024, ["退款项", "金额", "渠道", "状态"], [
    ["商品退款", "¥299", "微信支付", "已到账"],
    ["运费退款", "¥0", "-", "无"],
    ["优惠券", "已退回", "账户", "可用"]
  ], ids);

  return refund;
}

function buildNotFound(page, x, y, ids) {
  const notFound = screen(page, "PC Web / 404 页面", x, y, ids);
  header(notFound, "首页", ids);

  const state = box(notFound, "Not found state", 320, 180, 800, 380, colors.white, 16, ids);
  text(state, "404", 330, 54, 180, 64, "Bold", colors.brand, ids);
  text(state, "页面走丢了", 326, 150, 180, 30, "Bold", colors.ink, ids);
  text(state, "你访问的页面不存在、已下架或链接已过期。", 258, 204, 320, 16, "Regular", colors.muted, ids);
  button(state, "返回首页", 278, 276, 110, true, ids);
  button(state, "联系客服", 410, 276, 110, false, ids);

  const guide = box(notFound, "Not found guide", 64, 640, 1312, 260, colors.white, 8, ids);
  text(guide, "你可以继续浏览", 24, 24, 180, 20, "Bold", colors.ink, ids);
  [["热门商品", "查看热卖榜单"], ["分类频道", "按品类查找"], ["优惠券中心", "先领券再下单"], ["帮助中心", "查看常见问题"]].forEach(([title, desc], index) => {
    const item = frame(guide, "404 guide / " + title, 24 + index * 310, 80, 274, 112, index === 0 ? colors.warm : colors.soft, 10, ids);
    text(item, title, 20, 22, 120, 18, "Bold", index === 0 ? colors.brand : colors.ink, ids);
    text(item, desc, 20, 58, 160, 13, "Regular", colors.muted, ids);
  });

  return notFound;
}

function buildPaymentResult(page, x, y, ids) {
  const result = screen(page, "PC Web / 支付结果", x, y, ids);
  header(result, "个人中心", ids);

  const card = box(result, "Payment success card", 320, 140, 800, 360, colors.white, 16, ids);
  frame(card, "Success icon", 360, 48, 80, 80, colors.warm, 40, ids);
  text(card, "支付成功", 326, 150, 180, 34, "Bold", colors.brand, ids);
  text(card, "订单已提交，商家将尽快为你发货。", 248, 204, 320, 16, "Regular", colors.muted, ids);
  text(card, "订单号：202607040001", 252, 250, 220, 14, "Medium", colors.ink, ids);
  button(card, "查看订单", 250, 300, 130, true, ids);
  button(card, "继续购物", 420, 300, 130, false, ids);

  const flow = box(result, "Fulfillment steps", 184, 560, 1072, 220, colors.white, 8, ids);
  text(flow, "履约进度", 24, 22, 160, 20, "Bold", colors.ink, ids);
  ["买家付款", "商家发货", "物流运输", "确认收货", "评价晒单"].forEach((item, index) => {
    const node = frame(flow, "Step / " + item, 48 + index * 196, 86, 126, 70, index === 0 ? colors.warm : colors.soft, 35, ids);
    text(node, item, 24, 24, 78, 14, "Medium", index === 0 ? colors.brand : colors.ink, ids);
  });

  const also = box(result, "You may also like", 184, 820, 1072, 170, colors.white, 8, ids);
  text(also, "你可能还需要", 24, 22, 160, 20, "Bold", colors.ink, ids);
  [["耳机清洁套装", "¥19"], ["桌面充电站", "¥129"], ["智能音箱", "¥199"], ["便携收纳包", "¥29"]].forEach(([name, price], index) => {
    compactProduct(also, name, price, 24 + index * 244, 66, ids);
  });

  return result;
}

function buildPaymentFailed(page, x, y, ids) {
  const failed = screen(page, "PC Web / 支付失败", x, y, ids);
  header(failed, "个人中心", ids);

  const card = box(failed, "Payment failed card", 320, 150, 800, 390, colors.white, 16, ids);
  frame(card, "Failed icon", 360, 48, 80, 80, colors.soft, 40, ids);
  text(card, "支付未完成", 316, 154, 200, 34, "Bold", colors.ink, ids);
  text(card, "支付渠道返回失败，请重新支付或更换支付方式。", 230, 210, 360, 16, "Regular", colors.muted, ids);
  text(card, "订单号：202607040001 · 应付 ¥714", 250, 258, 300, 14, "Medium", colors.ink, ids);
  button(card, "重新支付", 250, 320, 130, true, ids);
  button(card, "更换方式", 420, 320, 130, false, ids);

  const reasons = box(failed, "Payment failed reasons", 184, 600, 1072, 260, colors.white, 8, ids);
  text(reasons, "可能原因", 24, 24, 160, 20, "Bold", colors.ink, ids);
  ["余额不足或银行卡限额", "支付二维码已过期", "网络波动导致渠道超时", "订单超过支付有效期"].forEach((item, index) => {
    const row = box(reasons, "Payment reason / " + item, 24 + (index % 2) * 510, 82 + Math.floor(index / 2) * 84, 480, 58, colors.soft, 8, ids);
    text(row, item, 18, 18, 320, 14, "Medium", colors.ink, ids);
  });

  return failed;
}

function buildOrderList(page, x, y, ids) {
  const orders = screen(page, "PC Web / 订单列表", x, y, ids);
  header(orders, "个人中心", ids);
  text(orders, "我的订单", 64, 118, 220, 30, "Bold", colors.ink, ids);

  const tabs = box(orders, "Order status tabs", 64, 182, 1312, 64, colors.white, 8, ids);
  ["全部", "待付款", "待发货", "待收货", "待评价", "售后中"].forEach((item, index) => {
    chip(tabs, item, 24 + index * 92, 17, 76, index === 0, ids);
  });
  input(tabs, "搜索订单号 / 商品名称", 980, 12, 260, ids);

  const list = box(orders, "Order cards", 64, 282, 1312, 650, colors.white, 8, ids);
  [
    ["202607040001", "待发货", "蓝牙耳机 Pro、氨基酸洁面乳", "¥525"],
    ["202607030012", "待付款", "儿童保温杯", "¥89"],
    ["202607020030", "已完成", "智能台灯", "¥159"],
    ["202607010021", "售后中", "纯棉四件套", "¥269"]
  ].forEach(([orderNo, status, goods, amount], index) => {
    const card = box(list, "Order card / " + orderNo, 24, 24 + index * 148, 1264, 120, index === 0 ? colors.warm : colors.white, 8, ids);
    text(card, "订单号 " + orderNo, 20, 18, 220, 14, "Medium", colors.ink, ids);
    chip(card, status, 1040, 14, 76, index === 0, ids);
    frame(card, "Order goods thumb", 20, 52, 52, 52, colors.image, 6, ids);
    text(card, goods, 88, 54, 360, 15, "Semi Bold", colors.ink, ids);
    text(card, amount, 760, 58, 100, 20, "Bold", colors.brand, ids);
    button(card, index === 1 ? "去支付" : "查看详情", 1120, 58, 104, index === 1, ids);
  });

  applyPersonalCenterLayout(orders, "我的订单", ids);
  return orders;
}

function buildOrderEmpty(page, x, y, ids) {
  const empty = screen(page, "PC Web / 订单空状态", x, y, ids);
  header(empty, "个人中心", ids);
  text(empty, "我的订单", 64, 118, 220, 30, "Bold", colors.ink, ids);

  const tabs = box(empty, "Empty order tabs", 64, 180, 1312, 64, colors.white, 8, ids);
  ["全部", "待付款", "待发货", "待收货", "待评价"].forEach((item, index) => chip(tabs, item, 24 + index * 92, 17, 76, index === 0, ids));

  const state = box(empty, "Order empty state", 320, 310, 800, 320, colors.white, 16, ids);
  frame(state, "Order empty illustration", 340, 46, 120, 120, colors.soft, 60, ids);
  text(state, "暂无订单", 340, 190, 140, 30, "Bold", colors.ink, ids);
  text(state, "下单后可以在这里查看订单状态、物流和售后进度。", 248, 244, 340, 15, "Regular", colors.muted, ids);
  button(state, "去购物", 290, 284, 100, true, ids);
  button(state, "查看推荐", 414, 284, 110, false, ids);

  const recommend = box(empty, "Order empty recommendations", 64, 700, 1312, 250, colors.white, 8, ids);
  text(recommend, "推荐商品", 24, 24, 140, 20, "Bold", colors.ink, ids);
  [["蓝牙耳机 Pro", "¥299"], ["智能台灯", "¥159"], ["保温杯", "¥89"], ["家用吹风机", "¥219"]].forEach(([name, price], index) => {
    compactProduct(recommend, name, price, 24 + index * 300, 86, ids);
  });

  applyPersonalCenterLayout(empty, "我的订单", ids);
  return empty;
}

function buildAccount(page, x, y, ids) {
  const account = screen(page, "PC Web / 个人中心", x, y, ids);
  header(account, "个人中心", ids);

  const sidebar = box(account, "Account sidebar", 64, 120, 220, 820, colors.white, 8, ids);
  text(sidebar, "个人中心", 24, 24, 140, 22, "Bold", colors.ink, ids);
  ["总览", "我的订单", "地址管理", "优惠券", "收藏商品", "账号安全", "消息中心", "售后服务"].forEach((item, index) => {
    chip(sidebar, item, 24, 78 + index * 48, 156, index === 0, ids);
  });

  const profile = box(account, "Account overview", 320, 120, 1056, 132, colors.white, 8, ids);
  frame(profile, "Avatar", 24, 26, 72, 72, colors.warm, 36, ids);
  text(profile, "李先生", 116, 30, 160, 22, "Bold", colors.ink, ids);
  text(profile, "普通会员 · 积分 1280 · 手机号 138****8888", 116, 66, 460, 14, "Regular", colors.muted, ids);

  const orders = box(account, "Order list", 320, 284, 680, 426, colors.white, 8, ids);
  text(orders, "最近订单", 24, 22, 180, 20, "Bold", colors.ink, ids);
  button(orders, "查看全部订单", 520, 16, 112, false, ids);
  table(orders, "Orders table", 24, 66, 632, ["订单号", "金额", "状态", "操作"], [
    ["202607040001", "¥714", "待支付", "去支付"],
    ["202607030012", "¥128", "待发货", "查看"],
    ["202607020030", "¥399", "已完成", "评价"]
  ], ids);

  const addresses = box(account, "Address manager", 1032, 284, 344, 426, colors.white, 8, ids);
  text(addresses, "常用地址", 24, 22, 160, 20, "Bold", colors.ink, ids);
  button(addresses, "管理地址", 118, 18, 90, false, ids);
  button(addresses, "新增地址", 222, 18, 98, true, ids);
  ["上海市浦东新区 XX 路 88 号", "杭州市西湖区 XX 街 21 号", "北京市朝阳区 XX 园 9 号"].forEach((item, index) => {
    const address = box(addresses, "Address item", 24, 70 + index * 98, 296, 76, index === 0 ? colors.warm : colors.soft, 8, ids);
    text(address, item, 14, 24, 230, 13, "Regular", colors.muted, ids);
  });

  applyPersonalCenterLayout(account, "总览", ids, true);
  return account;
}

function buildAddressManager(page, x, y, ids) {
  const addressPage = screen(page, "PC Web / 地址管理", x, y, ids);
  header(addressPage, "个人中心", ids);
  text(addressPage, "地址管理", 64, 118, 220, 30, "Bold", colors.ink, ids);

  const list = box(addressPage, "Address list full", 64, 182, 720, 750, colors.white, 8, ids);
  text(list, "常用地址", 24, 24, 160, 20, "Bold", colors.ink, ids);
  button(list, "新增地址", 560, 20, 112, true, ids);
  [
    ["李先生", "138****8888", "上海市浦东新区 XX 路 88 号", "默认"],
    ["王女士", "136****2222", "杭州市西湖区 XX 街 21 号", ""],
    ["张先生", "139****3333", "北京市朝阳区 XX 园 9 号", ""]
  ].forEach(([name, phone, addr, tag], index) => {
    const item = box(list, "Address card / " + name, 24, 82 + index * 142, 672, 112, index === 0 ? colors.warm : colors.white, 8, ids);
    text(item, name + "  " + phone, 18, 18, 220, 15, "Semi Bold", colors.ink, ids);
    if (tag) chip(item, tag, 260, 12, 58, true, ids);
    text(item, addr, 18, 50, 420, 14, "Regular", colors.muted, ids);
    button(item, "编辑", 512, 56, 64, false, ids);
    button(item, "删除", 590, 56, 64, false, ids);
  });

  const form = box(addressPage, "Address edit form", 824, 182, 552, 750, colors.white, 8, ids);
  text(form, "新增 / 编辑地址", 24, 24, 180, 20, "Bold", colors.ink, ids);
  input(form, "收货人姓名", 24, 88, 240, ids);
  input(form, "手机号码", 288, 88, 240, ids);
  input(form, "省 / 市 / 区", 24, 160, 504, ids);
  input(form, "详细地址", 24, 232, 504, ids);
  input(form, "邮政编码（选填）", 24, 304, 240, ids);
  chip(form, "设为默认地址", 24, 382, 126, true, ids);
  button(form, "保存地址", 24, 472, 160, true, ids);
  button(form, "取消", 208, 472, 120, false, ids);

  applyPersonalCenterLayout(addressPage, "地址管理", ids);
  return addressPage;
}

function buildAddressEmpty(page, x, y, ids) {
  const empty = screen(page, "PC Web / 地址空状态", x, y, ids);
  header(empty, "个人中心", ids);
  text(empty, "地址管理", 64, 118, 220, 30, "Bold", colors.ink, ids);

  const state = box(empty, "Address empty state", 320, 190, 800, 360, colors.white, 16, ids);
  frame(state, "Address empty illustration", 340, 54, 120, 120, colors.soft, 60, ids);
  text(state, "还没有收货地址", 300, 204, 220, 28, "Bold", colors.ink, ids);
  text(state, "新增常用地址后，下单时可快速选择并减少填写成本。", 236, 254, 360, 15, "Regular", colors.muted, ids);
  button(state, "新增地址", 278, 304, 110, true, ids);
  button(state, "导入微信地址", 410, 304, 130, false, ids);

  const form = box(empty, "Quick address form", 64, 640, 1312, 260, colors.white, 8, ids);
  text(form, "快捷新增", 24, 24, 140, 20, "Bold", colors.ink, ids);
  input(form, "收货人姓名", 24, 86, 260, ids);
  input(form, "手机号码", 308, 86, 260, ids);
  input(form, "省 / 市 / 区", 592, 86, 300, ids);
  input(form, "详细地址", 24, 158, 520, ids);
  button(form, "保存地址", 1120, 158, 120, true, ids);

  applyPersonalCenterLayout(empty, "地址管理", ids);
  return empty;
}

function buildProfile(page, x, y, ids) {
  const profile = screen(page, "PC Web / 个人资料", x, y, ids);
  header(profile, "个人中心", ids);
  text(profile, "个人资料", 64, 118, 220, 30, "Bold", colors.ink, ids);

  const form = box(profile, "Profile form", 64, 180, 760, 720, colors.white, 8, ids);
  text(form, "基础信息", 24, 24, 160, 20, "Bold", colors.ink, ids);
  frame(form, "Avatar upload", 24, 82, 96, 96, colors.warm, 48, ids);
  button(form, "更换头像", 144, 112, 96, false, ids);
  input(form, "昵称：李先生", 24, 220, 340, ids);
  input(form, "真实姓名（选填）", 388, 220, 300, ids);
  text(form, "性别", 24, 292, 80, 14, "Semi Bold", colors.ink, ids);
  ["男", "女", "保密"].forEach((item, index) => chip(form, item, 96 + index * 76, 284, 60, index === 2, ids));
  input(form, "生日：1995-01-01", 24, 358, 340, ids);
  input(form, "所在地区：上海市 浦东新区", 388, 358, 300, ids);
  const desc = box(form, "Profile intro", 24, 430, 664, 118, colors.white, 8, ids);
  text(desc, "个人简介", 14, 14, 120, 13, "Regular", colors.placeholder, ids);
  button(form, "保存资料", 24, 604, 140, true, ids);
  button(form, "取消修改", 188, 604, 120, false, ids);

  const side = box(profile, "Profile completion", 864, 180, 512, 720, colors.white, 8, ids);
  text(side, "资料完整度", 24, 24, 160, 20, "Bold", colors.ink, ids);
  text(side, "76%", 24, 80, 120, 42, "Bold", colors.brand, ids);
  text(side, "完善资料可获得积分奖励，并提升账号安全。", 24, 142, 340, 14, "Regular", colors.muted, ids);
  [["绑定手机号", "已完成"], ["设置支付密码", "已完成"], ["实名认证", "未完成"], ["填写生日", "已完成"]].forEach(([label, status], index) => {
    const row = frame(side, "Profile task / " + label, 24, 210 + index * 76, 440, 54, status === "未完成" ? colors.warm : colors.soft, 8, ids);
    text(row, label, 16, 16, 160, 14, "Medium", colors.ink, ids);
    text(row, status, 340, 16, 70, 14, "Semi Bold", status === "未完成" ? colors.brand : colors.muted, ids);
  });

  applyPersonalCenterLayout(profile, "个人资料", ids);
  return profile;
}

function buildBrowsingHistory(page, x, y, ids) {
  const history = screen(page, "PC Web / 浏览足迹", x, y, ids);
  header(history, "个人中心", ids);
  text(history, "浏览足迹", 64, 118, 220, 30, "Bold", colors.ink, ids);

  const toolbar = box(history, "History toolbar", 64, 180, 1312, 64, colors.white, 8, ids);
  ["今天", "昨天", "近 7 天", "近 30 天"].forEach((item, index) => chip(toolbar, item, 24 + index * 90, 17, 76, index === 0, ids));
  button(toolbar, "批量删除", 1120, 13, 104, false, ids);
  button(toolbar, "清空足迹", 1240, 13, 104, false, ids);

  const grid = box(history, "History product grid", 64, 284, 1312, 650, colors.white, 8, ids);
  text(grid, "今天浏览", 24, 24, 160, 20, "Bold", colors.ink, ids);
  [["蓝牙耳机 Pro", "¥299"], ["智能台灯", "¥159"], ["家用吹风机", "¥219"], ["纯棉四件套", "¥269"], ["AI 智能音箱", "¥399"], ["便携咖啡机", "¥299"], ["轻量跑鞋", "¥499"], ["保湿精华", "¥169"]].forEach(([name, price], index) => {
    miniProduct(grid, name, price, 24 + (index % 4) * 310, 78 + Math.floor(index / 4) * 282, ids);
  });

  applyPersonalCenterLayout(history, "浏览足迹", ids);
  return history;
}

function buildBindPhone(page, x, y, ids) {
  const bind = screen(page, "PC Web / 绑定手机", x, y, ids);
  header(bind, "个人中心", ids);
  text(bind, "绑定手机", 64, 118, 220, 30, "Bold", colors.ink, ids);

  const card = box(bind, "Bind phone card", 420, 180, 600, 560, colors.white, 16, ids);
  text(card, "更换绑定手机号", 40, 40, 220, 28, "Bold", colors.ink, ids);
  text(card, "当前手机号：138****8888", 42, 94, 240, 14, "Regular", colors.muted, ids);
  text(card, "验证当前手机号", 40, 158, 140, 15, "Semi Bold", colors.ink, ids);
  input(card, "短信验证码", 40, 190, 300, ids);
  button(card, "获取验证码", 360, 190, 120, false, ids);
  text(card, "绑定新手机号", 40, 274, 140, 15, "Semi Bold", colors.ink, ids);
  input(card, "新手机号", 40, 306, 440, ids);
  input(card, "新手机号验证码", 40, 378, 300, ids);
  button(card, "获取验证码", 360, 378, 120, false, ids);
  button(card, "确认绑定", 40, 470, 140, true, ids);
  button(card, "取消", 204, 470, 120, false, ids);

  const tips = box(bind, "Bind phone tips", 64, 790, 1312, 150, colors.warm, 10, ids);
  text(tips, "安全提示", 24, 24, 160, 20, "Bold", colors.brand, ids);
  text(tips, "更换手机号后，登录、支付验证、订单通知和售后通知都会发送到新号码。", 24, 72, 620, 15, "Regular", colors.ink, ids);

  applyPersonalCenterLayout(bind, "账号安全", ids);
  return bind;
}

function buildResetPassword(page, x, y, ids) {
  const reset = screen(page, "PC Web / 重置密码", x, y, ids);
  header(reset, "个人中心", ids);
  text(reset, "重置密码", 64, 118, 220, 30, "Bold", colors.ink, ids);

  const card = box(reset, "Reset password card", 420, 180, 600, 540, colors.white, 16, ids);
  text(card, "设置新登录密码", 40, 40, 240, 28, "Bold", colors.ink, ids);
  const steps = box(card, "Reset steps", 40, 100, 520, 52, colors.soft, 26, ids);
  ["身份验证", "设置密码", "完成"].forEach((item, index) => chip(steps, item, 18 + index * 156, 11, 106, index === 1, ids));
  input(card, "新密码", 40, 196, 440, ids);
  input(card, "确认新密码", 40, 268, 440, ids);
  text(card, "密码需包含 8-20 位字符，建议同时包含数字、字母和符号。", 40, 334, 440, 13, "Regular", colors.muted, ids);
  button(card, "提交修改", 40, 416, 140, true, ids);
  button(card, "返回安全中心", 204, 416, 140, false, ids);

  applyPersonalCenterLayout(reset, "账号安全", ids);
  return reset;
}

function buildNotificationPreferences(page, x, y, ids) {
  const prefs = screen(page, "PC Web / 通知偏好", x, y, ids);
  header(prefs, "个人中心", ids);
  text(prefs, "通知偏好", 64, 118, 220, 30, "Bold", colors.ink, ids);

  const channels = box(prefs, "Notification channels", 64, 180, 620, 720, colors.white, 8, ids);
  text(channels, "接收渠道", 24, 24, 160, 20, "Bold", colors.ink, ids);
  [["站内消息", "订单、优惠、售后消息默认接收"], ["短信通知", "支付、发货、到货提醒"], ["邮件通知", "发票、账号安全提醒"], ["浏览器推送", "秒杀开始、库存到货提醒"]].forEach(([title, desc], index) => {
    const row = box(channels, "Notify channel / " + title, 24, 82 + index * 118, 572, 88, index === 0 ? colors.warm : colors.white, 8, ids);
    text(row, title, 18, 18, 140, 16, "Semi Bold", colors.ink, ids);
    text(row, desc, 18, 50, 320, 13, "Regular", colors.muted, ids);
    chip(row, index < 3 ? "开启" : "关闭", 470, 28, 64, index < 3, ids);
  });

  const types = box(prefs, "Notification types", 724, 180, 652, 720, colors.white, 8, ids);
  text(types, "消息类型", 24, 24, 160, 20, "Bold", colors.ink, ids);
  [["订单状态", "支付、发货、签收、评价提醒"], ["售后进度", "审核、寄回、退款到账提醒"], ["优惠活动", "优惠券、满减、秒杀开始"], ["账号安全", "异地登录、密码修改、换绑手机"], ["商品提醒", "降价、到货、预售尾款"]].forEach(([title, desc], index) => {
    const row = box(types, "Notify type / " + title, 24, 82 + index * 106, 604, 78, colors.white, 8, ids);
    text(row, title, 18, 16, 140, 16, "Semi Bold", colors.ink, ids);
    text(row, desc, 18, 46, 320, 13, "Regular", colors.muted, ids);
    chip(row, index === 2 ? "低频" : "实时", 500, 24, 64, index !== 2, ids);
  });
  button(types, "保存设置", 24, 628, 140, true, ids);

  applyPersonalCenterLayout(prefs, "消息中心", ids);
  return prefs;
}

function buildPrivacySettings(page, x, y, ids) {
  const privacy = screen(page, "PC Web / 隐私设置", x, y, ids);
  header(privacy, "个人中心", ids);
  text(privacy, "隐私设置", 64, 118, 220, 30, "Bold", colors.ink, ids);

  const visibility = box(privacy, "Privacy visibility", 64, 180, 620, 720, colors.white, 8, ids);
  text(visibility, "可见性设置", 24, 24, 160, 20, "Bold", colors.ink, ids);
  [["公开我的评价昵称", "评价区展示昵称和头像"], ["允许个性化推荐", "根据浏览和购买记录推荐商品"], ["允许活动短信", "接收平台活动和优惠提醒"], ["共享售后诊断信息", "用于提升客服处理效率"]].forEach(([title, desc], index) => {
    const row = box(visibility, "Privacy item / " + title, 24, 82 + index * 118, 572, 88, index === 1 ? colors.warm : colors.white, 8, ids);
    text(row, title, 18, 18, 200, 16, "Semi Bold", colors.ink, ids);
    text(row, desc, 18, 50, 320, 13, "Regular", colors.muted, ids);
    chip(row, index === 2 ? "关闭" : "开启", 470, 28, 64, index !== 2, ids);
  });

  const data = box(privacy, "Privacy data", 724, 180, 652, 720, colors.white, 8, ids);
  text(data, "个人数据", 24, 24, 160, 20, "Bold", colors.ink, ids);
  [["下载个人数据", "导出订单、地址、浏览记录等个人数据"], ["清除浏览记录", "删除本账号的商品浏览足迹"], ["注销账号", "提交账号注销申请，需完成身份验证"]].forEach(([title, desc], index) => {
    const row = box(data, "Privacy data item / " + title, 24, 82 + index * 132, 604, 98, index === 2 ? colors.warm : colors.white, 8, ids);
    text(row, title, 18, 18, 180, 16, "Semi Bold", index === 2 ? colors.brand : colors.ink, ids);
    text(row, desc, 18, 50, 360, 13, "Regular", colors.muted, ids);
    button(row, index === 2 ? "申请注销" : "处理", 492, 30, 82, index !== 2, ids);
  });
  button(data, "保存隐私设置", 24, 620, 150, true, ids);

  applyPersonalCenterLayout(privacy, "隐私设置", ids);
  return privacy;
}

function buildCouponCenter(page, x, y, ids) {
  const coupons = screen(page, "PC Web / 优惠券中心", x, y, ids);
  header(coupons, "个人中心", ids);
  text(coupons, "优惠券中心", 64, 118, 260, 30, "Bold", colors.ink, ids);

  const hero = frame(coupons, "Coupon hero", 64, 180, 1312, 160, colors.warm, 14, ids);
  text(hero, "领券后下单更省", 36, 34, 280, 32, "Bold", colors.brand, ids);
  text(hero, "新人券、满减券、品类券、会员专享券统一领取。", 38, 88, 460, 16, "Regular", colors.ink, ids);
  input(hero, "输入兑换码", 900, 58, 240, ids);
  button(hero, "兑换", 1160, 58, 92, true, ids);

  const grid = box(coupons, "Coupon grid", 64, 376, 1312, 560, colors.white, 8, ids);
  ["新人 ¥99 礼包", "满 599 减 60", "美妆满 199 减 30", "数码满 999 减 100", "免运费券", "会员积分加倍"].forEach((item, index) => {
    const card = frame(grid, "Coupon card / " + item, 24 + (index % 3) * 420, 28 + Math.floor(index / 3) * 220, 388, 176, index % 2 === 0 ? colors.warm : colors.soft, 12, ids);
    text(card, item, 24, 24, 220, 24, "Bold", index % 2 === 0 ? colors.brand : colors.ink, ids);
    text(card, "有效期 2026-07-01 至 2026-07-31", 24, 72, 260, 13, "Regular", colors.muted, ids);
    text(card, "指定商品可用，不与部分活动同享。", 24, 100, 280, 13, "Regular", colors.muted, ids);
    button(card, "立即领取", 244, 118, 104, true, ids);
  });

  applyPersonalCenterLayout(coupons, "优惠券", ids);
  return coupons;
}

function buildFavorites(page, x, y, ids) {
  const favorites = screen(page, "PC Web / 收藏夹", x, y, ids);
  header(favorites, "个人中心", ids);
  text(favorites, "我的收藏", 64, 118, 220, 30, "Bold", colors.ink, ids);

  const toolbar = box(favorites, "Favorites toolbar", 64, 182, 1312, 64, colors.white, 8, ids);
  ["全部商品", "降价提醒", "失效商品"].forEach((item, index) => chip(toolbar, item, 24 + index * 108, 17, 92, index === 0, ids));
  button(toolbar, "批量管理", 1120, 13, 104, false, ids);
  button(toolbar, "加入购物车", 1240, 13, 112, true, ids);

  const grid = box(favorites, "Favorite product grid", 64, 282, 1312, 650, colors.white, 8, ids);
  [["蓝牙耳机 Pro", "¥299"], ["氨基酸洁面乳", "¥128"], ["智能台灯", "¥159"], ["纯棉四件套", "¥269"], ["轻薄羽绒服", "¥499"], ["儿童保温杯", "¥89"], ["家用吹风机", "¥219"], ["即食燕麦片", "¥49"]].forEach(([name, price], index) => {
    miniProduct(grid, name, price, 24 + (index % 4) * 310, 28 + Math.floor(index / 4) * 290, ids);
  });

  applyPersonalCenterLayout(favorites, "收藏商品", ids);
  return favorites;
}

function buildFavoritesEmpty(page, x, y, ids) {
  const empty = screen(page, "PC Web / 收藏空状态", x, y, ids);
  header(empty, "个人中心", ids);
  text(empty, "我的收藏", 64, 118, 220, 30, "Bold", colors.ink, ids);

  const state = box(empty, "Favorites empty state", 320, 190, 800, 340, colors.white, 16, ids);
  frame(state, "Favorite empty illustration", 340, 50, 120, 120, colors.soft, 60, ids);
  text(state, "暂无收藏商品", 306, 198, 220, 28, "Bold", colors.ink, ids);
  text(state, "浏览商品时点击收藏，可以在这里快速找回。", 266, 248, 300, 15, "Regular", colors.muted, ids);
  button(state, "浏览商品", 278, 294, 110, true, ids);
  button(state, "查看热卖", 410, 294, 110, false, ids);

  const categories = box(empty, "Favorite empty categories", 64, 610, 1312, 250, colors.white, 8, ids);
  text(categories, "热门分类", 24, 24, 140, 20, "Bold", colors.ink, ids);
  ["美妆个护", "数码家电", "服饰鞋包", "母婴玩具", "食品生鲜", "家居生活"].forEach((item, index) => {
    const tile = frame(categories, "Favorite category / " + item, 24 + index * 200, 86, 170, 86, index === 0 ? colors.warm : colors.soft, 10, ids);
    text(tile, item, 24, 28, 110, 16, "Semi Bold", index === 0 ? colors.brand : colors.ink, ids);
  });

  applyPersonalCenterLayout(empty, "收藏商品", ids);
  return empty;
}

function buildReview(page, x, y, ids) {
  const review = screen(page, "PC Web / 评价晒单", x, y, ids);
  header(review, "个人中心", ids);
  text(review, "评价晒单", 64, 118, 220, 30, "Bold", colors.ink, ids);

  const goods = box(review, "Review goods", 64, 182, 500, 250, colors.white, 8, ids);
  text(goods, "待评价商品", 24, 24, 160, 20, "Bold", colors.ink, ids);
  frame(goods, "Review product image", 24, 76, 120, 120, colors.image, 8, ids);
  text(goods, "蓝牙耳机 Pro 主动降噪长续航", 168, 78, 260, 16, "Semi Bold", colors.ink, ids);
  text(goods, "曜石黑 · 标准版 · 实付 ¥299", 168, 116, 240, 14, "Regular", colors.muted, ids);
  text(goods, "订单号 202607040001", 168, 150, 220, 13, "Regular", colors.muted, ids);

  const form = box(review, "Review form", 604, 182, 772, 650, colors.white, 8, ids);
  text(form, "发表评价", 24, 24, 160, 20, "Bold", colors.ink, ids);
  text(form, "商品评分", 24, 86, 100, 14, "Semi Bold", colors.ink, ids);
  text(form, "★★★★★", 134, 78, 180, 28, "Bold", colors.brand, ids);
  text(form, "评价内容", 24, 156, 100, 14, "Semi Bold", colors.ink, ids);
  const area = box(form, "Review textarea", 134, 142, 520, 180, colors.white, 8, ids);
  text(area, "分享商品体验、物流速度、服务感受等。", 16, 16, 400, 13, "Regular", colors.placeholder, ids);
  text(form, "上传图片", 24, 366, 100, 14, "Semi Bold", colors.ink, ids);
  [0, 1, 2, 3].forEach((index) => {
    const upload = box(form, "Review image upload " + (index + 1), 134 + index * 108, 350, 88, 88, colors.soft, 8, ids);
    text(upload, "+", 36, 24, 24, 28, "Bold", colors.muted, ids);
  });
  chip(form, "匿名评价", 134, 482, 92, true, ids);
  button(form, "提交评价", 134, 548, 140, true, ids);
  button(form, "暂不评价", 298, 548, 120, false, ids);

  const history = box(review, "Review history", 64, 472, 500, 360, colors.white, 8, ids);
  text(history, "历史评价", 24, 24, 160, 20, "Bold", colors.ink, ids);
  table(history, "Review history table", 24, 70, 452, ["商品", "评分", "时间"], [
    ["智能台灯", "5 星", "2026-07-02"],
    ["保温杯", "4 星", "2026-06-28"],
    ["洁面乳", "5 星", "2026-06-20"]
  ], ids);

  applyPersonalCenterLayout(review, "评价晒单", ids);
  return review;
}

function buildReviewSuccess(page, x, y, ids) {
  const success = screen(page, "PC Web / 评价成功", x, y, ids);
  header(success, "个人中心", ids);

  const card = box(success, "Review success card", 320, 150, 800, 390, colors.white, 16, ids);
  frame(card, "Review success icon", 360, 48, 80, 80, colors.warm, 40, ids);
  text(card, "评价发布成功", 292, 154, 240, 34, "Bold", colors.brand, ids);
  text(card, "感谢你的反馈，评价将帮助其他用户做出购买决策。", 230, 210, 380, 16, "Regular", colors.muted, ids);
  text(card, "已获得 +20 积分奖励", 306, 258, 200, 16, "Semi Bold", colors.ink, ids);
  button(card, "查看评价", 250, 320, 130, true, ids);
  button(card, "继续购物", 420, 320, 130, false, ids);

  const recommend = box(success, "Review success recommendations", 184, 600, 1072, 270, colors.white, 8, ids);
  text(recommend, "继续评价", 24, 24, 140, 20, "Bold", colors.ink, ids);
  table(recommend, "Pending review table", 24, 76, 1024, ["商品", "订单号", "购买时间", "操作"], [
    ["智能台灯", "202607020030", "2026-07-02", "去评价"],
    ["儿童保温杯", "202606280011", "2026-06-28", "去评价"]
  ], ids);

  applyPersonalCenterLayout(success, "评价晒单", ids);
  return success;
}

function buildMemberPoints(page, x, y, ids) {
  const member = screen(page, "PC Web / 会员积分", x, y, ids);
  header(member, "个人中心", ids);
  text(member, "会员积分", 64, 118, 220, 30, "Bold", colors.ink, ids);

  const overview = frame(member, "Member points hero", 64, 180, 1312, 210, colors.warm, 16, ids);
  text(overview, "普通会员", 36, 36, 180, 28, "Bold", colors.brand, ids);
  text(overview, "当前积分 1280", 36, 88, 220, 34, "Bold", colors.ink, ids);
  text(overview, "再获得 720 积分可升级为银卡会员，享受专属折扣和运费券。", 38, 142, 520, 15, "Regular", colors.muted, ids);
  button(overview, "积分兑换", 1060, 86, 120, true, ids);
  button(overview, "会员规则", 1196, 86, 120, false, ids);

  const tasks = box(member, "Points tasks", 64, 430, 620, 480, colors.white, 8, ids);
  text(tasks, "赚积分任务", 24, 24, 160, 20, "Bold", colors.ink, ids);
  [["每日签到", "+5"], ["完善资料", "+50"], ["评价晒单", "+20"], ["邀请好友", "+100"]].forEach(([task, point], index) => {
    const item = box(tasks, "Point task / " + task, 24, 78 + index * 86, 572, 66, index === 0 ? colors.warm : colors.white, 8, ids);
    text(item, task, 18, 18, 140, 15, "Semi Bold", colors.ink, ids);
    text(item, point + " 积分", 180, 18, 100, 15, "Bold", colors.brand, ids);
    button(item, index === 0 ? "去签到" : "去完成", 470, 14, 80, index === 0, ids);
  });

  const records = box(member, "Points records", 724, 430, 652, 480, colors.white, 8, ids);
  text(records, "积分明细", 24, 24, 160, 20, "Bold", colors.ink, ids);
  table(records, "Points records table", 24, 72, 604, ["时间", "来源", "积分"], [
    ["2026-07-04", "购物奖励", "+60"],
    ["2026-07-03", "评价晒单", "+20"],
    ["2026-07-02", "兑换优惠券", "-100"],
    ["2026-07-01", "每日签到", "+5"]
  ], ids);

  applyPersonalCenterLayout(member, "会员积分", ids);
  return member;
}

function buildAccountSecurity(page, x, y, ids) {
  const security = screen(page, "PC Web / 账号安全", x, y, ids);
  header(security, "个人中心", ids);
  text(security, "账号安全", 64, 118, 220, 30, "Bold", colors.ink, ids);

  const summary = box(security, "Security summary", 64, 180, 1312, 132, colors.white, 8, ids);
  text(summary, "安全等级：高", 24, 28, 180, 24, "Bold", colors.brand, ids);
  text(summary, "已绑定手机号、登录密码和支付密码，建议开启登录保护。", 24, 72, 520, 14, "Regular", colors.muted, ids);

  const list = box(security, "Security settings", 64, 348, 820, 560, colors.white, 8, ids);
  text(list, "安全设置", 24, 24, 160, 20, "Bold", colors.ink, ids);
  [["登录密码", "已设置，建议定期更换", "修改"], ["手机绑定", "138****8888", "换绑"], ["支付密码", "已开启", "修改"], ["登录保护", "异地登录短信验证", "开启"], ["实名认证", "未认证", "去认证"]].forEach(([title, desc, action], index) => {
    const row = box(list, "Security item / " + title, 24, 76 + index * 88, 772, 66, colors.white, 8, ids);
    text(row, title, 18, 16, 120, 16, "Semi Bold", colors.ink, ids);
    text(row, desc, 170, 18, 320, 14, "Regular", colors.muted, ids);
    button(row, action, 650, 14, 86, index === 4, ids);
  });

  const logs = box(security, "Login logs", 928, 348, 448, 560, colors.white, 8, ids);
  text(logs, "最近登录", 24, 24, 160, 20, "Bold", colors.ink, ids);
  table(logs, "Login log table", 24, 74, 400, ["时间", "设备", "状态"], [
    ["07-04", "Chrome", "成功"],
    ["07-03", "Safari", "成功"],
    ["07-02", "未知设备", "拦截"]
  ], ids);

  applyPersonalCenterLayout(security, "账号安全", ids);
  return security;
}

function buildRealNameVerification(page, x, y, ids) {
  const verify = screen(page, "PC Web / 实名认证", x, y, ids);
  header(verify, "个人中心", ids);
  text(verify, "实名认证", 64, 118, 220, 30, "Bold", colors.ink, ids);

  const form = box(verify, "Real-name form", 64, 180, 760, 700, colors.white, 8, ids);
  text(form, "身份信息", 24, 24, 160, 20, "Bold", colors.ink, ids);
  input(form, "真实姓名", 24, 88, 320, ids);
  input(form, "身份证号码", 24, 160, 520, ids);
  text(form, "证件照片", 24, 244, 100, 14, "Semi Bold", colors.ink, ids);
  const front = box(form, "ID front upload", 24, 280, 220, 140, colors.soft, 8, ids);
  text(front, "上传身份证人像面", 44, 58, 140, 14, "Regular", colors.muted, ids);
  const back = box(form, "ID back upload", 276, 280, 220, 140, colors.soft, 8, ids);
  text(back, "上传身份证国徽面", 44, 58, 140, 14, "Regular", colors.muted, ids);
  chip(form, "我已阅读并同意认证服务协议", 24, 466, 220, true, ids);
  button(form, "提交认证", 24, 540, 140, true, ids);
  button(form, "暂不认证", 188, 540, 120, false, ids);

  const explain = box(verify, "Real-name explain", 864, 180, 512, 700, colors.white, 8, ids);
  text(explain, "认证说明", 24, 24, 160, 20, "Bold", colors.ink, ids);
  ["用于账号安全、售后争议和大额支付保护。", "证件信息将加密存储，仅用于必要验证。", "认证通过后可提升账号安全等级。", "认证失败可重新提交或联系客服。"].forEach((item, index) => {
    const row = frame(explain, "Real-name explain / " + index, 24, 82 + index * 96, 440, 66, colors.soft, 8, ids);
    text(row, item, 18, 20, 360, 14, "Regular", colors.muted, ids);
  });

  applyPersonalCenterLayout(verify, "账号安全", ids);
  return verify;
}

function buildPayPassword(page, x, y, ids) {
  const payPwd = screen(page, "PC Web / 设置支付密码", x, y, ids);
  header(payPwd, "个人中心", ids);
  text(payPwd, "设置支付密码", 64, 118, 260, 30, "Bold", colors.ink, ids);

  const card = box(payPwd, "Pay password card", 420, 180, 600, 560, colors.white, 16, ids);
  text(card, "设置 6 位支付密码", 40, 40, 260, 28, "Bold", colors.ink, ids);
  const steps = box(card, "Pay password steps", 40, 100, 520, 52, colors.soft, 26, ids);
  ["身份验证", "设置密码", "确认完成"].forEach((item, index) => chip(steps, item, 18 + index * 154, 11, 104, index === 1, ids));
  input(card, "短信验证码", 40, 196, 300, ids);
  button(card, "获取验证码", 360, 196, 120, false, ids);
  input(card, "输入 6 位支付密码", 40, 278, 440, ids);
  input(card, "再次确认支付密码", 40, 350, 440, ids);
  text(card, "支付密码用于余额、积分抵扣和高风险订单验证。", 40, 414, 420, 13, "Regular", colors.muted, ids);
  button(card, "确认设置", 40, 472, 140, true, ids);
  button(card, "返回安全中心", 204, 472, 140, false, ids);

  applyPersonalCenterLayout(payPwd, "账号安全", ids);
  return payPwd;
}

function buildMessageCenter(page, x, y, ids) {
  const messages = screen(page, "PC Web / 消息中心", x, y, ids);
  header(messages, "个人中心", ids);
  text(messages, "消息中心", 64, 118, 220, 30, "Bold", colors.ink, ids);

  const side = box(messages, "Message categories", 64, 180, 240, 720, colors.white, 8, ids);
  text(side, "消息分类", 24, 24, 140, 20, "Bold", colors.ink, ids);
  ["全部消息", "订单通知", "优惠活动", "售后进度", "系统公告"].forEach((item, index) => chip(side, item, 24, 80 + index * 54, 160, index === 0, ids));

  const list = box(messages, "Message list", 344, 180, 1032, 720, colors.white, 8, ids);
  text(list, "全部消息", 24, 24, 160, 20, "Bold", colors.ink, ids);
  button(list, "通知设置", 762, 20, 104, false, ids);
  button(list, "全部已读", 884, 20, 104, false, ids);
  [["订单已支付成功", "订单 202607040001 支付成功，商家正在处理中。"], ["优惠券到账", "你有一张满 599 减 60 优惠券即将过期。"], ["售后审核通过", "退货退款申请已通过，请及时寄回商品。"], ["系统维护公告", "平台将在凌晨进行短时维护，不影响下单。"]].forEach(([title, desc], index) => {
    const item = box(list, "Message item / " + title, 24, 78 + index * 126, 984, 96, index === 0 ? colors.warm : colors.white, 8, ids);
    text(item, title, 20, 18, 260, 16, "Semi Bold", colors.ink, ids);
    text(item, desc, 20, 50, 560, 14, "Regular", colors.muted, ids);
    text(item, "2026-07-0" + (4 - index), 830, 20, 110, 13, "Regular", colors.muted, ids);
  });

  applyPersonalCenterLayout(messages, "消息中心", ids);
  return messages;
}

function buildLogisticsTracking(page, x, y, ids) {
  const logistics = screen(page, "PC Web / 物流跟踪", x, y, ids);
  header(logistics, "个人中心", ids);
  text(logistics, "物流跟踪", 64, 118, 220, 30, "Bold", colors.ink, ids);

  const summary = box(logistics, "Logistics summary", 64, 180, 1312, 150, colors.warm, 10, ids);
  text(summary, "运输中", 28, 30, 140, 28, "Bold", colors.brand, ids);
  text(summary, "顺丰速运 SF1234567890 · 预计 2026-07-06 送达", 28, 82, 420, 15, "Regular", colors.ink, ids);
  button(summary, "复制单号", 1110, 56, 100, false, ids);
  button(summary, "联系快递", 1228, 56, 100, true, ids);

  const route = box(logistics, "Logistics route", 64, 370, 760, 560, colors.white, 8, ids);
  text(route, "物流轨迹", 24, 24, 160, 20, "Bold", colors.ink, ids);
  [["已揽收", "上海浦东转运中心已揽收"], ["运输中", "快件已从上海发往杭州"], ["派送中", "预计明日 10:00 前派送"], ["已签收", "等待签收"]].forEach(([status, desc], index) => {
    frame(route, "Route dot " + index, 30, 84 + index * 96, 18, 18, index < 2 ? colors.brand : colors.line, 9, ids);
    text(route, status, 70, 76 + index * 96, 120, 16, "Semi Bold", colors.ink, ids);
    text(route, desc, 70, 106 + index * 96, 360, 14, "Regular", colors.muted, ids);
    text(route, "2026-07-0" + (4 + index) + " 12:30", 520, 92 + index * 96, 160, 13, "Regular", colors.muted, ids);
  });

  const goods = box(logistics, "Logistics goods", 864, 370, 512, 560, colors.white, 8, ids);
  text(goods, "包裹商品", 24, 24, 160, 20, "Bold", colors.ink, ids);
  compactProduct(goods, "蓝牙耳机 Pro", "x1", 24, 80, ids);
  compactProduct(goods, "氨基酸洁面乳", "x2", 24, 176, ids);
  text(goods, "收货地址", 24, 302, 120, 16, "Semi Bold", colors.ink, ids);
  text(goods, "李先生 138****8888\n上海市浦东新区 XX 路 88 号", 24, 336, 360, 14, "Regular", colors.muted, ids);

  applyPersonalCenterLayout(logistics, "我的订单", ids);
  return logistics;
}

function buildOrderDetail(page, x, y, ids) {
  const order = screen(page, "PC Web / 订单详情", x, y, ids);
  header(order, "个人中心", ids);
  text(order, "订单详情", 64, 118, 220, 30, "Bold", colors.ink, ids);

  const status = box(order, "Order status", 64, 178, 1312, 150, colors.warm, 10, ids);
  text(status, "待发货", 28, 28, 160, 28, "Bold", colors.brand, ids);
  text(status, "订单号 202607040001 · 下单时间 2026-07-04 10:28", 28, 78, 420, 14, "Regular", colors.muted, ids);
  button(status, "申请售后", 1050, 54, 116, false, ids);
  button(status, "联系客服", 1184, 54, 116, true, ids);

  const delivery = box(order, "Delivery info", 64, 360, 420, 260, colors.white, 8, ids);
  text(delivery, "收货信息", 24, 22, 160, 20, "Bold", colors.ink, ids);
  text(delivery, "李先生 138****8888", 24, 76, 220, 14, "Medium", colors.ink, ids);
  text(delivery, "上海市浦东新区 XX 路 88 号", 24, 112, 300, 14, "Regular", colors.muted, ids);
  text(delivery, "配送方式：普通快递", 24, 156, 220, 14, "Regular", colors.muted, ids);

  const goods = box(order, "Order detail goods", 520, 360, 856, 260, colors.white, 8, ids);
  text(goods, "订单商品", 24, 22, 160, 20, "Bold", colors.ink, ids);
  table(goods, "Order detail table", 24, 66, 808, ["商品", "规格", "单价", "数量", "售后"], [
    ["蓝牙耳机 Pro", "曜石黑", "¥299", "1", "申请"],
    ["氨基酸洁面乳", "套装", "¥128", "2", "申请"]
  ], ids);

  const timeline = box(order, "Order timeline", 64, 660, 740, 300, colors.white, 8, ids);
  text(timeline, "订单轨迹", 24, 22, 160, 20, "Bold", colors.ink, ids);
  ["订单提交", "支付成功", "商家处理中", "等待发货"].forEach((item, index) => {
    frame(timeline, "Timeline dot " + index, 28, 76 + index * 52, 14, 14, index < 2 ? colors.brand : colors.line, 7, ids);
    text(timeline, item, 60, 68 + index * 52, 160, 14, "Medium", colors.ink, ids);
    text(timeline, "2026-07-04 " + (10 + index) + ":28", 220, 68 + index * 52, 180, 13, "Regular", colors.muted, ids);
  });

  const summary = box(order, "Order payment summary", 840, 660, 536, 300, colors.white, 8, ids);
  text(summary, "费用明细", 24, 22, 160, 20, "Bold", colors.ink, ids);
  [["商品金额", "¥555"], ["运费", "¥0"], ["优惠", "-¥30"], ["实付", "¥525"]].forEach(([label, value], index) => {
    text(summary, label, 24, 76 + index * 44, 120, 14, "Regular", colors.muted, ids);
    text(summary, value, 390, 76 + index * 44, 100, 14, index === 3 ? "Bold" : "Medium", index === 3 ? colors.brand : colors.ink, ids);
  });

  applyPersonalCenterLayout(order, "我的订单", ids);
  return order;
}

function buildAfterSale(page, x, y, ids) {
  const afterSale = screen(page, "PC Web / 售后申请", x, y, ids);
  header(afterSale, "个人中心", ids);
  text(afterSale, "申请售后", 64, 118, 220, 30, "Bold", colors.ink, ids);

  const form = box(afterSale, "After-sale form", 64, 180, 820, 760, colors.white, 8, ids);
  text(form, "售后信息", 24, 24, 160, 20, "Bold", colors.ink, ids);
  text(form, "选择商品", 24, 86, 100, 14, "Semi Bold", colors.ink, ids);
  const item = box(form, "Refund product item", 134, 70, 620, 76, colors.warm, 8, ids);
  frame(item, "Product thumb", 14, 12, 52, 52, colors.image, 6, ids);
  text(item, "蓝牙耳机 Pro · 曜石黑", 82, 16, 240, 14, "Medium", colors.ink, ids);
  text(item, "可退数量 1 · 实付 ¥299", 82, 42, 220, 13, "Regular", colors.muted, ids);
  text(form, "售后类型", 24, 184, 100, 14, "Semi Bold", colors.ink, ids);
  ["仅退款", "退货退款", "换货"].forEach((value, index) => chip(form, value, 134 + index * 110, 176, 92, index === 1, ids));
  text(form, "退款原因", 24, 246, 100, 14, "Semi Bold", colors.ink, ids);
  input(form, "请选择退款原因", 134, 236, 360, ids);
  text(form, "问题描述", 24, 316, 100, 14, "Semi Bold", colors.ink, ids);
  const desc = box(form, "Description textarea", 134, 304, 520, 140, colors.white, 8, ids);
  text(desc, "请描述遇到的问题，方便商家审核。", 14, 14, 420, 13, "Regular", colors.placeholder, ids);
  text(form, "上传凭证", 24, 486, 100, 14, "Semi Bold", colors.ink, ids);
  [0, 1, 2].forEach((index) => {
    const upload = box(form, "Upload proof " + (index + 1), 134 + index * 112, 470, 92, 92, colors.soft, 8, ids);
    text(upload, "+", 38, 26, 24, 28, "Bold", colors.muted, ids);
  });
  button(form, "提交申请", 134, 630, 160, true, ids);
  button(form, "取消", 318, 630, 120, false, ids);

  const guide = box(afterSale, "After-sale guide", 928, 180, 448, 760, colors.white, 8, ids);
  text(guide, "售后流程", 24, 24, 160, 20, "Bold", colors.ink, ids);
  ["提交申请", "商家审核", "寄回商品", "平台退款"].forEach((item, index) => {
    const step = frame(guide, "Guide step / " + item, 24, 82 + index * 106, 360, 72, index === 0 ? colors.warm : colors.soft, 10, ids);
    text(step, item, 20, 14, 120, 16, "Semi Bold", index === 0 ? colors.brand : colors.ink, ids);
    text(step, "预计 " + (index + 1) + " 个工作日内完成", 20, 42, 220, 13, "Regular", colors.muted, ids);
  });
  text(guide, "说明：生鲜、定制商品等特殊品类按平台规则处理。", 24, 560, 330, 14, "Regular", colors.muted, ids);

  applyPersonalCenterLayout(afterSale, "售后服务", ids);
  return afterSale;
}

function buildAfterSaleList(page, x, y, ids) {
  const listPage = screen(page, "PC Web / 售后列表", x, y, ids);
  header(listPage, "个人中心", ids);
  text(listPage, "售后列表", 64, 118, 220, 30, "Bold", colors.ink, ids);

  const tabs = box(listPage, "After-sale tabs", 64, 180, 1312, 64, colors.white, 8, ids);
  ["全部", "审核中", "待寄回", "退款中", "已完成", "已关闭"].forEach((item, index) => chip(tabs, item, 24 + index * 94, 17, 78, index === 0, ids));
  input(tabs, "搜索服务单号 / 商品名称", 980, 12, 260, ids);

  const list = box(listPage, "After-sale cards", 64, 284, 1312, 640, colors.white, 8, ids);
  [
    ["AS202607040001", "商家审核中", "蓝牙耳机 Pro", "退货退款", "¥299"],
    ["AS202607030012", "待寄回商品", "儿童保温杯", "换货", "¥89"],
    ["AS202607010008", "退款中", "氨基酸洁面乳", "仅退款", "¥128"],
    ["AS202606280002", "已完成", "智能台灯", "退货退款", "¥159"]
  ].forEach(([no, status, goods, type, amount], index) => {
    const card = box(list, "After-sale card / " + no, 24, 24 + index * 144, 1264, 112, index === 0 ? colors.warm : colors.white, 8, ids);
    text(card, "服务单号 " + no, 20, 18, 220, 14, "Medium", colors.ink, ids);
    chip(card, status, 1030, 12, 100, index === 0, ids);
    frame(card, "After-sale goods image", 20, 52, 48, 48, colors.image, 6, ids);
    text(card, goods, 86, 54, 180, 15, "Semi Bold", colors.ink, ids);
    text(card, type + " · " + amount, 320, 56, 160, 14, "Regular", colors.muted, ids);
    button(card, "查看详情", 1148, 56, 92, index === 0, ids);
  });

  applyPersonalCenterLayout(listPage, "售后服务", ids);
  return listPage;
}

function buildAfterSaleDetail(page, x, y, ids) {
  const detail = screen(page, "PC Web / 售后详情", x, y, ids);
  header(detail, "个人中心", ids);
  text(detail, "售后详情", 64, 118, 220, 30, "Bold", colors.ink, ids);

  const status = box(detail, "After-sale status", 64, 180, 1312, 150, colors.warm, 10, ids);
  text(status, "商家审核中", 28, 30, 180, 28, "Bold", colors.brand, ids);
  text(status, "服务单号 AS202607040001 · 申请类型：退货退款", 28, 82, 420, 15, "Regular", colors.ink, ids);
  button(status, "撤销申请", 1110, 56, 100, false, ids);
  button(status, "联系客服", 1228, 56, 100, true, ids);

  const timeline = box(detail, "After-sale timeline", 64, 370, 650, 540, colors.white, 8, ids);
  text(timeline, "处理进度", 24, 24, 160, 20, "Bold", colors.ink, ids);
  [["提交申请", "买家提交退货退款申请"], ["商家审核", "等待商家在 24 小时内处理"], ["寄回商品", "审核通过后填写退货物流"], ["退款完成", "平台原路退款"]].forEach(([title, desc], index) => {
    frame(timeline, "After-sale dot " + index, 30, 84 + index * 92, 18, 18, index === 0 ? colors.brand : colors.line, 9, ids);
    text(timeline, title, 70, 76 + index * 92, 120, 16, "Semi Bold", colors.ink, ids);
    text(timeline, desc, 70, 106 + index * 92, 340, 14, "Regular", colors.muted, ids);
  });

  const info = box(detail, "After-sale info", 754, 370, 622, 540, colors.white, 8, ids);
  text(info, "申请信息", 24, 24, 160, 20, "Bold", colors.ink, ids);
  compactProduct(info, "蓝牙耳机 Pro", "¥299", 24, 78, ids);
  [["退款金额", "¥299"], ["退款原因", "商品质量问题"], ["问题描述", "佩戴后左耳无声音，申请退货退款。"], ["凭证图片", "3 张"]].forEach(([label, value], index) => {
    text(info, label, 24, 190 + index * 58, 100, 14, "Regular", colors.muted, ids);
    text(info, value, 150, 190 + index * 58, 360, 14, "Medium", colors.ink, ids);
  });

  applyPersonalCenterLayout(detail, "售后服务", ids);
  return detail;
}

function buildReturnLogistics(page, x, y, ids) {
  const returnShip = screen(page, "PC Web / 退货物流填写", x, y, ids);
  header(returnShip, "个人中心", ids);
  text(returnShip, "填写退货物流", 64, 118, 260, 30, "Bold", colors.ink, ids);

  const status = box(returnShip, "Return logistics status", 64, 180, 1312, 120, colors.warm, 10, ids);
  text(status, "商家已同意退货，请在 7 天内寄回商品", 28, 30, 420, 24, "Bold", colors.brand, ids);
  text(status, "服务单号 AS202607040001 · 退货地址：上海市浦东新区售后仓", 30, 74, 560, 14, "Regular", colors.ink, ids);

  const form = box(returnShip, "Return logistics form", 64, 340, 760, 560, colors.white, 8, ids);
  text(form, "物流信息", 24, 24, 160, 20, "Bold", colors.ink, ids);
  input(form, "选择快递公司", 24, 88, 340, ids);
  input(form, "填写物流单号", 24, 160, 340, ids);
  input(form, "寄件人手机", 24, 232, 340, ids);
  text(form, "上传寄件凭证", 24, 314, 120, 14, "Semi Bold", colors.ink, ids);
  [0, 1, 2].forEach((index) => {
    const upload = box(form, "Return proof " + (index + 1), 24 + index * 112, 346, 92, 92, colors.soft, 8, ids);
    text(upload, "+", 38, 26, 24, 28, "Bold", colors.muted, ids);
  });
  button(form, "提交物流", 24, 478, 140, true, ids);
  button(form, "暂不填写", 188, 478, 120, false, ids);

  const tips = box(returnShip, "Return tips", 864, 340, 512, 560, colors.white, 8, ids);
  text(tips, "寄回说明", 24, 24, 160, 20, "Bold", colors.ink, ids);
  ["请保持商品、配件、包装完整。", "请勿使用到付，运费按售后规则处理。", "商家签收后 1-3 个工作日内退款。", "超时未填写物流，售后申请可能关闭。"].forEach((item, index) => {
    const row = frame(tips, "Return tip / " + index, 24, 80 + index * 86, 440, 58, colors.soft, 8, ids);
    text(row, item, 18, 18, 360, 14, "Regular", colors.muted, ids);
  });

  applyPersonalCenterLayout(returnShip, "售后服务", ids);
  return returnShip;
}

function buildSupportTickets(page, x, y, ids) {
  const tickets = screen(page, "PC Web / 客服工单", x, y, ids);
  header(tickets, "个人中心", ids);
  text(tickets, "客服工单", 64, 118, 220, 30, "Bold", colors.ink, ids);

  const sidebar = box(tickets, "Ticket categories", 64, 180, 260, 720, colors.white, 8, ids);
  text(sidebar, "问题类型", 24, 24, 140, 20, "Bold", colors.ink, ids);
  ["全部工单", "订单问题", "支付退款", "物流配送", "售后服务", "账户安全"].forEach((item, index) => chip(sidebar, item, 24, 80 + index * 54, 170, index === 0, ids));
  button(sidebar, "新建工单", 24, 620, 170, true, ids);

  const list = box(tickets, "Ticket list", 364, 180, 1012, 720, colors.white, 8, ids);
  text(list, "我的工单", 24, 24, 160, 20, "Bold", colors.ink, ids);
  [
    ["TK202607040001", "订单未发货咨询", "处理中", "订单 202607040001 预计何时发货？"],
    ["TK202607020006", "优惠券不可用", "待补充", "满减券在结算页无法使用。"],
    ["TK202606290003", "退款到账时间", "已解决", "退款成功后多久可以到账？"]
  ].forEach(([no, title, status, desc], index) => {
    const row = box(list, "Ticket item / " + no, 24, 82 + index * 150, 964, 116, index === 0 ? colors.warm : colors.white, 8, ids);
    text(row, title, 20, 18, 240, 17, "Semi Bold", colors.ink, ids);
    text(row, no + " · " + desc, 20, 54, 520, 14, "Regular", colors.muted, ids);
    chip(row, status, 760, 24, 82, index === 0, ids);
    button(row, "查看", 866, 40, 70, index === 0, ids);
  });

  const compose = box(list, "Ticket compose", 24, 570, 964, 112, colors.soft, 8, ids);
  text(compose, "快捷新建：选择订单、描述问题、上传截图，客服将在 24 小时内处理。", 20, 28, 540, 15, "Regular", colors.muted, ids);
  button(compose, "创建工单", 800, 34, 100, true, ids);

  return tickets;
}

function buildTicketDetail(page, x, y, ids) {
  const detail = screen(page, "PC Web / 工单详情", x, y, ids);
  header(detail, "个人中心", ids);
  text(detail, "工单详情", 64, 118, 220, 30, "Bold", colors.ink, ids);

  const status = box(detail, "Ticket status", 64, 180, 1312, 132, colors.warm, 10, ids);
  text(status, "处理中", 28, 28, 120, 28, "Bold", colors.brand, ids);
  text(status, "工单 TK202607040001 · 订单未发货咨询 · 创建于 2026-07-04 11:20", 28, 78, 560, 14, "Regular", colors.ink, ids);
  button(status, "关闭工单", 1120, 48, 92, false, ids);
  button(status, "补充信息", 1230, 48, 92, true, ids);

  const chat = box(detail, "Ticket conversation", 64, 350, 860, 560, colors.white, 8, ids);
  text(chat, "沟通记录", 24, 24, 160, 20, "Bold", colors.ink, ids);
  [
    ["我", "订单已经支付两天了，还没有发货。"],
    ["客服", "已为你催促仓库，预计今天 18:00 前发出。"],
    ["我", "好的，麻烦同步物流单号。"]
  ].forEach(([role, content], index) => {
    const bubble = frame(chat, "Ticket message / " + role + index, role === "我" ? 360 : 24, 82 + index * 110, 452, 72, role === "我" ? colors.warm : colors.soft, 10, ids);
    text(bubble, role, 16, 12, 60, 13, "Semi Bold", role === "我" ? colors.brand : colors.ink, ids);
    text(bubble, content, 16, 38, 380, 14, "Regular", colors.ink, ids);
  });
  const reply = box(chat, "Ticket reply input", 24, 456, 812, 78, colors.white, 8, ids);
  text(reply, "输入补充信息...", 16, 18, 300, 14, "Regular", colors.placeholder, ids);
  button(reply, "发送", 700, 20, 76, true, ids);

  const info = box(detail, "Ticket side info", 964, 350, 412, 560, colors.white, 8, ids);
  text(info, "关联信息", 24, 24, 160, 20, "Bold", colors.ink, ids);
  compactProduct(info, "蓝牙耳机 Pro", "¥299", 24, 80, ids);
  [["订单号", "202607040001"], ["处理人", "客服 A102"], ["响应时限", "24 小时内"], ["满意度", "待评价"]].forEach(([label, value], index) => {
    text(info, label, 24, 204 + index * 56, 80, 14, "Regular", colors.muted, ids);
    text(info, value, 128, 204 + index * 56, 180, 14, "Medium", colors.ink, ids);
  });

  return detail;
}

function buildInvoiceManager(page, x, y, ids) {
  const invoice = screen(page, "PC Web / 发票管理", x, y, ids);
  header(invoice, "个人中心", ids);
  text(invoice, "发票管理", 64, 118, 220, 30, "Bold", colors.ink, ids);

  const apply = box(invoice, "Invoice apply panel", 64, 180, 600, 720, colors.white, 8, ids);
  text(apply, "申请发票", 24, 24, 160, 20, "Bold", colors.ink, ids);
  input(apply, "选择可开票订单", 24, 88, 520, ids);
  text(apply, "发票类型", 24, 160, 100, 14, "Semi Bold", colors.ink, ids);
  ["普通发票", "专用发票"].forEach((item, index) => chip(apply, item, 24 + index * 112, 190, 96, index === 0, ids));
  input(apply, "发票抬头", 24, 258, 520, ids);
  input(apply, "纳税人识别号", 24, 330, 520, ids);
  input(apply, "接收邮箱", 24, 402, 520, ids);
  button(apply, "提交申请", 24, 500, 140, true, ids);
  button(apply, "保存抬头", 188, 500, 120, false, ids);

  const history = box(invoice, "Invoice history", 704, 180, 672, 720, colors.white, 8, ids);
  text(history, "开票记录", 24, 24, 160, 20, "Bold", colors.ink, ids);
  table(history, "Invoice history table", 24, 74, 624, ["订单号", "金额", "状态", "操作"], [
    ["202607040001", "¥525", "待开票", "查看"],
    ["202607020030", "¥159", "已开票", "下载"],
    ["202606280011", "¥269", "已驳回", "重开"]
  ], ids);

  const title = box(history, "Invoice title", 24, 300, 624, 150, colors.soft, 8, ids);
  text(title, "常用发票抬头", 20, 20, 160, 18, "Bold", colors.ink, ids);
  text(title, "上海示例科技有限公司\n91310000MA1K000000", 20, 62, 320, 14, "Regular", colors.muted, ids);
  button(title, "编辑", 520, 88, 64, false, ids);

  return invoice;
}

function buildInvoiceDetail(page, x, y, ids) {
  const invoice = screen(page, "PC Web / 发票详情", x, y, ids);
  header(invoice, "个人中心", ids);
  text(invoice, "发票详情", 64, 118, 220, 30, "Bold", colors.ink, ids);

  const status = box(invoice, "Invoice detail status", 64, 180, 1312, 140, colors.warm, 10, ids);
  text(status, "已开票", 28, 30, 140, 28, "Bold", colors.brand, ids);
  text(status, "发票号码 FP202607040001 · 开票时间 2026-07-04 14:20", 28, 82, 480, 15, "Regular", colors.ink, ids);
  button(status, "下载 PDF", 1100, 52, 100, true, ids);
  button(status, "发送邮箱", 1218, 52, 100, false, ids);

  const detail = box(invoice, "Invoice base info", 64, 360, 620, 500, colors.white, 8, ids);
  text(detail, "发票信息", 24, 24, 160, 20, "Bold", colors.ink, ids);
  [["发票类型", "电子普通发票"], ["发票抬头", "上海示例科技有限公司"], ["纳税人识别号", "91310000MA1K000000"], ["开票金额", "¥525"], ["接收邮箱", "finance@example.com"]].forEach(([label, value], index) => {
    text(detail, label, 24, 82 + index * 62, 120, 14, "Regular", colors.muted, ids);
    text(detail, value, 180, 82 + index * 62, 320, 14, "Medium", colors.ink, ids);
  });

  const orders = box(invoice, "Invoice related orders", 724, 360, 652, 500, colors.white, 8, ids);
  text(orders, "关联订单", 24, 24, 160, 20, "Bold", colors.ink, ids);
  table(orders, "Invoice related order table", 24, 74, 604, ["订单号", "金额", "时间"], [
    ["202607040001", "¥525", "2026-07-04"],
    ["202607020030", "¥159", "2026-07-02"]
  ], ids);

  return invoice;
}

function buildAccountClosure(page, x, y, ids) {
  const closure = screen(page, "PC Web / 注销账号", x, y, ids);
  header(closure, "个人中心", ids);
  text(closure, "注销账号", 64, 118, 220, 30, "Bold", colors.ink, ids);

  const warn = box(closure, "Closure warning", 64, 180, 1312, 150, colors.warm, 10, ids);
  text(warn, "注销前请确认", 28, 28, 180, 28, "Bold", colors.brand, ids);
  text(warn, "账号注销后，订单、地址、收藏、积分、优惠券等数据将按规则处理，部分信息不可恢复。", 30, 82, 760, 15, "Regular", colors.ink, ids);

  const checklist = box(closure, "Closure checklist", 64, 370, 640, 520, colors.white, 8, ids);
  text(checklist, "注销条件", 24, 24, 160, 20, "Bold", colors.ink, ids);
  [["无待支付订单", "已满足"], ["无进行中售后", "未满足"], ["可用资金已清零", "已满足"], ["发票和纠纷已处理", "已满足"]].forEach(([label, status], index) => {
    const row = box(checklist, "Closure check / " + label, 24, 82 + index * 90, 592, 64, status === "未满足" ? colors.warm : colors.white, 8, ids);
    text(row, label, 18, 20, 200, 15, "Semi Bold", colors.ink, ids);
    text(row, status, 480, 20, 80, 15, "Bold", status === "未满足" ? colors.brand : colors.muted, ids);
  });

  const form = box(closure, "Closure apply form", 744, 370, 632, 520, colors.white, 8, ids);
  text(form, "申请注销", 24, 24, 160, 20, "Bold", colors.ink, ids);
  input(form, "短信验证码", 24, 88, 300, ids);
  button(form, "获取验证码", 344, 88, 120, false, ids);
  const reason = box(form, "Closure reason textarea", 24, 170, 520, 130, colors.white, 8, ids);
  text(reason, "注销原因（选填）", 14, 14, 220, 13, "Regular", colors.placeholder, ids);
  chip(form, "我已知晓注销后的影响", 24, 336, 170, true, ids);
  button(form, "提交申请", 24, 420, 140, false, ids);
  button(form, "返回安全中心", 188, 420, 140, true, ids);

  applyPersonalCenterLayout(closure, "隐私设置", ids);
  return closure;
}

function buildHelpCenter(page, x, y, ids) {
  const help = screen(page, "PC Web / 帮助中心", x, y, ids);
  header(help, "个人中心", ids);
  text(help, "帮助中心", 64, 118, 220, 30, "Bold", colors.ink, ids);

  const search = frame(help, "Help search hero", 64, 180, 1312, 180, colors.warm, 16, ids);
  text(search, "遇到问题？", 36, 34, 180, 32, "Bold", colors.brand, ids);
  text(search, "搜索订单、支付、配送、售后、账户相关问题。", 38, 88, 420, 16, "Regular", colors.ink, ids);
  input(search, "输入问题关键词", 720, 62, 360, ids);
  button(search, "搜索", 1100, 62, 92, true, ids);

  const faq = box(help, "FAQ list", 64, 400, 760, 520, colors.white, 8, ids);
  text(faq, "常见问题", 24, 24, 160, 20, "Bold", colors.ink, ids);
  ["如何修改收货地址？", "订单支付失败怎么办？", "如何申请退货退款？", "优惠券为什么不可用？", "发票多久可以开具？"].forEach((item, index) => {
    const row = box(faq, "FAQ item / " + item, 24, 76 + index * 76, 712, 56, colors.white, 8, ids);
    text(row, item, 18, 18, 300, 15, "Medium", colors.ink, ids);
    text(row, ">", 660, 18, 20, 15, "Bold", colors.muted, ids);
  });

  const contact = box(help, "Support channels", 864, 400, 512, 520, colors.white, 8, ids);
  text(contact, "联系客服", 24, 24, 160, 20, "Bold", colors.ink, ids);
  [["在线客服", "09:00-22:00 实时响应"], ["电话客服", "400-000-0000"], ["工单反馈", "复杂问题 24 小时内回复"]].forEach(([title, desc], index) => {
    const card = frame(contact, "Support channel / " + title, 24, 78 + index * 116, 464, 86, index === 0 ? colors.warm : colors.soft, 10, ids);
    text(card, title, 20, 18, 120, 17, "Semi Bold", index === 0 ? colors.brand : colors.ink, ids);
    text(card, desc, 20, 50, 260, 13, "Regular", colors.muted, ids);
    button(card, index === 0 ? "立即咨询" : "查看", 346, 24, 86, index === 0, ids);
  });

  return help;
}

function buildSearchEmpty(page, x, y, ids) {
  const empty = screen(page, "PC Web / 搜索空结果", x, y, ids);
  header(empty, "分类", ids);
  text(empty, "搜索结果", 64, 118, 220, 30, "Bold", colors.ink, ids);

  const query = box(empty, "Search summary", 64, 180, 1312, 76, colors.white, 8, ids);
  text(query, "关键词：限量版机械键盘", 24, 24, 240, 16, "Semi Bold", colors.ink, ids);
  text(query, "未找到匹配商品，建议更换关键词或浏览推荐分类。", 300, 26, 440, 14, "Regular", colors.muted, ids);
  input(query, "重新搜索商品", 930, 18, 240, ids);
  button(query, "搜索", 1190, 18, 82, true, ids);

  const state = box(empty, "Empty state", 320, 310, 800, 290, colors.white, 16, ids);
  frame(state, "Empty illustration", 340, 46, 120, 120, colors.soft, 60, ids);
  text(state, "没有找到相关商品", 304, 182, 220, 26, "Bold", colors.ink, ids);
  text(state, "试试缩短关键词、切换分类，或查看下方热门推荐。", 246, 230, 340, 15, "Regular", colors.muted, ids);

  const recommend = box(empty, "Empty recommendations", 64, 662, 1312, 300, colors.white, 8, ids);
  text(recommend, "热门推荐", 24, 22, 140, 20, "Bold", colors.ink, ids);
  [["蓝牙耳机 Pro", "¥299"], ["智能台灯", "¥159"], ["家用吹风机", "¥219"], ["纯棉四件套", "¥269"]].forEach(([name, price], index) => {
    miniProduct(recommend, name, price, 24 + index * 310, 58, ids);
  });

  return empty;
}

function buildArrivalReminder(page, x, y, ids) {
  const reminder = screen(page, "PC Web / 到货提醒", x, y, ids);
  header(reminder, "分类", ids);
  text(reminder, "到货提醒", 64, 118, 220, 30, "Bold", colors.ink, ids);

  const product = box(reminder, "Out of stock product", 64, 180, 600, 560, colors.white, 8, ids);
  frame(product, "Product image", 40, 40, 300, 240, colors.image, 12, ids);
  text(product, "限量版机械键盘", 40, 316, 260, 28, "Bold", colors.ink, ids);
  text(product, "当前无货，可提交手机号或站内提醒，到货后第一时间通知。", 42, 368, 420, 15, "Regular", colors.muted, ids);
  text(product, "预计补货：2026-07-18", 42, 420, 220, 15, "Semi Bold", colors.brand, ids);

  const form = box(reminder, "Arrival reminder form", 704, 180, 672, 560, colors.white, 8, ids);
  text(form, "提醒方式", 24, 24, 160, 20, "Bold", colors.ink, ids);
  ["站内消息", "短信提醒", "邮件提醒"].forEach((item, index) => chip(form, item, 24 + index * 112, 82, 96, index === 0, ids));
  input(form, "手机号码", 24, 158, 300, ids);
  input(form, "邮箱地址（选填）", 24, 230, 300, ids);
  text(form, "期望规格", 24, 314, 100, 14, "Semi Bold", colors.ink, ids);
  ["黑色红轴", "白色茶轴", "银色青轴"].forEach((item, index) => chip(form, item, 24 + index * 104, 346, 88, index === 0, ids));
  button(form, "提交提醒", 24, 446, 140, true, ids);
  button(form, "查看相似商品", 188, 446, 140, false, ids);

  const similar = box(reminder, "Similar products", 64, 780, 1312, 220, colors.white, 8, ids);
  text(similar, "相似商品", 24, 22, 140, 20, "Bold", colors.ink, ids);
  [["无线机械键盘", "¥399"], ["办公键鼠套装", "¥159"], ["电竞鼠标", "¥229"], ["桌面腕托", "¥49"]].forEach(([name, price], index) => {
    compactProduct(similar, name, price, 24 + index * 300, 78, ids);
  });

  return reminder;
}

async function run() {
  const createdIds = [];
  await loadFonts();

  const page = await getTargetPage();
  cleanupGenerated(page);

  const startY = getStartY(page);
  const note = box(page, "PC Web expansion note", 40, startY, 2940, 84, colors.white, 8, createdIds);
  text(note, "PC Web 完整页面补充", 28, 20, 320, 24, "Bold", colors.ink, createdIds);
  text(note, "已按业务模块分组排布：频道入口、商品浏览、交易支付、订单、个人中心资产、账号消息、履约售后、客服发票、帮助异常。", 360, 24, 1500, 16, "Regular", colors.muted, createdIds);

  const screenGapX = 60;
  const groupHeaderH = 74;
  const groupTopGap = 34;
  const groupBottomGap = 96;
  let cursorY = startY + 140;
  const generatedScreens = [];

  const groups = [
    {
      title: "01 频道入口",
      subtitle: "首页、分类、店铺、品牌、秒杀、新品等流量入口。",
      builders: [buildHome, buildCategoryChannel, buildStoreHome, buildStoreProducts, buildBrandZone, buildFlashSale, buildNewArrivals]
    },
    {
      title: "02 商品浏览",
      subtitle: "从列表到详情、评价、对比、预售和组合套餐。",
      builders: [buildProductList, buildProductDetail, buildProductReviews, buildProductCompare, buildPresaleProduct, buildBundleDeal]
    },
    {
      title: "03 购物交易",
      subtitle: "购物车、登录、确认订单、门店自提、支付成功和支付失败。",
      builders: [buildCart, buildCartEmpty, buildAuth, buildCheckout, buildPickupStore, buildPaymentResult, buildPaymentFailed]
    },
    {
      title: "04 订单中心",
      subtitle: "订单列表、空状态、取消、退款和订单详情。",
      builders: [buildOrderList, buildOrderEmpty, buildOrderCancel, buildRefundResult, buildOrderDetail]
    },
    {
      title: "05 个人中心与资产",
      subtitle: "个人中心为入口；资料、地址、优惠券、收藏、足迹、评价和积分为资产/资料页，空状态和成功页为对应页面状态。",
      builders: [buildAccount, buildProfile, buildAddressManager, buildAddressEmpty, buildCouponCenter, buildFavorites, buildFavoritesEmpty, buildBrowsingHistory, buildReview, buildReviewSuccess, buildMemberPoints]
    },
    {
      title: "06 账号与消息",
      subtitle: "账号安全、隐私设置、消息中心为入口；实名、支付密码、手机绑定、重置密码、通知偏好由父页面操作进入。",
      builders: [buildAccountSecurity, buildRealNameVerification, buildPayPassword, buildPrivacySettings, buildBindPhone, buildResetPassword, buildMessageCenter, buildNotificationPreferences]
    },
    {
      title: "07 履约与售后",
      subtitle: "物流、售后列表、售后申请、售后详情和退货物流。",
      builders: [buildLogisticsTracking, buildAfterSaleList, buildAfterSale, buildAfterSaleDetail, buildReturnLogistics]
    },
    {
      title: "08 客服与发票",
      subtitle: "客服工单、工单详情、发票管理、发票详情和注销账号。",
      builders: [buildSupportTickets, buildTicketDetail, buildInvoiceManager, buildInvoiceDetail, buildAccountClosure]
    },
    {
      title: "09 帮助与异常",
      subtitle: "帮助中心、到货提醒、搜索无结果和 404 页面。",
      builders: [buildHelpCenter, buildArrivalReminder, buildSearchEmpty, buildNotFound]
    }
  ];

  groups.forEach((group) => {
    groupHeader(page, group.title, group.subtitle, 40, cursorY, createdIds);
    const firstRowY = cursorY + groupHeaderH + groupTopGap;
    group.builders.forEach((builder, index) => {
      const x = 40 + index * (1440 + screenGapX);
      generatedScreens.push(builder(page, x, firstRowY, createdIds));
    });
    cursorY = firstRowY + 1024 + groupBottomGap;
  });

  figma.viewport.scrollAndZoomIntoView(generatedScreens);
  figma.notify("PC Web 完整页面已添加到 02 前台三端原型");
  figma.closePlugin("Created " + createdIds.length + " nodes on " + page.name + ".");
}

run().catch((error) => {
  figma.closePlugin("生成失败：" + (error && error.message ? error.message : String(error)));
});
