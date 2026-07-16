import type {
  MerchantCategory,
  MerchantAccount,
  MerchantCustomer,
  MerchantCustomerDetail,
  MerchantCustomerOverview,
  MerchantDashboardAnalytics,
  MerchantDashboardOverview,
  MerchantInventoryAlert,
  MerchantInventoryLog,
  MerchantAfterSale,
  MerchantCoupon,
  MerchantOrder,
  MerchantProduct,
  MerchantRole,
  MerchantSettlement,
  MerchantSettlementEntry,
  MerchantUser,
  PageResponse
} from "./merchantApi";
import type { AdminPageData, DashboardPageData, DetailPageData, FormPageData, ListPageData, MatrixPageData, Metric, TableRow } from "../types";

const currency = new Intl.NumberFormat("zh-CN", {
  style: "currency",
  currency: "CNY",
  maximumFractionDigits: 2
});

const number = new Intl.NumberFormat("zh-CN");

const formatMoney = (cents: number) => currency.format(cents / 100).replace("CN¥", "¥");

const formatTime = (value?: string) => {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const hour = String(date.getHours()).padStart(2, "0");
  const minute = String(date.getMinutes()).padStart(2, "0");
  return `${month}-${day} ${hour}:${minute}`;
};

const formatDate = (value?: string) => {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
};

const settlementEntryTypeLabel: Record<string, string> = {
  sale: "销售收入",
  commission: "平台佣金",
  refund: "退款冲减",
  commission_refund: "佣金退回",
  adjustment: "人工调账"
};

const productStatus = (status: number) => {
  if (status === 1) return "在售";
  if (status === 0) return "草稿";
  return "停用";
};

const categoryStatus = (status: number) => status === 1 ? "启用" : "停用";

const alertSeverity = (severity: string) => severity === "out_of_stock" ? "缺货风险" : "预警";

const maxChartHeight = 180;

const buildChartBars = (analytics: MerchantDashboardAnalytics) => {
  const values = analytics.sales_trend.map((item) => item.paid_amount);
  const max = Math.max(...values, 1);
  return values.map((value) => Math.max(36, Math.round((value / max) * maxChartHeight)));
};

const tableSubtitle = <T,>(page: PageResponse<T>) => `共 ${number.format(page.total)} 条 · 每页 ${page.page_size} 条`;

const pagination = <T,>(page: PageResponse<T>) => ({
  page: page.page,
  pageSize: page.page_size,
  total: page.total
});

const cloneListPage = (pages: AdminPageData[], id: string): ListPageData => {
  const page = pages.find((item): item is ListPageData => item.id === id && item.kind === "list");
  if (!page) throw new Error(`未找到列表页面：${id}`);
  return page;
};

const cloneDashboardPage = (pages: AdminPageData[]): DashboardPageData => {
  const page = pages.find((item): item is DashboardPageData => item.id === "dashboard-overview" && item.kind === "dashboard");
  if (!page) throw new Error("未找到工作台页面");
  return page;
};

const cloneFormPage = (pages: AdminPageData[], id: string): FormPageData => {
  const page = pages.find((item): item is FormPageData => item.id === id && item.kind === "form");
  if (!page) throw new Error(`未找到表单页面：${id}`);
  return page;
};

const cloneMatrixPage = (pages: AdminPageData[], id: string): MatrixPageData => {
  const page = pages.find((item): item is MatrixPageData => item.id === id && item.kind === "matrix");
  if (!page) throw new Error(`未找到矩阵页面：${id}`);
  return page;
};

const cloneDetailPage = (pages: AdminPageData[], id: string): DetailPageData => {
  const page = pages.find((item): item is DetailPageData => item.id === id && item.kind === "detail");
  if (!page) throw new Error(`未找到详情页面：${id}`);
  return page;
};

const permissionLabel: Record<string, string> = {
  "dashboard:read": "工作台查看",
  "order:read": "订单查看",
  "order:ship": "订单发货",
  "catalog:read": "商品查看",
  "catalog:write": "商品编辑",
  "inventory:read": "库存查看",
  "inventory:write": "库存调整",
  "upload:write": "图片上传",
  "account:read": "员工查看",
  "account:write": "员工管理",
  "customer:read": "顾客查看",
  "after_sale:read": "售后查看",
  "after_sale:write": "售后审核退款",
  "marketing:read": "营销查看",
  "marketing:write": "营销管理",
  "settlement:read": "财务结算查看"
};

const mapOrderRow = (order: MerchantOrder): TableRow => ({
  id: String(order.id),
  cells: {
    orderNo: order.order_no,
    buyer: order.receiver_name || `用户 ${order.user_id}`,
    amount: formatMoney(order.payable_amount),
    status: order.status_text,
    time: formatTime(order.created_at),
    action: "详情"
  },
  status: order.status_text
});

export const buildMerchantRemotePages = (
  staticPages: AdminPageData[],
  input: {
    user: MerchantUser;
    overview: MerchantDashboardOverview;
    analytics: MerchantDashboardAnalytics;
    products: PageResponse<MerchantProduct>;
    categories: MerchantCategory[];
    categoryPageItems?: MerchantCategory[];
    orders: PageResponse<MerchantOrder>;
    inventoryAlerts: PageResponse<MerchantInventoryAlert>;
    inventoryLogs?: PageResponse<MerchantInventoryLog>;
    accounts?: PageResponse<MerchantAccount>;
    roles?: MerchantRole[];
    customerOverview?: MerchantCustomerOverview;
    customers?: PageResponse<MerchantCustomer>;
    afterSales?: PageResponse<MerchantAfterSale>;
    coupons?: PageResponse<MerchantCoupon>;
    settlements?: PageResponse<MerchantSettlement>;
    settlementEntries?: PageResponse<MerchantSettlementEntry>;
  }
): Partial<Record<string, AdminPageData>> => {
	const can = (permission: string) => input.user.permissions.includes(permission);
  const canReadDashboard = can("dashboard:read");
  const categoriesById = new Map(input.categories.map((item) => [item.id, item.name]));
  const categoryPageItems = input.categoryPageItems ?? input.categories;
  const productStocks = input.products.list.map((product) => product.skus.reduce((sum, sku) => sum + sku.stock, 0));
  const lowStockCount = input.inventoryAlerts.total;
  const outOfStockCount = input.inventoryAlerts.list.filter((item) => item.severity === "out_of_stock").length;

  const dashboard = cloneDashboardPage(staticPages);
  const metrics: Metric[] = [
    { label: "今日 GMV", value: formatMoney(input.overview.today_paid_amount), delta: `${number.format(input.overview.today_paid_orders)} 单`, tone: "red" },
    { label: "待发货订单", value: number.format(input.overview.pending_shipment_orders), delta: "待处理", tone: "blue" },
    { label: "在售商品", value: number.format(input.overview.on_sale_products), delta: `${number.format(input.overview.total_products)} 商品`, tone: "green" },
    { label: "库存预警", value: number.format(input.overview.low_stock_skus + input.overview.out_of_stock_skus), delta: `${number.format(input.overview.out_of_stock_skus)} 缺货`, tone: "purple" }
  ];

  const dashboardPage: DashboardPageData = {
    ...dashboard,
    metrics,
    todos: [
      `待处理发货 ${number.format(input.overview.pending_shipment_orders)} 单`,
      `待支付订单 ${number.format(input.overview.pending_payment_orders)} 单`,
      `库存预警 ${number.format(input.overview.low_stock_skus)} 个 SKU`,
      `缺货 SKU ${number.format(input.overview.out_of_stock_skus)} 个`
    ],
    chartBars: buildChartBars(input.analytics),
    tableTitle: "热销商品",
    tableSubtitle: `${input.analytics.start_date || "-"} 至 ${input.analytics.end_date || "-"}`,
    columns: [
      { key: "rank", label: "排名" },
      { key: "product", label: "商品" },
      { key: "orders", label: "成交订单" },
      { key: "quantity", label: "销量" },
      { key: "amount", label: "销售额" }
    ],
    rows: input.analytics.top_products.map((product, index) => ({
      id: String(product.product_id),
      cells: {
        rank: String(index + 1),
        product: product.product_name,
        orders: number.format(product.paid_orders),
        quantity: number.format(product.quantity),
        amount: formatMoney(product.sales_amount)
      }
    }))
  };

  const products = cloneListPage(staticPages, "products");
  const productPage: ListPageData = {
    ...products,
	...pagination(input.products),
	actions: can("catalog:write") ? [{ label: "新增商品", variant: "primary" }] : [],
    tableSubtitle: tableSubtitle(input.products),
    metrics: [
      { label: canReadDashboard ? "商品总数" : "当前筛选商品", value: number.format(canReadDashboard ? input.overview.total_products : input.products.total), delta: "接口同步", tone: "blue" },
      { label: canReadDashboard ? "在售商品" : "本页在售", value: number.format(canReadDashboard ? input.overview.on_sale_products : input.products.list.filter((item) => item.status === 1).length), delta: canReadDashboard ? "实时" : "本页统计", tone: "green" },
      { label: "低库存 SKU", value: number.format(lowStockCount), delta: `缺货 ${number.format(outOfStockCount)}`, tone: "orange" },
      { label: "最高库存", value: number.format(Math.max(...productStocks, 0)), delta: "SKU 汇总", tone: "purple" }
    ],
    rows: input.products.list.map((product) => {
      const firstSku = product.skus[0];
      const stock = product.skus.reduce((sum, sku) => sum + sku.stock, 0);
      return {
        id: String(product.id),
        cells: {
          name: product.name,
          category: categoriesById.get(product.category_id) ?? `分类 ${product.category_id}`,
          price: firstSku ? formatMoney(firstSku.price) : "-",
          stock: number.format(stock),
          status: productStatus(product.status),
          action: can("catalog:write") ? "编辑" : "-"
        },
        status: productStatus(product.status)
      };
    })
  };

  const categories = cloneListPage(staticPages, "categories");
  const categoryPage: ListPageData = {
    ...categories,
	page: 1,
	pageSize: Math.max(categoryPageItems.length, 1),
	total: categoryPageItems.length,
	actions: can("catalog:write") ? [{ label: "新增分类", variant: "primary" }] : [],
    tableSubtitle: `共 ${number.format(categoryPageItems.length)} 条`,
    metrics: [
      { label: "分类总数", value: number.format(input.categories.length), delta: "接口同步", tone: "blue" },
      { label: "启用分类", value: number.format(input.categories.filter((item) => item.status === 1).length), delta: "实时", tone: "green" },
      { label: "隐藏分类", value: number.format(input.categories.filter((item) => item.status !== 1).length), delta: "待检查", tone: "orange" },
      { label: "关联商品", value: number.format(input.products.total), delta: "商品总数", tone: "purple" }
    ],
    rows: categoryPageItems.map((category) => ({
      id: String(category.id),
      cells: {
        name: category.name,
        owner: category.parent_id > 0 ? `上级 ${category.parent_id}` : "一级分类",
        amount: `排序 ${category.sort}`,
        status: categoryStatus(category.status),
        time: `商户 ${category.merchant_id}`,
        action: can("catalog:write") ? "编辑" : "-"
      },
      status: categoryStatus(category.status)
    }))
  };

  const orders = cloneListPage(staticPages, "order-list");
  const orderPage: ListPageData = {
    ...orders,
    ...pagination(input.orders),
    actions: [],
    tableSubtitle: tableSubtitle(input.orders),
    metrics: [
      { label: canReadDashboard ? "今日订单" : "当前筛选订单", value: number.format(canReadDashboard ? input.overview.today_paid_orders : input.orders.total), delta: canReadDashboard ? "已支付" : "接口同步", tone: "blue" },
      { label: canReadDashboard ? "待发货" : "本页待发货", value: number.format(canReadDashboard ? input.overview.pending_shipment_orders : input.orders.list.filter((item) => item.status === 2).length), delta: "待处理", tone: "orange" },
      { label: canReadDashboard ? "待支付" : "本页待支付", value: number.format(canReadDashboard ? input.overview.pending_payment_orders : input.orders.list.filter((item) => item.status === 1).length), delta: "待转化", tone: "red" },
      { label: canReadDashboard ? "累计成交" : "本页订单金额", value: formatMoney(canReadDashboard ? input.overview.total_paid_amount : input.orders.list.reduce((sum, item) => sum + item.payable_amount, 0)), delta: canReadDashboard ? `${number.format(input.overview.total_paid_orders)} 单` : `${number.format(input.orders.list.length)} 单`, tone: "green" }
    ],
    rows: input.orders.list.map(mapOrderRow)
  };

  const inventory = cloneListPage(staticPages, "inventory");
  const inventoryPage: ListPageData = {
    ...inventory,
	...pagination(input.inventoryAlerts),
	actions: [],
    tableSubtitle: tableSubtitle(input.inventoryAlerts),
    metrics: [
      { label: "预警 SKU", value: number.format(input.inventoryAlerts.total), delta: "接口同步", tone: "orange" },
      { label: "缺货 SKU", value: number.format(outOfStockCount), delta: "需补货", tone: "red" },
      { label: "低库存", value: number.format(input.inventoryAlerts.total - outOfStockCount), delta: "低于阈值", tone: "blue" },
      { label: "库存商品", value: number.format(input.products.total), delta: "商品总数", tone: "green" }
    ],
    rows: input.inventoryAlerts.list.map((alert) => ({
      id: `${alert.product_id}-${alert.sku_id}`,
      cells: {
        name: alert.sku_name,
        owner: alert.product_name,
        amount: `${number.format(alert.stock)} / 预警线 ${number.format(alert.low_stock_threshold)}`,
        status: alertSeverity(alert.severity),
        time: formatTime(alert.updated_at),
        action: can("inventory:write") ? "补货" : "-"
      },
      status: alertSeverity(alert.severity)
    }))
  };

  const inventoryLogPage: ListPageData | undefined = input.inventoryLogs ? {
    kind: "list",
    id: "inventory-logs",
    groupId: "group02",
    title: "库存流水",
    eyebrow: "商品中心 / 库存流水",
    description: "查询库存变更前后数量、业务来源和操作人，作为库存审计依据。",
    filters: [],
    actions: [],
    metrics: [
      { label: "流水总数", value: number.format(input.inventoryLogs.total), delta: "当前筛选", tone: "blue" },
      { label: "本页入库", value: number.format(input.inventoryLogs.list.filter((item) => item.quantity > 0).reduce((sum, item) => sum + item.quantity, 0)), delta: "库存增加", tone: "green" },
      { label: "本页出库", value: number.format(Math.abs(input.inventoryLogs.list.filter((item) => item.quantity < 0).reduce((sum, item) => sum + item.quantity, 0))), delta: "库存减少", tone: "orange" },
      { label: "人工调整", value: number.format(input.inventoryLogs.list.filter((item) => item.change_type === "merchant_adjustment").length), delta: "本页记录", tone: "purple" }
    ],
    columns: [
      { key: "name", label: "商品 / SKU" },
      { key: "change", label: "变更" },
      { key: "stock", label: "变更前后" },
      { key: "source", label: "业务来源" },
      { key: "operator", label: "操作人" },
      { key: "time", label: "发生时间" }
    ],
    rows: input.inventoryLogs.list.map((item) => ({
      id: String(item.id),
      cells: {
        name: `${item.product_name} / ${item.sku_name}`,
        change: `${item.quantity > 0 ? "+" : ""}${item.quantity} · ${item.change_type}`,
        stock: `${item.before_stock} -> ${item.after_stock}`,
        source: item.reference_type ? `${item.reference_type} #${item.reference_id}` : item.remark || "人工操作",
        operator: `${item.operator_type || "system"} #${item.operator_id || 0}`,
        time: formatTime(item.created_at)
      }
    })),
    tableSubtitle: tableSubtitle(input.inventoryLogs),
    ...pagination(input.inventoryLogs)
  } : undefined;

  const merchantInfo = cloneFormPage(staticPages, "merchant-info");
  const merchantInfoPage: FormPageData = {
    ...merchantInfo,
    description: "维护当前登录商户主体、账号角色、权限数量和经营状态。",
    fieldValues: {
      "商户名称": input.user.merchant_name,
      "联系人": input.user.nickname || input.user.username,
      "联系电话": input.user.username,
      "经营类目": `角色 ${input.user.role}`,
      "营业执照": `商户 ID ${input.user.merchant_id}`,
      "结算账户": `账号 ID ${input.user.id}`,
      "客服电话": `权限 ${input.user.permissions.length} 项`
    }
  };

  let employeePage: ListPageData | undefined;
  let rolePage: ListPageData | undefined;
  let permissionMatrixPage: MatrixPageData | undefined;
  let customerPage: ListPageData | undefined;
  let afterSalePage: ListPageData | undefined;
  let couponPage: ListPageData | undefined;
  let settlementPage: ListPageData | undefined;
  let settlementEntryPage: ListPageData | undefined;
  if (input.accounts && input.roles) {
    const employees = cloneListPage(staticPages, "employees");
    const enabledAccounts = input.accounts.list.filter((account) => account.status === 1).length;
    const canManageAccount = (account: MerchantAccount) => input.user.role === "owner"
      || (input.user.role === "admin" && account.role !== "owner" && account.role !== "admin");
    employeePage = {
      ...employees,
      ...pagination(input.accounts),
      tableSubtitle: tableSubtitle(input.accounts),
      actions: can("account:write") ? [{ label: "新增员工", variant: "primary" }] : [],
      metrics: [
        { label: "员工账号", value: number.format(input.accounts.total), delta: "接口同步", tone: "blue" },
        { label: "启用账号", value: number.format(enabledAccounts), delta: "可登录", tone: "green" },
        { label: "停用账号", value: number.format(input.accounts.list.length - enabledAccounts), delta: "不可登录", tone: "gray" },
        { label: "角色数量", value: number.format(input.roles.length), delta: "固定 RBAC", tone: "purple" }
      ],
      rows: input.accounts.list.map((account) => ({
        id: String(account.id),
        cells: {
          name: account.nickname,
          phone: account.username,
          role: account.role_name,
          lastLogin: formatTime(account.last_login_at),
          status: account.status === 1 ? "启用" : "停用",
          action: can("account:write") && canManageAccount(account) ? "编辑" : "-"
        },
        status: account.status === 1 ? "启用" : "停用"
      }))
    };

    const roles = cloneListPage(staticPages, "roles");
    rolePage = {
      ...roles,
      description: "查看系统固定岗位角色、成员数量和实际接口权限。",
      actions: [],
      tableSubtitle: `共 ${number.format(input.roles.length)} 个固定角色`,
      metrics: [
        { label: "固定角色", value: number.format(input.roles.length), delta: "RBAC", tone: "blue" },
        { label: "授权成员", value: number.format(input.roles.reduce((sum, role) => sum + role.member_count, 0)), delta: "当前商户", tone: "green" },
        { label: "高权限角色", value: "2", delta: "店主 / 管理员", tone: "orange" },
        { label: "权限项", value: number.format(Object.keys(permissionLabel).length), delta: "接口权限", tone: "purple" }
      ],
      rows: input.roles.map((role) => ({
        id: role.role,
        cells: {
          role: role.name,
          members: number.format(role.member_count),
          scope: `${role.permissions.length} 项接口权限`,
          createdAt: "系统内置",
          status: "启用",
          action: "-"
        },
        status: "启用"
      }))
    };

    const matrix = cloneMatrixPage(staticPages, "permission-matrix");
    permissionMatrixPage = {
      ...matrix,
      description: "查看固定岗位角色对应的真实接口权限，权限变更需由后端版本发布。",
      modules: Object.values(permissionLabel),
      roles: input.roles.map((role) => ({
        role: role.name,
        permissions: role.permissions.map((permission) => permissionLabel[permission] ?? permission)
      }))
    };
  }

  if (input.customerOverview && input.customers) {
    const customers = cloneListPage(staticPages, "user-list");
    customerPage = {
      ...customers,
      ...pagination(input.customers),
      description: "查看在当前商户完成过支付的顾客、复购情况和累计成交金额。",
      filters: ["昵称 / 手机号", "仅看复购顾客"],
      actions: [],
      tableSubtitle: tableSubtitle(input.customers),
      metrics: [
        { label: "成交顾客", value: number.format(input.customerOverview.total_customers), delta: "累计", tone: "blue" },
        { label: "30 天新客", value: number.format(input.customerOverview.new_customers_30d), delta: "首次成交", tone: "green" },
        { label: "复购顾客", value: number.format(input.customerOverview.repeat_customers), delta: `${(input.customerOverview.repeat_rate_bps / 100).toFixed(2)}%`, tone: "purple" },
        { label: "30 天活跃", value: number.format(input.customerOverview.active_customers_30d), delta: "最近成交", tone: "orange" }
      ],
      rows: input.customers.list.map((customer) => ({
        id: String(customer.user_id),
        cells: {
          name: customer.nickname,
          phone: customer.mobile_masked || "-",
          level: customer.is_repeat ? "复购顾客" : "首购顾客",
          orders: number.format(customer.paid_orders),
          amount: formatMoney(customer.total_paid_amount),
          action: "详情"
        }
      }))
    };
  }

  if (input.afterSales) {
    const page = cloneListPage(staticPages, "aftersale-list");
    const pending = input.afterSales.list.filter((item) => item.status === 1).length;
    const failed = input.afterSales.list.filter((item) => item.status === 6).length;
    afterSalePage = {
      ...page,
      ...pagination(input.afterSales),
      description: "审核当前商户的真实售后申请并跟踪原路退款结果。",
      actions: [],
      tableSubtitle: tableSubtitle(input.afterSales),
      metrics: [
        { label: "售后申请", value: number.format(input.afterSales.total), delta: "当前商户", tone: "blue" },
        { label: "待审核", value: number.format(pending), delta: "需处理", tone: "orange" },
        { label: "退款失败", value: number.format(failed), delta: "可重试", tone: "red" },
        { label: "本页退款", value: formatMoney(input.afterSales.list.filter((item) => item.status === 3).reduce((sum, item) => sum + item.refund_amount, 0)), delta: "已完成", tone: "green" }
      ],
      rows: input.afterSales.list.map((item) => ({
        id: String(item.id),
        cells: {
          serviceNo: item.after_sale_no,
          buyer: `用户 ${item.user_id} · ${item.order_no}`,
          type: `${item.type_text} · ${item.product_name} / ${item.sku_name}`,
          amount: formatMoney(item.refund_amount),
          status: item.status_text,
          action: "详情"
        },
        status: item.status_text
      }))
    };
  }

  if (input.coupons) {
    const page = cloneListPage(staticPages, "coupon-management");
    couponPage = {
      ...page,
      ...pagination(input.coupons),
      description: "创建和维护当前商户优惠券，跟踪领取与核销数量。",
      actions: can("marketing:write") ? [{ label: "新增优惠券", variant: "primary" }] : [],
      tableSubtitle: tableSubtitle(input.coupons),
      metrics: [
        { label: "优惠券", value: number.format(input.coupons.total), delta: "当前商户", tone: "blue" },
        { label: "发放中", value: number.format(input.coupons.list.filter((item) => item.status === 1).length), delta: "可领取", tone: "green" },
        { label: "已领取", value: number.format(input.coupons.list.reduce((sum, item) => sum + item.claimed_quantity, 0)), delta: "本页", tone: "orange" },
        { label: "已核销", value: number.format(input.coupons.list.reduce((sum, item) => sum + item.used_quantity, 0)), delta: "本页", tone: "purple" }
      ],
      rows: input.coupons.list.map((item) => ({ id: String(item.id), cells: { name: item.name, owner: `满 ${formatMoney(item.threshold_amount)}`, amount: `减 ${formatMoney(item.discount_amount)}`, status: item.status_text, time: `${item.claimed_quantity}/${item.total_quantity}`, action: can("marketing:write") ? "编辑" : "-" }, status: item.status_text }))
    };
  }

  if (input.settlements && input.settlementEntries) {
    const page = cloneListPage(staticPages, "merchant-settlements");
    const pendingAmount = input.settlements.list
      .filter((item) => item.status !== 3)
      .reduce((sum, item) => sum + item.net_amount, 0);
    const paidAmount = input.settlements.list
      .filter((item) => item.status === 3)
      .reduce((sum, item) => sum + item.net_amount, 0);
    const unassignedEntries = input.settlementEntries.list.filter((item) => !item.settlement_id).length;
    settlementPage = {
      ...page,
      ...pagination(input.settlements),
      description: "只读查看当前商户的周期结算单，核对销售收入、佣金、退款与最终净额。",
      filters: ["结算状态"],
      actions: [],
      tableSubtitle: tableSubtitle(input.settlements),
      metrics: [
        { label: "结算单", value: number.format(input.settlements.total), delta: "当前商户", tone: "blue" },
        { label: "本页待打款", value: formatMoney(pendingAmount), delta: "待确认或待打款", tone: "orange" },
        { label: "本页已打款", value: formatMoney(paidAmount), delta: "已完成", tone: "green" },
        { label: "账本流水", value: number.format(input.settlementEntries.total), delta: `本页 ${unassignedEntries} 条未归集`, tone: "purple" }
      ],
      columns: [
        { key: "settlementNo", label: "结算单号" },
        { key: "period", label: "结算周期" },
        { key: "gross", label: "销售收入" },
        { key: "commission", label: "平台佣金" },
        { key: "refund", label: "退款冲减" },
        { key: "net", label: "结算净额" },
        { key: "status", label: "状态" },
        { key: "action", label: "操作" }
      ],
      rows: input.settlements.list.map((item) => ({
        id: String(item.id),
        cells: {
          settlementNo: item.settlement_no,
          period: `${formatDate(item.period_start)} 至 ${formatDate(item.period_end)}`,
          gross: formatMoney(item.gross_amount),
          commission: formatMoney(item.commission_amount),
          refund: formatMoney(item.refund_amount),
          net: formatMoney(item.net_amount),
          status: item.status_text,
          action: "明细"
        },
        status: item.status_text
      }))
    };

    settlementEntryPage = {
      kind: "list",
      id: "settlement-entries",
      groupId: "finance",
      title: "结算账本",
      eyebrow: "财务结算 / 结算账本",
      description: "只读查看销售、佣金、退款和佣金退回流水；历史流水不会被修改，只会通过新流水冲正。",
      filters: ["流水类型"],
      actions: [],
      metrics: [
        { label: "账本流水", value: number.format(input.settlementEntries.total), delta: "当前筛选", tone: "blue" },
        { label: "本页销售", value: formatMoney(input.settlementEntries.list.filter((item) => item.entry_type === "sale").reduce((sum, item) => sum + item.amount, 0)), delta: "正向收入", tone: "green" },
        { label: "本页退款", value: formatMoney(Math.abs(input.settlementEntries.list.filter((item) => item.entry_type === "refund").reduce((sum, item) => sum + item.amount, 0))), delta: "冲减收入", tone: "orange" },
        { label: "未归集流水", value: number.format(unassignedEntries), delta: "当前页", tone: "purple" }
      ],
      columns: [
        { key: "entryNo", label: "流水号" },
        { key: "type", label: "流水类型" },
        { key: "business", label: "关联业务" },
        { key: "amount", label: "金额" },
        { key: "availableAt", label: "可结算时间" },
        { key: "settlement", label: "归集状态" },
        { key: "createdAt", label: "入账时间" }
      ],
      rows: input.settlementEntries.list.map((item) => ({
        id: String(item.id),
        cells: {
          entryNo: item.entry_no,
          type: settlementEntryTypeLabel[item.entry_type] ?? item.entry_type,
          business: item.refund_id ? `退款 #${item.refund_id}` : item.order_id ? `订单 #${item.order_id}` : "调账",
          amount: formatMoney(item.amount),
          availableAt: formatTime(item.available_at),
          settlement: item.settlement_id ? `结算单 #${item.settlement_id}` : "未归集",
          createdAt: formatTime(item.created_at)
        }
      })),
      tableSubtitle: tableSubtitle(input.settlementEntries),
      ...pagination(input.settlementEntries)
    };
  }

  return {
    "dashboard-overview": dashboardPage,
    products: productPage,
    categories: categoryPage,
    inventory: inventoryPage,
    ...(inventoryLogPage ? { "inventory-logs": inventoryLogPage } : {}),
    "order-list": orderPage,
  "merchant-info": merchantInfoPage,
  ...(employeePage ? { employees: employeePage } : {}),
  ...(rolePage ? { roles: rolePage } : {}),
    ...(permissionMatrixPage ? { "permission-matrix": permissionMatrixPage } : {}),
    ...(customerPage ? { "user-list": customerPage } : {}),
    ...(afterSalePage ? { "aftersale-list": afterSalePage } : {}),
    ...(couponPage ? { "coupon-management": couponPage } : {}),
    ...(settlementPage ? { "merchant-settlements": settlementPage } : {}),
    ...(settlementEntryPage ? { "settlement-entries": settlementEntryPage } : {})
  };
};

export const buildMerchantSettlementDetailPage = (settlement: MerchantSettlement): DetailPageData => ({
  kind: "detail",
  id: "merchant-settlement-detail",
  groupId: "finance",
  title: "结算单详情",
  eyebrow: "财务结算 / 商户结算 / 结算单详情",
  description: "核对该周期内已经归集的不可变账本流水和结算金额。",
  summary: [
    { label: "结算单号", value: settlement.settlement_no },
    { label: "结算周期", value: `${formatDate(settlement.period_start)} 至 ${formatDate(settlement.period_end)}` },
    { label: "销售收入", value: formatMoney(settlement.gross_amount) },
    { label: "平台佣金", value: formatMoney(settlement.commission_amount) },
    { label: "退款冲减", value: formatMoney(settlement.refund_amount) },
    { label: "结算净额", value: formatMoney(settlement.net_amount) },
    { label: "结算状态", value: settlement.status_text },
    { label: "打款时间", value: formatTime(settlement.paid_at) }
  ],
  steps: [
    "交易账本入账",
    "生成周期结算单",
    settlement.status >= 2 ? "商户已确认" : "等待确认",
    settlement.status >= 3 ? "平台已打款" : "等待打款"
  ],
  tableTitle: "结算流水",
  columns: [
    { key: "entryNo", label: "流水号" },
    { key: "type", label: "类型" },
    { key: "business", label: "关联业务" },
    { key: "amount", label: "金额" },
    { key: "availableAt", label: "可结算时间" }
  ],
  rows: (settlement.entries ?? []).map((entry) => ({
    id: String(entry.id),
    cells: {
      entryNo: entry.entry_no,
      type: settlementEntryTypeLabel[entry.entry_type] ?? entry.entry_type,
      business: entry.refund_id ? `退款 #${entry.refund_id}` : entry.order_id ? `订单 #${entry.order_id}` : "调账",
      amount: formatMoney(entry.amount),
      availableAt: formatTime(entry.available_at)
    }
  })),
  actions: []
});

export const buildMerchantOrderDetailPage = (staticPages: AdminPageData[], order: MerchantOrder, canShip = false): DetailPageData => {
  const page = cloneDetailPage(staticPages, "order-detail");
  const shipmentSummary = order.shipment ? [
    { label: "配送方式", value: order.shipment.delivery_type === "self_delivery" ? "商家自配送" : "普通快递" },
    { label: "物流信息", value: order.shipment.delivery_type === "self_delivery" ? "商家配送中" : `${order.shipment.logistics_company} ${order.shipment.tracking_no}` },
    { label: "发货时间", value: formatTime(order.shipment.shipped_at) },
    { label: "预计送达", value: formatTime(order.shipment.estimated_arrival_at) }
  ] : [];
  return {
    ...page,
    description: "查看真实订单金额、收件信息、商品明细和发货记录。",
    summary: [
      { label: "订单状态", value: order.status_text },
      { label: "订单金额", value: formatMoney(order.payable_amount) },
      { label: "收货人", value: `${order.receiver_name} ${order.receiver_phone}` },
      { label: "收货地址", value: order.receiver_address },
      ...shipmentSummary
    ],
    steps: ["买家下单", order.paid_at ? "买家支付" : "等待支付", order.shipment ? "商家发货" : "等待发货", order.completed_at ? "确认收货" : "等待收货"],
    tableTitle: "商品明细",
    rows: order.items.map((item) => ({
      id: String(item.id),
      cells: {
        time: item.sku_name,
        operator: item.product_name,
        action: `${item.quantity} 件`,
        content: item.discount_amount > 0 ? `${formatMoney(item.subtotal)} - ${formatMoney(item.discount_amount)}` : formatMoney(item.subtotal),
        result: formatMoney(item.payable_amount)
      },
      status: "成功"
    })),
    actions: canShip && order.status === 2 ? [{ label: "填写物流并发货", variant: "primary" }] : []
  };
};

export const buildMerchantCustomerDetailPage = (
  staticPages: AdminPageData[],
  detail: MerchantCustomerDetail
): DetailPageData => {
  const page = cloneDetailPage(staticPages, "user-detail");
  const customer = detail.customer;
  return {
    ...page,
    description: "查看当前商户内的顾客成交概况与最近订单，不包含其他商户数据。",
    summary: [
      { label: "顾客", value: customer.nickname },
      { label: "手机号", value: customer.mobile_masked || "-" },
      { label: "成交订单", value: `${number.format(customer.paid_orders)} 单` },
      { label: "累计成交", value: formatMoney(customer.total_paid_amount) }
    ],
    steps: ["注册账号", "首次成交", customer.is_repeat ? "产生复购" : "等待复购", "最近成交"],
    tableTitle: "当前商户最近订单",
    rows: detail.recent_orders.map((order) => ({
      id: String(order.id),
      cells: {
        orderNo: order.order_no,
        buyer: customer.nickname,
        amount: formatMoney(order.payable_amount),
        status: order.status_text,
        time: formatTime(order.created_at),
        action: "查看"
      },
      status: order.status_text
    }))
  };
};
