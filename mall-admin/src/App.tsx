import { BarChart3, CheckCircle2, ChevronDown, ChevronRight, CircleDollarSign, ClipboardList, Package, ShieldCheck, Tags, UserRound, UsersRound, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { buildMerchantCustomerDetailPage, buildMerchantOrderDetailPage, buildMerchantRemotePages, buildMerchantSettlementDetailPage } from "./api/merchantMappers";
import { clearMerchantAuth, loadStoredMerchantAuth, merchantApi, merchantApiBaseUrl, storeMerchantAuth, subscribeMerchantAuthExpired, type MerchantAccount, type MerchantAfterSale, type MerchantCategory, type MerchantCoupon, type MerchantDashboardAnalytics, type MerchantDashboardOverview, type MerchantInventoryAlert, type MerchantOrder, type MerchantProduct, type MerchantRole, type MerchantSku, type MerchantUser, type PageResponse } from "./api/merchantApi";
import { adminGroups, adminPages } from "./data/adminPages";
import { createMerchantListQuery, MerchantListPage, type MerchantListQuery } from "./features/merchant-list/MerchantListPage";
import type { AdminPageData, DashboardPageData, DetailPageData, FormPageData, ListPageData, MatrixPageData, TableColumn, TableRow, Tone } from "./types";

const toneClass = (tone: Tone) => `tone-${tone}`;

const sidebarModules = [
  { id: "dashboard", title: "工作台", icon: BarChart3 },
  { id: "group02", title: "商品中心", icon: Package },
  { id: "orders", title: "订单履约", icon: ClipboardList },
  { id: "users", title: "用户会员", icon: UsersRound },
  { id: "marketing", title: "营销运营", icon: Tags },
  { id: "finance", title: "财务结算", icon: CircleDollarSign },
  { id: "group07", title: "商户权限", icon: ShieldCheck }
];

const pagePermissions: Record<string, string | undefined> = {
  "dashboard-overview": "dashboard:read",
  products: "catalog:read",
  categories: "catalog:read",
  inventory: "inventory:read",
  "inventory-logs": "inventory:read",
  "order-list": "order:read",
  "order-detail": "order:read",
  "aftersale-list": "after_sale:read",
  "coupon-management": "marketing:read",
  "merchant-settlements": "settlement:read",
  "settlement-entries": "settlement:read",
  "merchant-settlement-detail": "settlement:read",
  "merchant-info": undefined,
  employees: "account:read",
  roles: "account:read",
  "permission-matrix": "account:read",
  "user-list": "customer:read",
  "user-detail": "customer:read"
};

const canAccessPage = (pageId: string, user?: MerchantUser) => {
  if (!(pageId in pagePermissions)) return false;
  const permission = pagePermissions[pageId];
  return !permission || Boolean(user?.permissions.includes(permission));
};

const canManageAccountRole = (actorRole: string, targetRole: string) => (
  actorRole === "owner" || (actorRole === "admin" && targetRole !== "owner" && targetRole !== "admin")
);

const writePermissionByPage: Partial<Record<string, string>> = {
  products: "catalog:write",
  categories: "catalog:write",
  inventory: "inventory:write",
  "aftersale-list": "after_sale:write",
  "coupon-management": "marketing:write",
  employees: "account:write"
};

const canWritePage = (pageId: string, user?: MerchantUser) => {
  const permission = writePermissionByPage[pageId];
  return !permission || Boolean(user?.permissions.includes(permission));
};

const emptyPage = <T,>(): PageResponse<T> => ({ list: [], page: 1, page_size: 20, total: 0 });

const emptyOverview: MerchantDashboardOverview = {
  total_products: 0,
  on_sale_products: 0,
  low_stock_skus: 0,
  out_of_stock_skus: 0,
  pending_payment_orders: 0,
  pending_shipment_orders: 0,
  today_paid_orders: 0,
  today_paid_amount: 0,
  total_paid_orders: 0,
  total_paid_amount: 0,
  generated_at: ""
};

const emptyAnalytics: MerchantDashboardAnalytics = {
  start_date: "",
  end_date: "",
  sales_trend: [],
  top_products: [],
  generated_at: ""
};

const listPageIds = [
  "products",
  "categories",
  "inventory",
  "inventory-logs",
  "order-list",
  "aftersale-list",
  "coupon-management",
  "merchant-settlements",
  "settlement-entries",
  "employees",
  "user-list"
] as const;

const createInitialListQueries = () => Object.fromEntries(
  listPageIds.map((pageId) => [pageId, createMerchantListQuery()])
) as Record<string, MerchantListQuery>;

const optionalInteger = (value: string) => {
  if (value === "") return undefined;
  const parsed = Number(value);
  return Number.isInteger(parsed) ? parsed : undefined;
};

const StatusPill: React.FC<{ value: string }> = ({ value }) => {
  const tone: Tone = value.includes("成功") || value.includes("启用") || value.includes("在售") || value.includes("已完成") || value.includes("推荐")
    ? "green"
    : value.includes("预警") || value.includes("待") || value.includes("生成中") || value.includes("复核")
      ? "orange"
      : value.includes("风险") || value.includes("停用")
        ? "red"
        : "blue";

  return <span className={`status-pill ${toneClass(tone)}`}>{value}</span>;
};

interface TableViewProps {
  title: string;
  subtitle?: string;
  columns: TableColumn[];
  rows: TableRow[];
  onRowAction?: (row: TableRow) => void;
}

const TableView: React.FC<TableViewProps> = ({ title, subtitle = "共 128 条，每页 20 条", columns, rows, onRowAction }) => (
  <section className="panel table-panel">
    <div className="panel-title">
      <div>
        <h3>{title}</h3>
        <p>{subtitle}</p>
      </div>
    </div>
    <table>
      <thead>
        <tr>
          {columns.map((column) => (
            <th key={column.key}>{column.label}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {rows.length === 0 ? (
          <tr className="empty-row"><td colSpan={columns.length}>暂无数据</td></tr>
        ) : rows.map((row) => (
          <tr key={row.id}>
            {columns.map((column, index) => {
              const value = row.cells[column.key] ?? "-";
              const isAction = column.key === "action";
              return (
                <td key={column.key} className={index === 0 ? "strong-cell" : undefined}>
                  {isAction && onRowAction && value !== "-" ? (
                    <button className="link-button" onClick={() => onRowAction(row)}>{value}</button>
                  ) : column.key === "status" || column.key === "result" ? (
                    <StatusPill value={value} />
                  ) : (
                    value
                  )}
                </td>
              );
            })}
          </tr>
        ))}
      </tbody>
    </table>
    <div className="pagination">
      <span>共 {rows.length} 条</span>
    </div>
  </section>
);

const DashboardPage: React.FC<{ page: DashboardPageData; onTodo: (pageId: string) => void }> = ({ page, onTodo }) => (
  <div className="dashboard-layout">
    <div className="metric-grid">
      {page.metrics.map((metric) => (
        <section className="panel metric-card" key={metric.label}>
          <div className={`metric-mark ${toneClass(metric.tone)}`} />
          <div>
            <p>{metric.label}</p>
            <strong>{metric.value}</strong>
          </div>
          <span className={toneClass(metric.delta.startsWith("-") ? "orange" : "green")}>{metric.delta}</span>
        </section>
      ))}
    </div>
    <section className="panel sales-chart">
      <h3>近 30 天成交趋势</h3>
      <div className="chart-bars">
        {page.chartBars.map((height, index) => (
          <span
            className={index % 2 === 0 ? "brand-bar" : "orange-bar"}
            key={`${height}-${index}`}
            style={{ height: `${height}px` }}
          />
        ))}
      </div>
    </section>
    <section className="panel todo-panel">
      <h3>待办事项</h3>
      <div className="todo-list">
        {page.todos.map((todo, index) => (
          <button className={index === 0 ? "todo-item featured" : "todo-item"} key={todo} onClick={() => onTodo(index < 2 ? "order-list" : "inventory")} type="button">
            <span>{todo}</span>
            <strong>处理</strong>
          </button>
        ))}
      </div>
    </section>
    <TableView
      title={page.tableTitle ?? "经营数据"}
      subtitle={page.tableSubtitle ?? "最新统计"}
      columns={page.columns}
      rows={page.rows}
    />
  </div>
);

const FormPage: React.FC<{ page: FormPageData; fieldValues?: Record<string, string> }> = ({ page, fieldValues }) => {
  const values = fieldValues ?? page.fieldValues;
  if (page.id === "merchant-info") {
    return (
      <section className="panel merchant-info-panel">
        <div className="merchant-info-grid">
          {page.sections.flatMap((section) => section.fields).map((field) => (
            <div className="merchant-info-item" key={field}>
              <span>{field}</span>
              <strong>{values?.[field] || "-"}</strong>
            </div>
          ))}
        </div>
      </section>
    );
  }
  return (
  <div className="form-layout">
    <section className="panel form-panel">
      {page.sections.map((section) => (
        <div className="form-section" key={section.title}>
          <div className="section-heading">
            <h3>{section.title}</h3>
          </div>
          <div className="field-grid">
            {section.fields.map((field) => (
              <label key={field}>
                <span>{field}</span>
                <input key={`${field}-${values?.[field] ?? ""}`} defaultValue={values?.[field] ?? ""} placeholder={`请输入${field}`} />
              </label>
            ))}
          </div>
        </div>
      ))}
      <div className="form-actions">
        <button className="ghost-button">保存草稿</button>
        <button className="primary-button">提交保存</button>
      </div>
    </section>
    <aside className="side-stack">
      <div className="side-panel-title">辅助配置</div>
      {page.sideCards.map((item, index) => (
        <section className={`side-card ${index === 0 ? "featured" : ""}`} key={item}>
          <div className={`side-icon ${toneClass(["red", "blue", "green", "purple"][index % 4] as Tone)}`} />
          <div>
            <h3>{item}</h3>
            <p>已配置，可进入查看或调整。</p>
          </div>
          <button className="side-action">配置</button>
        </section>
      ))}
    </aside>
  </div>
  );
};

const MatrixPage: React.FC<{ page: MatrixPageData }> = ({ page }) => (
  <section className="panel table-panel permission-matrix-panel">
    <div className="panel-title">
      <div>
        <h3>接口权限矩阵</h3>
        <p>当前商户固定岗位对应的实际后端接口权限。</p>
      </div>
    </div>
    <div className="permission-matrix-table">
      <table>
        <thead>
          <tr>
            <th>角色</th>
            {page.modules.map((module) => <th key={module}>{module}</th>)}
          </tr>
        </thead>
        <tbody>
          {page.roles.map((role) => (
            <tr key={role.role}>
              <td className="strong-cell">{role.role}</td>
              {page.modules.map((module) => (
                <td key={module}>{role.permissions.includes(module) ? <span className="status-pill tone-green">允许</span> : "-"}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </section>
);

const DetailPage: React.FC<{ page: DetailPageData; onAction: (actionLabel: string) => void; onRowAction?: (row: TableRow) => void }> = ({ page, onAction, onRowAction }) => (
  <div className="detail-layout">
    {page.actions?.length ? <div className="actions">{page.actions.map((action) => <button key={action.label} className={action.variant === "primary" ? "primary-button" : "ghost-button"} type="button" onClick={() => onAction(action.label)}>{action.label}</button>)}</div> : null}
    <section className="panel detail-summary">
      {page.summary.map((item) => (
        <div className="summary-item" key={item.label}>
          <span>{item.label}</span>
          <strong>{item.value}</strong>
        </div>
      ))}
    </section>
    <section className="panel process-panel">
      <h3>流程进度</h3>
      <div className="process-steps">
        {page.steps.map((step, index) => (
          <div className={`process-step ${index < 2 ? "done" : ""}`} key={step}>
            <span className="step-dot" />
            <strong>{step}</strong>
          </div>
        ))}
      </div>
    </section>
    <TableView
      title={page.tableTitle}
      subtitle="关键流转记录"
      columns={page.columns}
      rows={page.rows}
      onRowAction={onRowAction}
    />
  </div>
);

interface PageContentProps {
  page: AdminPageData;
	merchantUser?: MerchantUser;
  listQuery: MerchantListQuery;
  loading: boolean;
  onListQueryChange: (patch: Partial<MerchantListQuery>) => void;
  onListSearch: () => void;
  onListReset: () => void;
  onListRefresh: () => void;
  onListPageChange: (page: number) => void;
  onDashboardNavigate: (pageId: string) => void;
  onToolbarAction: (page: ListPageData, actionLabel: string) => void;
  onProductEdit: (row: TableRow) => void;
  onEmployeeEdit: (row: TableRow) => void;
  onOrderDetail: (row: TableRow) => void;
  onAfterSaleDetail: (row: TableRow) => void;
  onUserDetail: (row: TableRow) => void;
  onCategoryEdit: (row: TableRow) => void;
  onInventoryAdjust: (row: TableRow) => void;
  onCouponEdit: (row: TableRow) => void;
  onSettlementDetail: (row: TableRow) => void;
  onDetailAction: (actionLabel: string) => void;
}

const PageContent: React.FC<PageContentProps> = ({ page, merchantUser, listQuery, loading, onListQueryChange, onListSearch, onListReset, onListRefresh, onListPageChange, onDashboardNavigate, onToolbarAction, onProductEdit, onEmployeeEdit, onOrderDetail, onAfterSaleDetail, onUserDetail, onCategoryEdit, onInventoryAdjust, onCouponEdit, onSettlementDetail, onDetailAction }) => {
  if (page.kind === "dashboard") return <DashboardPage page={page} onTodo={onDashboardNavigate} />;
  if (page.kind === "form") {
    return <FormPage page={page} />;
  }
  if (page.kind === "detail") return <DetailPage page={page} onAction={onDetailAction} onRowAction={page.id === "user-detail" ? onOrderDetail : undefined} />;
  if (page.kind === "matrix") return <MatrixPage page={page} />;
  if (page.kind !== "list") return null;
	const canWrite = canWritePage(page.id, merchantUser);
  const onRowAction = page.id === "products" && canWrite
    ? onProductEdit
    : page.id === "categories" && canWrite
      ? onCategoryEdit
    : page.id === "inventory" && canWrite
      ? onInventoryAdjust
    : page.id === "coupon-management" && canWrite
      ? onCouponEdit
    : page.id === "employees" && canWrite
      ? onEmployeeEdit
    : page.id === "order-list"
      ? onOrderDetail
      : page.id === "aftersale-list"
        ? onAfterSaleDetail
        : page.id === "user-list"
          ? onUserDetail
          : page.id === "merchant-settlements"
            ? onSettlementDetail
          : undefined;
  return (
    <MerchantListPage
      page={page}
      query={listQuery}
      loading={loading}
      onQueryChange={onListQueryChange}
      onSearch={onListSearch}
      onReset={onListReset}
      onRefresh={onListRefresh}
      onPageChange={onListPageChange}
      onRowAction={onRowAction}
      onToolbarAction={onToolbarAction}
    />
  );
};

interface ApiState {
  loading: boolean;
  error: string;
  connected: boolean;
}

interface AuthPanelProps {
  apiState: ApiState;
  loginForm: { username: string; password: string };
  merchantUser?: MerchantUser;
  onLoginFormChange: (field: "username" | "password", value: string) => void;
  onLogin: (event: React.FormEvent<HTMLFormElement>) => void;
  onRefresh: () => void;
  onLogout: () => void;
}

const AuthPanel: React.FC<AuthPanelProps> = ({ apiState, loginForm, merchantUser, onLoginFormChange, onLogin, onRefresh, onLogout }) => {
  if (merchantUser) {
    return (
      <section className="account-panel connected">
        <div>
          <strong>{merchantUser.merchant_name}</strong>
          <span>{merchantUser.nickname || merchantUser.username} · {merchantUser.role} · {merchantUser.permissions.length} 项权限</span>
        </div>
        <div className="account-actions">
          <span>{apiState.loading ? "同步中" : apiState.connected ? "已连接后端" : "等待同步"} · {merchantApiBaseUrl}</span>
          {apiState.error ? <em>{apiState.error}</em> : null}
          <button className="ghost-button compact" type="button" onClick={onRefresh} disabled={apiState.loading}>刷新</button>
          <button className="ghost-button compact" type="button" onClick={onLogout}>退出</button>
        </div>
      </section>
    );
  }

  return (
    <form className="account-panel login" onSubmit={onLogin}>
      <div>
        <strong>连接商家后台接口</strong>
        <span>接口地址：{merchantApiBaseUrl}</span>
      </div>
      <div className="account-login-fields">
        <input value={loginForm.username} onChange={(event) => onLoginFormChange("username", event.target.value)} placeholder="商户账号" />
        <input value={loginForm.password} onChange={(event) => onLoginFormChange("password", event.target.value)} placeholder="商户密码" type="password" />
        <button className="primary-button" disabled={apiState.loading} type="submit">{apiState.loading ? "登录中" : "登录并同步"}</button>
      </div>
      {apiState.error ? <em>{apiState.error}</em> : null}
    </form>
  );
};

interface ModalField {
  name: string;
  label: string;
  placeholder: string;
  type?: "text" | "number" | "password" | "select" | "file";
  defaultValue?: string;
  options?: Array<{ label: string; value: string }>;
  disabled?: boolean;
}

interface ActionModalConfig {
  pageId: string;
  actionLabel: string;
  title: string;
  description: string;
  fields: ModalField[];
  accountId?: number;
  entityId?: number;
  readOnly?: boolean;
  productId?: number;
  skuId?: number;
  skus?: MerchantSku[];
}

const buildActionModalConfig = (page: ListPageData, actionLabel: string, categories: MerchantCategory[] = []): ActionModalConfig | undefined => {
  if (!actionLabel.includes("新增")) return undefined;

  if (page.id === "products") {
    return {
      pageId: page.id,
      actionLabel,
      title: "新增商品",
      description: "创建商品基础资料，创建后可继续维护 SKU、库存和上架状态。",
      fields: [
        { name: "name", label: "商品名称", placeholder: "请输入商品名称" },
        { name: "categoryId", label: "商品分类", placeholder: "请选择分类", type: "select", options: [{ label: "请选择分类", value: "" }, ...categories.filter((category) => category.status === 1).map((category) => ({ label: category.name, value: String(category.id) }))] },
        { name: "description", label: "商品描述", placeholder: "请输入商品描述" },
        { name: "cover", label: "商品主图 URL", placeholder: "请输入图片地址" },
        { name: "coverFile", label: "上传主图（可选）", placeholder: "", type: "file" },
        { name: "status", label: "商品状态", placeholder: "", type: "select", defaultValue: "0", options: [{ label: "草稿", value: "0" }, { label: "下架", value: "2" }] }
      ]
    };
  }

  if (page.id === "categories") {
    return {
      pageId: page.id,
      actionLabel,
      title: "新增分类",
      description: "创建商户商品分类，可设置上级分类、排序和启用状态。",
      fields: [
        { name: "name", label: "分类名称", placeholder: "请输入分类名称" },
        { name: "parentId", label: "上级分类", placeholder: "请选择上级分类", type: "select", defaultValue: "0", options: [{ label: "无（一级分类）", value: "0" }, ...categories.map((category) => ({ label: category.name, value: String(category.id) }))] },
        { name: "sort", label: "排序", placeholder: "请输入排序值", type: "number", defaultValue: "0" },
        { name: "status", label: "状态", placeholder: "", type: "select", defaultValue: "1", options: [{ label: "启用", value: "1" }, { label: "停用", value: "0" }] }
      ]
    };
  }

  if (page.id === "employees") {
    return {
      pageId: page.id,
      actionLabel,
      title: "新增员工",
      description: "创建商户后台登录账号，并分配固定岗位角色。",
      fields: [
        { name: "username", label: "登录账号", placeholder: "3-100 位字母、数字或 . _ @ -" },
        { name: "nickname", label: "员工昵称", placeholder: "请输入员工昵称" },
        { name: "password", label: "初始密码", placeholder: "至少 8 个字符", type: "password" },
        {
          name: "role", label: "岗位角色", placeholder: "请选择角色", type: "select",
          options: [
            { label: "运营人员", value: "operator" },
            { label: "销售人员", value: "sales" },
            { label: "库管人员", value: "warehouse" },
            { label: "管理员", value: "admin" },
            { label: "店主", value: "owner" }
          ]
        },
        {
          name: "status", label: "账号状态", placeholder: "请选择状态", type: "select", defaultValue: "1",
          options: [{ label: "启用", value: "1" }, { label: "停用", value: "0" }]
        }
      ]
    };
  }

  if (page.id === "coupon-management") {
    const now = new Date();
    const end = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
    return {
      pageId: page.id, actionLabel, title: "新增优惠券", description: "金额单位填写元，保存时转换为后端使用的分。时间使用浏览器可识别的 RFC3339 格式。",
      fields: [
        { name: "name", label: "优惠券名称", placeholder: "例如：满 100 减 10" },
        { name: "threshold", label: "使用门槛（元）", placeholder: "100", type: "number" },
        { name: "discount", label: "优惠金额（元）", placeholder: "10", type: "number" },
        { name: "quantity", label: "发行数量", placeholder: "100", type: "number" },
        { name: "perUserLimit", label: "每人限领", placeholder: "1", type: "number", defaultValue: "1" },
        { name: "startAt", label: "开始时间", placeholder: "RFC3339", defaultValue: now.toISOString() },
        { name: "endAt", label: "结束时间", placeholder: "RFC3339", defaultValue: end.toISOString() },
        { name: "status", label: "状态", placeholder: "", type: "select", defaultValue: "0", options: [{ label: "草稿", value: "0" }, { label: "发放中", value: "1" }, { label: "停用", value: "2" }] }
      ]
    };
  }

  return {
    pageId: page.id,
    actionLabel,
    title: actionLabel,
    description: `在 ${page.title} 中创建一条新记录。该模块后端接口待接入，当前先保留录入弹窗。`,
    fields: [
      { name: "name", label: "名称", placeholder: "请输入名称" },
      { name: "owner", label: "归属", placeholder: "请输入归属或说明" },
      { name: "remark", label: "备注", placeholder: "请输入备注" }
    ]
  };
};

const buildEmployeeEditModal = (account: MerchantAccount, roles: MerchantRole[]): ActionModalConfig => ({
  pageId: "employees",
  actionLabel: "编辑员工",
  title: `编辑员工 · ${account.nickname}`,
  description: "调整昵称、岗位和启停状态；填写新密码时会同时注销该员工的旧登录状态。",
  accountId: account.id,
  fields: [
    { name: "username", label: "登录账号", placeholder: "登录账号不可修改", defaultValue: account.username, disabled: true },
    { name: "nickname", label: "员工昵称", placeholder: "请输入员工昵称", defaultValue: account.nickname },
    {
      name: "role", label: "岗位角色", placeholder: "请选择角色", type: "select", defaultValue: account.role,
      options: roles.map((role) => ({ label: role.name, value: role.role }))
    },
    {
      name: "status", label: "账号状态", placeholder: "请选择状态", type: "select", defaultValue: String(account.status),
      options: [{ label: "启用", value: "1" }, { label: "停用", value: "0" }]
    },
    { name: "password", label: "重置密码（可选）", placeholder: "不修改请留空，至少 8 个字符", type: "password" }
  ]
});

const buildProductEditModal = (product: MerchantProduct, categories: MerchantCategory[]): ActionModalConfig => ({
  pageId: "products", actionLabel: "编辑商品", title: `编辑商品 · ${product.name}`, description: "先维护商品资料，再在下方独立管理每个 SKU；上架前至少需要一个启用且价格有效的 SKU。",
  entityId: product.id,
  productId: product.id,
  skus: product.skus,
  fields: [
    { name: "name", label: "商品名称", placeholder: "请输入商品名称", defaultValue: product.name },
    { name: "categoryId", label: "商品分类", placeholder: "请选择分类", type: "select", defaultValue: String(product.category_id), options: categories.filter((category) => category.status === 1 || category.id === product.category_id).map((category) => ({ label: category.name, value: String(category.id) })) },
    { name: "description", label: "商品描述", placeholder: "请输入商品描述", defaultValue: product.description },
    { name: "cover", label: "商品主图 URL", placeholder: "可直接填写 URL", defaultValue: product.cover },
    { name: "coverFile", label: "上传新主图（可选）", placeholder: "", type: "file" },
    { name: "status", label: "商品状态", placeholder: "", type: "select", defaultValue: String(product.status), options: [{ label: "草稿", value: "0" }, { label: "上架", value: "1" }, { label: "下架", value: "2" }] },
    { name: "operation", label: "保存操作", placeholder: "", type: "select", defaultValue: "save", options: [{ label: "保存资料", value: "save" }, { label: "保存并上架", value: "on_sale" }, { label: "保存并下架", value: "off_sale" }, { label: "删除商品", value: "delete" }] }
  ]
});

const buildSkuModal = (productId: number, sku?: MerchantSku): ActionModalConfig => ({
  pageId: "sku",
  actionLabel: sku ? "编辑 SKU" : "新增 SKU",
  title: sku ? `编辑 SKU · ${sku.name}` : "新增 SKU",
  description: "价格单位按元填写，保存时转换为分；库存变更会生成库存流水。",
  entityId: productId,
  productId,
  skuId: sku?.id,
  fields: [
    { name: "name", label: "SKU 名称", placeholder: "例如：黑色 / 128G", defaultValue: sku?.name ?? "" },
    { name: "image", label: "SKU 图片 URL", placeholder: "可与商品主图相同", defaultValue: sku?.image ?? "" },
    { name: "imageFile", label: "上传 SKU 图片（可选）", placeholder: "", type: "file" },
    { name: "price", label: "销售价（元）", placeholder: "99.00", type: "number", defaultValue: sku ? String(sku.price / 100) : "" },
    { name: "stock", label: "可售库存", placeholder: "0", type: "number", defaultValue: String(sku?.stock ?? 0) },
    { name: "lowStockThreshold", label: "低库存预警线", placeholder: "0", type: "number", defaultValue: String(sku?.low_stock_threshold ?? 0) },
    { name: "status", label: "SKU 状态", placeholder: "", type: "select", defaultValue: String(sku?.status ?? 1), options: [{ label: "启用", value: "1" }, { label: "停用", value: "0" }] },
    ...(sku ? [{ name: "operation", label: "保存操作", placeholder: "", type: "select" as const, defaultValue: "save", options: [{ label: "保存 SKU", value: "save" }, { label: "删除 SKU", value: "delete" }] }] : [])
  ]
});

const buildCategoryEditModal = (category: MerchantCategory, categories: MerchantCategory[]): ActionModalConfig => ({
  pageId: "categories", actionLabel: "编辑分类", title: `编辑分类 · ${category.name}`, description: "维护分类层级、排序和状态；删除前必须确保分类下没有商品。", entityId: category.id,
  fields: [
    { name: "name", label: "分类名称", placeholder: "请输入分类名称", defaultValue: category.name },
    { name: "parentId", label: "上级分类", placeholder: "请选择上级分类", type: "select", defaultValue: String(category.parent_id), options: [{ label: "无（一级分类）", value: "0" }, ...categories.filter((item) => item.id !== category.id).map((item) => ({ label: item.name, value: String(item.id) }))] },
    { name: "sort", label: "排序", placeholder: "0", type: "number", defaultValue: String(category.sort) },
    { name: "status", label: "状态", placeholder: "", type: "select", defaultValue: String(category.status), options: [{ label: "启用", value: "1" }, { label: "停用", value: "0" }] },
    { name: "operation", label: "保存操作", placeholder: "", type: "select", defaultValue: "save", options: [{ label: "保存", value: "save" }, { label: "删除分类", value: "delete" }] }
  ]
});

const buildInventoryModal = (alert: MerchantInventoryAlert): ActionModalConfig => ({
  pageId: "inventory", actionLabel: "调整库存", title: `调整库存 · ${alert.sku_name}`, description: "填写调整后的绝对库存和预警线，后端会记录变更前后数量和操作人。", entityId: alert.sku_id,
  fields: [
    { name: "stock", label: "调整后库存", placeholder: "0", type: "number", defaultValue: String(alert.stock) },
    { name: "lowStockThreshold", label: "低库存预警线", placeholder: "0", type: "number", defaultValue: String(alert.low_stock_threshold) },
    { name: "remark", label: "调整原因", placeholder: "例如：采购入库" }
  ]
});

const buildCouponEditModal = (coupon: MerchantCoupon): ActionModalConfig => ({
  ...(buildActionModalConfig({ id: "coupon-management", title: "优惠券", kind: "list", groupId: "marketing", eyebrow: "", description: "", filters: [], actions: [], metrics: [], columns: [], rows: [] }, "新增优惠券") as ActionModalConfig),
  actionLabel: "编辑优惠券", title: `编辑优惠券 · ${coupon.name}`, entityId: coupon.id,
  fields: (buildActionModalConfig({ id: "coupon-management", title: "优惠券", kind: "list", groupId: "marketing", eyebrow: "", description: "", filters: [], actions: [], metrics: [], columns: [], rows: [] }, "新增优惠券") as ActionModalConfig).fields.map((field) => ({ ...field, defaultValue: ({ name: coupon.name, threshold: String(coupon.threshold_amount / 100), discount: String(coupon.discount_amount / 100), quantity: String(coupon.total_quantity), perUserLimit: String(coupon.per_user_limit), startAt: coupon.start_at, endAt: coupon.end_at, status: String(coupon.status) } as Record<string, string>)[field.name] }))
});

interface ActionModalProps {
  config: ActionModalConfig;
  error: string;
  submitting: boolean;
  onClose: () => void;
  onSubmit: (event: React.FormEvent<HTMLFormElement>) => void;
  onCreateSku: (productId: number) => void;
  onEditSku: (productId: number, sku: MerchantSku) => void;
}

const ActionModal: React.FC<ActionModalProps> = ({ config, error, submitting, onClose, onSubmit, onCreateSku, onEditSku }) => (
  <div className="modal-backdrop" role="presentation">
    <section className={`modal-card ${config.skus ? "product-modal" : ""}`} role="dialog" aria-modal="true" aria-labelledby="action-modal-title">
      <div className="modal-head">
        <div>
          <h2 id="action-modal-title">{config.title}</h2>
          <p>{config.description}</p>
        </div>
        <button aria-label="关闭" className="modal-close" onClick={onClose} title="关闭" type="button"><X size={17} /></button>
      </div>
      <form key={`${config.pageId}-${config.actionLabel}-${config.entityId ?? "new"}-${config.skuId ?? "new"}`} onSubmit={onSubmit}>
        <div className="modal-field-grid">
          {config.fields.map((field) => (
            <label key={field.name}>
              <span>{field.label}</span>
            {field.type === "select" ? (
              <select name={field.name} defaultValue={field.defaultValue ?? field.options?.[0]?.value ?? ""}>
                {field.options?.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
              </select>
            ) : (
              <input name={field.name} placeholder={field.placeholder} type={field.type ?? "text"} defaultValue={field.defaultValue ?? ""} disabled={field.disabled} />
            )}
            </label>
          ))}
        </div>
        {config.productId && config.skus ? (
          <section className="sku-manager">
            <div className="sku-manager-head">
              <div><strong>SKU 列表</strong><span>共 {config.skus.length} 个规格</span></div>
              <button className="ghost-button compact" disabled={submitting} onClick={() => onCreateSku(config.productId as number)} type="button">新增 SKU</button>
            </div>
            <div className="sku-list">
              {config.skus.length === 0 ? <p>尚未创建 SKU，商品暂不能上架。</p> : config.skus.map((sku) => (
                <div className="sku-row" key={sku.id}>
                  <div><strong>{sku.name}</strong><span>¥{(sku.price / 100).toFixed(2)} · 库存 {sku.stock} · 预警线 {sku.low_stock_threshold}</span></div>
                  <span className={`status-pill ${sku.status === 1 ? "tone-green" : "tone-gray"}`}>{sku.status === 1 ? "启用" : "停用"}</span>
                  <button className="link-button" onClick={() => onEditSku(config.productId as number, sku)} type="button">编辑</button>
                </div>
              ))}
            </div>
          </section>
        ) : null}
        {error ? <p className="modal-error">{error}</p> : null}
        <div className="modal-actions">
          <button className="ghost-button" onClick={onClose} type="button">{config.readOnly ? "关闭" : "取消"}</button>
          {!config.readOnly ? <button className="primary-button" disabled={submitting} type="submit">{submitting ? "提交中" : "提交保存"}</button> : null}
        </div>
      </form>
    </section>
  </div>
);

interface AccountModalProps extends AuthPanelProps {
  onClose: () => void;
}

const AccountModal: React.FC<AccountModalProps> = ({ onClose, ...authProps }) => (
  <div className="modal-backdrop" role="presentation">
    <section className="modal-card account-modal" role="dialog" aria-modal="true" aria-labelledby="account-modal-title">
      <div className="modal-head">
        <div>
          <h2 id="account-modal-title">账号与接口</h2>
          <p>登录商户后台后同步真实商品、订单、库存和工作台数据。</p>
        </div>
        <button aria-label="关闭" className="modal-close" onClick={onClose} title="关闭" type="button"><X size={17} /></button>
      </div>
      <AuthPanel {...authProps} />
    </section>
  </div>
);

const App: React.FC = () => {
  const getInitialPageId = () => {
    const requested = new URLSearchParams(window.location.search).get("page");
    return requested && Object.prototype.hasOwnProperty.call(pagePermissions, requested) ? requested : "dashboard-overview";
  };
  const [activePageId, setActivePageId] = useState(getInitialPageId);
  const [merchantUser, setMerchantUser] = useState<MerchantUser | undefined>();
  const [merchantAccounts, setMerchantAccounts] = useState<MerchantAccount[]>([]);
  const [merchantRoles, setMerchantRoles] = useState<MerchantRole[]>([]);
  const [merchantCategories, setMerchantCategories] = useState<MerchantCategory[]>([]);
  const [merchantInventoryAlerts, setMerchantInventoryAlerts] = useState<MerchantInventoryAlert[]>([]);
  const [merchantAfterSales, setMerchantAfterSales] = useState<MerchantAfterSale[]>([]);
  const [merchantCoupons, setMerchantCoupons] = useState<MerchantCoupon[]>([]);
  const [selectedOrderId, setSelectedOrderId] = useState<number>();
  const [remotePages, setRemotePages] = useState<Partial<Record<string, AdminPageData>>>({});
  const [loginForm, setLoginForm] = useState({ username: "merchant_admin", password: "" });
  const [apiState, setApiState] = useState<ApiState>({ loading: false, error: "", connected: false });
  const [accountModalOpen, setAccountModalOpen] = useState(() => !loadStoredMerchantAuth());
  const [actionModal, setActionModal] = useState<ActionModalConfig | undefined>();
  const [actionModalError, setActionModalError] = useState("");
  const [actionModalSubmitting, setActionModalSubmitting] = useState(false);
  const [operationNotice, setOperationNotice] = useState("");
  const [listQueries, setListQueries] = useState<Record<string, MerchantListQuery>>(createInitialListQueries);
  const pages = useMemo(
    () => {
      const resolved = adminPages
        .filter((page) => page.id === "merchant-info" || Object.prototype.hasOwnProperty.call(remotePages, page.id))
        .map((page) => remotePages[page.id] ?? page);
      const knownPageIds = new Set(resolved.map((page) => page.id));
      const remoteOnly = Object.values(remotePages)
        .filter((page): page is AdminPageData => page !== undefined)
        .filter((page) => !knownPageIds.has(page.id));
      return [...resolved, ...remoteOnly].filter((page) => canAccessPage(page.id, merchantUser));
    },
    [remotePages, merchantUser]
  );
  const activePage = useMemo(() => pages.find((page) => page.id === activePageId) ?? pages[0], [activePageId, pages]);
  const activeGroup = useMemo(() => adminGroups.find((group) => group.id === activePage.groupId) ?? adminGroups[0], [activePage.groupId]);
  const pageTitle = activePage.title;
  const pageEyebrow = activePage.eyebrow;
  const pageDescription = activePage.description;
  const activeListQuery = listQueries[activePage.id] ?? createMerchantListQuery();
  const navigateToPage = (pageId: string) => {
    setActivePageId(pageId);
    const url = new URL(window.location.href);
    url.searchParams.set("page", pageId);
    window.history.pushState({}, "", url);
  };
  const openProductEdit = async (row: TableRow) => {
    const id = Number(row.id); if (!id) return;
    setApiState((current) => ({ ...current, loading: true, error: "" }));
    try { const product = await merchantApi.productDetail(id); setActionModal(buildProductEditModal(product, merchantCategories)); setActionModalError(""); setApiState((current) => ({ ...current, loading: false, connected: true })); }
    catch (error) { setApiState((current) => ({ ...current, loading: false, error: error instanceof Error ? error.message : "商品详情加载失败" })); }
  };
  const openCreateSku = (productId: number) => {
    setActionModal(buildSkuModal(productId));
    setActionModalError("");
  };
  const openEditSku = (productId: number, sku: MerchantSku) => {
    setActionModal(buildSkuModal(productId, sku));
    setActionModalError("");
  };
  const openEmployeeEdit = (row: TableRow) => {
    const account = merchantAccounts.find((item) => String(item.id) === row.id);
    if (!account || !merchantUser || !canManageAccountRole(merchantUser.role, account.role)) return;
    const manageableRoles = merchantRoles.filter((role) => canManageAccountRole(merchantUser.role, role.role));
    setActionModal(buildEmployeeEditModal(account, manageableRoles));
    setActionModalError("");
  };
  const openCategoryEdit = (row: TableRow) => { const value = merchantCategories.find((item) => String(item.id) === row.id); if (value) { setActionModal(buildCategoryEditModal(value, merchantCategories)); setActionModalError(""); } };
  const openInventoryAdjust = (row: TableRow) => { const parts = row.id.split("-"); const skuId = Number(parts[parts.length - 1]); const value = merchantInventoryAlerts.find((item) => item.sku_id === skuId); if (value) { setActionModal(buildInventoryModal(value)); setActionModalError(""); } };
  const openCouponEdit = (row: TableRow) => { const value = merchantCoupons.find((item) => String(item.id) === row.id); if (value) { setActionModal(buildCouponEditModal(value)); setActionModalError(""); } };
  const openSettlementDetail = async (row: TableRow) => {
    const id = Number(row.id);
    if (!Number.isFinite(id) || id <= 0) return;
    setApiState((current) => ({ ...current, loading: true, error: "" }));
    try {
      const settlement = await merchantApi.settlementDetail(id);
      setRemotePages((current) => ({ ...current, "merchant-settlement-detail": buildMerchantSettlementDetailPage(settlement) }));
      setApiState((current) => ({ ...current, loading: false, connected: true }));
      navigateToPage("merchant-settlement-detail");
    } catch (error) {
      setApiState((current) => ({ ...current, loading: false, error: error instanceof Error ? error.message : "结算单详情加载失败" }));
    }
  };
  const openOrderDetail = async (row: TableRow) => { const id = Number(row.id); if (!id) return; setApiState((current) => ({ ...current, loading: true, error: "" })); try { const order = await merchantApi.orderDetail(id); setSelectedOrderId(id); setRemotePages((current) => ({ ...current, "order-detail": buildMerchantOrderDetailPage(adminPages, order, Boolean(merchantUser?.permissions.includes("order:ship"))) })); setApiState((current) => ({ ...current, loading: false, connected: true })); navigateToPage("order-detail"); } catch (error) { setApiState((current) => ({ ...current, loading: false, error: error instanceof Error ? error.message : "订单详情加载失败" })); } };
  const openAfterSaleDetail = (row: TableRow) => {
    const value = merchantAfterSales.find((item) => String(item.id) === row.id);
    if (!value) return;
    const canReview = Boolean(merchantUser?.permissions.includes("after_sale:write"));
    const detailFields: ModalField[] = [
      { name: "afterSaleNo", label: "售后单号", placeholder: "", defaultValue: value.after_sale_no, disabled: true },
      { name: "orderNo", label: "订单号", placeholder: "", defaultValue: value.order_no, disabled: true },
      { name: "product", label: "商品 / SKU", placeholder: "", defaultValue: `${value.product_name} / ${value.sku_name}`, disabled: true },
      { name: "type", label: "售后类型", placeholder: "", defaultValue: value.type_text, disabled: true },
      { name: "reasonText", label: "申请原因", placeholder: "", defaultValue: value.reason, disabled: true },
      { name: "description", label: "申请说明", placeholder: "", defaultValue: value.description || "-", disabled: true },
      { name: "amount", label: "退款金额", placeholder: "", defaultValue: `¥${(value.refund_amount / 100).toFixed(2)}`, disabled: true },
      { name: "statusText", label: "售后状态", placeholder: "", defaultValue: value.status_text, disabled: true },
      { name: "refundNo", label: "退款单号", placeholder: "", defaultValue: value.refund?.refund_no || "尚未创建", disabled: true },
      { name: "refundStatus", label: "退款状态", placeholder: "", defaultValue: value.refund?.status_text || "-", disabled: true },
      { name: "retryCount", label: "退款尝试次数", placeholder: "", defaultValue: String(value.refund?.retry_count ?? 0), disabled: true },
      { name: "lastError", label: "最近错误", placeholder: "", defaultValue: value.refund?.last_error || value.refund?.failure_reason || "-", disabled: true }
    ];
    let operationFields: ModalField[] = [];
    if (canReview && value.status === 1) {
      operationFields = [
        { name: "operation", label: "审核结果", placeholder: "", type: "select", options: [{ label: "同意并原路退款", value: "approve" }, { label: "拒绝申请", value: "reject" }] },
        { name: "reason", label: "拒绝原因", placeholder: "拒绝申请时必填" }
      ];
    } else if (canReview && value.status === 2) {
      operationFields = [{ name: "operation", label: "退款操作", placeholder: "", type: "select", options: [{ label: "主动查询退款结果", value: "sync" }] }];
    } else if (canReview && value.status === 6) {
      operationFields = [{ name: "operation", label: "退款操作", placeholder: "", type: "select", options: [{ label: "重新发起原路退款", value: "retry" }] }];
    }
    setActionModal({
      pageId: "aftersale-list",
      actionLabel: "售后详情",
      title: `售后详情 · ${value.after_sale_no}`,
      description: value.images.length > 0 ? `售后凭证：${value.images.join("、")}` : "该申请未上传售后凭证。",
      entityId: value.id,
      fields: [...detailFields, ...operationFields],
      readOnly: operationFields.length === 0
    });
    setActionModalError("");
  };
  const openUserDetail = async (row: TableRow) => {
    const userID = Number(row.id);
    if (!Number.isFinite(userID) || userID <= 0) return;
    setApiState((current) => ({ ...current, loading: true, error: "" }));
    try {
      const detail = await merchantApi.customerDetail(userID);
      setRemotePages((current) => ({ ...current, "user-detail": buildMerchantCustomerDetailPage(adminPages, detail) }));
      setApiState((current) => ({ ...current, loading: false, connected: true }));
      navigateToPage("user-detail");
    } catch (error) {
      setApiState((current) => ({ ...current, loading: false, error: error instanceof Error ? error.message : "顾客详情加载失败" }));
      setAccountModalOpen(true);
    }
  };

  const loadMerchantData = async (queryOverrides: Partial<Record<string, MerchantListQuery>> = {}) => {
    setApiState((current) => ({ ...current, loading: true, error: "" }));
    try {
      const user = await merchantApi.me();
      const can = (permission: string) => user.permissions.includes(permission);
      const queryFor = (pageId: string) => queryOverrides[pageId] ?? listQueries[pageId] ?? createMerchantListQuery();
      const productQuery = queryFor("products");
      const categoryQuery = queryFor("categories");
      const orderQuery = queryFor("order-list");
      const inventoryQuery = queryFor("inventory");
      const inventoryLogQuery = queryFor("inventory-logs");
      const employeeQuery = queryFor("employees");
      const customerQuery = queryFor("user-list");
      const afterSaleQuery = queryFor("aftersale-list");
      const couponQuery = queryFor("coupon-management");
      const settlementQuery = queryFor("merchant-settlements");
      const settlementEntryQuery = queryFor("settlement-entries");
      const [overview, analytics, products, categories, orders, inventoryAlerts, inventoryLogs, accounts, roles, customerOverview, customers, afterSales, coupons, settlements, settlementEntries] = await Promise.all([
        can("dashboard:read") ? merchantApi.dashboardOverview() : Promise.resolve(emptyOverview),
        can("dashboard:read") ? merchantApi.dashboardAnalytics(10, 10) : Promise.resolve(emptyAnalytics),
        can("catalog:read") ? merchantApi.products({ page: productQuery.page, pageSize: productQuery.pageSize, keyword: productQuery.keyword, status: optionalInteger(productQuery.status) }) : Promise.resolve(emptyPage<MerchantProduct>()),
        can("catalog:read") ? merchantApi.categories() : Promise.resolve([]),
        can("order:read") ? merchantApi.orders({ page: orderQuery.page, pageSize: orderQuery.pageSize, status: optionalInteger(orderQuery.status), keyword: orderQuery.keyword }) : Promise.resolve(emptyPage<MerchantOrder>()),
        can("inventory:read") ? merchantApi.inventoryAlerts({ page: inventoryQuery.page, pageSize: inventoryQuery.pageSize, keyword: inventoryQuery.keyword }) : Promise.resolve(emptyPage<MerchantInventoryAlert>()),
        can("inventory:read") ? merchantApi.inventoryLogs({ page: inventoryLogQuery.page, pageSize: inventoryLogQuery.pageSize, productId: optionalInteger(inventoryLogQuery.productId), skuId: optionalInteger(inventoryLogQuery.skuId), changeType: inventoryLogQuery.changeType }) : Promise.resolve(undefined),
        can("account:read") ? merchantApi.accounts({ page: employeeQuery.page, pageSize: employeeQuery.pageSize, keyword: employeeQuery.keyword, role: employeeQuery.role, status: optionalInteger(employeeQuery.status) }) : Promise.resolve(undefined),
        can("account:read") ? merchantApi.roles() : Promise.resolve(undefined),
        can("customer:read") ? merchantApi.customerOverview() : Promise.resolve(undefined),
        can("customer:read") ? merchantApi.customers({ page: customerQuery.page, pageSize: customerQuery.pageSize, keyword: customerQuery.keyword, repeatOnly: customerQuery.repeatOnly === "" ? undefined : customerQuery.repeatOnly === "true" }) : Promise.resolve(undefined),
        can("after_sale:read") ? merchantApi.afterSales({ page: afterSaleQuery.page, pageSize: afterSaleQuery.pageSize, status: optionalInteger(afterSaleQuery.status) }) : Promise.resolve(undefined),
        can("marketing:read") ? merchantApi.coupons({ page: couponQuery.page, pageSize: couponQuery.pageSize, status: optionalInteger(couponQuery.status) }) : Promise.resolve(undefined),
        can("settlement:read") ? merchantApi.settlements({ page: settlementQuery.page, pageSize: settlementQuery.pageSize, status: optionalInteger(settlementQuery.status) }) : Promise.resolve(undefined),
        can("settlement:read") ? merchantApi.settlementEntries({ page: settlementEntryQuery.page, pageSize: settlementEntryQuery.pageSize, entryType: settlementEntryQuery.changeType }) : Promise.resolve(undefined)
      ]);
      const categoryKeyword = categoryQuery.keyword.trim().toLocaleLowerCase();
      const categoryPageItems = categoryKeyword
        ? categories.filter((category) => category.name.toLocaleLowerCase().includes(categoryKeyword))
        : categories;
      setMerchantUser(user);
      setMerchantAccounts(accounts?.list ?? []);
      setMerchantRoles(roles ?? []);
      setMerchantCategories(categories);
      setMerchantInventoryAlerts(inventoryAlerts.list);
      setMerchantAfterSales(afterSales?.list ?? []);
      setMerchantCoupons(coupons?.list ?? []);
      const nextRemotePages = buildMerchantRemotePages(adminPages, { user, overview, analytics, products, categories, categoryPageItems, orders, inventoryAlerts, inventoryLogs, accounts, roles, customerOverview, customers, afterSales, coupons, settlements, settlementEntries });
      setRemotePages((current) => ({
        ...nextRemotePages,
        ...(current["order-detail"] ? { "order-detail": current["order-detail"] } : {}),
        ...(current["user-detail"] ? { "user-detail": current["user-detail"] } : {}),
        ...(current["merchant-settlement-detail"] ? { "merchant-settlement-detail": current["merchant-settlement-detail"] } : {})
      }));
      setApiState({ loading: false, error: "", connected: true });
    } catch (error) {
      const message = error instanceof Error ? error.message : "接口同步失败";
      setApiState({ loading: false, error: message, connected: false });
      if (message.includes("未登录") || message.includes("401") || message.includes("token")) {
        clearMerchantAuth();
        setMerchantUser(undefined);
      setMerchantAccounts([]);
      setMerchantRoles([]);
        setRemotePages({});
      }
    }
  };

  useEffect(() => {
    if (!loadStoredMerchantAuth()) return;
    void loadMerchantData();
  }, []);

  useEffect(() => subscribeMerchantAuthExpired(() => {
    setMerchantUser(undefined);
    setMerchantAccounts([]);
    setMerchantRoles([]);
    setRemotePages({});
    setApiState({ loading: false, error: "登录状态已过期，请重新登录", connected: false });
    setLoginForm((current) => ({ ...current, password: "" }));
    setAccountModalOpen(true);
  }), []);

  useEffect(() => {
    if (!operationNotice) return;
    const timer = window.setTimeout(() => setOperationNotice(""), 4000);
    return () => window.clearTimeout(timer);
  }, [operationNotice]);

  const updateListQuery = (pageId: string, patch: Partial<MerchantListQuery>) => {
    setListQueries((current) => ({
      ...current,
      [pageId]: { ...(current[pageId] ?? createMerchantListQuery()), ...patch }
    }));
  };

  const runListQuery = (pageId: string, patch: Partial<MerchantListQuery> = {}) => {
    const next = { ...(listQueries[pageId] ?? createMerchantListQuery()), ...patch };
    setListQueries((current) => ({ ...current, [pageId]: next }));
    void loadMerchantData({ [pageId]: next });
  };

  const handleLogin = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setApiState({ loading: true, error: "", connected: false });
    try {
      const auth = await merchantApi.login(loginForm.username.trim(), loginForm.password);
      storeMerchantAuth(auth);
      setMerchantUser(auth.user);
      await loadMerchantData();
      setLoginForm((current) => ({ ...current, password: "" }));
      setAccountModalOpen(false);
    } catch (error) {
      const message = error instanceof Error ? error.message : "登录失败";
      setApiState({ loading: false, error: message, connected: false });
    }
  };

  const handleLogout = async () => {
    const storedAuth = loadStoredMerchantAuth();
    if (storedAuth) {
      try {
        await merchantApi.logout(storedAuth.refreshToken);
      } catch {
        // Local state is cleared even when the remote refresh token has already expired.
      }
    }
    clearMerchantAuth();
    setMerchantUser(undefined);
    setMerchantAccounts([]);
    setMerchantRoles([]);
    setRemotePages({});
    setApiState({ loading: false, error: "", connected: false });
    setLoginForm((current) => ({ ...current, password: "" }));
    setAccountModalOpen(true);
  };

  const handleToolbarAction = (page: ListPageData, actionLabel: string) => {
	if (!canWritePage(page.id, merchantUser)) return;
    const config = buildActionModalConfig(page, actionLabel, merchantCategories);
    if (!config) return;
    if (page.id === "employees" && merchantUser?.role === "admin") {
      const roleField = config.fields.find((field) => field.name === "role");
      if (roleField) roleField.options = roleField.options?.filter((option) => option.value !== "owner" && option.value !== "admin");
    }
    setActionModal(config);
    setActionModalError("");
  };

  const handleDetailAction = (actionLabel: string) => {
	if (!merchantUser?.permissions.includes("order:ship")) return;
    if (activePageId !== "order-detail" || actionLabel !== "填写物流并发货" || !selectedOrderId) return;
    setActionModal({ pageId: "order-detail", actionLabel, title: "填写物流并发货", description: "普通快递必须填写物流公司和运单号；商家配送不需要运单号。", entityId: selectedOrderId, fields: [
      { name: "deliveryType", label: "配送方式", placeholder: "", type: "select", defaultValue: "express", options: [{ label: "普通快递", value: "express" }, { label: "商家配送", value: "self_delivery" }] },
      { name: "company", label: "物流公司", placeholder: "例如：顺丰速运" },
      { name: "trackingNo", label: "运单号", placeholder: "请输入运单号" },
      { name: "estimatedArrivalAt", label: "预计送达时间（可选）", placeholder: "例如：2026-07-20T18:00:00+08:00" }
    ] });
    setActionModalError("");
  };

  const handleActionModalSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!actionModal) return;
    const values = Object.fromEntries(new FormData(event.currentTarget).entries());
    const readValue = (name: string) => String(values[name] ?? "").trim();
    setActionModalError("");
    setActionModalSubmitting(true);

    try {
      if (actionModal.pageId === "products") {
        if (!loadStoredMerchantAuth()) throw new Error("请先在右上角账号入口登录商户后台");
        const categoryId = Number(readValue("categoryId"));
        if (!readValue("name")) throw new Error("请输入商品名称");
        if (!Number.isFinite(categoryId) || categoryId <= 0) throw new Error("请输入有效的分类 ID");
        let cover = readValue("cover");
        const coverFile = values.coverFile;
        if (coverFile instanceof File && coverFile.size > 0) cover = (await merchantApi.uploadImage(coverFile, "product")).url;
        const productPayload = {
          category_id: categoryId,
          name: readValue("name"),
          cover,
          description: readValue("description"),
          status: Number(readValue("status") || 0)
        };
        if (actionModal.entityId) {
          const operation = readValue("operation");
          if (operation === "delete") await merchantApi.deleteProduct(actionModal.entityId);
          else {
            await merchantApi.updateProduct(actionModal.entityId, productPayload);
            if (operation === "on_sale") await merchantApi.setProductOnSale(actionModal.entityId);
            if (operation === "off_sale") await merchantApi.setProductOffSale(actionModal.entityId);
          }
        } else await merchantApi.createProduct(productPayload);
        await loadMerchantData();
      } else if (actionModal.pageId === "sku") {
        const productId = actionModal.productId;
        if (!productId) throw new Error("商品 ID 不存在");
        if (actionModal.skuId && readValue("operation") === "delete") {
          await merchantApi.deleteSku(productId, actionModal.skuId);
        } else {
          const name = readValue("name");
          const price = Math.round(Number(readValue("price")) * 100);
          const stock = Number(readValue("stock"));
          const lowStockThreshold = Number(readValue("lowStockThreshold"));
          const status = Number(readValue("status"));
          if (!name) throw new Error("请输入 SKU 名称");
          if (!Number.isFinite(price) || price <= 0) throw new Error("SKU 售价必须大于 0");
          if (!Number.isInteger(stock) || stock < 0) throw new Error("SKU 库存必须是非负整数");
          if (!Number.isInteger(lowStockThreshold) || lowStockThreshold < 0) throw new Error("低库存预警线必须是非负整数");
          if (status !== 0 && status !== 1) throw new Error("SKU 状态不合法");
          let image = readValue("image");
          const imageFile = values.imageFile;
          if (imageFile instanceof File && imageFile.size > 0) image = (await merchantApi.uploadImage(imageFile, "product")).url;
          const payload = { name, image, price, stock, low_stock_threshold: lowStockThreshold, status };
          if (actionModal.skuId) await merchantApi.updateSku(productId, actionModal.skuId, payload);
          else await merchantApi.createSku(productId, payload);
        }
        await loadMerchantData();
      } else if (actionModal.pageId === "categories") {
        if (!loadStoredMerchantAuth()) throw new Error("请先在右上角账号入口登录商户后台");
        const parentIdText = readValue("parentId");
        const sortText = readValue("sort");
        if (!readValue("name")) throw new Error("请输入分类名称");
        const parentId = parentIdText ? Number(parentIdText) : 0;
        const sort = sortText ? Number(sortText) : 0;
        if (!Number.isInteger(parentId) || parentId < 0) throw new Error("上级分类 ID 必须是非负整数");
        if (!Number.isInteger(sort)) throw new Error("排序必须是整数");
        const payload = {
          parent_id: parentId,
          name: readValue("name"),
          sort,
          status: readValue("status") ? Number(readValue("status")) : 1
        };
        if (actionModal.entityId && readValue("operation") === "delete") await merchantApi.deleteCategory(actionModal.entityId);
        else if (actionModal.entityId) await merchantApi.updateCategory(actionModal.entityId, payload);
        else await merchantApi.createCategory(payload);
        await loadMerchantData();
      } else if (actionModal.pageId === "inventory") {
        if (!actionModal.entityId) throw new Error("SKU ID 不存在");
        const stock = Number(readValue("stock"));
        const lowStockThreshold = Number(readValue("lowStockThreshold"));
        if (!Number.isInteger(stock) || stock < 0) throw new Error("库存必须是非负整数");
        if (!Number.isInteger(lowStockThreshold) || lowStockThreshold < 0) throw new Error("低库存预警线必须是非负整数");
        if (!readValue("remark")) throw new Error("请填写库存调整原因");
        await merchantApi.adjustStock(actionModal.entityId, { stock, low_stock_threshold: lowStockThreshold, remark: readValue("remark") }); await loadMerchantData();
      } else if (actionModal.pageId === "order-detail") {
        if (!actionModal.entityId) throw new Error("订单 ID 不存在");
        const deliveryType = readValue("deliveryType");
        if (deliveryType === "express" && (!readValue("company") || !readValue("trackingNo"))) throw new Error("普通快递必须填写物流公司和运单号");
        await merchantApi.shipOrder(actionModal.entityId, { delivery_type: deliveryType, logistics_company: readValue("company"), tracking_no: readValue("trackingNo"), estimated_arrival_at: readValue("estimatedArrivalAt") || undefined });
        const detail = await merchantApi.orderDetail(actionModal.entityId); setRemotePages((current) => ({ ...current, "order-detail": buildMerchantOrderDetailPage(adminPages, detail, Boolean(merchantUser?.permissions.includes("order:ship"))) })); await loadMerchantData();
      } else if (actionModal.pageId === "aftersale-list") {
        if (!actionModal.entityId) throw new Error("售后 ID 不存在");
        const operation = readValue("operation");
        if (operation === "approve" || operation === "retry") await merchantApi.approveAfterSale(actionModal.entityId);
        else if (operation === "sync") await merchantApi.syncAfterSaleRefund(actionModal.entityId);
        else if (operation === "reject") {
          if (!readValue("reason")) throw new Error("请填写拒绝原因");
          await merchantApi.rejectAfterSale(actionModal.entityId, readValue("reason"));
        } else throw new Error("当前售后没有可执行的操作");
        await loadMerchantData();
      } else if (actionModal.pageId === "coupon-management") {
        const name = readValue("name");
        const thresholdAmount = Math.round(Number(readValue("threshold")) * 100);
        const discountAmount = Math.round(Number(readValue("discount")) * 100);
        const totalQuantity = Number(readValue("quantity"));
        const perUserLimit = Number(readValue("perUserLimit"));
        const startAt = new Date(readValue("startAt"));
        const endAt = new Date(readValue("endAt"));
        if (!name) throw new Error("请输入优惠券名称");
        if (!Number.isFinite(discountAmount) || discountAmount <= 0) throw new Error("优惠金额必须大于 0");
        if (!Number.isFinite(thresholdAmount) || thresholdAmount < discountAmount) throw new Error("使用门槛不能小于优惠金额");
        if (!Number.isInteger(totalQuantity) || totalQuantity <= 0) throw new Error("发行数量必须是正整数");
        if (!Number.isInteger(perUserLimit) || perUserLimit <= 0) throw new Error("每人限领必须是正整数");
        if (!Number.isFinite(startAt.getTime()) || !Number.isFinite(endAt.getTime())) throw new Error("请输入有效的开始和结束时间");
        if (endAt <= startAt) throw new Error("结束时间必须晚于开始时间");
        const payload = { name, threshold_amount: thresholdAmount, discount_amount: discountAmount, total_quantity: totalQuantity, per_user_limit: perUserLimit, status: Number(readValue("status")), start_at: startAt.toISOString(), end_at: endAt.toISOString() };
        if (actionModal.entityId) await merchantApi.updateCoupon(actionModal.entityId, payload); else await merchantApi.createCoupon(payload); await loadMerchantData();
      } else if (actionModal.pageId === "employees") {
        if (!loadStoredMerchantAuth()) throw new Error("请先在右上角账号入口登录商户后台");
        const nickname = readValue("nickname");
        const role = readValue("role");
        const status = Number(readValue("status"));
        const newPassword = readValue("password");
        if (!nickname) throw new Error("请输入员工昵称");
        if (!role) throw new Error("请选择岗位角色");
        if (actionModal.accountId) {
          await merchantApi.updateAccount(actionModal.accountId, { nickname, role, status });
          if (newPassword) await merchantApi.resetAccountPassword(actionModal.accountId, newPassword);
        } else {
          const username = readValue("username");
          if (!username) throw new Error("请输入登录账号");
          if (!newPassword) throw new Error("请输入初始密码");
          await merchantApi.createAccount({ username, nickname, password: newPassword, role, status });
        }
        await loadMerchantData();
      } else {
        throw new Error("当前操作尚未接入后端");
      }
      setOperationNotice(`${actionModal.title}已完成，最新数据已经同步`);
      setActionModal(undefined);
    } catch (error) {
      setActionModalError(error instanceof Error ? error.message : "提交失败");
    } finally {
      setActionModalSubmitting(false);
    }
  };

  return (
    <div className="admin-shell">
      <aside className="sidebar">
        <div className="brand">
          <div>
            <strong>Mall Admin</strong>
            <span>商城管理后台</span>
          </div>
        </div>
        <nav>
          {sidebarModules.map((module) => {
            const Icon = module.icon;
            const group = adminGroups.find((item) => item.id === module.id);
            const active = module.id === activeGroup.id;
            const childPages = group?.pageIds
              .map((pageId) => pages.find((page) => page.id === pageId))
              .filter((page): page is AdminPageData => Boolean(page)) ?? [];
            if (!group || childPages.length === 0) return null;
            return (
              <section className="module-section" key={module.id}>
                <button
                  className={`module-button ${active ? "active" : ""}`}
                  onClick={() => {
                    navigateToPage(childPages[0].id);
                  }}
                >
                  <span className="module-main">
                    <span className="module-icon">
                      <Icon size={14} />
                    </span>
                    <span>{module.title}</span>
                  </span>
                  <span className="module-meta">
                    {active ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                  </span>
                </button>
                <div className={`child-menu ${active ? "open" : ""}`}>
                    {childPages.map((page) => {
                      const childActive = page.id === activePageId
                        || (activePageId === "order-detail" && page.id === "order-list")
                        || (activePageId === "user-detail" && page.id === "user-list")
                        || (activePageId === "merchant-settlement-detail" && page.id === "merchant-settlements");
                      return (
                        <button
                          className={childActive ? "active" : ""}
                          key={page.id}
                          onClick={() => {
                            navigateToPage(page.id);
                          }}
                        >
                          <span className="child-dot" />
                          <span>{page.title}</span>
                        </button>
                      );
                    })}
                </div>
              </section>
            );
          })}
        </nav>
        <div className="merchant-card">
          <strong>{merchantUser?.merchant_name ?? "尚未登录"}</strong>
          <span>{merchantUser ? `${merchantUser.role} · 已认证` : "请登录商户后台"}</span>
        </div>
      </aside>
      <main>
        <header className="topbar">
          <div className="topbar-crumb">{activeGroup.title.replace(/^[0-9]{2} /, "")} / {pageTitle}</div>
          <button className="user-chip" onClick={() => setAccountModalOpen(true)} type="button">
            <UserRound size={18} />
            <span>{merchantUser?.nickname || merchantUser?.username || "管理员"}</span>
          </button>
        </header>
        <section className="page-head">
          <div>
            <span>{pageEyebrow}</span>
            <h1>{pageTitle}</h1>
            <p>{pageDescription}</p>
          </div>
        </section>
        {apiState.error && merchantUser ? (
          <section className="api-feedback error" role="alert">
            <div><strong>数据加载失败</strong><span>{apiState.error}</span></div>
            <button className="ghost-button compact" disabled={apiState.loading} onClick={() => void loadMerchantData()} type="button">重新加载</button>
          </section>
        ) : null}
        {operationNotice ? (
          <section className="api-feedback success" role="status">
            <div><strong><CheckCircle2 size={16} />操作成功</strong><span>{operationNotice}</span></div>
            <button aria-label="关闭成功提示" className="icon-button compact" onClick={() => setOperationNotice("")} title="关闭" type="button"><X size={15} /></button>
          </section>
        ) : null}
        {apiState.loading && merchantUser ? <div className="api-progress" role="status">正在同步最新数据...</div> : null}
        <PageContent
          page={activePage}
		  merchantUser={merchantUser}
          listQuery={activeListQuery}
          loading={apiState.loading}
          onListQueryChange={(patch) => updateListQuery(activePage.id, patch)}
          onListSearch={() => runListQuery(activePage.id, { page: 1 })}
          onListReset={() => runListQuery(activePage.id, createMerchantListQuery())}
          onListRefresh={() => runListQuery(activePage.id)}
          onListPageChange={(page) => runListQuery(activePage.id, { page })}
          onDashboardNavigate={navigateToPage}
          onToolbarAction={handleToolbarAction}
          onProductEdit={openProductEdit}
      onEmployeeEdit={openEmployeeEdit}
          onOrderDetail={openOrderDetail}
          onAfterSaleDetail={openAfterSaleDetail}
          onUserDetail={openUserDetail}
          onCategoryEdit={openCategoryEdit}
          onInventoryAdjust={openInventoryAdjust}
          onCouponEdit={openCouponEdit}
          onSettlementDetail={openSettlementDetail}
          onDetailAction={handleDetailAction}
        />
      </main>
      {accountModalOpen ? (
        <AccountModal
          apiState={apiState}
          loginForm={loginForm}
          merchantUser={merchantUser}
          onLoginFormChange={(field, value) => setLoginForm((current) => ({ ...current, [field]: value }))}
          onLogin={handleLogin}
          onRefresh={() => void loadMerchantData()}
          onLogout={handleLogout}
          onClose={() => setAccountModalOpen(false)}
        />
      ) : null}
      {actionModal ? (
        <ActionModal
          config={actionModal}
          error={actionModalError}
          submitting={actionModalSubmitting}
          onClose={() => setActionModal(undefined)}
          onSubmit={handleActionModalSubmit}
          onCreateSku={openCreateSku}
          onEditSku={openEditSku}
        />
      ) : null}
    </div>
  );
};

export default App;
