import type { LucideIcon } from "lucide-react";

export type Tone = "red" | "blue" | "green" | "orange" | "purple" | "gray";

export interface Metric {
  label: string;
  value: string;
  delta: string;
  tone: Tone;
}

export interface TableColumn {
  key: string;
  label: string;
}

export interface TableRow {
  id: string;
  cells: Record<string, string>;
  status?: string;
}

export interface PageAction {
  label: string;
  variant?: "primary" | "ghost";
}

export interface ListPageData {
  kind: "list";
  id: string;
  groupId: string;
  title: string;
  eyebrow: string;
  description: string;
  filters: string[];
  actions: PageAction[];
  metrics: Metric[];
  columns: TableColumn[];
  rows: TableRow[];
  tableSubtitle?: string;
}

export interface DashboardPageData {
  kind: "dashboard";
  id: string;
  groupId: string;
  title: string;
  eyebrow: string;
  description: string;
  metrics: Metric[];
  todos: string[];
  chartBars: number[];
  columns: TableColumn[];
  rows: TableRow[];
}

export interface FormSection {
  title: string;
  fields: string[];
}

export interface FormPageData {
  kind: "form";
  id: string;
  groupId: string;
  title: string;
  eyebrow: string;
  description: string;
  sections: FormSection[];
  sideCards: string[];
  fieldValues?: Record<string, string>;
}

export interface MatrixRole {
  role: string;
  permissions: string[];
}

export interface MatrixPageData {
  kind: "matrix";
  id: string;
  groupId: string;
  title: string;
  eyebrow: string;
  description: string;
  modules: string[];
  roles: MatrixRole[];
}

export interface BoardPageData {
  kind: "board";
  id: string;
  groupId: string;
  title: string;
  eyebrow: string;
  description: string;
  cards: string[];
}

export interface DetailSummaryItem {
  label: string;
  value: string;
}

export interface DetailPageData {
  kind: "detail";
  id: string;
  groupId: string;
  title: string;
  eyebrow: string;
  description: string;
  summary: DetailSummaryItem[];
  steps: string[];
  tableTitle: string;
  columns: TableColumn[];
  rows: TableRow[];
  actions?: PageAction[];
}

export type AdminPageData = DashboardPageData | ListPageData | FormPageData | MatrixPageData | BoardPageData | DetailPageData;

export interface AdminGroup {
  id: string;
  title: string;
  subtitle: string;
  icon: LucideIcon;
  pageIds: string[];
}
