import type React from "react";
import { useCallback, useEffect, useState } from "react";
import { AlertCircle, ArrowLeft, CheckCircle2, Clock3, MapPin, Package, RotateCcw, Truck, WalletCards, X } from "lucide-react";
import { Link } from "@tanstack/react-router";

import { moneyFromCent } from "@/api/client";
import type { AfterSaleResponse, CreateAfterSaleRequest, LogisticsResponse, OrderItemResponse, OrderResponse } from "@/api/client";
import { ProductVisual } from "@/shared/components/ProductVisual";
import { formatPrice } from "@/shared/utils/money";

interface OrderDetailPageProps {
  orderId: number;
  onAfterSaleCreate: (payload: CreateAfterSaleRequest) => Promise<AfterSaleResponse | null>;
  onBack: () => void;
  onCancel: (id: number) => Promise<boolean>;
  onConfirm: (id: number) => Promise<OrderResponse | null>;
  onLoad: (id: number) => Promise<OrderResponse>;
  onLoadLogistics: (id: number) => Promise<LogisticsResponse>;
  onPay: (order: OrderResponse) => void;
}

type PendingAction = "cancel" | "confirm" | "after-sale" | null;

const formatDateTime = (value?: string | null): string => {
  if (!value) {
    return "-";
  }
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : date.toLocaleString("zh-CN", { hour12: false });
};

const deliveryTypeText = (value: string): string => value === "self_delivery" ? "商家配送" : "快递配送";

export const OrderDetailPage: React.FC<OrderDetailPageProps> = ({
  orderId,
  onAfterSaleCreate,
  onBack,
  onCancel,
  onConfirm,
  onLoad,
  onLoadLogistics,
  onPay
}) => {
  const [order, setOrder] = useState<OrderResponse | null>(null);
  const [logistics, setLogistics] = useState<LogisticsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [logisticsError, setLogisticsError] = useState("");
  const [pendingAction, setPendingAction] = useState<PendingAction>(null);
  const [cancelConfirming, setCancelConfirming] = useState(false);
  const [receiptConfirming, setReceiptConfirming] = useState(false);
  const [afterSaleItem, setAfterSaleItem] = useState<OrderItemResponse | null>(null);
  const [afterSaleType, setAfterSaleType] = useState<CreateAfterSaleRequest["type"]>("refund_only");
  const [afterSaleReason, setAfterSaleReason] = useState("");
  const [afterSaleDescription, setAfterSaleDescription] = useState("");
  const [afterSaleError, setAfterSaleError] = useState("");

  const load = useCallback(async (): Promise<void> => {
    if (!Number.isInteger(orderId) || orderId <= 0) {
      setError("订单编号不合法");
      setLoading(false);
      return;
    }

    setLoading(true);
    setError("");
    setLogistics(null);
    setLogisticsError("");
    try {
      const detail = await onLoad(orderId);
      setOrder(detail);
      if (detail.status === 3 || detail.status === 4) {
        try {
          setLogistics(await onLoadLogistics(orderId));
        } catch (requestError) {
          setLogisticsError(requestError instanceof Error ? requestError.message : "物流信息加载失败");
        }
      }
    } catch (requestError) {
      setOrder(null);
      setError(requestError instanceof Error ? requestError.message : "订单详情加载失败");
    } finally {
      setLoading(false);
    }
  }, [onLoad, onLoadLogistics, orderId]);

  useEffect(() => {
    void load();
  }, [load]);

  const handleCancel = async (): Promise<void> => {
    if (!cancelConfirming) {
      setCancelConfirming(true);
      return;
    }
    setPendingAction("cancel");
    const ok = await onCancel(orderId);
    setPendingAction(null);
    setCancelConfirming(false);
    if (ok) {
      await load();
    }
  };

  const handleConfirm = async (): Promise<void> => {
    if (!receiptConfirming) {
      setReceiptConfirming(true);
      return;
    }
    setPendingAction("confirm");
    const latest = await onConfirm(orderId);
    setPendingAction(null);
    setReceiptConfirming(false);
    if (latest) {
      setOrder(latest);
      await load();
    }
  };

  const openAfterSale = (item: OrderItemResponse): void => {
    setAfterSaleItem(item);
    setAfterSaleType("refund_only");
    setAfterSaleReason("");
    setAfterSaleDescription("");
    setAfterSaleError("");
  };

  const closeAfterSale = (): void => {
    if (pendingAction !== "after-sale") {
      setAfterSaleItem(null);
    }
  };

  const submitAfterSale = async (event: React.FormEvent<HTMLFormElement>): Promise<void> => {
    event.preventDefault();
    if (!order || !afterSaleItem) {
      return;
    }
    const reason = afterSaleReason.trim();
    const description = afterSaleDescription.trim();
    if (!reason) {
      setAfterSaleError("请填写售后原因");
      return;
    }
    if (reason.length > 100 || description.length > 500) {
      setAfterSaleError("售后原因不能超过 100 个字符，补充说明不能超过 500 个字符");
      return;
    }

    setPendingAction("after-sale");
    const result = await onAfterSaleCreate({
      order_id: order.id,
      order_item_id: afterSaleItem.id as number,
      type: afterSaleType,
      reason,
      description,
      images: []
    });
    setPendingAction(null);
    if (result) {
      setAfterSaleItem(null);
    }
  };

  if (loading) {
    return (
      <section className="panel order-detail-state">
        <Clock3 size={28} />
        <h1>正在加载订单</h1>
      </section>
    );
  }

  if (error || !order) {
    return (
      <section className="panel order-detail-state error">
        <AlertCircle size={28} />
        <h1>订单详情加载失败</h1>
        <p>{error || "订单不存在"}</p>
        <div>
          <button className="primary-button" onClick={() => void load()} type="button">重新加载</button>
          <button className="plain-button" onClick={onBack} type="button">返回订单列表</button>
        </div>
      </section>
    );
  }

  const canAfterSale = order.status === 2 || order.status === 3 || order.status === 4;

  return (
    <section className="order-detail-page">
      <header className="order-detail-head">
        <button aria-label="返回订单列表" className="icon-button" onClick={onBack} title="返回订单列表" type="button">
          <ArrowLeft size={19} />
        </button>
        <div>
          <span>订单 {order.order_no}</span>
          <h1>{order.status_text}</h1>
          <p>{formatDateTime(order.created_at)} 创建</p>
        </div>
        <div className="order-detail-actions">
          {order.status === 1 ? (
            <>
              <button className="plain-button danger" disabled={pendingAction !== null} onClick={() => void handleCancel()} type="button">
                {pendingAction === "cancel" ? "取消中" : cancelConfirming ? "确认取消订单" : "取消订单"}
              </button>
              <button className="primary-button solid" disabled={pendingAction !== null} onClick={() => onPay(order)} type="button">
                <WalletCards size={16} />
                {order.trade_id ? "合并支付" : "去支付"}
              </button>
            </>
          ) : null}
          {order.status === 3 ? (
            <button className="primary-button solid" disabled={pendingAction !== null} onClick={() => void handleConfirm()} type="button">
              <CheckCircle2 size={16} />
              {pendingAction === "confirm" ? "确认中" : receiptConfirming ? "确认已经收货" : "确认收货"}
            </button>
          ) : null}
        </div>
      </header>

      <div className="order-detail-grid">
        <main className="order-detail-main">
          <section className="panel order-detail-section">
            <div className="order-detail-section-title">
              <Package size={18} />
              <h2>商品明细</h2>
              <span>{order.items.length} 项</span>
            </div>
            <div className="order-detail-items">
              {order.items.map((item) => (
                <article className="order-detail-item" key={item.id ?? item.sku_id}>
                  <div className="order-detail-product-image">
                    <ProductVisual alt={item.product_name} compact src={item.sku_image} />
                  </div>
                  <div className="order-detail-product-copy">
                    <strong>{item.product_name}</strong>
                    <span>{item.sku_name}</span>
                    <span>{formatPrice(moneyFromCent(item.price))} × {item.quantity}</span>
                  </div>
                  <div className="order-detail-product-amount">
                    {item.discount_amount > 0 ? <span>优惠 -{formatPrice(moneyFromCent(item.discount_amount))}</span> : null}
                    <strong>{formatPrice(moneyFromCent(item.payable_amount))}</strong>
                    {canAfterSale && item.id ? (
                      <button className="plain-button small" disabled={pendingAction !== null} onClick={() => openAfterSale(item)} type="button">
                        <RotateCcw size={14} />
                        申请售后
                      </button>
                    ) : null}
                  </div>
                </article>
              ))}
            </div>
          </section>

          {(order.status === 3 || order.status === 4) ? (
            <section className="panel order-detail-section">
              <div className="order-detail-section-title">
                <Truck size={18} />
                <h2>配送信息</h2>
              </div>
              {logistics ? (
                <div className="order-logistics-grid">
                  <div><span>配送方式</span><strong>{deliveryTypeText(logistics.delivery_type)}</strong></div>
                  <div><span>承运方</span><strong>{logistics.logistics_company || "商家配送"}</strong></div>
                  <div><span>运单号</span><strong>{logistics.tracking_no || "无运单号"}</strong></div>
                  <div><span>发货时间</span><strong>{formatDateTime(logistics.shipped_at)}</strong></div>
                  {logistics.traces.map((trace) => (
                    <div className="order-logistics-trace" key={`${trace.time}-${trace.content}`}>
                      <span>{formatDateTime(trace.time)}</span>
                      <strong>{trace.content}</strong>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="order-logistics-error">
                  <span>{logisticsError || "正在读取物流信息"}</span>
                  {logisticsError ? <button className="plain-button small" onClick={() => void load()} type="button">重试</button> : null}
                </div>
              )}
            </section>
          ) : null}
        </main>

        <aside className="order-detail-side">
          <section className="panel order-detail-section">
            <div className="order-detail-section-title">
              <MapPin size={18} />
              <h2>收货信息</h2>
            </div>
            <dl className="order-detail-data">
              <div><dt>收货人</dt><dd>{order.receiver_name}</dd></div>
              <div><dt>手机号</dt><dd>{order.receiver_phone}</dd></div>
              <div><dt>地址</dt><dd>{order.receiver_address}</dd></div>
              {order.remark ? <div><dt>订单备注</dt><dd>{order.remark}</dd></div> : null}
            </dl>
          </section>

          <section className="panel order-detail-section order-detail-amounts">
            <div><span>商品金额</span><strong>{formatPrice(moneyFromCent(order.goods_amount))}</strong></div>
            <div><span>运费</span><strong>{formatPrice(moneyFromCent(order.freight_amount))}</strong></div>
            <div><span>优惠</span><strong>-{formatPrice(moneyFromCent(order.discount_amount))}</strong></div>
            <div className="total"><span>实付金额</span><strong>{formatPrice(moneyFromCent(order.payable_amount))}</strong></div>
          </section>

          <Link className="plain-button order-after-sale-link" to="/account/after-sales">
            查看售后记录
          </Link>
        </aside>
      </div>

      {afterSaleItem ? (
        <div className="order-after-sale-backdrop" role="presentation">
          <form className="order-after-sale-dialog" onSubmit={(event) => void submitAfterSale(event)}>
            <header>
              <div>
                <h2>申请售后</h2>
                <p>{afterSaleItem.product_name} · {afterSaleItem.sku_name}</p>
              </div>
              <button aria-label="关闭售后申请" disabled={pendingAction === "after-sale"} onClick={closeAfterSale} type="button">
                <X size={18} />
              </button>
            </header>
            <label>
              <span>售后类型</span>
              <select onChange={(event) => setAfterSaleType(event.target.value as CreateAfterSaleRequest["type"])} value={afterSaleType}>
                <option value="refund_only">仅退款</option>
                <option value="return_refund">退货退款</option>
              </select>
            </label>
            <label>
              <span>售后原因</span>
              <input maxLength={100} onChange={(event) => { setAfterSaleReason(event.target.value); setAfterSaleError(""); }} placeholder="请简要说明申请原因" value={afterSaleReason} />
            </label>
            <label>
              <span>补充说明</span>
              <textarea maxLength={500} onChange={(event) => setAfterSaleDescription(event.target.value)} placeholder="可补充商品情况和处理诉求" value={afterSaleDescription} />
            </label>
            <div className="order-after-sale-refund">
              <span>预计退款商品金额</span>
              <strong>{formatPrice(moneyFromCent(afterSaleItem.payable_amount))}</strong>
            </div>
            {afterSaleError ? <p className="order-after-sale-error">{afterSaleError}</p> : null}
            <footer>
              <button className="primary-button solid" disabled={pendingAction === "after-sale"} type="submit">
                {pendingAction === "after-sale" ? "提交中" : "提交申请"}
              </button>
              <button className="plain-button" disabled={pendingAction === "after-sale"} onClick={closeAfterSale} type="button">取消</button>
            </footer>
          </form>
        </div>
      ) : null}
    </section>
  );
};

export default OrderDetailPage;
