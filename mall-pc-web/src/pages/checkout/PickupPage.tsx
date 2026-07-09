import type React from "react";
import { MapPin, Search, Store } from "lucide-react";
import { HeroTitle } from "@/shared/components/HeroTitle";

export const PickupPage: React.FC = () => (
  <>
    <HeroTitle title="选择自提门店" />
    <div className="pickup-layout">
      <section className="map-panel">
        <MapPin size={42} />
        <h2>地图区域</h2>
        <p>展示门店位置、距离和配送范围。</p>
      </section>
      <section className="panel store-panel">
        <h2>附近门店</h2>
        <label className="inline-search">
          <Search size={15} />
          <input placeholder="搜索城市 / 门店" />
        </label>
        {["浦东旗舰店|距你 1.2km · 今日可提", "西湖银泰店|距你 3.8km · 明日可提", "朝阳大悦城店|距你 5.6km · 今日可提"].map((item, index) => {
          const [name, desc] = item.split("|");
          return (
            <article className={index === 0 ? "store-card active" : "store-card"} key={name}>
              <Store size={18} />
              <div>
                <strong>{name}</strong>
                <span>{desc}</span>
              </div>
              <button className={index === 0 ? "primary-button small" : "plain-button small"}>{index === 0 ? "已选择" : "选择"}</button>
            </article>
          );
        })}
        <button className="primary-button solid">确认门店</button>
      </section>
    </div>
    <section className="panel pickup-goods">
      <strong>自提商品：蓝牙耳机 Pro、耳机保护套 · 预计备货 2 小时</strong>
      <span>自提码将在订单支付后生成，请凭码到店核销。</span>
    </section>
  </>
);

export default PickupPage;

