/**
 * Re-export from constants folder for build compatibility.
 * All actual exports live in ./constants/index.ts
 */
export { DEFAULT_AVATAR_PATH } from "./constants/common";
export { getBreadcrumb } from "./constants/breadcrumb";
export type { BreadcrumbRoute } from "./constants/breadcrumb";
export {
  accountItems,
  dashboardItems,
  managementItems,
  hasSubmenu,
} from "./constants/menu";
export type {
  DashboardItem,
  DashboardItemBase,
  DashboardItemLink,
  DashboardItemWithChildren,
  SubMenuItem,
} from "./constants/menu";
