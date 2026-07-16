import { ChevronLeft, ChevronRight, RefreshCw, RotateCcw, Search } from "lucide-react";
import type { FormEvent } from "react";
import type { ListPageData, TableRow, Tone } from "../../types";

export interface MerchantListQuery {
  page: number;
  pageSize: number;
  keyword: string;
  status: string;
  role: string;
  repeatOnly: string;
  changeType: string;
  productId: string;
  skuId: string;
}

export const createMerchantListQuery = (): MerchantListQuery => ({
  page: 1,
  pageSize: 20,
  keyword: "",
  status: "",
  role: "",
  repeatOnly: "",
  changeType: "",
  productId: "",
  skuId: ""
});

interface FilterOption {
  label: string;
  value: string;
}

interface FilterDefinition {
  key: keyof Pick<MerchantListQuery, "keyword" | "status" | "role" | "repeatOnly" | "changeType" | "productId" | "skuId">;
  label: string;
  placeholder?: string;
  inputMode?: "numeric";
  options?: FilterOption[];
}

const statusOptions = {
  product: [
    { label: "全部状态", value: "" },
    { label: "草稿", value: "0" },
    { label: "在售", value: "1" },
    { label: "已下架", value: "2" }
  ],
  order: [
    { label: "全部状态", value: "" },
    { label: "待支付", value: "1" },
    { label: "待发货", value: "2" },
    { label: "已发货", value: "3" },
    { label: "已完成", value: "4" },
    { label: "已取消", value: "5" }
  ],
  afterSale: [
    { label: "全部状态", value: "" },
    { label: "待审核", value: "1" },
    { label: "退款处理中", value: "2" },
    { label: "退款成功", value: "3" },
    { label: "已拒绝", value: "4" },
    { label: "用户取消", value: "5" },
    { label: "退款失败", value: "6" }
  ],
  coupon: [
    { label: "全部状态", value: "" },
    { label: "草稿", value: "0" },
    { label: "发放中", value: "1" },
    { label: "已停用", value: "2" }
  ],
  account: [
    { label: "全部状态", value: "" },
    { label: "启用", value: "1" },
    { label: "停用", value: "0" }
  ],
  settlement: [
    { label: "全部状态", value: "" },
    { label: "待确认", value: "1" },
    { label: "已确认待打款", value: "2" },
    { label: "已打款", value: "3" }
  ]
} satisfies Record<string, FilterOption[]>;

const roleOptions: FilterOption[] = [
  { label: "全部岗位", value: "" },
  { label: "店主", value: "owner" },
  { label: "管理员", value: "admin" },
  { label: "运营人员", value: "operator" },
  { label: "销售人员", value: "sales" },
  { label: "库管人员", value: "warehouse" }
];

const filterDefinitions: Record<string, FilterDefinition[]> = {
  products: [
    { key: "keyword", label: "商品搜索", placeholder: "商品名称" },
    { key: "status", label: "商品状态", options: statusOptions.product }
  ],
  categories: [{ key: "keyword", label: "分类搜索", placeholder: "分类名称" }],
  inventory: [{ key: "keyword", label: "库存搜索", placeholder: "商品或 SKU 名称" }],
  "inventory-logs": [
    { key: "productId", label: "商品 ID", placeholder: "商品 ID", inputMode: "numeric" },
    { key: "skuId", label: "SKU ID", placeholder: "SKU ID", inputMode: "numeric" },
    {
      key: "changeType",
      label: "变更类型",
      options: [
        { label: "全部类型", value: "" },
        { label: "创建 SKU 初始化", value: "merchant_init" },
        { label: "商家调整", value: "merchant_adjustment" },
        { label: "下单扣减", value: "order_create" },
        { label: "取消返还", value: "order_cancel" },
        { label: "超时返还", value: "order_timeout" }
      ]
    }
  ],
  "order-list": [
    { key: "keyword", label: "订单搜索", placeholder: "订单号、收货人或手机号" },
    { key: "status", label: "订单状态", options: statusOptions.order }
  ],
  "aftersale-list": [{ key: "status", label: "售后状态", options: statusOptions.afterSale }],
  "coupon-management": [{ key: "status", label: "优惠券状态", options: statusOptions.coupon }],
  "merchant-settlements": [{ key: "status", label: "结算状态", options: statusOptions.settlement }],
  "settlement-entries": [
    {
      key: "changeType",
      label: "流水类型",
      options: [
        { label: "全部类型", value: "" },
        { label: "销售收入", value: "sale" },
        { label: "平台佣金", value: "commission" },
        { label: "退款冲减", value: "refund" },
        { label: "佣金退回", value: "commission_refund" },
        { label: "人工调账", value: "adjustment" }
      ]
    }
  ],
  employees: [
    { key: "keyword", label: "员工搜索", placeholder: "账号或昵称" },
    { key: "role", label: "岗位角色", options: roleOptions },
    { key: "status", label: "账号状态", options: statusOptions.account }
  ],
  "user-list": [
    { key: "keyword", label: "顾客搜索", placeholder: "昵称或手机号" },
    {
      key: "repeatOnly",
      label: "顾客类型",
      options: [
        { label: "全部顾客", value: "" },
        { label: "仅复购顾客", value: "true" },
        { label: "仅首购顾客", value: "false" }
      ]
    }
  ]
};

const toneClass = (tone: Tone) => `tone-${tone}`;

const StatusPill: React.FC<{ value: string }> = ({ value }) => {
  const tone: Tone = value.includes("成功") || value.includes("启用") || value.includes("在售") || value.includes("已完成") || value.includes("推荐")
    ? "green"
    : value.includes("预警") || value.includes("待") || value.includes("处理中") || value.includes("确认中")
      ? "orange"
      : value.includes("风险") || value.includes("失败") || value.includes("停用") || value.includes("拒绝")
        ? "red"
        : "blue";

  return <span className={`status-pill ${toneClass(tone)}`}>{value}</span>;
};

interface MerchantListPageProps {
  page: ListPageData;
  query: MerchantListQuery;
  loading: boolean;
  onQueryChange: (patch: Partial<MerchantListQuery>) => void;
  onSearch: () => void;
  onReset: () => void;
  onRefresh: () => void;
  onPageChange: (page: number) => void;
  onRowAction?: (row: TableRow) => void;
  onToolbarAction: (page: ListPageData, actionLabel: string) => void;
}

export const MerchantListPage: React.FC<MerchantListPageProps> = ({
  page,
  query,
  loading,
  onQueryChange,
  onSearch,
  onReset,
  onRefresh,
  onPageChange,
  onRowAction,
  onToolbarAction
}) => {
  const filters = filterDefinitions[page.id] ?? [];
  const currentPage = page.page ?? query.page;
  const pageSize = page.pageSize ?? query.pageSize;
  const total = page.total ?? page.rows.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  const submitSearch = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    onSearch();
  };

  return (
    <>
      <form className="toolbar" onSubmit={submitSearch}>
        <div className="filters">
          {filters.map((filter) => (
            <label className="filter-control" key={filter.key}>
              <span className="sr-only">{filter.label}</span>
              {filter.options ? (
                <select
                  aria-label={filter.label}
                  value={query[filter.key]}
                  onChange={(event) => onQueryChange({ [filter.key]: event.target.value })}
                >
                  {filter.options.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
                </select>
              ) : (
                <input
                  aria-label={filter.label}
                  inputMode={filter.inputMode}
                  placeholder={filter.placeholder}
                  value={query[filter.key]}
                  onChange={(event) => onQueryChange({ [filter.key]: event.target.value })}
                />
              )}
            </label>
          ))}
        </div>
        <div className="actions">
          <button
            aria-label="刷新列表"
            className="icon-button toolbar-icon-button"
            disabled={loading}
            onClick={onRefresh}
            title="刷新列表"
            type="button"
          ><RefreshCw size={16} /></button>
          {filters.length > 0 ? (
            <>
              <button className="primary-button" disabled={loading} type="submit"><Search size={15} />查询</button>
              <button className="ghost-button" disabled={loading} onClick={onReset} type="button"><RotateCcw size={15} />重置</button>
            </>
          ) : null}
          {page.actions.map((action) => (
            <button
              key={action.label}
              className={action.variant === "primary" ? "primary-button" : "ghost-button"}
              disabled={loading}
              onClick={() => onToolbarAction(page, action.label)}
              type="button"
            >
              {action.label}
            </button>
          ))}
        </div>
      </form>

      {page.metrics.length > 0 ? (
        <div className="metric-grid list-metric-grid">
          {page.metrics.map((metric) => (
            <section className="panel metric-card" key={metric.label}>
              <div className={`metric-mark ${toneClass(metric.tone)}`} />
              <div>
                <p>{metric.label}</p>
                <strong>{metric.value}</strong>
              </div>
              <span className={toneClass(metric.tone)}>{metric.delta}</span>
            </section>
          ))}
        </div>
      ) : null}

      <section className="panel table-panel" aria-busy={loading}>
        <div className="panel-title">
          <div>
            <h3>{page.title}</h3>
            <p>{page.tableSubtitle ?? `共 ${total} 条`}</p>
          </div>
        </div>
        <div className="table-scroll">
          <table>
            <thead>
              <tr>{page.columns.map((column) => <th key={column.key}>{column.label}</th>)}</tr>
            </thead>
            <tbody>
              {page.rows.length === 0 ? (
                <tr className="empty-row"><td colSpan={page.columns.length}>{loading ? "正在加载数据..." : page.emptyText ?? "暂无符合条件的数据"}</td></tr>
              ) : page.rows.map((row) => (
                <tr key={row.id}>
                  {page.columns.map((column, index) => {
                    const value = row.cells[column.key] ?? "-";
                    const isAction = column.key === "action";
                    return (
                      <td key={column.key} className={index === 0 ? "strong-cell" : undefined}>
                        {isAction && onRowAction && value !== "-" ? (
                          <button className="link-button" disabled={loading} onClick={() => onRowAction(row)} type="button">{value}</button>
                        ) : column.key === "status" || column.key === "result" ? (
                          <StatusPill value={value} />
                        ) : value}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="pagination">
          <span>第 {currentPage} / {totalPages} 页，共 {total} 条</span>
          <div>
            <button
              aria-label="上一页"
              className="icon-button compact"
              disabled={loading || currentPage <= 1}
              onClick={() => onPageChange(currentPage - 1)}
              title="上一页"
              type="button"
            ><ChevronLeft size={16} /></button>
            <button
              aria-label="下一页"
              className="icon-button compact"
              disabled={loading || currentPage >= totalPages}
              onClick={() => onPageChange(currentPage + 1)}
              title="下一页"
              type="button"
            ><ChevronRight size={16} /></button>
          </div>
        </div>
      </section>
    </>
  );
};
