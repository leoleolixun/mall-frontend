import type React from "react";

export interface ShellProps {
  children: React.ReactNode;
}

export const Shell: React.FC<ShellProps> = ({ children }) => (
  <div className="app-shell">
    <main className="workspace">{children}</main>
  </div>
);

export default Shell;

