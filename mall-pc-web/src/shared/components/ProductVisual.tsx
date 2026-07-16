import type React from "react";
import { useEffect, useState } from "react";

export const ProductVisual: React.FC<{ alt?: string; compact?: boolean; src?: string }> = ({ alt = "商品图片", compact = false, src }) => {
  const [imageFailed, setImageFailed] = useState(false);

  useEffect(() => {
    setImageFailed(false);
  }, [src]);

  return (
    <div className={compact ? "product-visual compact" : "product-visual"}>
      <div />
      <span />
      {src && !imageFailed ? <img alt={alt} loading="lazy" onError={() => setImageFailed(true)} src={src} /> : null}
    </div>
  );
};

export default ProductVisual;
