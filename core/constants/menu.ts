import type { LucideIcon } from "lucide-react";
import {
  ArrowLeftRight,
  BarChart3,
  Bell,
  Building2,
  Coins,
  CreditCard,
  FileStack,
  FolderKanban,
  GraduationCap,
  HeartPulse,
  Kanban,
  Package,
  ShieldCheck,
  ShoppingCart,
  User,
  Users,
} from "lucide-react";

/** Code key for the item (React key, state id). */
export interface SubMenuItem {
  name: string;
  /** i18n key for the label shown on screen (e.g. t(title)) */
  title: string;
  url: string;
}

export interface DashboardItemBase {
  /** Code key for the item (React key, state id). */
  name: string;
  /** i18n key for the menu item label displayed on screen */
  title: string;
  icon: LucideIcon;
  /** When true, item is shown but not clickable (e.g. coming soon). */
  disabled?: boolean;
}

export interface DashboardItemLink extends DashboardItemBase {
  url: string;
  children?: never;
}

export interface DashboardItemWithChildren extends DashboardItemBase {
  url?: string;
  children: SubMenuItem[];
}

export type DashboardItem = DashboardItemLink | DashboardItemWithChildren;

export function hasSubmenu(
  item: DashboardItem
): item is DashboardItemWithChildren {
  return (
    "children" in item &&
    Array.isArray(item.children) &&
    item.children.length > 0
  );
}

export const dashboardItems: DashboardItem[] = [
  {
    name: "kanban",
    title: "kanban",
    url: "/kanban",
    icon: Kanban,
  },
  {
    name: "hotelBooking",
    title: "hotelBooking",
    icon: Building2,
    children: [
      {
        name: "hotelDashboard",
        title: "hotelDashboard",
        url: "/hotel-dashboard",
      },
      { name: "booking", title: "booking", url: "/hotel/booking" },
    ],
  },
  {
    name: "ecommerce",
    title: "ecommerce",
    icon: ShoppingCart,
    disabled: true,
    children: [
      {
        name: "ecommerceDashboard",
        title: "ecommerceDashboard",
        url: "/dashboard/ecommerce",
      },
      {
        name: "productList",
        title: "productList",
        url: "/dashboard/ecommerce/products",
      },
      {
        name: "productDetail",
        title: "productDetail",
        url: "/dashboard/ecommerce/products/1",
      },
      {
        name: "addProduct",
        title: "addProduct",
        url: "/dashboard/ecommerce/products/new",
      },
      {
        name: "orderList",
        title: "orderList",
        url: "/dashboard/ecommerce/orders",
      },
      {
        name: "orderDetail",
        title: "orderDetail",
        url: "/dashboard/ecommerce/orders/1",
      },
    ],
  },
  {
    name: "projects",
    title: "projects",
    url: "/dashboard/projects",
    icon: FolderKanban,
    disabled: true,
  },
  {
    name: "analytics",
    title: "analytics",
    url: "/dashboard/analytics",
    icon: BarChart3,
    disabled: true,
  },
  {
    name: "crypto",
    title: "crypto",
    url: "/dashboard/crypto",
    icon: Coins,
    disabled: true,
  },
  {
    name: "academy",
    title: "academy",
    url: "/dashboard/academy",
    icon: GraduationCap,
    disabled: true,
  },
  {
    name: "hospital",
    title: "hospital",
    url: "/dashboard/hospital",
    icon: HeartPulse,
    disabled: true,
  },
];

export const managementItems: DashboardItem[] = [
  {
    name: "userManager",
    title: "userManager",
    icon: Users,
    children: [
      {
        name: "userManagerDashboard",
        title: "dashboard",
        url: "/users/dashboard",
      },
      { name: "userManagerList", title: "list", url: "/users" },
    ],
  },
  {
    name: "fileManager",
    title: "fileManager",
    icon: FileStack,
    children: [
      {
        name: "fileManagerDashboard",
        title: "dashboard",
        url: "/file-manage/dashboard",
      },
      { name: "fileManagerList", title: "list", url: "/file-manage" },
    ],
  },
  {
    name: "productManager",
    title: "productManager",
    icon: Package,
    children: [
      {
        name: "productManagerDashboard",
        title: "dashboard",
        url: "/product/dashboard",
      },
      {
        name: "productManagerList",
        title: "list",
        url: "/product",
      },
    ],
  },
  {
    name: "companyManager",
    title: "companyManager",
    icon: Building2,
    disabled: true,
    children: [
      {
        name: "companyManagerDashboard",
        title: "dashboard",
        url: "/management/companies",
      },
      {
        name: "companyManagerList",
        title: "list",
        url: "/management/companies/list",
      },
    ],
  },
  {
    name: "transactionsManager",
    title: "transactionsManager",
    icon: ArrowLeftRight,
    children: [
      {
        name: "transactionsManagerDashboard",
        title: "dashboard",
        url: "/transactions/dashboard",
      },
      {
        name: "transactionsManagerList",
        title: "list",
        url: "/transactions",
      },
    ],
  },
];

export const accountItems: DashboardItem[] = [
  {
    name: "profile",
    title: "profile",
    url: "/profile",
    icon: User,
  },
  { name: "billing", title: "billing", url: "/billing", icon: CreditCard },
  {
    name: "identityVerification",
    title: "identityVerification",
    url: "/identity-verification",
    icon: ShieldCheck,
  },
  {
    name: "paymentDashboard",
    title: "paymentDashboard",
    icon: CreditCard,
    children: [
      // { name: "paymentDocs", title: "paymentDocs", url: "/payment/docs" },
      { name: "paymentStripe", title: "paymentStripe", url: "/payment/stripe" },
      { name: "paymentGmo", title: "paymentGmo", url: "/payment/gmo" },
    ],
  },
  {
    name: "notifications",
    title: "notifications",
    url: "/notifications",
    icon: Bell,
  },
];
