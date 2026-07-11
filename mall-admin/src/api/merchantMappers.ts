import type {
  MerchantCategory,
  MerchantDashboardAnalytics,
  MerchantDashboardOverview,
  MerchantInventoryAlert,
  MerchantOrder,
  MerchantProduct,
  MerchantUser,
  PageResponse
} from "./merchantApi";
import type { AdminPageData, DashboardPageData, FormPageData, ListPageData, Metric, TableRow } from "../types";

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
  }
): Partial<Record<string, AdminPageData>> => {
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
          action: "编辑"
        },
        status: productStatus(product.status)
      };
    })
  };

  const categories = cloneListPage(staticPages, "categories");
  const categoryPage: ListPageData = {
    ...categories,
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
        action: "编辑"
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
        action: "补货"
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

  return {
    "dashboard-overview": dashboardPage,
    products: productPage,
    categories: categoryPage,
    inventory: inventoryPage,
    "order-list": orderPage,
    "merchant-info": merchantInfoPage
  };
};
