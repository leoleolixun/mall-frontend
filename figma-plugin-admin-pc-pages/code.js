const TARGET_PAGE_NAME = "01 后台管理端原型";
const FONT_FAMILY = "Inter";
const SCREEN_W = 1440;
const SCREEN_H = 980;

const colors = {
  white: "#FFFFFF",
  bg: "#F6F7FB",
  soft: "#F9FAFB",
  line: "#E4E7EC",
  ink: "#172033",
  muted: "#667085",
  brand: "#E5484D",
  warm: "#FFF1F0",
  green: "#12B76A",
  blue: "#2E90FA",
  orange: "#F79009",
  purple: "#7A5AF8",
  image: "#FBE5E6",
  sidebar: "#111827",
  sidebarActive: "#243145",
  sidebarHover: "#182233",
  sidebarChildActive: "#3A2631",
  sidebarDisabled: "#475467",
  sidebarMuted: "#9CA3AF"
};

const modules = [
  "工作台",
  "商品中心",
  "订单履约",
  "用户会员",
  "营销运营",
  "财务结算",
  "商户管理",
  "客服内容",
  "系统设置"
];

const menuChildren = {
  工作台: ["工作台总览"],
  商品中心: ["商品列表", "分类管理", "品牌管理", "库存预警", "商品审核"],
  订单履约: ["订单列表", "发货管理", "物流跟踪", "售后列表"],
  用户会员: ["用户列表", "会员等级", "积分记录"],
  营销运营: ["优惠券管理", "促销活动", "首页装修", "推荐位管理"],
  财务结算: ["支付流水", "退款流水", "商户结算", "对账单"],
  商户管理: ["商户信息", "门店列表", "员工管理", "角色权限", "权限矩阵"],
  客服内容: ["客服工单", "发票管理", "消息通知", "帮助文章"],
  系统设置: ["系统配置", "操作日志", "数据导出"]
};

const contextualMenuParent = {
  登录: "工作台总览",
  商品编辑: "商品列表",
  订单详情: "订单列表",
  售后详情: "售后列表",
  用户详情: "用户列表",
  工单详情: "客服工单"
};

const pageDefs = [
  { name: "登录", module: "工作台", template: "login" },
  { name: "工作台总览", module: "工作台", template: "dashboard", title: "工作台总览", metrics: [["今日 GMV", "¥126,480", "+12.8%"], ["待发货订单", "238", "-4.1%"], ["新增用户", "1,286", "+8.6%"], ["售后处理中", "42", "+2.4%"]], rows: ["待处理发货 238 单", "退款审核 17 单", "库存预警 29 个 SKU", "客服待回复 12 条"] },

  { name: "商品列表", module: "商品中心", template: "list", title: "商品列表", filters: ["商品名称", "类目", "上下架", "库存状态"], actions: ["新增商品", "批量上架"], columns: ["商品", "类目", "价格", "库存", "状态", "操作"], rows: [["蓝牙耳机 Pro", "数码家电", "¥299", "1,280", "在售", "编辑"], ["氨基酸洁面乳", "美妆个护", "¥128", "328", "在售", "编辑"], ["儿童保温杯", "母婴用品", "¥89", "18", "预警", "补货"]] },
  { name: "商品编辑", module: "商品中心", template: "form", title: "商品编辑", fields: ["商品名称", "商品类目", "商品品牌", "销售价格", "划线价格", "商品卖点", "规格名称", "SKU 库存", "商品详情"], aside: ["商品主图", "详情图", "上架设置", "运费模板"] },
  { name: "分类管理", module: "商品中心", template: "list", title: "分类管理", filters: ["分类名称", "层级", "状态"], actions: ["新增分类"], columns: ["分类名称", "层级", "商品数", "排序", "状态", "操作"], rows: [["数码家电", "一级", "286", "1", "启用", "编辑"], ["美妆个护", "一级", "198", "2", "启用", "编辑"], ["蓝牙耳机", "二级", "64", "12", "启用", "编辑"]] },
  { name: "品牌管理", module: "商品中心", template: "list", title: "品牌管理", filters: ["品牌名称", "类目", "状态"], actions: ["新增品牌"], columns: ["品牌", "关联类目", "商品数", "推荐", "状态", "操作"], rows: [["SoundMax", "数码家电", "42", "是", "启用", "编辑"], ["GlowLab", "美妆个护", "36", "否", "启用", "编辑"], ["BabyCare", "母婴用品", "28", "是", "启用", "编辑"]] },
  { name: "库存预警", module: "商品中心", template: "list", title: "库存预警", filters: ["SKU 编码", "仓库", "预警级别"], actions: ["导出", "批量补货"], columns: ["SKU", "商品", "可售库存", "锁定库存", "预警线", "操作"], rows: [["SKU-10023", "儿童保温杯", "18", "6", "30", "补货"], ["SKU-10058", "快充套装", "22", "4", "50", "补货"], ["SKU-10211", "机械键盘", "9", "2", "20", "补货"]] },
  { name: "商品审核", module: "商品中心", template: "list", title: "商品审核", filters: ["提交商户", "审核状态", "提交时间"], actions: ["批量通过"], columns: ["商品", "商户", "提交时间", "风险项", "状态", "操作"], rows: [["智能音箱 Max", "默认商户", "07-05 10:20", "无", "待审", "审核"], ["夏季防晒霜", "默认商户", "07-05 09:12", "敏感词", "待审", "审核"], ["儿童餐具套装", "默认商户", "07-04 18:08", "图片待核", "待审", "审核"]] },

  { name: "订单列表", module: "订单履约", template: "list", title: "订单列表", filters: ["订单号", "买家", "订单状态", "下单时间"], actions: ["导出订单", "批量发货"], columns: ["订单号", "买家", "金额", "状态", "下单时间", "操作"], rows: [["202607040001", "李先生", "¥555", "待发货", "07-04 10:12", "详情"], ["202607030012", "王女士", "¥299", "待支付", "07-03 18:40", "详情"], ["202607020030", "张先生", "¥128", "已完成", "07-02 09:16", "详情"]] },
  { name: "订单详情", module: "订单履约", template: "detail", title: "订单详情", summary: [["订单状态", "待发货"], ["订单金额", "¥555"], ["买家", "李先生"], ["收货地址", "上海市浦东新区 XX 路 88 号"]], steps: ["买家下单", "买家支付", "商家发货", "确认收货"], tableTitle: "商品明细" },
  { name: "发货管理", module: "订单履约", template: "form", title: "发货管理", fields: ["订单号", "收货人", "物流公司", "物流单号", "发货仓库", "包裹重量", "发货备注"], aside: ["待发货商品", "地址校验", "打印面单", "发货记录"] },
  { name: "物流跟踪", module: "订单履约", template: "detail", title: "物流跟踪", summary: [["物流公司", "顺丰速运"], ["物流单号", "SF1234567890"], ["当前状态", "运输中"], ["预计送达", "2026-07-06 18:00"]], steps: ["仓库出库", "快递揽收", "到达集散中心", "派送中"], tableTitle: "轨迹明细" },
  { name: "售后列表", module: "订单履约", template: "list", title: "售后列表", filters: ["服务单号", "服务类型", "处理状态"], actions: ["导出售后"], columns: ["服务单号", "买家", "类型", "金额", "状态", "操作"], rows: [["AS202607040001", "李先生", "退货退款", "¥299", "待寄回", "处理"], ["AS202607020018", "王女士", "仅退款", "¥128", "审核中", "处理"], ["AS202606280033", "张先生", "换货", "¥89", "已完成", "查看"]] },
  { name: "售后详情", module: "订单履约", template: "detail", title: "售后详情", summary: [["服务单号", "AS202607040001"], ["服务类型", "退货退款"], ["退款金额", "¥299"], ["处理状态", "待买家寄回"]], steps: ["提交申请", "商家审核", "买家寄回", "退款完成"], tableTitle: "协商记录" },

  { name: "用户列表", module: "用户会员", template: "list", title: "用户列表", filters: ["手机号", "会员等级", "注册时间"], actions: ["导出用户"], columns: ["用户", "手机号", "会员等级", "订单数", "消费金额", "操作"], rows: [["李先生", "138****8888", "普通会员", "8", "¥2,980", "详情"], ["王女士", "139****6666", "银卡会员", "16", "¥6,420", "详情"], ["张先生", "137****9999", "普通会员", "3", "¥588", "详情"]] },
  { name: "用户详情", module: "用户会员", template: "detail", title: "用户详情", summary: [["用户昵称", "李先生"], ["手机号", "138****8888"], ["会员等级", "普通会员"], ["累计消费", "¥2,980"]], steps: ["注册账号", "首次下单", "绑定手机号", "最近登录"], tableTitle: "最近订单" },
  { name: "会员等级", module: "用户会员", template: "list", title: "会员等级", filters: ["等级名称", "状态"], actions: ["新增等级"], columns: ["等级", "成长值门槛", "折扣", "包邮权益", "状态", "操作"], rows: [["普通会员", "0", "无", "否", "启用", "编辑"], ["银卡会员", "1000", "9.8 折", "是", "启用", "编辑"], ["金卡会员", "5000", "9.5 折", "是", "启用", "编辑"]] },
  { name: "积分记录", module: "用户会员", template: "list", title: "积分记录", filters: ["用户", "积分类型", "发生时间"], actions: ["导出"], columns: ["用户", "变动", "来源", "余额", "时间", "操作"], rows: [["李先生", "+20", "评价晒单", "1,280", "07-05 09:20", "查看"], ["王女士", "-100", "兑换优惠券", "860", "07-04 16:30", "查看"], ["张先生", "+50", "下单奖励", "230", "07-03 11:08", "查看"]] },

  { name: "优惠券管理", module: "营销运营", template: "list", title: "优惠券管理", filters: ["券名称", "券状态", "有效期"], actions: ["新增优惠券"], columns: ["券名称", "门槛", "库存", "领取数", "状态", "操作"], rows: [["满 299 减 30", "满 299", "8,000", "1,286", "投放中", "编辑"], ["新人专享券", "无门槛", "2,000", "876", "投放中", "编辑"], ["美妆品类券", "满 99", "1,500", "642", "待开始", "编辑"]] },
  { name: "促销活动", module: "营销运营", template: "list", title: "促销活动", filters: ["活动名称", "活动类型", "活动状态"], actions: ["新增活动"], columns: ["活动", "类型", "商品数", "开始时间", "状态", "操作"], rows: [["夏季焕新", "满减", "86", "07-10", "待开始", "配置"], ["新品首发", "限时折扣", "24", "07-06", "进行中", "配置"], ["会员日", "会员价", "128", "07-18", "待开始", "配置"]] },
  { name: "首页装修", module: "营销运营", template: "board", title: "首页装修", cards: ["轮播 Banner", "快捷入口", "限时专区", "推荐商品", "品牌专区", "底部导航"] },
  { name: "推荐位管理", module: "营销运营", template: "list", title: "推荐位管理", filters: ["推荐位", "终端", "状态"], actions: ["新增推荐位"], columns: ["位置", "终端", "内容数", "排序", "状态", "操作"], rows: [["首页猜你喜欢", "H5/小程序", "24", "1", "启用", "配置"], ["PC 首页热卖", "PC Web", "16", "2", "启用", "配置"], ["分类页推荐", "全端", "32", "3", "启用", "配置"]] },

  { name: "支付流水", module: "财务结算", template: "list", title: "支付流水", filters: ["交易单号", "支付渠道", "支付时间"], actions: ["导出流水"], columns: ["交易单号", "订单号", "渠道", "金额", "状态", "支付时间"], rows: [["PAY202607040001", "202607040001", "微信支付", "¥555", "成功", "07-04 10:16"], ["PAY202607030012", "202607030012", "支付宝", "¥299", "待支付", "07-03 18:40"], ["PAY202607020030", "202607020030", "微信支付", "¥128", "成功", "07-02 09:20"]] },
  { name: "退款流水", module: "财务结算", template: "list", title: "退款流水", filters: ["退款单号", "退款状态", "申请时间"], actions: ["导出退款"], columns: ["退款单号", "服务单号", "渠道", "金额", "状态", "操作"], rows: [["RF202607040001", "AS202607040001", "微信原路退", "¥299", "待退款", "处理"], ["RF202607020018", "AS202607020018", "支付宝原路退", "¥128", "成功", "查看"], ["RF202606280033", "AS202606280033", "微信原路退", "¥89", "成功", "查看"]] },
  { name: "商户结算", module: "财务结算", template: "list", title: "商户结算", filters: ["结算周期", "商户", "结算状态"], actions: ["生成结算单"], columns: ["结算单", "商户", "销售额", "退款", "应结算", "状态"], rows: [["ST20260701", "默认商户", "¥86,420", "¥2,180", "¥84,240", "待打款"], ["ST20260630", "默认商户", "¥79,120", "¥1,680", "¥77,440", "已打款"], ["ST20260629", "默认商户", "¥82,690", "¥2,010", "¥80,680", "已打款"]] },
  { name: "对账单", module: "财务结算", template: "detail", title: "对账单", summary: [["对账日期", "2026-07-04"], ["订单收入", "¥126,480"], ["退款金额", "¥3,280"], ["差异金额", "¥0"]], steps: ["拉取渠道流水", "匹配订单", "匹配退款", "生成差异报告"], tableTitle: "差异明细" },

  { name: "商户信息", module: "商户管理", template: "form", title: "商户信息", fields: ["商户名称", "主体类型", "主商户编码", "联系人", "联系电话", "经营类目", "营业执照", "结算账户", "客服电话"], aside: ["门店列表", "资质审核", "经营状态", "合同信息"] },
  { name: "门店列表", module: "商户管理", template: "list", title: "门店列表", filters: ["门店名称", "负责人", "所在城市", "经营状态"], actions: ["新增门店", "批量停用"], columns: ["门店", "负责人", "城市", "经营状态", "更新时间", "操作"], rows: [["上海旗舰店", "陈运营", "上海", "营业中", "07-05 09:10", "编辑 / 停用"], ["杭州湖滨店", "赵店长", "杭州", "营业中", "07-04 18:22", "编辑 / 停用"], ["南京体验店", "刘店长", "南京", "装修中", "07-03 11:08", "编辑 / 删除"]] },
  { name: "员工管理", module: "商户管理", template: "list", title: "员工管理", filters: ["员工姓名", "角色", "状态"], actions: ["新增员工"], columns: ["员工", "手机号", "角色", "最近登录", "状态", "操作"], rows: [["陈运营", "136****1111", "店铺管理员", "07-05 09:10", "启用", "编辑"], ["赵客服", "135****2222", "客服专员", "07-05 08:42", "启用", "编辑"], ["刘仓管", "134****3333", "仓库发货", "07-04 18:00", "停用", "编辑"]] },
  { name: "角色权限", module: "商户管理", template: "list", title: "角色权限", filters: ["角色名称", "状态"], actions: ["新增角色"], columns: ["角色", "成员数", "权限范围", "创建时间", "状态", "操作"], rows: [["店铺管理员", "3", "全部模块", "06-28", "启用", "配置"], ["客服专员", "6", "订单/售后/客服", "06-29", "启用", "配置"], ["仓库发货", "4", "订单/物流", "07-01", "启用", "配置"]] },
  { name: "权限矩阵", module: "商户管理", template: "board", title: "权限矩阵", cards: ["商品查看/编辑", "订单查看/发货", "售后审核/退款", "营销配置", "财务导出", "系统设置"] },

  { name: "客服工单", module: "客服内容", template: "list", title: "客服工单", filters: ["工单编号", "问题类型", "处理状态"], actions: ["分配客服"], columns: ["工单", "用户", "类型", "优先级", "状态", "操作"], rows: [["TK202607050001", "李先生", "物流咨询", "高", "待回复", "处理"], ["TK202607030006", "王女士", "退款咨询", "中", "处理中", "处理"], ["TK202607010018", "张先生", "发票问题", "低", "已解决", "查看"]] },
  { name: "工单详情", module: "客服内容", template: "detail", title: "工单详情", summary: [["工单编号", "TK202607050001"], ["用户", "李先生"], ["问题类型", "物流咨询"], ["当前状态", "待回复"]], steps: ["用户提交", "系统分配", "客服回复", "用户评价"], tableTitle: "沟通记录" },
  { name: "发票管理", module: "客服内容", template: "list", title: "发票管理", filters: ["发票抬头", "开票状态", "申请时间"], actions: ["批量开票"], columns: ["申请单", "抬头", "订单金额", "类型", "状态", "操作"], rows: [["IV202607040001", "上海某某公司", "¥555", "普票", "待开票", "开票"], ["IV202607020018", "王女士", "¥299", "普票", "已开票", "下载"], ["IV202606280033", "张先生", "¥128", "普票", "已红冲", "查看"]] },
  { name: "消息通知", module: "客服内容", template: "list", title: "消息通知", filters: ["通知类型", "发送状态", "发送时间"], actions: ["新建通知"], columns: ["标题", "类型", "触达用户", "渠道", "状态", "操作"], rows: [["订单发货提醒", "交易通知", "1,260", "站内/短信", "发送中", "查看"], ["优惠券过期提醒", "营销通知", "8,420", "站内", "待发送", "编辑"], ["售后处理提醒", "服务通知", "342", "站内/短信", "已发送", "查看"]] },
  { name: "帮助文章", module: "客服内容", template: "list", title: "帮助文章", filters: ["文章标题", "分类", "状态"], actions: ["新增文章"], columns: ["标题", "分类", "阅读量", "排序", "状态", "操作"], rows: [["如何修改地址", "订单问题", "2,860", "1", "发布", "编辑"], ["如何申请退款", "售后问题", "3,420", "2", "发布", "编辑"], ["发票如何下载", "发票问题", "1,280", "3", "草稿", "编辑"]] },

  { name: "系统配置", module: "系统设置", template: "form", title: "系统配置", fields: ["商城名称", "客服电话", "默认运费", "订单超时取消", "售后有效期", "积分兑换比例", "隐私协议版本"], aside: ["基础配置", "交易配置", "售后配置", "安全配置"] },
  { name: "操作日志", module: "系统设置", template: "list", title: "操作日志", filters: ["操作人", "操作模块", "操作时间"], actions: ["导出日志"], columns: ["操作人", "模块", "动作", "IP", "时间", "结果"], rows: [["陈运营", "商品", "编辑商品", "10.0.0.12", "07-05 09:20", "成功"], ["赵客服", "售后", "审核退款", "10.0.0.18", "07-05 09:12", "成功"], ["系统", "订单", "自动取消", "127.0.0.1", "07-05 09:00", "成功"]] },
  { name: "数据导出", module: "系统设置", template: "list", title: "数据导出", filters: ["任务名称", "任务状态", "创建时间"], actions: ["新建导出"], columns: ["任务", "数据范围", "创建人", "文件大小", "状态", "操作"], rows: [["订单明细 07-04", "订单", "陈运营", "12.8 MB", "已完成", "下载"], ["用户列表", "用户", "系统", "8.2 MB", "生成中", "刷新"], ["支付流水", "财务", "财务专员", "4.6 MB", "已完成", "下载"]] }
];

const generatedPageNames = pageDefs.map((def) => "Admin PC / " + def.name);
const generatedNames = ["Admin PC expansion note"].concat(generatedPageNames);

function rgb(hex) {
  const value = parseInt(hex.slice(1), 16);
  return { r: ((value >> 16) & 255) / 255, g: ((value >> 8) & 255) / 255, b: (value & 255) / 255 };
}

function paint(hex) {
  return { type: "SOLID", color: rgb(hex) };
}

async function loadFonts() {
  await Promise.all(["Regular", "Medium", "Semi Bold", "Bold"].map((style) => figma.loadFontAsync({ family: FONT_FAMILY, style })));
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
  node.name = "Text / " + String(value).slice(0, 28);
  node.fontName = { family: FONT_FAMILY, style: style || "Regular" };
  node.characters = String(value);
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
  const node = frame(parent, "Button / " + label, x, y, width, 36, isPrimary ? colors.brand : colors.white, 6, ids);
  if (!isPrimary) {
    node.strokes = [paint(colors.line)];
    node.strokeWeight = 1;
  }
  const labelNode = text(node, label, 12, 9, width - 24, 13, "Semi Bold", isPrimary ? colors.white : colors.ink, ids);
  labelNode.textAlignHorizontal = "CENTER";
  return node;
}

function chip(parent, label, x, y, width, tone, ids) {
  const fill = tone === "green" ? "#ECFDF3" : tone === "blue" ? "#EFF8FF" : tone === "orange" ? "#FFFAEB" : colors.warm;
  const color = tone === "green" ? colors.green : tone === "blue" ? colors.blue : tone === "orange" ? colors.orange : colors.brand;
  const node = frame(parent, "Chip / " + label, x, y, width, 28, fill, 14, ids);
  const labelNode = text(node, label, 8, 6, width - 16, 12, "Medium", color, ids);
  labelNode.textAlignHorizontal = "CENTER";
  return node;
}

function input(parent, placeholder, x, y, width, ids) {
  const node = box(parent, "Input / " + placeholder, x, y, width, 38, colors.white, 6, ids);
  text(node, placeholder, 12, 10, width - 24, 13, "Regular", colors.muted, ids);
  return node;
}

function iconContainer(parent, name, x, y, ids) {
  const node = figma.createFrame();
  node.name = "Sidebar icon / " + name;
  node.x = x;
  node.y = y;
  node.resize(18, 18);
  node.fills = [];
  node.strokes = [];
  node.clipsContent = false;
  return append(parent, node, ids);
}

function iconFill(parent, name, x, y, width, height, fill, radius, ids) {
  return frame(parent, name, x, y, width, height, fill, radius === undefined ? 1 : radius, ids);
}

function iconOutline(parent, name, x, y, width, height, stroke, radius, ids) {
  const node = figma.createFrame();
  node.name = name;
  node.x = x;
  node.y = y;
  node.resize(width, height);
  node.fills = [];
  node.strokes = [paint(stroke)];
  node.strokeWeight = 1.4;
  node.cornerRadius = radius === undefined ? 3 : radius;
  node.clipsContent = false;
  return append(parent, node, ids);
}

function iconCircle(parent, name, x, y, size, stroke, ids, filled) {
  const node = figma.createEllipse();
  node.name = name;
  node.x = x;
  node.y = y;
  node.resize(size, size);
  node.fills = filled ? [paint(stroke)] : [];
  node.strokes = filled ? [] : [paint(stroke)];
  node.strokeWeight = 1.4;
  return append(parent, node, ids);
}

function drawSidebarIcon(parent, moduleName, x, y, active, ids) {
  const color = active ? colors.brand : colors.sidebarMuted;
  const icon = iconContainer(parent, moduleName, x, y, ids);
  if (moduleName === "工作台") {
    iconOutline(icon, "Icon dashboard panel", 2, 3, 14, 12, color, 3, ids);
    iconFill(icon, "Icon dashboard bar 1", 5, 10, 2, 3, color, 1, ids);
    iconFill(icon, "Icon dashboard bar 2", 8, 7, 2, 6, color, 1, ids);
    iconFill(icon, "Icon dashboard bar 3", 11, 5, 2, 8, color, 1, ids);
  } else if (moduleName === "商品中心") {
    iconOutline(icon, "Icon package body", 3, 4, 12, 11, color, 2, ids);
    iconFill(icon, "Icon package lid", 5, 3, 8, 2, color, 1, ids);
    iconFill(icon, "Icon package seam", 8, 5, 2, 5, color, 1, ids);
  } else if (moduleName === "订单履约") {
    iconOutline(icon, "Icon order sheet", 4, 2, 10, 14, color, 2, ids);
    iconFill(icon, "Icon order line 1", 7, 6, 5, 1.5, color, 1, ids);
    iconFill(icon, "Icon order line 2", 7, 9, 5, 1.5, color, 1, ids);
    iconFill(icon, "Icon order line 3", 7, 12, 4, 1.5, color, 1, ids);
  } else if (moduleName === "用户会员") {
    iconCircle(icon, "Icon user head primary", 3, 3, 6, color, ids, false);
    iconCircle(icon, "Icon user head secondary", 10, 5, 5, color, ids, false);
    iconOutline(icon, "Icon user body primary", 2, 11, 8, 4, color, 3, ids);
    iconOutline(icon, "Icon user body secondary", 10, 12, 6, 3, color, 3, ids);
  } else if (moduleName === "营销运营") {
    iconOutline(icon, "Icon tag body", 3, 5, 12, 8, color, 2, ids);
    iconCircle(icon, "Icon tag dot", 5, 7, 3, color, ids, true);
    iconFill(icon, "Icon tag tail", 12, 8, 3, 2, color, 1, ids);
  } else if (moduleName === "财务结算") {
    iconOutline(icon, "Icon wallet body", 2, 5, 14, 10, color, 3, ids);
    iconOutline(icon, "Icon wallet pocket", 9, 8, 6, 4, color, 2, ids);
    iconCircle(icon, "Icon wallet dot", 11, 9, 2, color, ids, true);
  } else if (moduleName === "商户管理") {
    iconOutline(icon, "Icon shield body", 4, 2, 10, 13, color, 5, ids);
    iconFill(icon, "Icon shield crest", 8, 5, 2, 5, color, 1, ids);
    iconFill(icon, "Icon shield base", 6, 11, 6, 1.5, color, 1, ids);
  } else if (moduleName === "客服内容") {
    iconCircle(icon, "Icon support headband", 3, 3, 12, color, ids, false);
    iconFill(icon, "Icon support left pad", 2, 8, 3, 5, color, 2, ids);
    iconFill(icon, "Icon support right pad", 13, 8, 3, 5, color, 2, ids);
    iconFill(icon, "Icon support mic", 9, 13, 5, 1.5, color, 1, ids);
  } else {
    iconCircle(icon, "Icon settings core", 6, 6, 6, color, ids, false);
    iconFill(icon, "Icon settings top", 8, 1, 2, 4, color, 1, ids);
    iconFill(icon, "Icon settings bottom", 8, 13, 2, 4, color, 1, ids);
    iconFill(icon, "Icon settings left", 1, 8, 4, 2, color, 1, ids);
    iconFill(icon, "Icon settings right", 13, 8, 4, 2, color, 1, ids);
  }
  return icon;
}

async function getTargetPage() {
  if (typeof figma.loadAllPagesAsync === "function") {
    await figma.loadAllPagesAsync();
  }
  let targetPage = figma.root.children.find((page) => page.name === TARGET_PAGE_NAME);
  if (!targetPage && typeof figma.createPage === "function") {
    targetPage = figma.createPage();
    targetPage.name = TARGET_PAGE_NAME;
  }
  targetPage = targetPage || figma.currentPage;
  if (typeof figma.setCurrentPageAsync === "function") {
    await figma.setCurrentPageAsync(targetPage);
  } else {
    figma.currentPage = targetPage;
  }
  return targetPage;
}

function cleanupGenerated(page) {
  page.findAll((node) => generatedNames.indexOf(node.name) !== -1 || node.name.indexOf("Admin PC group / ") === 0).forEach((node) => node.remove());
}

function getStartY(page) {
  let maxY = 0;
  page.children.forEach((child) => {
    maxY = Math.max(maxY, child.y + child.height);
  });
  return Math.max(120, Math.ceil(maxY + 120));
}

function groupHeader(page, title, subtitle, x, y, ids) {
  const header = box(page, "Admin PC group / " + title, x, y, 2940, 74, colors.warm, 12, ids);
  text(header, title, 24, 18, 260, 26, "Bold", colors.brand, ids);
  text(header, subtitle, 320, 24, 1200, 16, "Regular", colors.muted, ids);
  return header;
}

function adminShell(page, def, x, y, ids) {
  const screen = frame(page, "Admin PC / " + def.name, x, y, SCREEN_W, SCREEN_H, colors.bg, 12, ids);
  screen.strokes = [paint(colors.line)];
  screen.strokeWeight = 1;

  const sidebar = frame(screen, "Admin sidebar", 0, 0, 220, SCREEN_H, colors.sidebar, 0, ids);
  text(sidebar, "Mall Admin", 24, 24, 150, 24, "Bold", colors.white, ids);
  text(sidebar, "商城管理后台", 24, 58, 120, 13, "Regular", colors.sidebarMuted, ids);
  const activeMenuName = contextualMenuParent[def.name] || def.name;
  let navY = 100;
  modules.forEach((moduleName) => {
    const active = moduleName === def.module;
    const children = menuChildren[moduleName] || [];
    const item = frame(sidebar, "Sidebar item / " + moduleName, 14, navY, 192, 38, active ? colors.sidebarActive : colors.sidebar, 8, ids);
    drawSidebarIcon(item, moduleName, 14, 10, active, ids);
    text(item, moduleName, 44, 10, 116, 13, active ? "Semi Bold" : "Regular", active ? colors.white : colors.sidebarMuted, ids);
    text(item, active ? "▾" : "›", 174, 9, 12, 13, "Semi Bold", active ? colors.white : colors.sidebarMuted, ids);
    navY += 42;
    if (active) {
      const hoverChild = children.find((child) => child !== activeMenuName);
      children.forEach((child) => {
        const childActive = child === activeMenuName;
        const childHover = child === hoverChild && !childActive;
        const childItem = frame(sidebar, "Sidebar subitem / " + moduleName + " / " + child, 46, navY, 160, 30, childActive ? colors.sidebarChildActive : childHover ? colors.sidebarHover : colors.sidebar, 6, ids);
        frame(childItem, "Subitem dot / " + child, 10, 12, 6, 6, childActive ? colors.brand : colors.sidebarDisabled, 3, ids);
        text(childItem, child, 26, 7, 104, 12, childActive || childHover ? "Semi Bold" : "Regular", childActive || childHover ? colors.white : colors.sidebarMuted, ids);
        navY += 34;
      });
    }
  });
  const sideFooter = frame(sidebar, "Merchant card", 16, 876, 188, 72, "#1F2937", 10, ids);
  text(sideFooter, "默认商户", 16, 14, 110, 14, "Semi Bold", colors.white, ids);
  text(sideFooter, "旗舰店 · 已认证", 16, 40, 120, 12, "Regular", colors.sidebarMuted, ids);

  const topbar = frame(screen, "Admin topbar", 220, 0, 1220, 64, colors.white, 0, ids);
  topbar.strokes = [paint(colors.line)];
  topbar.strokeWeight = 1;
  text(topbar, def.module + " / " + def.name, 24, 22, 300, 14, "Medium", colors.muted, ids);
  input(topbar, "搜索订单、商品、用户", 720, 14, 260, ids);
  frame(topbar, "Notification bell", 1000, 18, 28, 28, colors.soft, 14, ids);
  frame(topbar, "Admin avatar", 1052, 14, 36, 36, colors.warm, 18, ids);
  text(topbar, "管理员", 1098, 22, 70, 13, "Semi Bold", colors.ink, ids);

  text(screen, def.title || def.name, 244, 94, 260, 28, "Bold", colors.ink, ids);
  text(screen, "用于管理商城 " + def.module + " 的核心数据、流程与风险事项。", 244, 132, 480, 14, "Regular", colors.muted, ids);
  return screen;
}

function metricCard(parent, title, value, delta, x, y, ids, tone) {
  const card = box(parent, "Metric / " + title, x, y, 260, 112, colors.white, 10, ids);
  frame(card, "Metric mark", 18, 18, 36, 36, tone || colors.warm, 10, ids);
  text(card, title, 70, 18, 120, 13, "Regular", colors.muted, ids);
  text(card, value, 70, 48, 120, 26, "Bold", colors.ink, ids);
  text(card, delta, 190, 54, 56, 13, "Semi Bold", delta.indexOf("-") === 0 ? colors.orange : colors.green, ids);
  return card;
}

function renderToolbar(parent, def, ids) {
  const toolbar = box(parent, "Filter toolbar", 244, 168, 1148, 76, colors.white, 10, ids);
  (def.filters || ["关键词", "状态", "时间"]).forEach((filter, index) => input(toolbar, filter, 20 + index * 188, 19, 168, ids));
  button(toolbar, "查询", 810, 20, 82, true, ids);
  button(toolbar, "重置", 904, 20, 82, false, ids);
  (def.actions || ["新增"]).forEach((action, index) => button(toolbar, action, 1004 + index * 112, 20, 100, index === 0, ids));
}

function renderTable(parent, def, x, y, width, height, ids) {
  const table = box(parent, "Table / " + (def.tableTitle || def.title), x, y, width, height, colors.white, 10, ids);
  text(table, def.tableTitle || def.title, 20, 18, 180, 18, "Bold", colors.ink, ids);
  const columns = def.columns || ["名称", "状态", "金额", "时间", "处理人", "操作"];
  const rows = def.rows || [["订单创建", "成功", "¥555", "07-05 09:20", "系统", "查看"], ["库存扣减", "成功", "2 件", "07-05 09:21", "系统", "查看"], ["发货通知", "待处理", "-", "07-05 09:22", "运营", "处理"]];
  const colW = Math.floor((width - 40) / columns.length);
  const header = frame(table, "Table header", 20, 58, width - 40, 44, colors.soft, 6, ids);
  columns.forEach((col, index) => text(header, col, 12 + index * colW, 14, colW - 16, 13, "Semi Bold", colors.muted, ids));
  rows.forEach((row, rowIndex) => {
    const rowFrame = frame(table, "Table row / " + rowIndex, 20, 108 + rowIndex * 58, width - 40, 54, colors.white, 0, ids);
    rowFrame.strokes = [paint(colors.line)];
    rowFrame.strokeWeight = 1;
    row.forEach((value, colIndex) => {
      const fill = colIndex === columns.length - 1 ? colors.brand : colors.ink;
      text(rowFrame, value, 12 + colIndex * colW, 18, colW - 16, 13, colIndex === 0 ? "Semi Bold" : "Regular", fill, ids);
    });
  });
  text(table, "共 128 条 · 每页 20 条", 20, height - 36, 160, 13, "Regular", colors.muted, ids);
  button(table, "上一页", width - 182, height - 44, 72, false, ids);
  button(table, "下一页", width - 96, height - 44, 72, true, ids);
  return table;
}

function renderListPage(page, def, x, y, ids) {
  const screen = adminShell(page, def, x, y, ids);
  renderToolbar(screen, def, ids);
  renderTable(screen, def, 244, 268, 1148, 610, ids);
  return screen;
}

function renderDashboard(page, def, x, y, ids) {
  const screen = adminShell(page, def, x, y, ids);
  (def.metrics || []).forEach(([title, value, delta], index) => metricCard(screen, title, value, delta, 244 + index * 286, 172, ids, [colors.warm, "#EFF8FF", "#ECFDF3", "#F4F3FF"][index]));
  const chart = box(screen, "Sales chart", 244, 316, 730, 320, colors.white, 10, ids);
  text(chart, "近 30 天成交趋势", 20, 18, 180, 18, "Bold", colors.ink, ids);
  [180, 138, 164, 96, 122, 76, 104, 58, 82, 44].forEach((h, index) => {
    frame(chart, "Chart bar / " + index, 42 + index * 62, 250 - h, 34, h, index % 2 === 0 ? colors.brand : colors.orange, 6, ids);
  });
  const todo = box(screen, "Todo panel", 1000, 316, 392, 320, colors.white, 10, ids);
  text(todo, "待办事项", 20, 18, 120, 18, "Bold", colors.ink, ids);
  (def.rows || []).forEach((item, index) => {
    const row = frame(todo, "Todo / " + item, 20, 60 + index * 56, 352, 42, index === 0 ? colors.warm : colors.soft, 8, ids);
    text(row, item, 14, 13, 220, 13, "Medium", colors.ink, ids);
    text(row, "处理", 304, 13, 34, 13, "Semi Bold", colors.brand, ids);
  });
  renderTable(screen, { title: "实时订单", columns: ["订单", "用户", "金额", "状态", "时间"], rows: [["202607050010", "李先生", "¥299", "待发货", "09:42"], ["202607050009", "王女士", "¥128", "已支付", "09:36"], ["202607050008", "张先生", "¥89", "已支付", "09:20"]] }, 244, 662, 1148, 240, ids);
  return screen;
}

function renderFormPage(page, def, x, y, ids) {
  const screen = adminShell(page, def, x, y, ids);
  const form = box(screen, "Form panel / " + def.title, 244, 172, 760, 706, colors.white, 10, ids);
  text(form, "基础信息", 24, 22, 140, 20, "Bold", colors.ink, ids);
  (def.fields || []).forEach((field, index) => {
    const col = index % 2;
    const row = Math.floor(index / 2);
    text(form, field, 24 + col * 356, 76 + row * 82, 120, 13, "Semi Bold", colors.ink, ids);
    input(form, "请输入" + field, 24 + col * 356, 104 + row * 82, 320, ids);
  });
  button(form, "保存草稿", 502, 636, 104, false, ids);
  button(form, "提交保存", 622, 636, 104, true, ids);

  const aside = box(screen, "Aside panel / " + def.title, 1030, 172, 362, 706, colors.white, 10, ids);
  text(aside, "辅助配置", 20, 22, 120, 20, "Bold", colors.ink, ids);
  (def.aside || []).forEach((item, index) => {
    const card = frame(aside, "Aside item / " + item, 20, 70 + index * 96, 322, 72, index === 0 ? colors.warm : colors.soft, 8, ids);
    text(card, item, 16, 16, 140, 14, "Semi Bold", colors.ink, ids);
    text(card, "已配置，可进入查看或调整。", 16, 42, 190, 12, "Regular", colors.muted, ids);
    text(card, "配置", 270, 28, 34, 13, "Semi Bold", colors.brand, ids);
  });
  return screen;
}

function renderDetailPage(page, def, x, y, ids) {
  const screen = adminShell(page, def, x, y, ids);
  const summary = box(screen, "Detail summary", 244, 172, 1148, 150, colors.white, 10, ids);
  (def.summary || []).forEach(([label, value], index) => {
    text(summary, label, 24 + index * 276, 32, 100, 13, "Regular", colors.muted, ids);
    text(summary, value, 24 + index * 276, 66, 230, 18, "Bold", colors.ink, ids);
  });
  const flow = box(screen, "Process timeline", 244, 346, 1148, 148, colors.white, 10, ids);
  text(flow, "流程进度", 20, 18, 120, 18, "Bold", colors.ink, ids);
  (def.steps || []).forEach((step, index) => {
    frame(flow, "Step dot / " + step, 42 + index * 260, 78, 22, 22, index < 2 ? colors.brand : colors.line, 11, ids);
    text(flow, step, 24 + index * 260, 112, 100, 13, "Semi Bold", index < 2 ? colors.brand : colors.muted, ids);
    if (index < (def.steps || []).length - 1) {
      frame(flow, "Step line / " + index, 72 + index * 260, 88, 210, 2, index < 1 ? colors.brand : colors.line, 1, ids);
    }
  });
  renderTable(screen, { title: def.tableTitle || "明细", columns: ["时间", "操作人", "动作", "内容", "结果"], rows: [["07-05 09:20", "系统", "创建", "记录已创建", "成功"], ["07-05 09:28", "管理员", "审核", "信息核对通过", "成功"], ["07-05 10:02", "运营", "备注", "等待下一步处理", "成功"]] }, 244, 520, 1148, 358, ids);
  return screen;
}

function renderBoardPage(page, def, x, y, ids) {
  const screen = adminShell(page, def, x, y, ids);
  const canvas = box(screen, "Board canvas", 244, 172, 760, 706, colors.white, 10, ids);
  text(canvas, def.title + "画布", 24, 22, 180, 20, "Bold", colors.ink, ids);
  (def.cards || []).forEach((item, index) => {
    const card = box(canvas, "Board component / " + item, 24 + (index % 2) * 352, 76 + Math.floor(index / 2) * 160, 320, 124, index === 0 ? colors.warm : colors.soft, 10, ids);
    text(card, item, 18, 18, 160, 16, "Bold", colors.ink, ids);
    text(card, "拖拽排序，支持端口差异化配置。", 18, 50, 220, 13, "Regular", colors.muted, ids);
    button(card, "配置", 218, 70, 72, true, ids);
  });
  const config = box(screen, "Board config", 1030, 172, 362, 706, colors.white, 10, ids);
  text(config, "属性面板", 20, 22, 120, 20, "Bold", colors.ink, ids);
  input(config, "组件标题", 20, 78, 320, ids);
  input(config, "展示终端", 20, 132, 320, ids);
  input(config, "跳转链接", 20, 186, 320, ids);
  text(config, "展示状态", 20, 260, 80, 13, "Semi Bold", colors.ink, ids);
  chip(config, "启用", 20, 292, 64, "green", ids);
  chip(config, "隐藏", 96, 292, 64, "orange", ids);
  button(config, "保存配置", 220, 636, 104, true, ids);
  return screen;
}

function renderLogin(page, def, x, y, ids) {
  const screen = frame(page, "Admin PC / " + def.name, x, y, SCREEN_W, SCREEN_H, colors.bg, 12, ids);
  screen.strokes = [paint(colors.line)];
  screen.strokeWeight = 1;
  const hero = frame(screen, "Login hero", 0, 0, 760, SCREEN_H, colors.sidebar, 0, ids);
  text(hero, "Mall Admin", 84, 110, 260, 38, "Bold", colors.white, ids);
  text(hero, "商城后台管理系统", 86, 170, 220, 18, "Regular", colors.sidebarMuted, ids);
  frame(hero, "Dashboard preview", 86, 260, 540, 360, "#1F2937", 16, ids);
  text(hero, "商品、订单、用户、营销、财务一体化运营。", 86, 700, 360, 18, "Regular", colors.sidebarMuted, ids);
  const panel = box(screen, "Login panel", 900, 210, 380, 520, colors.white, 14, ids);
  text(panel, "登录后台", 36, 42, 160, 28, "Bold", colors.ink, ids);
  text(panel, "使用管理员账号进入商城管理端", 36, 84, 220, 14, "Regular", colors.muted, ids);
  text(panel, "账号", 36, 142, 60, 13, "Semi Bold", colors.ink, ids);
  input(panel, "请输入账号", 36, 170, 308, ids);
  text(panel, "密码", 36, 228, 60, 13, "Semi Bold", colors.ink, ids);
  input(panel, "请输入密码", 36, 256, 308, ids);
  text(panel, "验证码", 36, 314, 60, 13, "Semi Bold", colors.ink, ids);
  input(panel, "短信或图形验证码", 36, 342, 190, ids);
  frame(panel, "Captcha", 242, 342, 102, 38, colors.soft, 6, ids);
  button(panel, "登录", 36, 420, 308, true, ids);
  text(panel, "忘记密码 · 联系管理员", 110, 470, 160, 13, "Regular", colors.muted, ids);
  return screen;
}

function renderPage(page, def, x, y, ids) {
  if (def.template === "login") return renderLogin(page, def, x, y, ids);
  if (def.template === "dashboard") return renderDashboard(page, def, x, y, ids);
  if (def.template === "form") return renderFormPage(page, def, x, y, ids);
  if (def.template === "detail") return renderDetailPage(page, def, x, y, ids);
  if (def.template === "board") return renderBoardPage(page, def, x, y, ids);
  return renderListPage(page, def, x, y, ids);
}

async function run() {
  const createdIds = [];
  await loadFonts();
  const page = await getTargetPage();
  cleanupGenerated(page);

  const startY = getStartY(page);
  const note = box(page, "Admin PC expansion note", 40, startY, 2940, 84, colors.white, 8, createdIds);
  text(note, "后台管理端页面", 28, 20, 260, 24, "Bold", colors.ink, createdIds);
  text(note, "按业务模块分组生成 39 个后台 PC 页面：登录、工作台、商品、订单、用户、营销、财务、权限、客服内容、系统设置。", 330, 24, 980, 16, "Regular", colors.muted, createdIds);

  const groups = [
    { title: "01 登录与工作台", subtitle: "后台入口、经营数据、待办事项。", names: ["登录", "工作台总览"] },
    { title: "02 商品中心", subtitle: "商品、分类、品牌、库存和审核。", names: ["商品列表", "商品编辑", "分类管理", "品牌管理", "库存预警", "商品审核"] },
    { title: "03 订单履约", subtitle: "订单、发货、物流和售后处理。", names: ["订单列表", "订单详情", "发货管理", "物流跟踪", "售后列表", "售后详情"] },
    { title: "04 用户会员", subtitle: "用户、会员等级和积分资产。", names: ["用户列表", "用户详情", "会员等级", "积分记录"] },
    { title: "05 营销运营", subtitle: "优惠券、促销活动、首页装修和推荐位。", names: ["优惠券管理", "促销活动", "首页装修", "推荐位管理"] },
    { title: "06 财务结算", subtitle: "支付、退款、商户结算和对账。", names: ["支付流水", "退款流水", "商户结算", "对账单"] },
    { title: "07 商户管理", subtitle: "主商户资料、门店/子商户、员工、角色和权限矩阵。", names: ["商户信息", "门店列表", "员工管理", "角色权限", "权限矩阵"] },
    { title: "08 客服内容", subtitle: "客服工单、发票、消息通知和帮助文章。", names: ["客服工单", "工单详情", "发票管理", "消息通知", "帮助文章"] },
    { title: "09 系统设置", subtitle: "系统参数、操作日志和数据导出。", names: ["系统配置", "操作日志", "数据导出"] }
  ];

  const byName = new Map(pageDefs.map((def) => [def.name, def]));
  const screenGapX = 60;
  const headerH = 74;
  const headerGap = 34;
  const groupGap = 96;
  let cursorY = startY + 140;
  const generatedScreens = [];

  groups.forEach((group) => {
    groupHeader(page, group.title, group.subtitle, 40, cursorY, createdIds);
    const firstRowY = cursorY + headerH + headerGap;
    group.names.forEach((name, index) => {
      const def = byName.get(name);
      const x = 40 + index * (SCREEN_W + screenGapX);
      generatedScreens.push(renderPage(page, def, x, firstRowY, createdIds));
    });
    cursorY = firstRowY + SCREEN_H + groupGap;
  });

  figma.viewport.scrollAndZoomIntoView(generatedScreens);
  figma.notify("后台管理端页面已添加到 " + page.name);
  figma.closePlugin("Created " + createdIds.length + " nodes on " + page.name + ".");
}

run().catch((error) => {
  figma.closePlugin("生成失败：" + (error && error.message ? error.message : String(error)));
});
