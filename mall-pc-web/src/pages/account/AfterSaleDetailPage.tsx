import type React from "react";
import { useCallback, useEffect, useState } from "react";
import { AlertCircle, ArrowLeft, Clock3, RotateCcw } from "lucide-react";

import { moneyFromCent } from "@/api/client";
import type { AfterSaleResponse } from "@/api/client";
import { ProductVisual } from "@/shared/components/ProductVisual";
import { formatPrice } from "@/shared/utils/money";

interface AfterSaleDetailPageProps {
  afterSaleId: number;
  onBack: () => void;
  onCancel: (id: number) => Promise<boolean>;
  onLoad: (id: number) => Promise<AfterSaleResponse>;
}

const formatDateTime = (value?: string | null): string => {
  if (!value) {
    return "-";
  }
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : date.toLocaleString("zh-CN", { hour12: false });
};

export const AfterSaleDetailPage: React.FC<AfterSaleDetailPageProps> = ({ afterSaleId, onBack, onCancel, onLoad }) => {
  const [detail, setDetail] = useState<AfterSaleResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [cancelling, setCancelling] = useState(false);
  const [confirmingCancel, setConfirmingCancel] = useState(false);

  const load = useCallback(async (): Promise<void> => {
    if (!Number.isInteger(afterSaleId) || afterSaleId <= 0) {
      setError("售后编号不合法");
      setLoading(false);
      return;
    }
    setLoading(true);
    setError("");
    try {
      setDetail(await onLoad(afterSaleId));
    } catch (requestError) {
      setDetail(null);
      setError(requestError instanceof Error ? requestError.message : "售后详情加载失败");
    } finally {
      setLoading(false);
    }
  }, [afterSaleId, onLoad]);

  useEffect(() => {
    void load();
  }, [load]);

  const handleCancel = async (): Promise<void> => {
    if (!confirmingCancel) {
      setConfirmingCancel(true);
      return;
    }
    setCancelling(true);
    const ok = await onCancel(afterSaleId);
    setCancelling(false);
    setConfirmingCancel(false);
    if (ok) {
      await load();
    }
  };

  if (loading) {
    return <section className="panel order-detail-state"><Clock3 size={28} /><h1>正在加载售后详情</h1></section>;
  }

  if (error || !detail) {
    return (
      <section className="panel order-detail-state error">
        <AlertCircle size={28} />
        <h1>售后详情加载失败</h1>
        <p>{error || "售后申请不存在"}</p>
        <div>
          <button className="primary-button" onClick={() => void load()} type="button">重新加载</button>
          <button className="plain-button" onClick={onBack} type="button">返回售后列表</button>
        </div>
      </section>
    );
  }

  return (
    <section className="after-sale-detail-page">
      <header className="order-detail-head">
        <button aria-label="返回售后列表" className="icon-button" onClick={onBack} title="返回售后列表" type="button">
          <ArrowLeft size={19} />
        </button>
        <div>
          <span>售后单 {detail.after_sale_no}</span>
          <h1>{detail.status_text}</h1>
          <p>{formatDateTime(detail.created_at)} 提交</p>
        </div>
        {detail.status === 1 ? (
          <button className="plain-button danger" disabled={cancelling} onClick={() => void handleCancel()} type="button">
            {cancelling ? "取消中" : confirmingCancel ? "确认取消申请" : "取消申请"}
          </button>
        ) : null}
      </header>

      <div className="after-sale-detail-grid">
        <main className="panel order-detail-section">
          <div className="order-detail-section-title">
            <RotateCcw size={18} />
            <h2>申请内容</h2>
          </div>
          <article className="after-sale-product">
            <div><ProductVisual alt={detail.product_name} compact src={detail.sku_image} /></div>
            <div>
              <strong>{detail.product_name}</strong>
              <span>{detail.sku_name}</span>
              <span>订单 {detail.order_no}</span>
            </div>
            <strong>{formatPrice(moneyFromCent(detail.refund_amount))}</strong>
          </article>
          <dl className="after-sale-detail-data">
            <div><dt>售后类型</dt><dd>{detail.type_text}</dd></div>
            <div><dt>申请原因</dt><dd>{detail.reason}</dd></div>
            <div><dt>补充说明</dt><dd>{detail.description || "-"}</dd></div>
            {detail.reject_reason ? <div><dt>拒绝原因</dt><dd>{detail.reject_reason}</dd></div> : null}
          </dl>
          {detail.images.length > 0 ? (
            <div className="after-sale-images">
              {detail.images.map((image) => <img alt="售后凭证" key={image} src={image} />)}
            </div>
          ) : null}
        </main>

        <aside className="panel order-detail-section after-sale-progress">
          <div><span>申请状态</span><strong>{detail.status_text}</strong></div>
          <div><span>申请金额</span><strong>{formatPrice(moneyFromCent(detail.refund_amount))}</strong></div>
          <div><span>商家审核</span><strong>{formatDateTime(detail.reviewed_at)}</strong></div>
          {detail.refund ? (
            <>
              <div><span>退款单号</span><strong>{detail.refund.refund_no}</strong></div>
              <div><span>退款状态</span><strong>{detail.refund.status_text}</strong></div>
              {detail.refund.failure_reason || detail.refund.last_error ? (
                <div><span>处理信息</span><strong>{detail.refund.last_error || detail.refund.failure_reason}</strong></div>
              ) : null}
            </>
          ) : null}
          <div><span>最后更新</span><strong>{formatDateTime(detail.updated_at)}</strong></div>
        </aside>
      </div>
    </section>
  );
};

export default AfterSaleDetailPage;
