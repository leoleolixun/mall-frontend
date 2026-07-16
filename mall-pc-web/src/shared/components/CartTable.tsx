import type React from "react";
import { useState } from "react";
import type { CartLine } from "@/shared/types/domain";
import { formatPrice } from "@/shared/utils/money";
import { ProductVisual } from "@/shared/components/ProductVisual";

export const CartTable: React.FC<{ lines: CartLine[]; onQuantityChange?: (id: string, quantity: number) => Promise<void> }> = ({ lines, onQuantityChange }) => {
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const updateQuantity = async (id: string, quantity: number): Promise<void> => {
    if (!onQuantityChange || updatingId) {
      return;
    }
    setUpdatingId(id);
    await onQuantityChange(id, quantity);
    setUpdatingId(null);
  };

  return <table className="cart-table">
    <thead>
      <tr>
        {["商品", "规格", "单价", "数量", "小计"].map((head) => <th key={head}>{head}</th>)}
      </tr>
    </thead>
    <tbody>
      {lines.map((line) => (
        <tr key={line.id}>
          <td>
            <div className="cart-product-cell">
              <ProductVisual alt={line.name} compact src={line.cover} />
              <div className="cart-product-copy">
                <strong>{line.name}</strong>
                {line.available === false ? <span>{line.message || "当前商品不可结算"}</span> : null}
              </div>
            </div>
          </td>
          <td>{line.spec}</td>
          <td>{formatPrice(line.price)}</td>
          <td>
            {onQuantityChange ? (
              <div className="stepper compact">
                <button disabled={updatingId === line.id} onClick={() => void updateQuantity(line.id, line.quantity - 1)}>-</button>
                <b>{line.quantity}</b>
                <button disabled={updatingId === line.id || line.available === false} onClick={() => void updateQuantity(line.id, line.quantity + 1)}>+</button>
              </div>
            ) : (
              <span className="readonly-quantity">x {line.quantity}</span>
            )}
          </td>
          <td>{formatPrice(line.price * line.quantity)}</td>
        </tr>
      ))}
    </tbody>
  </table>;
};

export default CartTable;
