import {
  BadgeCheck,
  BarChart3,
  Boxes,
  ClipboardList,
  CircleDollarSign,
  DatabaseBackup,
  FileClock,
  FileDown,
  Headphones,
  KeyRound,
  PackageCheck,
  Route,
  Settings,
  ShieldCheck,
  Store,
  Tags,
  Truck,
  UsersRound
} from "lucide-react";
import type { AdminGroup, AdminPageData, TableColumn, TableRow } from "../types";

const productColumns: TableColumn[] = [
  { key: "name", label: "商品" },
  { key: "category", label: "类目" },
  { key: "price", label: "价格" },
  { key: "stock", label: "库存" },
  { key: "status", label: "状态" },
  { key: "action", label: "操作" }
];

const productRows: TableRow[] = [
  { id: "p1", cells: { name: "蓝牙耳机 Pro", category: "数码家电", price: "¥299", stock: "1,280", status: "在售", action: "编辑" }, status: "在售" },
  { id: "p2", cells: { name: "氨基酸洁面乳", category: "美妆个护", price: "¥128", stock: "328", status: "在售", action: "编辑" }, status: "在售" },
  { id: "p3", cells: { name: "儿童保温杯", category: "母婴用品", price: "¥89", stock: "18", status: "预警", action: "补货" }, status: "预警" }
];

const settlementColumns: TableColumn[] = [
  { key: "name", label: "名称" },
  { key: "owner", label: "归属" },
  { key: "amount", label: "数值" },
  { key: "status", label: "状态" },
  { key: "time", label: "更新时间" },
  { key: "action", label: "操作" }
];

const systemColumns: TableColumn[] = [
  { key: "operator", label: "操作人" },
  { key: "module", label: "模块" },
  { key: "action", label: "动作" },
  { key: "ip", label: "IP" },
  { key: "time", label: "时间" },
  { key: "result", label: "结果" }
];

const orderColumns: TableColumn[] = [
  { key: "orderNo", label: "订单号" },
  { key: "buyer", label: "买家" },
  { key: "amount", label: "金额" },
  { key: "status", label: "状态" },
  { key: "time", label: "下单时间" },
  { key: "action", label: "操作" }
];

const afterSaleColumns: TableColumn[] = [
  { key: "serviceNo", label: "服务单号" },
  { key: "buyer", label: "买家" },
  { key: "type", label: "类型" },
  { key: "amount", label: "金额" },
  { key: "status", label: "状态" },
  { key: "action", label: "操作" }
];

const employeeColumns: TableColumn[] = [
  { key: "name", label: "员工" },
  { key: "phone", label: "手机号" },
  { key: "role", label: "角色" },
  { key: "lastLogin", label: "最近登录" },
  { key: "status", label: "状态" },
  { key: "action", label: "操作" }
];

const roleColumns: TableColumn[] = [
  { key: "role", label: "角色" },
  { key: "members", label: "成员数" },
  { key: "scope", label: "权限范围" },
  { key: "createdAt", label: "创建时间" },
  { key: "status", label: "状态" },
  { key: "action", label: "操作" }
];

const userColumns: TableColumn[] = [
  { key: "name", label: "用户" },
  { key: "phone", label: "手机号" },
  { key: "level", label: "会员等级" },
  { key: "orders", label: "订单数" },
  { key: "amount", label: "消费金额" },
  { key: "action", label: "操作" }
];

const financeColumns: TableColumn[] = [
  { key: "tradeNo", label: "交易单号" },
  { key: "orderNo", label: "订单号" },
  { key: "channel", label: "渠道" },
  { key: "amount", label: "金额" },
  { key: "status", label: "状态" },
  { key: "time", label: "支付时间" }
];

const supportColumns: TableColumn[] = [
  { key: "ticketNo", label: "工单" },
  { key: "user", label: "用户" },
  { key: "type", label: "类型" },
  { key: "priority", label: "优先级" },
  { key: "status", label: "状态" },
  { key: "action", label: "操作" }
];

export const adminGroups: AdminGroup[] = [
  {
    id: "dashboard",
    title: "01 工作台",
    subtitle: "经营概览、待办事项和实时订单",
    icon: BarChart3,
    pageIds: ["dashboard-overview"]
  },
  {
    id: "group02",
    title: "02 商品中心",
    subtitle: "商品、分类、品牌、库存和审核",
    icon: Boxes,
    pageIds: ["products", "categories", "brands", "inventory", "product-audit"]
  },
  {
    id: "orders",
    title: "03 订单履约",
    subtitle: "订单、发货、物流跟踪和售后处理",
    icon: ClipboardList,
    pageIds: ["order-list", "shipping-management", "logistics-tracking", "aftersale-list"]
  },
  {
    id: "users",
    title: "04 用户会员",
    subtitle: "用户资料、会员等级和积分记录",
    icon: UsersRound,
    pageIds: ["user-list", "member-levels", "points-records"]
  },
  {
    id: "marketing",
    title: "05 营销运营",
    subtitle: "优惠券、促销活动、首页装修和推荐位",
    icon: BadgeCheck,
    pageIds: ["coupon-management", "promotion-activities", "homepage-layout", "recommendation-slots"]
  },
  {
    id: "finance",
    title: "06 财务结算",
    subtitle: "支付、退款、结算和对账",
    icon: CircleDollarSign,
    pageIds: ["payment-flow", "refund-flow", "merchant-settlements", "reconciliation"]
  },
  {
    id: "group07",
    title: "07 商户权限",
    subtitle: "商户资料、员工、角色和权限矩阵",
    icon: ShieldCheck,
    pageIds: ["merchant-info", "employees", "roles", "permission-matrix"]
  },
  {
    id: "support",
    title: "08 客服内容",
    subtitle: "客服工单、发票、消息通知和帮助文章",
    icon: Headphones,
    pageIds: ["support-tickets", "invoice-management", "message-notifications", "help-articles"]
  },
  {
    id: "group09",
    title: "09 系统设置",
    subtitle: "系统参数、操作日志和数据导出",
    icon: Settings,
    pageIds: ["system-config", "operation-logs", "data-export"]
  }
];

export const adminPages: AdminPageData[] = [
  {
    kind: "dashboard",
    id: "dashboard-overview",
    groupId: "dashboard",
    title: "工作台总览",
    eyebrow: "工作台 / 工作台总览",
    description: "用于管理商城工作台的核心数据、流程与风险事项。",
    metrics: [
      { label: "今日 GMV", value: "¥126,480", delta: "+12.8%", tone: "red" },
      { label: "待发货订单", value: "238", delta: "-4.1%", tone: "blue" },
      { label: "新增用户", value: "1,286", delta: "+8.6%", tone: "green" },
      { label: "售后处理中", value: "42", delta: "+2.4%", tone: "purple" }
    ],
    todos: ["待处理发货 238 单", "退款审核 17 单", "库存预警 29 个 SKU", "客服待回复 12 条"],
    chartBars: [180, 138, 164, 96, 122, 76, 104, 58, 82, 44],
    columns: [
      { key: "orderNo", label: "订单" },
      { key: "buyer", label: "用户" },
      { key: "amount", label: "金额" },
      { key: "status", label: "状态" },
      { key: "time", label: "时间" }
    ],
    rows: [
      { id: "rt1", cells: { orderNo: "202607050010", buyer: "李先生", amount: "¥299", status: "待发货", time: "09:42" }, status: "待发货" },
      { id: "rt2", cells: { orderNo: "202607050009", buyer: "王女士", amount: "¥128", status: "已支付", time: "09:36" }, status: "已支付" },
      { id: "rt3", cells: { orderNo: "202607050008", buyer: "张先生", amount: "¥89", status: "已支付", time: "09:20" }, status: "已支付" }
    ]
  },
  {
    kind: "list",
    id: "products",
    groupId: "group02",
    title: "商品列表",
    eyebrow: "商品中心 / 商品列表",
    description: "集中管理全端商品，支持上下架、库存预警、批量操作和商户归属筛选。",
    filters: ["商品名称 / SKU", "类目", "上下架状态", "库存状态"],
    actions: [{ label: "新增商品", variant: "primary" }, { label: "批量上架" }],
    metrics: [
      { label: "在售商品", value: "1,286", delta: "+8.2%", tone: "green" },
      { label: "低库存 SKU", value: "29", delta: "+4", tone: "orange" },
      { label: "待审核", value: "16", delta: "-3", tone: "blue" },
      { label: "今日更新", value: "84", delta: "+12", tone: "purple" }
    ],
    columns: productColumns,
    rows: productRows
  },
  {
    kind: "form",
    id: "product-edit",
    groupId: "group02",
    title: "商品编辑",
    eyebrow: "商品中心 / 商品编辑",
    description: "覆盖基础信息、规格库存、图文详情、销售设置和发布状态。",
    sections: [
      { title: "基础信息", fields: ["商品名称", "商品类目", "品牌", "商品卖点"] },
      { title: "价格库存", fields: ["销售价", "划线价", "SKU 编码", "可售库存"] },
      { title: "发布设置", fields: ["上架状态", "运费模板", "售后策略", "推荐权重"] }
    ],
    sideCards: ["商品主图", "详情图册", "规格预览", "发布检查"]
  },
  {
    kind: "list",
    id: "categories",
    groupId: "group02",
    title: "分类管理",
    eyebrow: "商品中心 / 分类管理",
    description: "维护前台类目树、排序、导航展示和类目启停状态。",
    filters: ["分类名称", "层级", "状态"],
    actions: [{ label: "新增分类", variant: "primary" }, { label: "调整排序" }],
    metrics: [
      { label: "一级分类", value: "12", delta: "稳定", tone: "blue" },
      { label: "二级分类", value: "86", delta: "+5", tone: "green" },
      { label: "隐藏分类", value: "7", delta: "-1", tone: "gray" },
      { label: "关联商品", value: "3,420", delta: "+128", tone: "purple" }
    ],
    columns: settlementColumns,
    rows: [
      { id: "c1", cells: { name: "数码家电", owner: "一级分类", amount: "286 商品", status: "启用", time: "07-05 09:10", action: "编辑" }, status: "启用" },
      { id: "c2", cells: { name: "蓝牙耳机", owner: "二级分类", amount: "64 商品", status: "启用", time: "07-05 08:40", action: "编辑" }, status: "启用" },
      { id: "c3", cells: { name: "夏季专区", owner: "营销分类", amount: "42 商品", status: "隐藏", time: "07-04 18:22", action: "调整" }, status: "隐藏" }
    ]
  },
  {
    kind: "list",
    id: "brands",
    groupId: "group02",
    title: "品牌管理",
    eyebrow: "商品中心 / 品牌管理",
    description: "维护品牌资料、Logo、推荐状态和类目绑定关系。",
    filters: ["品牌名称", "关联类目", "推荐状态"],
    actions: [{ label: "新增品牌", variant: "primary" }, { label: "导入品牌" }],
    metrics: [
      { label: "品牌总数", value: "148", delta: "+6", tone: "green" },
      { label: "推荐品牌", value: "32", delta: "+2", tone: "blue" },
      { label: "待完善", value: "11", delta: "-4", tone: "orange" },
      { label: "关联商品", value: "2,618", delta: "+90", tone: "purple" }
    ],
    columns: settlementColumns,
    rows: [
      { id: "b1", cells: { name: "SoundMax", owner: "数码家电", amount: "42 商品", status: "推荐", time: "07-05 09:08", action: "编辑" }, status: "推荐" },
      { id: "b2", cells: { name: "GlowLab", owner: "美妆个护", amount: "36 商品", status: "启用", time: "07-04 17:30", action: "编辑" }, status: "启用" },
      { id: "b3", cells: { name: "BabyCare", owner: "母婴用品", amount: "28 商品", status: "推荐", time: "07-04 11:16", action: "编辑" }, status: "推荐" }
    ]
  },
  {
    kind: "list",
    id: "inventory",
    groupId: "group02",
    title: "库存预警",
    eyebrow: "商品中心 / 库存预警",
    description: "按 SKU 监控可售库存、锁定库存、预警线和补货进度。",
    filters: ["SKU 编码", "仓库", "预警级别", "负责人"],
    actions: [{ label: "批量补货", variant: "primary" }, { label: "导出明细" }],
    metrics: [
      { label: "预警 SKU", value: "29", delta: "+4", tone: "orange" },
      { label: "缺货 SKU", value: "7", delta: "+2", tone: "red" },
      { label: "补货中", value: "18", delta: "+6", tone: "blue" },
      { label: "库存周转", value: "18.6 天", delta: "-1.2", tone: "green" }
    ],
    columns: settlementColumns,
    rows: [
      { id: "i1", cells: { name: "SKU-10023", owner: "儿童保温杯", amount: "18 / 预警线 30", status: "预警", time: "07-05 09:20", action: "补货" }, status: "预警" },
      { id: "i2", cells: { name: "SKU-10058", owner: "快充套装", amount: "22 / 预警线 50", status: "预警", time: "07-05 08:36", action: "补货" }, status: "预警" },
      { id: "i3", cells: { name: "SKU-10211", owner: "机械键盘", amount: "9 / 预警线 20", status: "缺货风险", time: "07-04 19:02", action: "补货" }, status: "缺货风险" }
    ]
  },
  {
    kind: "list",
    id: "product-audit",
    groupId: "group02",
    title: "商品审核",
    eyebrow: "商品中心 / 商品审核",
    description: "审核商户提交的商品资料、敏感词、图片合规和上架风险。",
    filters: ["提交商户", "审核状态", "风险类型", "提交时间"],
    actions: [{ label: "批量通过", variant: "primary" }, { label: "批量驳回" }],
    metrics: [
      { label: "待审核", value: "16", delta: "-3", tone: "blue" },
      { label: "高风险", value: "3", delta: "+1", tone: "red" },
      { label: "今日通过", value: "42", delta: "+8", tone: "green" },
      { label: "平均耗时", value: "18 分", delta: "-6", tone: "purple" }
    ],
    columns: settlementColumns,
    rows: [
      { id: "a1", cells: { name: "智能音箱 Max", owner: "默认商户", amount: "无风险", status: "待审", time: "07-05 10:20", action: "审核" }, status: "待审" },
      { id: "a2", cells: { name: "夏季防晒霜", owner: "默认商户", amount: "敏感词", status: "待审", time: "07-05 09:12", action: "审核" }, status: "待审" },
      { id: "a3", cells: { name: "儿童餐具套装", owner: "默认商户", amount: "图片待核", status: "复核", time: "07-04 18:08", action: "复核" }, status: "复核" }
    ]
  },
  {
    kind: "list",
    id: "order-list",
    groupId: "orders",
    title: "订单列表",
    eyebrow: "订单履约 / 订单列表",
    description: "统一处理商城订单、支付状态、发货进度和履约异常。",
    filters: ["订单号", "买家", "订单状态", "下单时间"],
    actions: [{ label: "导出订单", variant: "primary" }, { label: "批量发货" }],
    metrics: [
      { label: "今日订单", value: "486", delta: "+10.4%", tone: "blue" },
      { label: "待发货", value: "238", delta: "-4.1%", tone: "orange" },
      { label: "待支付", value: "32", delta: "+6", tone: "red" },
      { label: "履约完成", value: "91.8%", delta: "+1.2%", tone: "green" }
    ],
    columns: orderColumns,
    rows: [
      { id: "o1", cells: { orderNo: "202607040001", buyer: "李先生", amount: "¥555", status: "待发货", time: "07-04 10:12", action: "详情" }, status: "待发货" },
      { id: "o2", cells: { orderNo: "202607030012", buyer: "王女士", amount: "¥299", status: "待支付", time: "07-03 18:40", action: "详情" }, status: "待支付" },
      { id: "o3", cells: { orderNo: "202607020030", buyer: "张先生", amount: "¥128", status: "已完成", time: "07-02 09:16", action: "详情" }, status: "已完成" }
    ]
  },
  {
    kind: "detail",
    id: "order-detail",
    groupId: "orders",
    title: "订单详情",
    eyebrow: "订单履约 / 订单列表 / 订单详情",
    description: "查看订单状态、金额、买家信息、流程进度和商品明细。",
    summary: [
      { label: "订单状态", value: "待发货" },
      { label: "订单金额", value: "¥555" },
      { label: "买家", value: "李先生" },
      { label: "收货地址", value: "上海市浦东新区 XX 路 88 号" }
    ],
    steps: ["买家下单", "买家支付", "商家发货", "确认收货"],
    tableTitle: "商品明细",
    columns: [
      { key: "time", label: "时间" },
      { key: "operator", label: "操作人" },
      { key: "action", label: "动作" },
      { key: "content", label: "内容" },
      { key: "result", label: "结果" }
    ],
    rows: [
      { id: "od1", cells: { time: "07-04 10:12", operator: "买家", action: "下单", content: "订单已提交", result: "成功" }, status: "成功" },
      { id: "od2", cells: { time: "07-04 10:16", operator: "支付系统", action: "支付", content: "微信支付 ¥555", result: "成功" }, status: "成功" },
      { id: "od3", cells: { time: "07-04 10:28", operator: "系统", action: "锁库", content: "库存已锁定", result: "成功" }, status: "成功" }
    ]
  },
  {
    kind: "form",
    id: "shipping-management",
    groupId: "orders",
    title: "发货管理",
    eyebrow: "订单履约 / 发货管理",
    description: "维护待发货订单、物流公司、物流单号、仓库和面单打印信息。",
    sections: [
      { title: "订单信息", fields: ["订单号", "收货人", "收货地址", "联系电话"] },
      { title: "物流信息", fields: ["物流公司", "物流单号", "发货仓库", "包裹重量"] },
      { title: "发货备注", fields: ["发货备注", "打印状态", "拣货状态", "复核人员"] }
    ],
    sideCards: ["待发货商品", "地址校验", "打印面单", "发货记录"]
  },
  {
    kind: "detail",
    id: "logistics-tracking",
    groupId: "orders",
    title: "物流跟踪",
    eyebrow: "订单履约 / 物流跟踪",
    description: "查看物流公司、单号、当前状态、预计送达和完整轨迹。",
    summary: [
      { label: "物流公司", value: "顺丰速运" },
      { label: "物流单号", value: "SF1234567890" },
      { label: "当前状态", value: "运输中" },
      { label: "预计送达", value: "2026-07-06 18:00" }
    ],
    steps: ["仓库出库", "快递揽收", "到达集散中心", "派送中"],
    tableTitle: "轨迹明细",
    columns: [
      { key: "time", label: "时间" },
      { key: "operator", label: "节点" },
      { key: "action", label: "动作" },
      { key: "content", label: "内容" },
      { key: "result", label: "状态" }
    ],
    rows: [
      { id: "lt1", cells: { time: "07-05 09:20", operator: "上海仓", action: "出库", content: "包裹离开仓库", result: "成功" }, status: "成功" },
      { id: "lt2", cells: { time: "07-05 12:18", operator: "顺丰", action: "揽收", content: "快递员已揽收", result: "成功" }, status: "成功" },
      { id: "lt3", cells: { time: "07-05 20:40", operator: "华东集散", action: "中转", content: "运输至下一站", result: "运输中" }, status: "运输中" }
    ]
  },
  {
    kind: "list",
    id: "aftersale-list",
    groupId: "orders",
    title: "售后列表",
    eyebrow: "订单履约 / 售后列表",
    description: "集中处理退款、退货退款、换货和售后协商进度。",
    filters: ["服务单号", "服务类型", "处理状态", "申请时间"],
    actions: [{ label: "导出售后", variant: "primary" }, { label: "批量分配" }],
    metrics: [
      { label: "售后处理中", value: "42", delta: "+2.4%", tone: "orange" },
      { label: "退款审核", value: "17", delta: "+3", tone: "red" },
      { label: "今日完结", value: "28", delta: "+8", tone: "green" },
      { label: "平均时效", value: "3.2 小时", delta: "-0.6", tone: "blue" }
    ],
    columns: afterSaleColumns,
    rows: [
      { id: "as1", cells: { serviceNo: "AS202607040001", buyer: "李先生", type: "退货退款", amount: "¥299", status: "待寄回", action: "处理" }, status: "待寄回" },
      { id: "as2", cells: { serviceNo: "AS202607020018", buyer: "王女士", type: "仅退款", amount: "¥128", status: "审核中", action: "处理" }, status: "审核中" },
      { id: "as3", cells: { serviceNo: "AS202606280033", buyer: "张先生", type: "换货", amount: "¥89", status: "已完成", action: "查看" }, status: "已完成" }
    ]
  },
  {
    kind: "detail",
    id: "aftersale-detail",
    groupId: "orders",
    title: "售后详情",
    eyebrow: "订单履约 / 售后列表 / 售后详情",
    description: "查看服务单类型、退款金额、处理状态、协商进度和沟通记录。",
    summary: [
      { label: "服务单号", value: "AS202607040001" },
      { label: "服务类型", value: "退货退款" },
      { label: "退款金额", value: "¥299" },
      { label: "处理状态", value: "待买家寄回" }
    ],
    steps: ["提交申请", "商家审核", "买家寄回", "退款完成"],
    tableTitle: "协商记录",
    columns: [
      { key: "time", label: "时间" },
      { key: "operator", label: "操作人" },
      { key: "action", label: "动作" },
      { key: "content", label: "内容" },
      { key: "result", label: "结果" }
    ],
    rows: [
      { id: "ad1", cells: { time: "07-04 11:20", operator: "买家", action: "申请", content: "商品不合适，申请退货退款", result: "成功" }, status: "成功" },
      { id: "ad2", cells: { time: "07-04 13:08", operator: "赵客服", action: "审核", content: "同意退货，等待寄回", result: "成功" }, status: "成功" },
      { id: "ad3", cells: { time: "07-05 09:18", operator: "系统", action: "提醒", content: "提醒买家上传物流", result: "待处理" }, status: "待处理" }
    ]
  },
  {
    kind: "list",
    id: "user-list",
    groupId: "users",
    title: "用户列表",
    eyebrow: "用户会员 / 用户列表",
    description: "管理商城用户资料、手机号、会员等级、订单数量和消费金额。",
    filters: ["手机号", "会员等级", "注册时间", "用户状态"],
    actions: [{ label: "导出用户", variant: "primary" }, { label: "批量打标" }],
    metrics: [
      { label: "注册用户", value: "18,640", delta: "+8.6%", tone: "green" },
      { label: "今日新增", value: "1,286", delta: "+128", tone: "blue" },
      { label: "高价值用户", value: "642", delta: "+24", tone: "purple" },
      { label: "沉默用户", value: "2,180", delta: "-3.2%", tone: "orange" }
    ],
    columns: userColumns,
    rows: [
      { id: "u1", cells: { name: "李先生", phone: "138****8888", level: "普通会员", orders: "8", amount: "¥2,980", action: "详情" } },
      { id: "u2", cells: { name: "王女士", phone: "139****6666", level: "银卡会员", orders: "16", amount: "¥6,420", action: "详情" } },
      { id: "u3", cells: { name: "张先生", phone: "137****9999", level: "普通会员", orders: "3", amount: "¥588", action: "详情" } }
    ]
  },
  {
    kind: "detail",
    id: "user-detail",
    groupId: "users",
    title: "用户详情",
    eyebrow: "用户会员 / 用户列表 / 用户详情",
    description: "查看用户基础资料、会员等级、累计消费和最近订单。",
    summary: [
      { label: "用户昵称", value: "李先生" },
      { label: "手机号", value: "138****8888" },
      { label: "会员等级", value: "普通会员" },
      { label: "累计消费", value: "¥2,980" }
    ],
    steps: ["注册账号", "首次下单", "绑定手机号", "最近登录"],
    tableTitle: "最近订单",
    columns: orderColumns,
    rows: [
      { id: "uo1", cells: { orderNo: "202607040001", buyer: "李先生", amount: "¥555", status: "待发货", time: "07-04 10:12", action: "详情" }, status: "待发货" },
      { id: "uo2", cells: { orderNo: "202606280020", buyer: "李先生", amount: "¥299", status: "已完成", time: "06-28 14:16", action: "详情" }, status: "已完成" },
      { id: "uo3", cells: { orderNo: "202606180018", buyer: "李先生", amount: "¥128", status: "已完成", time: "06-18 09:36", action: "详情" }, status: "已完成" }
    ]
  },
  {
    kind: "list",
    id: "member-levels",
    groupId: "users",
    title: "会员等级",
    eyebrow: "用户会员 / 会员等级",
    description: "配置会员成长值门槛、折扣权益、包邮权益和等级状态。",
    filters: ["等级名称", "状态", "权益类型"],
    actions: [{ label: "新增等级", variant: "primary" }, { label: "复制等级" }],
    metrics: [
      { label: "等级数", value: "5", delta: "稳定", tone: "blue" },
      { label: "银卡会员", value: "3,260", delta: "+4.2%", tone: "green" },
      { label: "金卡会员", value: "820", delta: "+36", tone: "purple" },
      { label: "权益成本", value: "¥8,420", delta: "+2.1%", tone: "orange" }
    ],
    columns: settlementColumns,
    rows: [
      { id: "ml1", cells: { name: "普通会员", owner: "成长值 0", amount: "无折扣", status: "启用", time: "默认", action: "编辑" }, status: "启用" },
      { id: "ml2", cells: { name: "银卡会员", owner: "成长值 1000", amount: "9.8 折", status: "启用", time: "包邮", action: "编辑" }, status: "启用" },
      { id: "ml3", cells: { name: "金卡会员", owner: "成长值 5000", amount: "9.5 折", status: "启用", time: "包邮", action: "编辑" }, status: "启用" }
    ]
  },
  {
    kind: "list",
    id: "points-records",
    groupId: "users",
    title: "积分记录",
    eyebrow: "用户会员 / 积分记录",
    description: "追踪用户积分来源、变动、余额和兑换行为。",
    filters: ["用户", "积分类型", "发生时间"],
    actions: [{ label: "导出", variant: "primary" }, { label: "手动调整" }],
    metrics: [
      { label: "今日发放", value: "18,260", delta: "+12%", tone: "green" },
      { label: "今日消耗", value: "9,800", delta: "+6%", tone: "orange" },
      { label: "积分余额", value: "1,280 万", delta: "+3.4%", tone: "blue" },
      { label: "兑换订单", value: "86", delta: "+8", tone: "purple" }
    ],
    columns: settlementColumns,
    rows: [
      { id: "pt1", cells: { name: "李先生", owner: "评价晒单", amount: "+20", status: "成功", time: "余额 1,280", action: "查看" }, status: "成功" },
      { id: "pt2", cells: { name: "王女士", owner: "兑换优惠券", amount: "-100", status: "成功", time: "余额 860", action: "查看" }, status: "成功" },
      { id: "pt3", cells: { name: "张先生", owner: "下单奖励", amount: "+50", status: "成功", time: "余额 230", action: "查看" }, status: "成功" }
    ]
  },
  {
    kind: "list",
    id: "coupon-management",
    groupId: "marketing",
    title: "优惠券管理",
    eyebrow: "营销运营 / 优惠券管理",
    description: "管理优惠券门槛、库存、领取量、投放状态和有效期。",
    filters: ["券名称", "券状态", "有效期"],
    actions: [{ label: "新增优惠券", variant: "primary" }, { label: "批量投放" }],
    metrics: [
      { label: "投放中", value: "12", delta: "+2", tone: "green" },
      { label: "领取数", value: "10,286", delta: "+18%", tone: "blue" },
      { label: "核销率", value: "28.6%", delta: "+1.2%", tone: "purple" },
      { label: "即将过期", value: "4", delta: "+1", tone: "orange" }
    ],
    columns: settlementColumns,
    rows: [
      { id: "cp1", cells: { name: "满 299 减 30", owner: "满 299", amount: "8,000", status: "投放中", time: "领取 1,286", action: "编辑" }, status: "投放中" },
      { id: "cp2", cells: { name: "新人专享券", owner: "无门槛", amount: "2,000", status: "投放中", time: "领取 876", action: "编辑" }, status: "投放中" },
      { id: "cp3", cells: { name: "美妆品类券", owner: "满 99", amount: "1,500", status: "待开始", time: "领取 642", action: "编辑" }, status: "待开始" }
    ]
  },
  {
    kind: "list",
    id: "promotion-activities",
    groupId: "marketing",
    title: "促销活动",
    eyebrow: "营销运营 / 促销活动",
    description: "配置满减、限时折扣、会员日等促销活动和商品范围。",
    filters: ["活动名称", "活动类型", "活动状态"],
    actions: [{ label: "新增活动", variant: "primary" }, { label: "复制活动" }],
    metrics: [
      { label: "活动总数", value: "18", delta: "+3", tone: "blue" },
      { label: "进行中", value: "5", delta: "+1", tone: "green" },
      { label: "待开始", value: "7", delta: "+2", tone: "orange" },
      { label: "活动 GMV", value: "¥86,420", delta: "+12.4%", tone: "purple" }
    ],
    columns: settlementColumns,
    rows: [
      { id: "pa1", cells: { name: "夏季焕新", owner: "满减", amount: "86 商品", status: "待开始", time: "07-10", action: "配置" }, status: "待开始" },
      { id: "pa2", cells: { name: "新品首发", owner: "限时折扣", amount: "24 商品", status: "进行中", time: "07-06", action: "配置" }, status: "进行中" },
      { id: "pa3", cells: { name: "会员日", owner: "会员价", amount: "128 商品", status: "待开始", time: "07-18", action: "配置" }, status: "待开始" }
    ]
  },
  {
    kind: "board",
    id: "homepage-layout",
    groupId: "marketing",
    title: "首页装修",
    eyebrow: "营销运营 / 首页装修",
    description: "搭建商城首页模块，支持轮播、快捷入口、专区和推荐商品排序。",
    cards: ["轮播 Banner", "快捷入口", "限时专区", "推荐商品", "品牌专区", "底部导航"]
  },
  {
    kind: "list",
    id: "recommendation-slots",
    groupId: "marketing",
    title: "推荐位管理",
    eyebrow: "营销运营 / 推荐位管理",
    description: "维护首页、PC、分类页等推荐位内容、终端和排序。",
    filters: ["推荐位", "终端", "状态"],
    actions: [{ label: "新增推荐位", variant: "primary" }, { label: "批量启用" }],
    metrics: [
      { label: "推荐位", value: "24", delta: "+2", tone: "blue" },
      { label: "启用中", value: "18", delta: "+1", tone: "green" },
      { label: "待配置", value: "6", delta: "-2", tone: "orange" },
      { label: "点击率", value: "8.6%", delta: "+0.8%", tone: "purple" }
    ],
    columns: settlementColumns,
    rows: [
      { id: "rs1", cells: { name: "首页猜你喜欢", owner: "H5/小程序", amount: "24 内容", status: "启用", time: "排序 1", action: "配置" }, status: "启用" },
      { id: "rs2", cells: { name: "PC 首页热卖", owner: "PC Web", amount: "16 内容", status: "启用", time: "排序 2", action: "配置" }, status: "启用" },
      { id: "rs3", cells: { name: "分类页推荐", owner: "全端", amount: "32 内容", status: "启用", time: "排序 3", action: "配置" }, status: "启用" }
    ]
  },
  {
    kind: "list",
    id: "payment-flow",
    groupId: "finance",
    title: "支付流水",
    eyebrow: "财务结算 / 支付流水",
    description: "查看支付交易单号、订单号、渠道、金额、状态和支付时间。",
    filters: ["交易单号", "支付渠道", "支付时间"],
    actions: [{ label: "导出流水", variant: "primary" }, { label: "快速复核" }],
    metrics: [
      { label: "今日支付", value: "¥126,480", delta: "+12.8%", tone: "green" },
      { label: "支付笔数", value: "486", delta: "+10%", tone: "blue" },
      { label: "待支付", value: "32", delta: "+6", tone: "orange" },
      { label: "成功率", value: "98.2%", delta: "+0.4%", tone: "purple" }
    ],
    columns: financeColumns,
    rows: [
      { id: "pay1", cells: { tradeNo: "PAY202607040001", orderNo: "202607040001", channel: "微信支付", amount: "¥555", status: "成功", time: "07-04 10:16" }, status: "成功" },
      { id: "pay2", cells: { tradeNo: "PAY202607030012", orderNo: "202607030012", channel: "支付宝", amount: "¥299", status: "待支付", time: "07-03 18:40" }, status: "待支付" },
      { id: "pay3", cells: { tradeNo: "PAY202607020030", orderNo: "202607020030", channel: "微信支付", amount: "¥128", status: "成功", time: "07-02 09:20" }, status: "成功" }
    ]
  },
  {
    kind: "list",
    id: "refund-flow",
    groupId: "finance",
    title: "退款流水",
    eyebrow: "财务结算 / 退款流水",
    description: "查看退款单号、服务单、渠道、金额、状态和处理动作。",
    filters: ["退款单号", "退款状态", "申请时间"],
    actions: [{ label: "导出退款", variant: "primary" }, { label: "批量处理" }],
    metrics: [
      { label: "退款申请", value: "42", delta: "+2", tone: "orange" },
      { label: "待退款", value: "17", delta: "+3", tone: "red" },
      { label: "退款成功", value: "25", delta: "+8", tone: "green" },
      { label: "退款金额", value: "¥8,960", delta: "+6.2%", tone: "blue" }
    ],
    columns: settlementColumns,
    rows: [
      { id: "rf1", cells: { name: "RF202607040001", owner: "AS202607040001", amount: "¥299", status: "待退款", time: "微信原路退", action: "处理" }, status: "待退款" },
      { id: "rf2", cells: { name: "RF202607020018", owner: "AS202607020018", amount: "¥128", status: "成功", time: "支付宝原路退", action: "查看" }, status: "成功" },
      { id: "rf3", cells: { name: "RF202606280033", owner: "AS202606280033", amount: "¥89", status: "成功", time: "微信原路退", action: "查看" }, status: "成功" }
    ]
  },
  {
    kind: "list",
    id: "merchant-settlements",
    groupId: "finance",
    title: "商户结算",
    eyebrow: "财务结算 / 商户结算",
    description: "按结算周期生成商户结算单，核对销售额、退款和应结算金额。",
    filters: ["结算周期", "商户", "结算状态"],
    actions: [{ label: "生成结算单", variant: "primary" }, { label: "导出账单" }],
    metrics: [
      { label: "待打款", value: "¥84,240", delta: "+6.4%", tone: "orange" },
      { label: "已打款", value: "¥77,440", delta: "+2.8%", tone: "green" },
      { label: "退款抵扣", value: "¥2,180", delta: "-4.2%", tone: "blue" },
      { label: "差异金额", value: "¥0", delta: "正常", tone: "purple" }
    ],
    columns: settlementColumns,
    rows: [
      { id: "st1", cells: { name: "ST20260701", owner: "默认商户", amount: "¥84,240", status: "待打款", time: "销售 ¥86,420", action: "对账" }, status: "待打款" },
      { id: "st2", cells: { name: "ST20260630", owner: "默认商户", amount: "¥77,440", status: "已打款", time: "销售 ¥79,120", action: "查看" }, status: "已打款" },
      { id: "st3", cells: { name: "ST20260629", owner: "默认商户", amount: "¥80,680", status: "已打款", time: "销售 ¥82,690", action: "查看" }, status: "已打款" }
    ]
  },
  {
    kind: "detail",
    id: "reconciliation",
    groupId: "finance",
    title: "对账单",
    eyebrow: "财务结算 / 商户结算 / 对账单",
    description: "核对渠道流水、商城订单、退款金额和差异明细。",
    summary: [
      { label: "对账日期", value: "2026-07-04" },
      { label: "订单收入", value: "¥126,480" },
      { label: "退款金额", value: "¥3,280" },
      { label: "差异金额", value: "¥0" }
    ],
    steps: ["拉取渠道流水", "匹配订单", "匹配退款", "生成差异报告"],
    tableTitle: "差异明细",
    columns: systemColumns,
    rows: [
      { id: "rc1", cells: { operator: "系统", module: "微信支付", action: "拉取流水", ip: "-", time: "07-05 00:10", result: "成功" }, status: "成功" },
      { id: "rc2", cells: { operator: "系统", module: "订单", action: "匹配收入", ip: "-", time: "07-05 00:18", result: "成功" }, status: "成功" },
      { id: "rc3", cells: { operator: "系统", module: "退款", action: "匹配退款", ip: "-", time: "07-05 00:24", result: "成功" }, status: "成功" }
    ]
  },
  {
    kind: "form",
    id: "merchant-info",
    groupId: "group07",
    title: "商户信息",
    eyebrow: "商户权限 / 商户信息",
    description: "用于管理商城 商户权限 的核心数据、流程与风险事项。",
    sections: [
      { title: "基础信息", fields: ["商户名称", "联系人", "联系电话", "经营类目", "营业执照", "结算账户", "客服电话"] }
    ],
    sideCards: ["资质审核", "品牌授权", "经营状态", "合同信息"]
  },
  {
    kind: "list",
    id: "employees",
    groupId: "group07",
    title: "员工管理",
    eyebrow: "商户权限 / 员工管理",
    description: "管理商户后台员工账号、角色、启停状态和最近登录记录。",
    filters: ["员工姓名", "手机号", "角色", "账号状态"],
    actions: [{ label: "新增员工", variant: "primary" }, { label: "批量停用" }],
    metrics: [
      { label: "员工账号", value: "18", delta: "+2", tone: "blue" },
      { label: "在线员工", value: "7", delta: "+1", tone: "green" },
      { label: "停用账号", value: "3", delta: "0", tone: "gray" },
      { label: "异常登录", value: "1", delta: "+1", tone: "orange" }
    ],
    columns: employeeColumns,
    rows: [
      { id: "e1", cells: { name: "陈运营", phone: "136****1111", role: "店铺管理员", lastLogin: "07-05 09:10", status: "启用", action: "编辑" }, status: "启用" },
      { id: "e2", cells: { name: "赵客服", phone: "135****2222", role: "客服专员", lastLogin: "07-05 08:42", status: "启用", action: "编辑" }, status: "启用" },
      { id: "e3", cells: { name: "刘仓管", phone: "134****3333", role: "仓库发货", lastLogin: "07-04 18:00", status: "停用", action: "编辑" }, status: "停用" }
    ]
  },
  {
    kind: "list",
    id: "roles",
    groupId: "group07",
    title: "角色权限",
    eyebrow: "商户权限 / 角色权限",
    description: "配置岗位角色、成员数量、数据范围和可操作功能权限。",
    filters: ["角色名称", "权限范围", "状态"],
    actions: [{ label: "新增角色", variant: "primary" }, { label: "复制角色" }],
    metrics: [
      { label: "角色数", value: "8", delta: "+1", tone: "blue" },
      { label: "授权成员", value: "18", delta: "+2", tone: "green" },
      { label: "高权限角色", value: "2", delta: "0", tone: "orange" },
      { label: "待复核", value: "1", delta: "+1", tone: "red" }
    ],
    columns: roleColumns,
    rows: [
      { id: "r1", cells: { role: "店铺管理员", members: "3", scope: "全部模块", createdAt: "06-28", status: "启用", action: "配置" }, status: "启用" },
      { id: "r2", cells: { role: "客服专员", members: "6", scope: "订单/售后/客服", createdAt: "06-29", status: "启用", action: "配置" }, status: "启用" },
      { id: "r3", cells: { role: "仓库发货", members: "4", scope: "订单/物流", createdAt: "07-01", status: "启用", action: "配置" }, status: "启用" }
    ]
  },
  {
    kind: "matrix",
    id: "permission-matrix",
    groupId: "group07",
    title: "权限矩阵",
    eyebrow: "商户权限 / 权限矩阵",
    description: "按模块配置角色可见范围、操作能力和高危权限，支持快速复核。",
    modules: ["商品查看/编辑", "订单查看/发货", "售后审核/退款", "营销配置", "财务导出", "系统设置"],
    roles: [
      { role: "店铺管理员", permissions: ["商品查看/编辑", "订单查看/发货", "售后审核/退款", "营销配置", "财务导出"] },
      { role: "客服专员", permissions: ["订单查看/发货", "售后审核/退款"] },
      { role: "仓库发货", permissions: ["订单查看/发货"] },
      { role: "财务专员", permissions: ["财务导出"] }
    ]
  },
  {
    kind: "list",
    id: "support-tickets",
    groupId: "support",
    title: "客服工单",
    eyebrow: "客服内容 / 客服工单",
    description: "处理用户咨询、物流问题、退款咨询和售后协同。",
    filters: ["工单编号", "问题类型", "处理状态"],
    actions: [{ label: "分配客服", variant: "primary" }, { label: "批量关闭" }],
    metrics: [
      { label: "待回复", value: "12", delta: "+3", tone: "orange" },
      { label: "处理中", value: "28", delta: "+6", tone: "blue" },
      { label: "已解决", value: "86", delta: "+18", tone: "green" },
      { label: "高优先级", value: "4", delta: "+1", tone: "red" }
    ],
    columns: supportColumns,
    rows: [
      { id: "tk1", cells: { ticketNo: "TK202607050001", user: "李先生", type: "物流咨询", priority: "高", status: "待回复", action: "处理" }, status: "待回复" },
      { id: "tk2", cells: { ticketNo: "TK202607030006", user: "王女士", type: "退款咨询", priority: "中", status: "处理中", action: "处理" }, status: "处理中" },
      { id: "tk3", cells: { ticketNo: "TK202607010018", user: "张先生", type: "发票问题", priority: "低", status: "已解决", action: "查看" }, status: "已解决" }
    ]
  },
  {
    kind: "detail",
    id: "ticket-detail",
    groupId: "support",
    title: "工单详情",
    eyebrow: "客服内容 / 客服工单 / 工单详情",
    description: "查看工单编号、用户、问题类型、状态和沟通记录。",
    summary: [
      { label: "工单编号", value: "TK202607050001" },
      { label: "用户", value: "李先生" },
      { label: "问题类型", value: "物流咨询" },
      { label: "当前状态", value: "待回复" }
    ],
    steps: ["用户提交", "系统分配", "客服回复", "用户评价"],
    tableTitle: "沟通记录",
    columns: systemColumns,
    rows: [
      { id: "td1", cells: { operator: "李先生", module: "客服", action: "提交", ip: "-", time: "07-05 09:20", result: "成功" }, status: "成功" },
      { id: "td2", cells: { operator: "系统", module: "客服", action: "分配", ip: "-", time: "07-05 09:21", result: "成功" }, status: "成功" },
      { id: "td3", cells: { operator: "赵客服", module: "客服", action: "备注", ip: "10.0.0.18", time: "07-05 09:28", result: "待处理" }, status: "待处理" }
    ]
  },
  {
    kind: "list",
    id: "invoice-management",
    groupId: "support",
    title: "发票管理",
    eyebrow: "客服内容 / 发票管理",
    description: "管理发票申请、抬头、订单金额、开票状态和下载。",
    filters: ["发票抬头", "开票状态", "申请时间"],
    actions: [{ label: "批量开票", variant: "primary" }, { label: "导出发票" }],
    metrics: [
      { label: "待开票", value: "18", delta: "+4", tone: "orange" },
      { label: "已开票", value: "126", delta: "+16", tone: "green" },
      { label: "红冲发票", value: "3", delta: "+1", tone: "red" },
      { label: "开票金额", value: "¥86,420", delta: "+9.8%", tone: "blue" }
    ],
    columns: settlementColumns,
    rows: [
      { id: "iv1", cells: { name: "IV202607040001", owner: "上海某某公司", amount: "¥555", status: "待开票", time: "普票", action: "开票" }, status: "待开票" },
      { id: "iv2", cells: { name: "IV202607020018", owner: "王女士", amount: "¥299", status: "已开票", time: "普票", action: "下载" }, status: "已开票" },
      { id: "iv3", cells: { name: "IV202606280033", owner: "张先生", amount: "¥128", status: "已红冲", time: "普票", action: "查看" }, status: "已红冲" }
    ]
  },
  {
    kind: "list",
    id: "message-notifications",
    groupId: "support",
    title: "消息通知",
    eyebrow: "客服内容 / 消息通知",
    description: "配置交易、营销、服务类通知的标题、触达用户、渠道和状态。",
    filters: ["通知类型", "发送状态", "发送时间"],
    actions: [{ label: "新建通知", variant: "primary" }, { label: "批量发送" }],
    metrics: [
      { label: "待发送", value: "8", delta: "+2", tone: "orange" },
      { label: "发送中", value: "3", delta: "+1", tone: "blue" },
      { label: "已发送", value: "126", delta: "+18", tone: "green" },
      { label: "触达用户", value: "8,420", delta: "+12%", tone: "purple" }
    ],
    columns: settlementColumns,
    rows: [
      { id: "mn1", cells: { name: "订单发货提醒", owner: "交易通知", amount: "1,260 用户", status: "发送中", time: "站内/短信", action: "查看" }, status: "发送中" },
      { id: "mn2", cells: { name: "优惠券过期提醒", owner: "营销通知", amount: "8,420 用户", status: "待发送", time: "站内", action: "编辑" }, status: "待发送" },
      { id: "mn3", cells: { name: "售后处理提醒", owner: "服务通知", amount: "342 用户", status: "已发送", time: "站内/短信", action: "查看" }, status: "已发送" }
    ]
  },
  {
    kind: "list",
    id: "help-articles",
    groupId: "support",
    title: "帮助文章",
    eyebrow: "客服内容 / 帮助文章",
    description: "维护帮助中心文章、分类、阅读量、排序和发布状态。",
    filters: ["文章标题", "分类", "状态"],
    actions: [{ label: "新增文章", variant: "primary" }, { label: "调整排序" }],
    metrics: [
      { label: "文章数", value: "48", delta: "+3", tone: "blue" },
      { label: "已发布", value: "42", delta: "+2", tone: "green" },
      { label: "草稿", value: "6", delta: "+1", tone: "orange" },
      { label: "阅读量", value: "12,860", delta: "+18%", tone: "purple" }
    ],
    columns: settlementColumns,
    rows: [
      { id: "ha1", cells: { name: "如何修改地址", owner: "订单问题", amount: "2,860", status: "发布", time: "排序 1", action: "编辑" }, status: "发布" },
      { id: "ha2", cells: { name: "如何申请退款", owner: "售后问题", amount: "3,420", status: "发布", time: "排序 2", action: "编辑" }, status: "发布" },
      { id: "ha3", cells: { name: "发票如何下载", owner: "发票问题", amount: "1,280", status: "草稿", time: "排序 3", action: "编辑" }, status: "草稿" }
    ]
  },
  {
    kind: "form",
    id: "system-config",
    groupId: "group09",
    title: "系统配置",
    eyebrow: "系统设置 / 系统配置",
    description: "维护商城基础参数、交易规则、售后策略、安全策略和协议版本。",
    sections: [
      { title: "基础配置", fields: ["商城名称", "客服电话", "默认语言", "默认时区"] },
      { title: "交易配置", fields: ["订单超时取消", "默认运费", "支付有效期", "库存锁定时间"] },
      { title: "售后配置", fields: ["售后有效期", "自动同意退款", "退货仓地址", "协议版本"] }
    ],
    sideCards: ["基础配置", "交易规则", "售后规则", "安全策略"]
  },
  {
    kind: "list",
    id: "operation-logs",
    groupId: "group09",
    title: "操作日志",
    eyebrow: "系统设置 / 操作日志",
    description: "记录后台关键操作，用于审计追溯、异常排查和安全复核。",
    filters: ["操作人", "操作模块", "操作动作", "操作时间"],
    actions: [{ label: "导出日志", variant: "primary" }, { label: "清空筛选" }],
    metrics: [
      { label: "今日日志", value: "1,284", delta: "+12%", tone: "blue" },
      { label: "失败操作", value: "7", delta: "+2", tone: "orange" },
      { label: "高危操作", value: "3", delta: "0", tone: "red" },
      { label: "审计通过", value: "99.4%", delta: "+0.2", tone: "green" }
    ],
    columns: systemColumns,
    rows: [
      { id: "l1", cells: { operator: "陈运营", module: "商品", action: "编辑商品", ip: "10.0.0.12", time: "07-05 09:20", result: "成功" }, status: "成功" },
      { id: "l2", cells: { operator: "赵客服", module: "售后", action: "审核退款", ip: "10.0.0.18", time: "07-05 09:12", result: "成功" }, status: "成功" },
      { id: "l3", cells: { operator: "系统", module: "订单", action: "自动取消", ip: "127.0.0.1", time: "07-05 09:00", result: "成功" }, status: "成功" }
    ]
  },
  {
    kind: "list",
    id: "data-export",
    groupId: "group09",
    title: "数据导出",
    eyebrow: "系统设置 / 数据导出",
    description: "统一管理订单、用户、财务等数据导出任务，控制文件有效期和权限。",
    filters: ["任务名称", "数据范围", "任务状态", "创建时间"],
    actions: [{ label: "新建导出", variant: "primary" }, { label: "批量下载" }],
    metrics: [
      { label: "导出任务", value: "36", delta: "+8", tone: "blue" },
      { label: "生成中", value: "4", delta: "+1", tone: "orange" },
      { label: "可下载", value: "22", delta: "-3", tone: "green" },
      { label: "过期文件", value: "10", delta: "+2", tone: "gray" }
    ],
    columns: settlementColumns,
    rows: [
      { id: "d1", cells: { name: "订单明细 07-04", owner: "订单", amount: "12.8 MB", status: "已完成", time: "陈运营", action: "下载" }, status: "已完成" },
      { id: "d2", cells: { name: "用户列表", owner: "用户", amount: "8.2 MB", status: "生成中", time: "系统", action: "刷新" }, status: "生成中" },
      { id: "d3", cells: { name: "支付流水", owner: "财务", amount: "4.6 MB", status: "已完成", time: "财务专员", action: "下载" }, status: "已完成" }
    ]
  }
];

export const iconMap = {
  "dashboard-overview": BarChart3,
  products: PackageCheck,
  "product-edit": Tags,
  categories: Boxes,
  brands: BadgeCheck,
  inventory: DatabaseBackup,
  "product-audit": ShieldCheck,
  "order-list": ClipboardList,
  "order-detail": ClipboardList,
  "shipping-management": Truck,
  "logistics-tracking": Route,
  "aftersale-list": FileClock,
  "aftersale-detail": FileClock,
  "user-list": UsersRound,
  "user-detail": UsersRound,
  "member-levels": BadgeCheck,
  "points-records": DatabaseBackup,
  "coupon-management": BadgeCheck,
  "promotion-activities": BadgeCheck,
  "homepage-layout": Boxes,
  "recommendation-slots": BadgeCheck,
  "payment-flow": CircleDollarSign,
  "refund-flow": CircleDollarSign,
  "merchant-settlements": CircleDollarSign,
  reconciliation: FileClock,
  "merchant-info": Store,
  employees: UsersRound,
  roles: KeyRound,
  "permission-matrix": ShieldCheck,
  "support-tickets": Headphones,
  "ticket-detail": Headphones,
  "invoice-management": FileClock,
  "message-notifications": FileClock,
  "help-articles": FileClock,
  "system-config": Settings,
  "operation-logs": FileClock,
  "data-export": FileDown
};
