import type React from "react";
import { Search } from "lucide-react";
import { Chip } from "@/shared/components/Chip";
import { HeroTitle } from "@/shared/components/HeroTitle";

export const ComparePage: React.FC = () => (
  <>
    <HeroTitle title="商品对比" subtitle="同类商品参数和操作对比。" />
    <section className="panel compare-toolbar">
      <p>已选择 3 件商品，可继续添加同类商品进行参数对比。</p>
      <label className="inline-search">
        <Search size={15} />
        <input placeholder="添加商品名称" />
      </label>
      <button className="primary-button">添加对比</button>
    </section>
    <section className="panel compare-panel">
      <CompareTable />
    </section>
  </>
);

export const CompareTable: React.FC = () => {
  const rows = [
    ["价格", "¥299", "¥399", "¥349"],
    ["核心卖点", "主动降噪", "AI 语音", "轻量佩戴"],
    ["续航", "30 小时", "18 小时", "24 小时"],
    ["保修", "12 个月", "12 个月", "6 个月"],
    ["评分", "4.9", "4.8", "4.7"]
  ];

  return (
    <table className="compare-table">
      <thead>
        <tr>
          {["参数", "蓝牙耳机 Pro", "智能音箱 Max", "降噪耳机 Air"].map((head) => <th key={head}>{head}</th>)}
        </tr>
      </thead>
      <tbody>
        {rows.map((row) => (
          <tr key={row[0]}>
            {row.map((cell) => <td key={cell}>{cell}</td>)}
          </tr>
        ))}
        <tr>
          <td>操作</td>
          {[1, 2, 3].map((item) => (
            <td key={item}>
              <button className={item === 1 ? "primary-button small" : "plain-button small"}>{item === 1 ? "加入购物车" : "查看详情"}</button>
            </td>
          ))}
        </tr>
      </tbody>
    </table>
  );
};

export default ComparePage;

