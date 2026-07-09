import type React from "react";

export const SummaryRow: React.FC<{ label: string; value: string }> = ({ label, value }) => (
  <div className="summary-row">
    <span>{label}</span>
    <b>{value}</b>
  </div>
);

export default SummaryRow;

