import type {
  MerchantCategory,
  MerchantAccount,
  MerchantCustomer,
  MerchantCustomerDetail,
  MerchantCustomerOverview,
  MerchantDashboardAnalytics,
  MerchantDashboardOverview,
  MerchantInventoryAlert,
  MerchantAfterSale,
  MerchantCoupon,
  MerchantOrder,
  MerchantProduct,
  MerchantRole,
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
  "marketing:write": "营销管理"
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
    orders: PageResponse<MerchantOrder>;
    inventoryAlerts: PageResponse<MerchantInventoryAlert>;
    accounts?: PageResponse<MerchantAccount>;
    roles?: MerchantRole[];
    customerOverview?: MerchantCustomerOverview;
    customers?: PageResponse<MerchantCustomer>;
    afterSales?: PageResponse<MerchantAfterSale>;
    coupons?: PageResponse<MerchantCoupon>;
  }
): Partial<Record<string, AdminPageData>> => {
	const can = (permission: string) => input.user.permissions.includes(permission);
  const categoriesById = new Map(input.categories.map((item) => [item.id, item.name]));
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
    rows: input.orders.list.slice(0, 5).map((order) => ({
      id: String(order.id),
      cells: {
        orderNo: order.order_no,
        buyer: order.receiver_name || `用户 ${order.user_id}`,
        amount: formatMoney(order.payable_amount),
        status: order.status_text,
        time: formatTime(order.created_at).slice(6)
      },
      status: order.status_text
    }))
  };

  const products = cloneListPage(staticPages, "products");
  const productPage: ListPageData = {
    ...products,
	actions: can("catalog:write") ? products.actions : [],
    tableSubtitle: tableSubtitle(input.products),
    metrics: [
      { label: "商品总数", value: number.format(input.overview.total_products), delta: "接口同步", tone: "blue" },
      { label: "在售商品", value: number.format(input.overview.on_sale_products), delta: "实时", tone: "green" },
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
	actions: can("catalog:write") ? categories.actions : [],
    tableSubtitle: `共 ${number.format(input.categories.length)} 条`,
    metrics: [
      { label: "分类总数", value: number.format(input.categories.length), delta: "接口同步", tone: "blue" },
      { label: "启用分类", value: number.format(input.categories.filter((item) => item.status === 1).length), delta: "实时", tone: "green" },
      { label: "隐藏分类", value: number.format(input.categories.filter((item) => item.status !== 1).length), delta: "待检查", tone: "orange" },
      { label: "关联商品", value: number.format(input.products.total), delta: "商品总数", tone: "purple" }
    ],
    rows: input.categories.map((category) => ({
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
    tableSubtitle: tableSubtitle(input.orders),
    metrics: [
      { label: "今日订单", value: number.format(input.overview.today_paid_orders), delta: "已支付", tone: "blue" },
      { label: "待发货", value: number.format(input.overview.pending_shipment_orders), delta: "待处理", tone: "orange" },
      { label: "待支付", value: number.format(input.overview.pending_payment_orders), delta: "待转化", tone: "red" },
      { label: "累计成交", value: formatMoney(input.overview.total_paid_amount), delta: `${number.format(input.overview.total_paid_orders)} 单`, tone: "green" }
    ],
    rows: input.orders.list.map(mapOrderRow)
  };

  const inventory = cloneListPage(staticPages, "inventory");
  const inventoryPage: ListPageData = {
    ...inventory,
	actions: can("inventory:write") ? inventory.actions : [],
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
  if (input.accounts && input.roles) {
    const employees = cloneListPage(staticPages, "employees");
    const enabledAccounts = input.accounts.list.filter((account) => account.status === 1).length;
    employeePage = {
      ...employees,
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
          action: can("account:write") ? "编辑" : "-"
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
          action: "查看"
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
        cells: { name: item.after_sale_no, owner: `${item.product_name} · ${item.sku_name}`, amount: formatMoney(item.refund_amount), status: item.status_text, time: formatTime(item.created_at), action: can("after_sale:write") ? "处理" : "-" },
        status: item.status_text
      }))
    };
  }

  if (input.coupons) {
    const page = cloneListPage(staticPages, "coupon-management");
    couponPage = {
      ...page,
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

  return {
    "dashboard-overview": dashboardPage,
    products: productPage,
    categories: categoryPage,
    inventory: inventoryPage,
    "order-list": orderPage,
  "merchant-info": merchantInfoPage,
  ...(employeePage ? { employees: employeePage } : {}),
  ...(rolePage ? { roles: rolePage } : {}),
    ...(permissionMatrixPage ? { "permission-matrix": permissionMatrixPage } : {}),
    ...(customerPage ? { "user-list": customerPage } : {}),
    ...(afterSalePage ? { "aftersale-list": afterSalePage } : {}),
    ...(couponPage ? { "coupon-management": couponPage } : {})
  };
};

export const buildMerchantOrderDetailPage = (staticPages: AdminPageData[], order: MerchantOrder, canShip = false): DetailPageData => {
  const page = cloneDetailPage(staticPages, "order-detail");
  return {
    ...page,
    description: "查看真实订单金额、收件信息、商品明细和发货记录。",
    summary: [
      { label: "订单状态", value: order.status_text },
      { label: "订单金额", value: formatMoney(order.payable_amount) },
      { label: "收货人", value: `${order.receiver_name} ${order.receiver_phone}` },
      { label: "收货地址", value: order.receiver_address }
    ],
    steps: ["买家下单", order.paid_at ? "买家支付" : "等待支付", order.shipment ? "商家发货" : "等待发货", order.completed_at ? "确认收货" : "等待收货"],
    tableTitle: "商品明细",
    rows: order.items.map((item) => ({ id: String(item.id), cells: { time: item.sku_name, operator: item.product_name, action: `${item.quantity} 件`, content: formatMoney(item.price), result: formatMoney(item.subtotal) }, status: "成功" })),
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
