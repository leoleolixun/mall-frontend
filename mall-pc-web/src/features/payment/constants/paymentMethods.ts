import type { PayChannel, PayScene } from "@/api/client";

export interface PaymentMethodOption {
  channel: PayChannel;
  description: string;
  enabled: boolean;
  label: string;
  scene?: PayScene;
  tag: string;
}

export const paymentMethods: PaymentMethodOption[] = [
  {
    channel: "wechat",
    description: "适合微信扫码、公众号或小程序支付。",
    enabled: true,
    label: "微信支付",
    tag: "推荐"
  },
  {
    channel: "alipay",
    description: "适合支付宝 PC 网页支付，创建支付单后跳转支付宝收银台。",
    enabled: true,
    label: "支付宝",
    scene: "page",
    tag: "常用"
  },
  {
    channel: "stripe",
    description: "预留海外银行卡、Apple Pay 等国际支付场景。",
    enabled: false,
    label: "Stripe",
    tag: "待接入"
  }
];
