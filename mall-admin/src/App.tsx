import { BarChart3, Bell, ChevronDown, ChevronRight, ClipboardList, Headphones, Package, Search, Settings, ShieldCheck, Tags, UserRound, UsersRound, WalletCards } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { buildMerchantCustomerDetailPage, buildMerchantOrderDetailPage, buildMerchantRemotePages } from "./api/merchantMappers";
import { clearMerchantAuth, loadStoredMerchantAuth, merchantApi, merchantApiBaseUrl, storeMerchantAuth, type MerchantAccount, type MerchantAfterSale, type MerchantCategory, type MerchantCoupon, type MerchantDashboardAnalytics, type MerchantDashboardOverview, type MerchantInventoryAlert, type MerchantOrder, type MerchantProduct, type MerchantRole, type MerchantUser, type PageResponse } from "./api/merchantApi";
import { adminGroups, adminPages } from "./data/adminPages";
import type { AdminPageData, BoardPageData, DashboardPageData, DetailPageData, FormPageData, ListPageData, MatrixPageData, TableColumn, TableRow, Tone } from "./types";

const toneClass = (tone: Tone) => `tone-${tone}`;

const sidebarModules = [
  { id: "dashboard", title: "工作台", icon: BarChart3 },
  { id: "group02", title: "商品中心", icon: Package },
  { id: "orders", title: "订单履约", icon: ClipboardList },
  { id: "users", title: "用户会员", icon: UsersRound },
  { id: "marketing", title: "营销运营", icon: Tags },
  { id: "finance", title: "财务结算", icon: WalletCards },
  { id: "group07", title: "商户权限", icon: ShieldCheck },
  { id: "support", title: "客服内容", icon: Headphones },
  { id: "group09", title: "系统设置", icon: Settings }
];

const pagePermissions: Record<string, string | undefined> = {
  "dashboard-overview": "dashboard:read",
  products: "catalog:read",
  "product-edit": "catalog:read",
  categories: "catalog:read",
  inventory: "inventory:read",
  "order-list": "order:read",
  "order-detail": "order:read",
  "shipping-management": "order:ship",
  "logistics-tracking": "order:read",
  "aftersale-list": "after_sale:read",
  "aftersale-detail": "after_sale:read",
  "coupon-management": "marketing:read",
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
  return !permission || !user || user.permissions.includes(permission);
};

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

interface ToolbarProps {
  page: ListPageData;
  onAction: (page: ListPageData, actionLabel: string) => void;
}

const Toolbar: React.FC<ToolbarProps> = ({ page, onAction }) => (
  <div className="toolbar">
    <div className="filters">
      {page.filters.map((filter) => (
        <label className="filter-control" key={filter}>
          <input placeholder={`请输入${filter}`} />
        </label>
      ))}
    </div>
    <div className="actions">
      <button className="primary-button">查询</button>
      <button className="ghost-button">重置</button>
      {page.actions.map((action) => (
        <button
          key={action.label}
          className={action.variant === "primary" ? "primary-button" : "ghost-button"}
          onClick={() => onAction(page, action.label)}
          type="button"
        >
          {action.label}
        </button>
      ))}
    </div>
  </div>
);

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
      <button className="ghost-button compact">列设置</button>
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
        {rows.map((row) => (
          <tr key={row.id}>
            {columns.map((column, index) => {
              const value = row.cells[column.key] ?? "-";
              const isAction = column.key === "action";
              return (
                <td key={column.key} className={index === 0 ? "strong-cell" : undefined}>
                  {isAction && onRowAction ? (
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
      <span>已选择 0 条</span>
      <div>
        <button className="ghost-button compact">上一页</button>
        <button className="primary-button compact">下一页</button>
      </div>
    </div>
  </section>
);

const DataTable: React.FC<{ page: ListPageData; onRowAction?: (row: TableRow) => void }> = ({ page, onRowAction }) => (
  <TableView title={page.title} subtitle={page.tableSubtitle} columns={page.columns} rows={page.rows} onRowAction={onRowAction} />
);

const ListPage: React.FC<{ page: ListPageData; onRowAction?: (row: TableRow) => void; onToolbarAction: (page: ListPageData, actionLabel: string) => void }> = ({ page, onRowAction, onToolbarAction }) => (
  <>
    <Toolbar page={page} onAction={onToolbarAction} />
    <DataTable page={page} onRowAction={onRowAction} />
  </>
);

const DashboardPage: React.FC<{ page: DashboardPageData }> = ({ page }) => (
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
          <button className={index === 0 ? "todo-item featured" : "todo-item"} key={todo}>
            <span>{todo}</span>
            <strong>处理</strong>
          </button>
        ))}
      </div>
    </section>
    <TableView
      title="实时订单"
      subtitle="最近 30 分钟订单动态"
      columns={page.columns}
      rows={page.rows}
    />
  </div>
);

const FormPage: React.FC<{ page: FormPageData; fieldValues?: Record<string, string> }> = ({ page, fieldValues }) => {
  const values = fieldValues ?? page.fieldValues;
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

const BoardPage: React.FC<{ page: BoardPageData }> = ({ page }) => (
  <div className="board-layout">
    <section className="panel board-canvas">
      <div className="panel-title">
        <div>
          <h3>{page.title}画布</h3>
          <p>拖拽排序，支持端口差异化配置。</p>
        </div>
        <button className="primary-button">保存配置</button>
      </div>
      <div className="board-card-grid">
        {page.cards.map((card, index) => (
          <section className={index === 0 ? "board-card featured" : "board-card"} key={card}>
            <h3>{card}</h3>
            <p>支持内容、跳转、展示终端和排序配置。</p>
            <button className="primary-button compact">配置</button>
          </section>
        ))}
      </div>
    </section>
    <aside className="panel board-config">
      <h3>属性面板</h3>
      <label>
        <span>组件标题</span>
        <input defaultValue={page.cards[0]} />
      </label>
      <label>
        <span>展示终端</span>
        <input defaultValue="H5 / 小程序 / PC Web" />
      </label>
      <label>
        <span>跳转链接</span>
        <input placeholder="请输入跳转链接" />
      </label>
      <div className="switch-row">
        <span>展示状态</span>
        <div>
          <span className="status-pill tone-green">启用</span>
          <span className="status-pill tone-orange">隐藏</span>
        </div>
      </div>
      <button className="primary-button board-save">保存配置</button>
    </aside>
  </div>
);

const DetailPage: React.FC<{ page: DetailPageData; onAction: (actionLabel: string) => void }> = ({ page, onAction }) => (
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
    />
  </div>
);

interface PageContentProps {
  page: AdminPageData;
	merchantUser?: MerchantUser;
  productFieldValues?: Record<string, string>;
  onToolbarAction: (page: ListPageData, actionLabel: string) => void;
  onProductEdit: (row: TableRow) => void;
  onEmployeeEdit: (row: TableRow) => void;
  onOrderDetail: (row: TableRow) => void;
  onAfterSaleDetail: (row: TableRow) => void;
  onUserDetail: (row: TableRow) => void;
  onTicketDetail: (row: TableRow) => void;
  onReconciliation: (row: TableRow) => void;
  onCategoryEdit: (row: TableRow) => void;
  onInventoryAdjust: (row: TableRow) => void;
  onCouponEdit: (row: TableRow) => void;
  onDetailAction: (actionLabel: string) => void;
}

const PageContent: React.FC<PageContentProps> = ({ page, merchantUser, productFieldValues, onToolbarAction, onProductEdit, onEmployeeEdit, onOrderDetail, onAfterSaleDetail, onUserDetail, onTicketDetail, onReconciliation, onCategoryEdit, onInventoryAdjust, onCouponEdit, onDetailAction }) => {
  if (page.kind === "dashboard") return <DashboardPage page={page} />;
  if (page.kind === "form") {
    return <FormPage page={page} fieldValues={page.id === "product-edit" ? productFieldValues : undefined} />;
  }
  if (page.kind === "detail") return <DetailPage page={page} onAction={onDetailAction} />;
  if (page.kind === "matrix") return <MatrixPage page={page} />;
  if (page.kind === "board") return <BoardPage page={page} />;
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
      : page.id === "aftersale-list" && canWrite
        ? onAfterSaleDetail
        : page.id === "user-list"
          ? onUserDetail
          : page.id === "support-tickets"
            ? onTicketDetail
            : page.id === "merchant-settlements"
              ? onReconciliation
              : undefined;
  return <ListPage page={page} onRowAction={onRowAction} onToolbarAction={onToolbarAction} />;
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
}

const buildActionModalConfig = (page: ListPageData, actionLabel: string): ActionModalConfig | undefined => {
  if (!actionLabel.includes("新增")) return undefined;

  if (page.id === "products") {
    return {
      pageId: page.id,
      actionLabel,
      title: "新增商品",
      description: "创建商品基础资料，创建后可继续维护 SKU、库存和上架状态。",
      fields: [
        { name: "name", label: "商品名称", placeholder: "请输入商品名称" },
        { name: "categoryId", label: "分类 ID", placeholder: "请输入分类 ID", type: "number" },
        { name: "description", label: "商品描述", placeholder: "请输入商品描述" },
        { name: "cover", label: "商品主图", placeholder: "请输入图片地址" }
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
        { name: "parentId", label: "上级分类 ID", placeholder: "不填默认为一级分类", type: "number" },
        { name: "sort", label: "排序", placeholder: "请输入排序值", type: "number", defaultValue: "0" }
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

const buildProductEditModal = (product: MerchantProduct): ActionModalConfig => ({
  pageId: "products", actionLabel: "编辑商品", title: `编辑商品 · ${product.name}`, description: "维护商品资料和第一个 SKU；上下架、删除也通过本次操作提交。",
  entityId: product.id,
  fields: [
    { name: "name", label: "商品名称", placeholder: "请输入商品名称", defaultValue: product.name },
    { name: "categoryId", label: "分类 ID", placeholder: "请输入分类 ID", type: "number", defaultValue: String(product.category_id) },
    { name: "description", label: "商品描述", placeholder: "请输入商品描述", defaultValue: product.description },
    { name: "cover", label: "商品主图 URL", placeholder: "可直接填写 URL", defaultValue: product.cover },
    { name: "coverFile", label: "上传新主图（可选）", placeholder: "", type: "file" },
    { name: "skuName", label: "首个 SKU 名称", placeholder: "默认规格", defaultValue: product.skus[0]?.name ?? "默认规格" },
    { name: "skuPrice", label: "首个 SKU 售价（元）", placeholder: "99.00", type: "number", defaultValue: product.skus[0] ? String(product.skus[0].price / 100) : "" },
    { name: "skuStock", label: product.skus[0] ? "首个 SKU 库存（请到库存页调整）" : "首个 SKU 初始库存", placeholder: "0", type: "number", defaultValue: String(product.skus[0]?.stock ?? 0), disabled: Boolean(product.skus[0]) },
    { name: "status", label: "商品状态", placeholder: "", type: "select", defaultValue: String(product.status), options: [{ label: "草稿", value: "0" }, { label: "上架", value: "1" }, { label: "下架", value: "2" }] },
    { name: "operation", label: "保存操作", placeholder: "", type: "select", defaultValue: "save", options: [{ label: "保存资料", value: "save" }, { label: "保存并上架", value: "on_sale" }, { label: "保存并下架", value: "off_sale" }, { label: "删除商品", value: "delete" }] }
  ]
});

const buildCategoryEditModal = (category: MerchantCategory): ActionModalConfig => ({
  pageId: "categories", actionLabel: "编辑分类", title: `编辑分类 · ${category.name}`, description: "维护分类层级、排序和状态；删除前必须确保分类下没有商品。", entityId: category.id,
  fields: [
    { name: "name", label: "分类名称", placeholder: "请输入分类名称", defaultValue: category.name },
    { name: "parentId", label: "上级分类 ID", placeholder: "0", type: "number", defaultValue: String(category.parent_id) },
    { name: "sort", label: "排序", placeholder: "0", type: "number", defaultValue: String(category.sort) },
    { name: "status", label: "状态", placeholder: "", type: "select", defaultValue: String(category.status), options: [{ label: "启用", value: "1" }, { label: "停用", value: "0" }] },
    { name: "operation", label: "保存操作", placeholder: "", type: "select", defaultValue: "save", options: [{ label: "保存", value: "save" }, { label: "删除分类", value: "delete" }] }
  ]
});

const buildInventoryModal = (alert: MerchantInventoryAlert): ActionModalConfig => ({
  pageId: "inventory", actionLabel: "调整库存", title: `调整库存 · ${alert.sku_name}`, description: "填写调整后的绝对库存值，后端会记录变更前后数量和操作人。", entityId: alert.sku_id,
  fields: [{ name: "stock", label: "调整后库存", placeholder: "0", type: "number", defaultValue: String(alert.stock) }, { name: "remark", label: "调整原因", placeholder: "例如：采购入库" }]
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
}

const ActionModal: React.FC<ActionModalProps> = ({ config, error, submitting, onClose, onSubmit }) => (
  <div className="modal-backdrop" role="presentation">
    <section className="modal-card" role="dialog" aria-modal="true" aria-labelledby="action-modal-title">
      <div className="modal-head">
        <div>
          <h2 id="action-modal-title">{config.title}</h2>
          <p>{config.description}</p>
        </div>
        <button className="modal-close" onClick={onClose} type="button">×</button>
      </div>
      <form onSubmit={onSubmit}>
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
        {error ? <p className="modal-error">{error}</p> : null}
        <div className="modal-actions">
          <button className="ghost-button" onClick={onClose} type="button">取消</button>
          <button className="primary-button" disabled={submitting} type="submit">{submitting ? "提交中" : "提交保存"}</button>
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
        <button className="modal-close" onClick={onClose} type="button">×</button>
      </div>
      <AuthPanel {...authProps} />
    </section>
  </div>
);

const App: React.FC = () => {
  const getInitialPageId = () => {
    const requested = new URLSearchParams(window.location.search).get("page");
    return adminPages.some((page) => page.id === requested) ? requested as string : "dashboard-overview";
  };
  const [activePageId, setActivePageId] = useState(getInitialPageId);
  const [selectedProduct, setSelectedProduct] = useState<TableRow | undefined>();
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
  const [accountModalOpen, setAccountModalOpen] = useState(false);
  const [actionModal, setActionModal] = useState<ActionModalConfig | undefined>();
  const [actionModalError, setActionModalError] = useState("");
  const [actionModalSubmitting, setActionModalSubmitting] = useState(false);
  const pages = useMemo(
    () => adminPages.map((page) => remotePages[page.id] ?? page).filter((page) => canAccessPage(page.id, merchantUser)),
    [remotePages, merchantUser]
  );
  const activePage = useMemo(() => pages.find((page) => page.id === activePageId) ?? pages[0], [activePageId, pages]);
  const activeGroup = useMemo(() => adminGroups.find((group) => group.id === activePage.groupId) ?? adminGroups[0], [activePage.groupId]);
  const productFieldValues = useMemo(() => selectedProduct ? {
    "商品名称": selectedProduct.cells.name,
    "商品类目": selectedProduct.cells.category,
    "品牌": selectedProduct.cells.name.includes("耳机") ? "SoundMax" : selectedProduct.cells.name.includes("洁面") ? "GlowLab" : "默认品牌",
    "商品卖点": "官方正品 · 极速发货 · 7 天无理由",
    "销售价": selectedProduct.cells.price,
    "划线价": selectedProduct.cells.price.replace("¥", "¥") + ".00",
    "SKU 编码": selectedProduct.id.toUpperCase(),
    "可售库存": selectedProduct.cells.stock,
    "上架状态": selectedProduct.cells.status,
    "运费模板": "默认包邮模板",
    "售后策略": "7 天无理由",
    "推荐权重": selectedProduct.status === "预警" ? "40" : "80"
  } : undefined, [selectedProduct]);
  const pageTitle = activePage.title;
  const pageEyebrow = activePage.id === "product-edit" ? "商品中心 / 商品列表 / 商品编辑" : activePage.eyebrow;
  const pageDescription = activePage.description;
  const navigateToPage = (pageId: string) => {
    setActivePageId(pageId);
    const url = new URL(window.location.href);
    url.searchParams.set("page", pageId);
    window.history.pushState({}, "", url);
  };
  const openProductEdit = async (row: TableRow) => {
    const id = Number(row.id); if (!id) return;
    setApiState((current) => ({ ...current, loading: true, error: "" }));
    try { const product = await merchantApi.productDetail(id); setActionModal(buildProductEditModal(product)); setActionModalError(""); setApiState((current) => ({ ...current, loading: false, connected: true })); }
    catch (error) { setApiState((current) => ({ ...current, loading: false, error: error instanceof Error ? error.message : "商品详情加载失败" })); }
  };
  const openEmployeeEdit = (row: TableRow) => {
    const account = merchantAccounts.find((item) => String(item.id) === row.id);
    if (!account) return;
    setActionModal(buildEmployeeEditModal(account, merchantRoles));
    setActionModalError("");
  };
  const openCategoryEdit = (row: TableRow) => { const value = merchantCategories.find((item) => String(item.id) === row.id); if (value) { setActionModal(buildCategoryEditModal(value)); setActionModalError(""); } };
  const openInventoryAdjust = (row: TableRow) => { const parts = row.id.split("-"); const skuId = Number(parts[parts.length - 1]); const value = merchantInventoryAlerts.find((item) => item.sku_id === skuId); if (value) { setActionModal(buildInventoryModal(value)); setActionModalError(""); } };
  const openCouponEdit = (row: TableRow) => { const value = merchantCoupons.find((item) => String(item.id) === row.id); if (value) { setActionModal(buildCouponEditModal(value)); setActionModalError(""); } };
  const openOrderDetail = async (row: TableRow) => { const id = Number(row.id); if (!id) return; setApiState((current) => ({ ...current, loading: true, error: "" })); try { const order = await merchantApi.orderDetail(id); setSelectedOrderId(id); setRemotePages((current) => ({ ...current, "order-detail": buildMerchantOrderDetailPage(adminPages, order, Boolean(merchantUser?.permissions.includes("order:ship"))) })); setApiState((current) => ({ ...current, loading: false, connected: true })); navigateToPage("order-detail"); } catch (error) { setApiState((current) => ({ ...current, loading: false, error: error instanceof Error ? error.message : "订单详情加载失败" })); } };
  const openAfterSaleDetail = (row: TableRow) => { const value = merchantAfterSales.find((item) => String(item.id) === row.id); if (!value) return; setActionModal({ pageId: "aftersale-list", actionLabel: "处理售后", title: `处理售后 · ${value.after_sale_no}`, description: `${value.product_name} · ${value.reason} · 退款 ¥${(value.refund_amount / 100).toFixed(2)}`, entityId: value.id, fields: [{ name: "operation", label: "审核结果", placeholder: "", type: "select", options: [{ label: "同意并原路退款", value: "approve" }, { label: "拒绝申请", value: "reject" }] }, { name: "reason", label: "拒绝原因", placeholder: "同意时可留空" }] }); setActionModalError(""); };
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
  const openTicketDetail = () => navigateToPage("ticket-detail");
  const openReconciliation = () => navigateToPage("reconciliation");

  const loadMerchantData = async () => {
    setApiState((current) => ({ ...current, loading: true, error: "" }));
    try {
    const user = await merchantApi.me();
    const can = (permission: string) => user.permissions.includes(permission);
    const [overview, analytics, products, categories, orders, inventoryAlerts, accounts, roles, customerOverview, customers, afterSales, coupons] = await Promise.all([
      can("dashboard:read") ? merchantApi.dashboardOverview() : Promise.resolve(emptyOverview),
      can("dashboard:read") ? merchantApi.dashboardAnalytics(10, 10) : Promise.resolve(emptyAnalytics),
      can("catalog:read") ? merchantApi.products({ page: 1, pageSize: 20 }) : Promise.resolve(emptyPage<MerchantProduct>()),
      can("catalog:read") ? merchantApi.categories() : Promise.resolve([]),
      can("order:read") ? merchantApi.orders({ page: 1, pageSize: 20 }) : Promise.resolve(emptyPage<MerchantOrder>()),
      can("inventory:read") ? merchantApi.inventoryAlerts({ page: 1, pageSize: 20 }) : Promise.resolve(emptyPage<MerchantInventoryAlert>()),
      can("account:read") ? merchantApi.accounts({ page: 1, pageSize: 50 }) : Promise.resolve(undefined),
      can("account:read") ? merchantApi.roles() : Promise.resolve(undefined),
      can("customer:read") ? merchantApi.customerOverview() : Promise.resolve(undefined),
      can("customer:read") ? merchantApi.customers({ page: 1, pageSize: 20 }) : Promise.resolve(undefined),
      can("after_sale:read") ? merchantApi.afterSales({ page: 1, pageSize: 20 }) : Promise.resolve(undefined),
      can("marketing:read") ? merchantApi.coupons({ page: 1, pageSize: 20 }) : Promise.resolve(undefined)
    ]);
      setMerchantUser(user);
    setMerchantAccounts(accounts?.list ?? []);
    setMerchantRoles(roles ?? []);
    setMerchantCategories(categories); setMerchantInventoryAlerts(inventoryAlerts.list); setMerchantAfterSales(afterSales?.list ?? []); setMerchantCoupons(coupons?.list ?? []);
    setRemotePages(buildMerchantRemotePages(adminPages, { user, overview, analytics, products, categories, orders, inventoryAlerts, accounts, roles, customerOverview, customers, afterSales, coupons }));
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

  const handleLogin = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setApiState({ loading: true, error: "", connected: false });
    try {
      const auth = await merchantApi.login(loginForm.username.trim(), loginForm.password);
      storeMerchantAuth(auth);
      setMerchantUser(auth.user);
      await loadMerchantData();
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
  };

  const handleToolbarAction = (page: ListPageData, actionLabel: string) => {
	if (!canWritePage(page.id, merchantUser)) return;
    const config = buildActionModalConfig(page, actionLabel);
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
            const detail = await merchantApi.productDetail(actionModal.entityId);
            const skuPrice = Math.round(Number(readValue("skuPrice")) * 100);
            if (readValue("skuName") && Number.isFinite(skuPrice)) {
              const skuPayload = { name: readValue("skuName"), image: cover, price: skuPrice, stock: detail.skus[0]?.stock ?? Number(readValue("skuStock")), low_stock_threshold: detail.skus[0]?.low_stock_threshold ?? 0, status: detail.skus[0]?.status ?? 1 };
              if (detail.skus[0]) await merchantApi.updateSku(detail.id, detail.skus[0].id, skuPayload); else await merchantApi.createSku(detail.id, skuPayload);
            }
            if (operation === "on_sale") await merchantApi.setProductOnSale(actionModal.entityId);
            if (operation === "off_sale") await merchantApi.setProductOffSale(actionModal.entityId);
          }
        } else await merchantApi.createProduct(productPayload);
        await loadMerchantData();
      } else if (actionModal.pageId === "categories") {
        if (!loadStoredMerchantAuth()) throw new Error("请先在右上角账号入口登录商户后台");
        const parentIdText = readValue("parentId");
        const sortText = readValue("sort");
        if (!readValue("name")) throw new Error("请输入分类名称");
        const payload = {
          parent_id: parentIdText ? Number(parentIdText) : 0,
          name: readValue("name"),
          sort: sortText ? Number(sortText) : 0,
          status: readValue("status") ? Number(readValue("status")) : 1
        };
        if (actionModal.entityId && readValue("operation") === "delete") await merchantApi.deleteCategory(actionModal.entityId);
        else if (actionModal.entityId) await merchantApi.updateCategory(actionModal.entityId, payload);
        else await merchantApi.createCategory(payload);
        await loadMerchantData();
      } else if (actionModal.pageId === "inventory") {
        if (!actionModal.entityId) throw new Error("SKU ID 不存在");
        const stock = Number(readValue("stock")); if (!Number.isInteger(stock) || stock < 0) throw new Error("库存必须是非负整数");
        await merchantApi.adjustStock(actionModal.entityId, { stock, remark: readValue("remark") }); await loadMerchantData();
      } else if (actionModal.pageId === "order-detail") {
        if (!actionModal.entityId) throw new Error("订单 ID 不存在");
        const deliveryType = readValue("deliveryType");
        await merchantApi.shipOrder(actionModal.entityId, { delivery_type: deliveryType, logistics_company: readValue("company"), tracking_no: readValue("trackingNo"), estimated_arrival_at: readValue("estimatedArrivalAt") || undefined });
        const detail = await merchantApi.orderDetail(actionModal.entityId); setRemotePages((current) => ({ ...current, "order-detail": buildMerchantOrderDetailPage(adminPages, detail, Boolean(merchantUser?.permissions.includes("order:ship"))) })); await loadMerchantData();
      } else if (actionModal.pageId === "aftersale-list") {
        if (!actionModal.entityId) throw new Error("售后 ID 不存在");
        if (readValue("operation") === "approve") await merchantApi.approveAfterSale(actionModal.entityId); else { if (!readValue("reason")) throw new Error("请填写拒绝原因"); await merchantApi.rejectAfterSale(actionModal.entityId, readValue("reason")); }
        await loadMerchantData();
      } else if (actionModal.pageId === "coupon-management") {
        const payload = { name: readValue("name"), threshold_amount: Math.round(Number(readValue("threshold")) * 100), discount_amount: Math.round(Number(readValue("discount")) * 100), total_quantity: Number(readValue("quantity")), per_user_limit: Number(readValue("perUserLimit")), status: Number(readValue("status")), start_at: new Date(readValue("startAt")).toISOString(), end_at: new Date(readValue("endAt")).toISOString() };
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
      }
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
            return (
              <section className="module-section" key={module.id}>
                <button
                  className={`module-button ${active ? "active" : ""} ${group ? "" : "disabled"}`}
          disabled={!group || childPages.length === 0}
                  onClick={() => {
            if (!group || childPages.length === 0) return;
                    setSelectedProduct(undefined);
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
                {group ? (
                  <div className={`child-menu ${active ? "open" : ""}`}>
                    {childPages.map((page) => {
                      const childActive = page.id === activePageId
                        || (activePageId === "product-edit" && page.id === "products")
                        || (activePageId === "order-detail" && page.id === "order-list")
                        || (activePageId === "aftersale-detail" && page.id === "aftersale-list")
                        || (activePageId === "user-detail" && page.id === "user-list")
                        || (activePageId === "ticket-detail" && page.id === "support-tickets")
                        || (activePageId === "reconciliation" && page.id === "merchant-settlements");
                      return (
                        <button
                          className={childActive ? "active" : ""}
                          key={page.id}
                          onClick={() => {
                            setSelectedProduct(undefined);
                            navigateToPage(page.id);
                          }}
                        >
                          <span className="child-dot" />
                          <span>{page.title}</span>
                        </button>
                      );
                    })}
                  </div>
                ) : null}
              </section>
            );
          })}
        </nav>
        <div className="merchant-card">
          <strong>{merchantUser?.merchant_name ?? "默认商户"}</strong>
          <span>{merchantUser ? `${merchantUser.role} · 已认证` : "旗舰店 · 已认证"}</span>
        </div>
      </aside>
      <main>
        <header className="topbar">
          <div className="topbar-crumb">{activeGroup.title.replace(/^[0-9]{2} /, "")} / {pageTitle}</div>
          <div className="search-box">
            <Search size={16} />
            <input placeholder="搜索订单、商品、用户" />
          </div>
          <button className="icon-button"><Bell size={18} /></button>
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
        <PageContent
          page={activePage}
		  merchantUser={merchantUser}
          productFieldValues={productFieldValues}
          onToolbarAction={handleToolbarAction}
          onProductEdit={openProductEdit}
      onEmployeeEdit={openEmployeeEdit}
          onOrderDetail={openOrderDetail}
          onAfterSaleDetail={openAfterSaleDetail}
          onUserDetail={openUserDetail}
          onTicketDetail={openTicketDetail}
          onReconciliation={openReconciliation}
          onCategoryEdit={openCategoryEdit}
          onInventoryAdjust={openInventoryAdjust}
          onCouponEdit={openCouponEdit}
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
          onRefresh={loadMerchantData}
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
        />
      ) : null}
    </div>
  );
};

export default App;
