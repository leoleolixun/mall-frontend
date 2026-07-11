import { BarChart3, Bell, ChevronDown, ChevronRight, ClipboardList, Headphones, Package, Search, Settings, ShieldCheck, Tags, UserRound, UsersRound, WalletCards } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { buildMerchantRemotePages } from "./api/merchantMappers";
import { clearMerchantAuth, loadStoredMerchantAuth, merchantApi, merchantApiBaseUrl, storeMerchantAuth, type MerchantUser } from "./api/merchantApi";
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

const Toolbar: React.FC<{ page: ListPageData }> = ({ page }) => (
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
        <button key={action.label} className={action.variant === "primary" ? "primary-button" : "ghost-button"}>
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

const ListPage: React.FC<{ page: ListPageData; onRowAction?: (row: TableRow) => void }> = ({ page, onRowAction }) => (
  <>
    <Toolbar page={page} />
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
  <div className="permission-layout">
    <section className="panel permission-canvas">
      <div className="panel-title">
        <div>
          <h3>权限矩阵画布</h3>
          <p>按模块配置角色可见范围、操作能力和高危权限。</p>
        </div>
      </div>
      <div className="permission-card-grid">
        {page.modules.map((module, index) => (
          <section className={index === 0 ? "permission-card featured" : "permission-card"} key={module}>
            <h3>{module}</h3>
            <p>按角色配置该模块可见范围与操作能力。</p>
            <button className="primary-button compact">配置</button>
          </section>
        ))}
      </div>
    </section>
    <aside className="panel permission-config">
      <h3>属性面板</h3>
      <label>
        <span>角色名称</span>
        <input defaultValue="店铺管理员" />
      </label>
      <label>
        <span>数据范围</span>
        <input defaultValue="全部店铺数据" />
      </label>
      <label>
        <span>高危权限</span>
        <input defaultValue="财务导出、系统设置" />
      </label>
      <div className="switch-row">
        <span>展示状态</span>
        <div>
          <span className="status-pill tone-green">启用</span>
          <span className="status-pill tone-orange">隐藏</span>
        </div>
      </div>
      <button className="primary-button permission-save">保存配置</button>
    </aside>
  </div>
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

const DetailPage: React.FC<{ page: DetailPageData }> = ({ page }) => (
  <div className="detail-layout">
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
  productFieldValues?: Record<string, string>;
  onProductEdit: (row: TableRow) => void;
  onOrderDetail: (row: TableRow) => void;
  onAfterSaleDetail: (row: TableRow) => void;
  onUserDetail: (row: TableRow) => void;
  onTicketDetail: (row: TableRow) => void;
  onReconciliation: (row: TableRow) => void;
}

const PageContent: React.FC<PageContentProps> = ({ page, productFieldValues, onProductEdit, onOrderDetail, onAfterSaleDetail, onUserDetail, onTicketDetail, onReconciliation }) => {
  if (page.kind === "dashboard") return <DashboardPage page={page} />;
  if (page.kind === "form") {
    return <FormPage page={page} fieldValues={page.id === "product-edit" ? productFieldValues : undefined} />;
  }
  if (page.kind === "detail") return <DetailPage page={page} />;
  if (page.kind === "matrix") return <MatrixPage page={page} />;
  if (page.kind === "board") return <BoardPage page={page} />;
  const onRowAction = page.id === "products"
    ? onProductEdit
    : page.id === "order-list"
      ? onOrderDetail
      : page.id === "aftersale-list"
        ? onAfterSaleDetail
        : page.id === "user-list"
          ? onUserDetail
          : page.id === "support-tickets"
            ? onTicketDetail
            : page.id === "merchant-settlements"
              ? onReconciliation
              : undefined;
  return <ListPage page={page} onRowAction={onRowAction} />;
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
      <section className="api-banner connected">
        <div>
          <strong>{merchantUser.merchant_name}</strong>
          <span>{merchantUser.nickname || merchantUser.username} · {merchantUser.role} · {merchantUser.permissions.length} 项权限</span>
        </div>
        <div className="api-banner-meta">
          <span>{apiState.loading ? "同步中" : apiState.connected ? "已连接后端" : "等待同步"} · {merchantApiBaseUrl}</span>
          {apiState.error ? <em>{apiState.error}</em> : null}
          <button className="ghost-button compact" type="button" onClick={onRefresh} disabled={apiState.loading}>刷新</button>
          <button className="ghost-button compact" type="button" onClick={onLogout}>退出</button>
        </div>
      </section>
    );
  }

  return (
    <form className="api-banner login" onSubmit={onLogin}>
      <div>
        <strong>连接商家后台接口</strong>
        <span>接口地址：{merchantApiBaseUrl}</span>
      </div>
      <div className="api-login-fields">
        <input value={loginForm.username} onChange={(event) => onLoginFormChange("username", event.target.value)} placeholder="商户账号" />
        <input value={loginForm.password} onChange={(event) => onLoginFormChange("password", event.target.value)} placeholder="商户密码" type="password" />
        <button className="primary-button" disabled={apiState.loading} type="submit">{apiState.loading ? "登录中" : "登录并同步"}</button>
      </div>
      {apiState.error ? <em>{apiState.error}</em> : null}
    </form>
  );
};

const App: React.FC = () => {
  const getInitialPageId = () => {
    const requested = new URLSearchParams(window.location.search).get("page");
    return adminPages.some((page) => page.id === requested) ? requested as string : "dashboard-overview";
  };
  const [activePageId, setActivePageId] = useState(getInitialPageId);
  const [selectedProduct, setSelectedProduct] = useState<TableRow | undefined>();
  const [merchantUser, setMerchantUser] = useState<MerchantUser | undefined>();
  const [remotePages, setRemotePages] = useState<Partial<Record<string, AdminPageData>>>({});
  const [loginForm, setLoginForm] = useState({ username: "merchant_admin", password: "" });
  const [apiState, setApiState] = useState<ApiState>({ loading: false, error: "", connected: false });
  const pages = useMemo(() => adminPages.map((page) => remotePages[page.id] ?? page), [remotePages]);
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
  const openProductEdit = (row: TableRow) => {
    setSelectedProduct(row);
    navigateToPage("product-edit");
  };
  const openOrderDetail = () => navigateToPage("order-detail");
  const openAfterSaleDetail = () => navigateToPage("aftersale-detail");
  const openUserDetail = () => navigateToPage("user-detail");
  const openTicketDetail = () => navigateToPage("ticket-detail");
  const openReconciliation = () => navigateToPage("reconciliation");

  const loadMerchantData = async () => {
    setApiState((current) => ({ ...current, loading: true, error: "" }));
    try {
      const [user, overview, analytics, products, categories, orders, inventoryAlerts] = await Promise.all([
        merchantApi.me(),
        merchantApi.dashboardOverview(),
        merchantApi.dashboardAnalytics(10, 10),
        merchantApi.products({ page: 1, pageSize: 20 }),
        merchantApi.categories(),
        merchantApi.orders({ page: 1, pageSize: 20 }),
        merchantApi.inventoryAlerts({ page: 1, pageSize: 20 })
      ]);
      setMerchantUser(user);
      setRemotePages(buildMerchantRemotePages(adminPages, { user, overview, analytics, products, categories, orders, inventoryAlerts }));
      setApiState({ loading: false, error: "", connected: true });
    } catch (error) {
      const message = error instanceof Error ? error.message : "接口同步失败";
      setApiState({ loading: false, error: message, connected: false });
      if (message.includes("未登录") || message.includes("401") || message.includes("token")) {
        clearMerchantAuth();
        setMerchantUser(undefined);
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
    setRemotePages({});
    setApiState({ loading: false, error: "", connected: false });
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
                  disabled={!group}
                  onClick={() => {
                    if (!group) return;
                    setSelectedProduct(undefined);
                    navigateToPage(group.pageIds[0]);
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
          <div className="user-chip">
            <UserRound size={18} />
            <span>{merchantUser?.nickname || merchantUser?.username || "管理员"}</span>
          </div>
        </header>
        <section className="page-head">
          <div>
            <span>{pageEyebrow}</span>
            <h1>{pageTitle}</h1>
            <p>{pageDescription}</p>
          </div>
        </section>
        <AuthPanel
          apiState={apiState}
          loginForm={loginForm}
          merchantUser={merchantUser}
          onLoginFormChange={(field, value) => setLoginForm((current) => ({ ...current, [field]: value }))}
          onLogin={handleLogin}
          onRefresh={loadMerchantData}
          onLogout={handleLogout}
        />
        <PageContent
          page={activePage}
          productFieldValues={productFieldValues}
          onProductEdit={openProductEdit}
          onOrderDetail={openOrderDetail}
          onAfterSaleDetail={openAfterSaleDetail}
          onUserDetail={openUserDetail}
          onTicketDetail={openTicketDetail}
          onReconciliation={openReconciliation}
        />
      </main>
    </div>
  );
};

export default App;
