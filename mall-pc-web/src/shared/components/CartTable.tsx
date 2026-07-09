import type React from "react";
import type { CartLine } from "@/shared/types/domain";
import { formatPrice } from "@/shared/utils/money";
import { ProductVisual } from "@/shared/components/ProductVisual";

export const CartTable: React.FC<{ lines: CartLine[]; onQuantityChange?: (id: string, quantity: number) => void }> = ({ lines, onQuantityChange }) => (
  <table className="cart-table">
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
              <ProductVisual compact />
              <strong>{line.name}</strong>
            </div>
          </td>
          <td>{line.spec}</td>
          <td>{formatPrice(line.price)}</td>
          <td>
            {onQuantityChange ? (
              <div className="stepper compact">
                <button onClick={() => onQuantityChange(line.id, line.quantity - 1)}>-</button>
                <b>{line.quantity}</b>
                <button onClick={() => onQuantityChange(line.id, line.quantity + 1)}>+</button>
              </div>
            ) : (
              <span className="readonly-quantity">x {line.quantity}</span>
            )}
          </td>
          <td>{formatPrice(line.price * line.quantity)}</td>
        </tr>
      ))}
    </tbody>
  </table>
);

export default CartTable;

