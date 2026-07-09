import type React from "react";

export const Chip: React.FC<{ children: React.ReactNode; active?: boolean; onClick?: () => void }> = ({ children, active = false, onClick }) => (
  <button className={active ? "chip active" : "chip"} onClick={onClick}>{children}</button>
);

export default Chip;

