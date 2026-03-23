/**
 * Single source of truth for breadcrumb segments.
 * Add entries for any route that should show in the breadcrumb; layout derives breadcrumb from pathname.
 */

export interface BreadcrumbRoute {
  path: string;
  titleKey: string;
  parentPath?: string;
}

const BREADCRUMB_ROUTES: BreadcrumbRoute[] = [
  { path: "/", titleKey: "dashboard" },
  { path: "/notifications", titleKey: "notifications" },
  {
    path: "/notifications/setting",
    titleKey: "notificationSettings",
    parentPath: "/notifications",
  },
  { path: "/profile", titleKey: "profile" },
  { path: "/profile/settings", titleKey: "settings", parentPath: "/profile" },
  { path: "/billing", titleKey: "billing" },
  { path: "/identity-verification", titleKey: "identityVerification" },
  { path: "/dashboard/ecommerce", titleKey: "ecommerce", parentPath: "/" },
  { path: "/dashboard/payment", titleKey: "paymentDashboard", parentPath: "/" },
  { path: "/dashboard/hotel", titleKey: "hotel", parentPath: "/" },
  { path: "/hotel-dashboard", titleKey: "hotelDashboard", parentPath: "/" },
  { path: "/hotel/booking", titleKey: "booking", parentPath: "/" },
  { path: "/dashboard/projects", titleKey: "projects", parentPath: "/" },
  { path: "/dashboard/sales", titleKey: "sales", parentPath: "/" },
  { path: "/kanban", titleKey: "kanban", parentPath: "/" },
  { path: "/dashboard/analytics", titleKey: "analytics", parentPath: "/" },
  { path: "/dashboard/files", titleKey: "files", parentPath: "/" },
  { path: "/dashboard/crypto", titleKey: "crypto", parentPath: "/" },
  { path: "/dashboard/academy", titleKey: "academy", parentPath: "/" },
  { path: "/dashboard/hospital", titleKey: "hospital", parentPath: "/" },
  { path: "/dashboard/finance", titleKey: "finance", parentPath: "/" },
  { path: "/users", titleKey: "userManagerList", parentPath: "/users" },
  { path: "/users", titleKey: "userManager" },
  { path: "/users/dashboard", titleKey: "dashboard", parentPath: "/users" },
  {
    path: "/file-manage/dashboard",
    titleKey: "dashboard",
    parentPath: "/file-manage",
  },
  { path: "/file-manage", titleKey: "fileManager" },
];

/**
 * Returns breadcrumb segments for the given pathname (e.g. Profile > Settings).
 * No mandatory "Dashboard" first; only the matching route chain is returned.
 */
export function getBreadcrumb(
  pathname: string | null | undefined
): { labelKey: string; href: string }[] {
  const path =
    pathname && pathname.startsWith("/")
      ? pathname
      : pathname
        ? `/${pathname}`
        : "/";
  const normalized = path.replace(/\/$/, "") || "/";

  const matched = BREADCRUMB_ROUTES.filter((r) => {
    const rPath = r.path.replace(/\/$/, "") || "/";
    return normalized === rPath || normalized.startsWith(rPath + "/");
  }).sort((a, b) => b.path.length - a.path.length)[0];

  if (!matched) return [];

  const chain: BreadcrumbRoute[] = [];
  let current: BreadcrumbRoute | undefined = matched;
  while (current) {
    chain.unshift(current);
    const parentPath: string | undefined = current.parentPath;
    current = parentPath
      ? BREADCRUMB_ROUTES.find((r) => r.path === parentPath && r !== current)
      : undefined;
  }

  return chain.map((c) => ({ labelKey: c.titleKey, href: c.path }));
}
