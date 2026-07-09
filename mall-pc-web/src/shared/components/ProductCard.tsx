import type React from "react";
import { ShoppingCart } from "lucide-react";
import type { Product } from "@/shared/types/domain";
import { formatPrice } from "@/shared/utils/money";
import { ProductVisual } from "@/shared/components/ProductVisual";

export const ProductCard: React.FC<{
  product: Product;
  compact?: boolean;
  onAdd?: (product: Product) => void;
  onOpen?: (product: Product) => void;
}> = ({ product, compact = false, onAdd, onOpen }) => (
  <article className={compact ? "product-card compact" : "product-card"}>
    <button className="visual-button" onClick={() => onOpen?.(product)}>
      <ProductVisual compact={compact} />
    </button>
    <div className="card-meta">
      <button onClick={() => onOpen?.(product)}>{product.name}</button>
    </div>
    <div className="card-actions">
      <b>{formatPrice(product.price)}</b>
      <button className="primary-button small" onClick={() => onAdd?.(product)}><ShoppingCart size={14} />加购</button>
    </div>
  </article>
);

export default ProductCard;

