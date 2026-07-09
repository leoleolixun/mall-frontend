import type React from "react";
import { HeroTitle } from "@/shared/components/HeroTitle";

export const PresalePage: React.FC = () => (
  <>
    <HeroTitle title="预售商品" />
    <section className="presale-hero">
      <div>
        <span className="badge">定金 ¥50 抵 ¥100</span>
        <h2>AI 智能音箱 Max 预售开启</h2>
        <p>支付定金锁定优惠，尾款开始后自动提醒。</p>
        <strong>尾款时间 2026-07-20 10:00</strong>
      </div>
      <div>
        <button className="primary-button solid">支付定金</button>
        <button className="plain-button">加入提醒</button>
      </div>
    </section>
    <div className="two-columns">
      <section className="panel">
        <h2>预售规则</h2>
        {["定金支付后不可直接退款，需按规则申请。", "尾款支付时间开始后将通过短信和站内信提醒。", "未按时支付尾款，定金可能不予退还。", "预售商品预计 2026-07-28 起发货。"].map((item) => (
          <p className="soft-row" key={item}>{item}</p>
        ))}
      </section>
      <section className="panel">
        <h2>预售流程</h2>
        <div className="timeline">
          {["支付定金", "等待尾款", "支付尾款", "商家发货"].map((item, index) => (
            <div className={index === 0 ? "active" : ""} key={item}>{item}</div>
          ))}
        </div>
        <strong className="brand-text">当前阶段：支付定金中</strong>
      </section>
    </div>
  </>
);

export default PresalePage;

