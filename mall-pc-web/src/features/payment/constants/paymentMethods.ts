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
    channel: "alipay",
    description: "适合支付宝 PC 网页支付，创建支付单后跳转支付宝收银台。",
    enabled: true,
    label: "支付宝",
    scene: "page",
    tag: "网页支付"
  }
];
