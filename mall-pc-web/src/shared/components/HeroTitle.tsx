import type React from "react";

export const HeroTitle: React.FC<{ title: string; subtitle?: string; crumbs?: string }> = ({ title, subtitle, crumbs }) => (
  <div className="page-title">
    {crumbs ? <p>{crumbs}</p> : null}
    <h1>{title}</h1>
    {subtitle ? <span>{subtitle}</span> : null}
  </div>
);

export default HeroTitle;

