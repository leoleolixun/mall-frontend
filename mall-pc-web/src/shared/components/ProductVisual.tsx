import type React from "react";

export const ProductVisual: React.FC<{ compact?: boolean }> = ({ compact = false }) => (
  <div className={compact ? "product-visual compact" : "product-visual"}>
    <div />
    <span />
  </div>
);

export default ProductVisual;

